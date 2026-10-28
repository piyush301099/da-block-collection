export default async function decorate(block) {
  // Same positional contract as the Lilly pull-quote: [image, quote, author]
  const [imageDiv, quoteDiv, authorDiv] = [...block.children];

  const picture = imageDiv?.querySelector('picture');
  const quote = quoteDiv?.firstElementChild;
  const [author, authorTitle] = authorDiv?.querySelectorAll('p') || [];

  const figure = document.createElement('figure');
  if (picture?.querySelector('img')?.getAttribute('src')) {
    const media = document.createElement('div');
    media.className = 'poc-pull-quote-media';
    media.append(picture);
    figure.append(media);
  }

  const blockquote = document.createElement('blockquote');
  blockquote.className = 'poc-pull-quote-text';
  if (quote) blockquote.append(...quote.childNodes);

  const caption = document.createElement('figcaption');
  if (author?.textContent.trim()) {
    const name = document.createElement('strong');
    name.textContent = author.textContent.trim();
    caption.append(name);
  }
  if (authorTitle?.textContent.trim()) {
    const title = document.createElement('span');
    title.textContent = authorTitle.textContent.trim();
    caption.append(title);
  }

  figure.append(blockquote, caption);
  block.replaceChildren(figure);
}
