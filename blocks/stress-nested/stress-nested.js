/*
 * Stress Nested Block (TEST FIXTURE — not a real production block)
 * Two levels of container nesting (stress-nested -> group -> item), one
 * level deeper than any real block in this repo (e.g. Cards -> Card is
 * only one level). Deliberately exercises get_block_fields'/
 * get_block_markdown_template's container-child merging, which only
 * recurses one level (see containerChildIds in tools.js).
 */

export default function decorate(block) {
  const groupsList = document.createElement('ul');
  groupsList.className = 'stress-nested-groups';

  [...block.children].forEach((groupRow) => {
    const [titleCell, ...itemCells] = [...groupRow.children];
    const groupItem = document.createElement('li');
    groupItem.className = 'stress-nested-group';

    if (titleCell && titleCell.textContent.trim()) {
      const heading = document.createElement('h3');
      heading.append(...titleCell.childNodes);
      groupItem.append(heading);
    }

    const itemsList = document.createElement('ul');
    itemsList.className = 'stress-nested-items';
    itemCells.forEach((itemCell) => {
      const item = document.createElement('li');
      item.className = 'stress-nested-item';
      item.append(...itemCell.childNodes);
      itemsList.append(item);
    });
    groupItem.append(itemsList);
    groupsList.append(groupItem);
  });

  block.replaceChildren(groupsList);
}
