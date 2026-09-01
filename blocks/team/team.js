import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const [titleRow, descriptionRow, ...memberRows] = [...block.children];

  const header = document.createElement('div');
  header.className = 'team-header';
  if (titleRow?.firstElementChild?.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.append(...titleRow.firstElementChild.childNodes);
    header.append(h2);
  }
  if (descriptionRow?.firstElementChild?.textContent.trim()) {
    const p = document.createElement('p');
    p.className = 'team-description';
    p.append(...descriptionRow.firstElementChild.childNodes);
    header.append(p);
  }

  const ul = document.createElement('ul');
  ul.className = 'team-grid';
  memberRows.forEach((row) => {
    const li = document.createElement('li');
    li.className = 'team-member';
    const [photoCell, nameCell, roleCell, bioCell, linkCell] = [...row.children];

    if (photoCell) {
      photoCell.className = 'team-member-photo';
      li.append(photoCell);
    }

    const body = document.createElement('div');
    body.className = 'team-member-body';
    if (nameCell) {
      nameCell.className = 'team-member-name';
      body.append(nameCell);
    }
    if (roleCell) {
      roleCell.className = 'team-member-role';
      body.append(roleCell);
    }
    if (bioCell) {
      bioCell.className = 'team-member-bio';
      body.append(bioCell);
    }
    if (linkCell) {
      linkCell.className = 'team-member-link';
      body.append(linkCell);
    }
    li.append(body);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture')
    .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }])));

  block.replaceChildren(header, ul);
}
