export default function decorate(block) {
  const [headingRow, descriptionRow] = [...block.children];
  const headingCell = headingRow?.firstElementChild;
  const descriptionCell = descriptionRow?.firstElementChild;

  const heading = document.createElement('h3');
  heading.className = 'callout-heading';
  if (headingCell) heading.append(...headingCell.childNodes);

  const description = document.createElement('div');
  description.className = 'callout-description';
  if (descriptionCell) description.append(...descriptionCell.childNodes);

  // icon variant is authored as an icon-* modifier class on the block itself
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
