import { fetchBlockConfig } from './fetch-config.js';

const DEFAULT_ITEM_COUNT = 3;

const commonProperties = {
  org: { type: 'string', description: 'DA organization (the "org" from pageContext).' },
  site: { type: 'string', description: 'DA site/repo (the "site" from pageContext).' },
  env: {
    type: 'string',
    description: 'Which published copy to read: "live" (production, default) or "preview" (staging).',
  },
  ref: { type: 'string', description: 'Branch/ref to read from. Defaults to "main".' },
};

export const TOOLS = [
  {
    name: 'list_blocks',
    description: 'List the blocks authors can insert into a page section for a da-block-collection based site, including which ones are containers (hold nested items).',
    inputSchema: {
      type: 'object',
      properties: { ...commonProperties },
      required: ['org', 'site'],
    },
  },
  {
    name: 'get_block_fields',
    description: 'Get the ordered, editable fields (name, label, type, selector) for a specific block, including child-item fields for container blocks like Cards or Accordion.',
    inputSchema: {
      type: 'object',
      properties: {
        ...commonProperties,
        blockName: { type: 'string', description: 'Block title or id, e.g. "Hero" or "cards".' },
      },
      required: ['org', 'site', 'blockName'],
    },
  },
  {
    name: 'get_block_markdown_template',
    description: 'Draft a ready-to-insert content table for a block, in the correct field order/column shape, with placeholder text for each field. For container blocks, repeats the child item shape itemCount times (default 3). Always show this to the user and get confirmation before saving it into a document.',
    inputSchema: {
      type: 'object',
      properties: {
        ...commonProperties,
        blockName: { type: 'string', description: 'Block title or id, e.g. "Hero" or "cards".' },
        itemCount: { type: 'number', description: 'Number of repeated child items for container blocks (default 3).' },
      },
      required: ['org', 'site', 'blockName'],
    },
  },
];

function textResult(text) {
  return { content: [{ type: 'text', text }] };
}

function allComponents(definitions) {
  return (definitions.groups || []).flatMap((group) => group.components || []);
}

function indexById(items) {
  return new Map(items.map((item) => [item.id, item]));
}

function findFilterEntry(filters, filterId) {
  return filters.find((entry) => entry.id === filterId);
}

function findComponent(definitions, blockName) {
  const needle = blockName.trim().toLowerCase();
  return allComponents(definitions).find(
    (component) => component.id.toLowerCase() === needle
      || (component.title || '').toLowerCase() === needle,
  );
}

function insertableBlockIds(filters) {
  const sectionEntry = findFilterEntry(filters, 'section');
  return sectionEntry && Array.isArray(sectionEntry.components) ? sectionEntry.components : [];
}

function containerChildIds(component, filters) {
  const filterId = component.filter || component.id;
  const entry = findFilterEntry(filters, filterId);
  return entry && Array.isArray(entry.components) ? entry.components : [];
}

function modelFields(models, modelId) {
  const model = indexById(models).get(modelId);
  return (model && model.fields) || [];
}

// component-definition.json holds the DOM `selector` per field; component-models.json holds
// the label/type for the properties panel. Merge them so callers get both.
function mergedFields(component, models) {
  const plugin = (component.plugins && component.plugins.da) || {};
  const defFields = Array.isArray(plugin.fields) ? plugin.fields : [];
  const modelFieldList = modelFields(models, component.model);

  if (!defFields.length) {
    return modelFieldList;
  }

  const modelByName = new Map(modelFieldList.map((field) => [field.name, field]));
  return defFields.map((defField) => ({
    ...(modelByName.get(defField.name) || {}),
    name: defField.name,
    selector: defField.selector,
  }));
}

export async function listBlocks({
  org, site, env, ref,
}) {
  const { definitions, filters } = await fetchBlockConfig({
    org, site, env, ref,
  });
  const components = indexById(allComponents(definitions));

  const lines = insertableBlockIds(filters).map((id) => {
    const component = components.get(id);
    if (!component) {
      return `- ${id} (no definition found — check component-definition.json)`;
    }
    const childIds = containerChildIds(component, filters);
    const containerNote = childIds.length
      ? ` — container, holds nested "${childIds.join('", "')}" items`
      : '';
    return `- ${component.title} (id: ${component.id})${containerNote}`;
  });

  if (!lines.length) {
    return textResult(`No insertable blocks found for ${org}/${site}. Check that component-filters.json has a "section" entry and that the site is published.`);
  }

  return textResult(`Blocks available in a page section for ${org}/${site} (${env || 'live'}, ref ${ref || 'main'}):\n${lines.join('\n')}`);
}

function describeFields(fields) {
  if (!fields.length) return '  (no own fields — likely a pure container)';
  return fields.map((field) => {
    const required = field.required ? ', required' : '';
    const selector = field.selector ? ` → ${field.selector}` : '';
    return `  - ${field.name} (${field.component}${required}): "${field.label || field.name}"${selector}`;
  }).join('\n');
}

export async function getBlockFields({
  org, site, env, ref, blockName,
}) {
  const { definitions, models, filters } = await fetchBlockConfig({
    org, site, env, ref,
  });

  const component = findComponent(definitions, blockName);
  if (!component) {
    return textResult(`No block named "${blockName}" found for ${org}/${site}.`);
  }

  const fields = mergedFields(component, models);
  const childIds = containerChildIds(component, filters);
  const componentIndex = indexById(allComponents(definitions));

  const sections = [`${component.title} (id: ${component.id})`, describeFields(fields)];

  childIds.forEach((childId) => {
    const child = componentIndex.get(childId);
    if (!child) return;
    sections.push(`  Nested "${child.title}" item fields:`);
    sections.push(describeFields(mergedFields(child, models)));
  });

  return textResult(sections.join('\n'));
}

function fieldSelectorColumnKey(field, fallbackIndex) {
  const match = /^(div:nth-child\(\d+\))/.exec(field.selector || '');
  return match ? match[1] : `__col_${fallbackIndex}`;
}

function groupFieldsIntoColumns(fields) {
  const groups = [];
  const keyToIndex = new Map();
  fields.forEach((field) => {
    const key = fieldSelectorColumnKey(field, groups.length);
    if (!keyToIndex.has(key)) {
      keyToIndex.set(key, groups.length);
      groups.push([]);
    }
    groups[keyToIndex.get(key)].push(field);
  });
  return groups;
}

function placeholder(field) {
  return `[${field.label || field.name}]`;
}

// columns > 0 -> one row split into that many cells; columns === 0 -> one row per field group.
function buildItemRows(fields, columns) {
  const groups = groupFieldsIntoColumns(fields);
  if (columns > 0) {
    const cells = groups.slice(0, columns).map((group) => group.map(placeholder).join(' / '));
    while (cells.length < columns) cells.push('');
    return [cells];
  }
  return groups.map((group) => [group.map(placeholder).join(' / ')]);
}

function renderTable(title, rowsOfCells) {
  const columnCount = Math.max(1, ...rowsOfCells.map((cells) => cells.length));
  const lines = [`| ${title} |`];
  rowsOfCells.forEach((cells) => {
    const padded = [...cells, ...Array(columnCount - cells.length).fill('')];
    lines.push(`| ${padded.join(' | ')} |`);
  });
  return lines.join('\n');
}

export async function getBlockMarkdownTemplate({
  org, site, env, ref, blockName, itemCount,
}) {
  const { definitions, models, filters } = await fetchBlockConfig({
    org, site, env, ref,
  });

  const component = findComponent(definitions, blockName);
  if (!component) {
    return textResult(`No block named "${blockName}" found for ${org}/${site}.`);
  }

  const plugin = (component.plugins && component.plugins.da) || {};
  const childIds = containerChildIds(component, filters);
  const componentIndex = indexById(allComponents(definitions));

  // Freeform blocks (unsafeHTML skeleton, no rows/columns) are meant to be dragged in via UE,
  // not hand-typed as a table — say so instead of guessing a shape with false confidence.
  if (plugin.unsafeHTML && !childIds.length) {
    const fields = mergedFields(component, models);
    return textResult(
      `"${component.title}" is inserted as a Universal Editor component (drag it from the block`
      + ' panel) rather than typed as a table, so there is no reliable table shape to paste.'
      + ` Its fields, in order, are:\n${describeFields(fields)}\n\nBest-effort fallback table if`
      + ` you are authoring by hand:\n${renderTable(component.title, [fields.map(placeholder)])}`
      + '\n\n(Unverified — confirm this renders correctly in preview before publishing.)',
    );
  }

  if (childIds.length) {
    const child = componentIndex.get(childIds[0]);
    if (!child) {
      return textResult(`"${component.title}" is a container but its child component "${childIds[0]}" has no definition.`);
    }
    const childPlugin = (child.plugins && child.plugins.da) || {};
    const oneItemRows = buildItemRows(mergedFields(child, models), childPlugin.columns || 0);
    const count = itemCount && itemCount > 0 ? itemCount : DEFAULT_ITEM_COUNT;

    const allRows = [];
    for (let i = 0; i < count; i += 1) {
      allRows.push(...oneItemRows);
    }

    return textResult(
      `Assuming ${count} "${child.title}" item(s) (default; say how many you want if different):\n`
      + `${renderTable(component.title, allRows)}\n\n(Draft — confirm before saving into the document.)`,
    );
  }

  // A top-level block's own fields are selected relative to the block root, so each distinct
  // nth-child group is a separate row (e.g. Quote's quote/author) — never columns of one row,
  // unlike a container's repeating child item (e.g. Card), where `columns` is meaningful.
  const rows = buildItemRows(mergedFields(component, models), 0);
  return textResult(`${renderTable(component.title, rows)}\n\n(Draft — confirm before saving into the document.)`);
}

export async function callTool(name, args) {
  switch (name) {
    case 'list_blocks':
      return listBlocks(args);
    case 'get_block_fields':
      return getBlockFields(args);
    case 'get_block_markdown_template':
      return getBlockMarkdownTemplate(args);
    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  }
}
