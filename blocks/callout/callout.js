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

  // theme variant (theme-light/theme-dark/theme-brand) is applied via CSS only, no JS needed
  block.replaceChildren(heading, description);
}
