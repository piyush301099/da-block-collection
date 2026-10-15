/**
 * Applies the `classes` field's value to the block as CSS classes. Defensive
 * against both rendering shapes seen in production EDS/UE blocks: container
 * (xwalk) authoring renders it as a `data-classes` attribute, while document
 * (DA) authoring can occasionally leave it as an unconsumed content row
 * instead of pre-applying the values to classList.
 * @param {Element} block
 */
function applyBlockClasses(block) {
  const addClasses = (value) => {
    value
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)
      .forEach((token) => block.classList.add(token));
  };

  const dataClasses = block.dataset.classes?.trim();
  if (dataClasses) {
    addClasses(dataClasses);
    delete block.dataset.classes;
  }

  const classesRows = [...block.children].filter((row) => {
    if (row.children.length !== 1) return false;
    if (row.querySelector('[data-aue-prop="classes"]')) return true;
    const rowValue = row.firstElementChild?.textContent?.trim() || '';
    return rowValue.split(/\s+/).some((token) => /^(theme|icon)-/.test(token));
  });

  classesRows.forEach((row) => {
    const classesValue = (
      row.querySelector('[data-aue-prop="classes"]')?.textContent
      || row.firstElementChild?.textContent
      || ''
    ).trim();
    if (classesValue) addClasses(classesValue);
    row.remove();
  });
}

export default function decorate(block) {
  applyBlockClasses(block);

  const [headingRow, descriptionRow] = [...block.children];
  const headingCell = headingRow?.firstElementChild;
  const descriptionCell = descriptionRow?.firstElementChild;

  const heading = document.createElement('h3');
  heading.className = 'callout-heading';
  if (headingCell) heading.append(...headingCell.childNodes);

  const description = document.createElement('div');
  description.className = 'callout-description';
  if (descriptionCell) description.append(...descriptionCell.childNodes);

  // theme variant (theme-light/theme-dark/theme-brand) is applied via CSS only, no JS needed
  // icon variant is authored as an icon-* modifier class on the block itself, same as video's classes_autoplay
  const iconClass = [...block.classList].find((c) => c.startsWith('icon-'));
  const iconType = iconClass ? iconClass.replace('icon-', '') : 'none';

  block.replaceChildren();
  if (iconType !== 'none') {
    const icon = document.createElement('span');
    icon.className = `callout-icon callout-icon-${iconType}`;
    icon.setAttribute('aria-hidden', 'true');
    block.append(icon);
  }
  block.append(heading, description);
}
