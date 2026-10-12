/**
 * Stress Import Block — real implementation (TEST FIXTURE)
 * Lives outside blocks/ on purpose, imported by blocks/stress-import/
 * stress-import.js. get_block_source (tools/mcp-block-library) does not
 * follow relative imports, so this file is invisible to it even though it
 * contains all of the block's actual behavior.
 *
 * Mirrors a real-world pattern: value-carrying classes parsed via regex
 * (not simple boolean classList.contains checks) plus a flat, positionally
 * enumerated set of per-panel modifier classes (panel 1 through 6), each
 * authored via the UE "classes_[suffix]" select-field convention.
 */

/** Block-level value-carrying class patterns (capture a value, not a boolean). */
const VALUE_CLASS_PATTERNS = {
  batchSize: { pattern: /^batch-size-(\d+)$/i, default: '12' },
  headingScalePx: { pattern: /^heading-scale-(\d+)px$/i, default: '28' },
};

/** Per-panel (1-6) modifier class patterns — flat enumeration, not a container. */
const PANEL_SUFFIXES = ['one', 'two', 'three', 'four', 'five', 'six'];

const PANEL_FIELD_PATTERNS = {
  targetMode: (suffix) => new RegExp(`^panel-${suffix}-target-(newtab|sametab)$`, 'i'),
  confirmLeave: (suffix) => new RegExp(`^panel-${suffix}-confirm-(yes|no)$`, 'i'),
  iconStyle: (suffix) => new RegExp(`^panel-${suffix}-icon-(circle|square|none)$`, 'i'),
  sizeVariant: (suffix) => new RegExp(`^panel-${suffix}-size-(small|medium|large)$`, 'i'),
};

/**
 * Extracts the first captured value matching any of the given class names
 * against a single regex pattern.
 * @param {string[]} classNames all class names on the block
 * @param {RegExp} pattern the capturing regex to test each class name against
 * @returns {string|null} the captured value, or null if no class matched
 */
function extractValue(classNames, pattern) {
  for (let i = 0; i < classNames.length; i += 1) {
    const match = pattern.exec(classNames[i]);
    if (match) return match[1];
  }
  return null;
}

/**
 * Parses every block-level value-carrying class into a plain config object.
 * @param {Element} block the block root element
 * @returns {Object} parsed { batchSize, headingScalePx } config
 */
function parseValueClasses(block) {
  const classNames = [...block.classList];
  const config = {};
  Object.entries(VALUE_CLASS_PATTERNS).forEach(([key, { pattern, default: fallback }]) => {
    config[key] = extractValue(classNames, pattern) || fallback;
  });
  return config;
}

/**
 * Parses the flat, positionally enumerated panel-N-* modifier classes for a
 * single panel suffix (one of PANEL_SUFFIXES), independent of the other
 * panels — each panel's configuration lives entirely in its own class names.
 * @param {Element} block the block root element
 * @param {string} suffix one of PANEL_SUFFIXES
 * @returns {Object} parsed per-panel config, any field left as null if unset
 */
function parsePanelClasses(block, suffix) {
  const classNames = [...block.classList];
  const config = {};
  Object.entries(PANEL_FIELD_PATTERNS).forEach(([key, patternFor]) => {
    config[key] = extractValue(classNames, patternFor(suffix));
  });
  return config;
}

/**
 * Builds the decorated DOM for a single panel, applying whatever subset of
 * panel-N-* modifiers were authored. Panels with no authored content row at
 * that position are skipped entirely (positional, not container-based).
 * @param {Element} row the authored row for this panel position, or undefined
 * @param {string} suffix one of PANEL_SUFFIXES
 * @param {Element} block the block root element, for reading its class list
 * @returns {Element|null} the built panel element, or null if row is absent
 */
function buildPanel(row, suffix, block) {
  if (!row) return null;
  const panelConfig = parsePanelClasses(block, suffix);

  const panel = document.createElement('div');
  panel.className = `stress-import-panel stress-import-panel-${suffix}`;
  if (panelConfig.iconStyle) panel.dataset.iconStyle = panelConfig.iconStyle;
  if (panelConfig.sizeVariant) panel.dataset.sizeVariant = panelConfig.sizeVariant;
  if (panelConfig.targetMode) panel.dataset.targetMode = panelConfig.targetMode;
  if (panelConfig.confirmLeave) panel.dataset.confirmLeave = panelConfig.confirmLeave;

  panel.append(...row.childNodes);
  return panel;
}

export function decorateStressImport(block) {
  const { batchSize, headingScalePx } = parseValueClasses(block);
  block.dataset.batchSize = batchSize;
  block.style.setProperty('--stress-import-heading-size', `${headingScalePx}px`);

  const rows = [...block.children];
  const panelsWrapper = document.createElement('div');
  panelsWrapper.className = 'stress-import-panels';

  PANEL_SUFFIXES.forEach((suffix, index) => {
    const panel = buildPanel(rows[index], suffix, block);
    if (panel) panelsWrapper.append(panel);
  });

  block.replaceChildren(panelsWrapper);
}
