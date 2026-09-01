import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const [avatarRow, quoteRow, nameRow] = [...block.children];
  const avatarCell = avatarRow?.firstElementChild;
  const quoteCell = quoteRow?.firstElementChild;
  const nameCell = nameRow?.firstElementChild;

  const figure = document.createElement('figure');
  figure.className = 'testimonial-avatar';
  const img = avatarCell?.querySelector('img');
  if (img) {
    figure.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '160' }]));
  }

  const blockquote = document.createElement('blockquote');
  blockquote.className = 'testimonial-quote';
  if (quoteCell) blockquote.append(...quoteCell.childNodes);

  const cite = document.createElement('cite');
  cite.className = 'testimonial-name';
  if (nameCell) cite.append(...nameCell.childNodes);

  block.replaceChildren(figure, blockquote, cite);
}
