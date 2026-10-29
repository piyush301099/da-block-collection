const RINGSIDE_SIZE_CLASS = {
  '14px': 'poc-body-small',
  '16px': 'poc-body-medium',
  '20px': 'poc-body-large',
  '24px': 'poc-heading-6',
  '28px': 'poc-heading-5',
  '32px': 'poc-heading-4',
  '36px': 'poc-heading-3',
  '48px': 'poc-heading-2',
  '60px': 'poc-heading-1',
  '100px': 'poc-display-extra-large',
};

// Same patterns and defaults as eds/blocks/pull-quote/pull-quote-config.js in the Lilly repo.
function readOption(classes, pattern, fallback) {
  const match = classes.map((c) => c.match(pattern)).find(Boolean);
  return match ? match[1] : fallback;
}

export default async function decorate(block) {
  const classes = [...block.classList];
  const componentType = readOption(classes, /^image-(.+)$/, 'none');
  const imagePosition = readOption(classes, /^align-(.+)$/, 'left');
  const alignment = readOption(classes, /^icon-align-(.+)$/, 'left');
  const fontSize = readOption(classes, /^quote-fs-(.+)$/, '36px');

  // Positional contract, same as Lilly: [image, quote, author]
  const [imageDiv, quoteDiv, authorDiv] = [...block.children];
  const picture = imageDiv?.querySelector('picture');
  const quote = quoteDiv?.firstElementChild;
  const [author, authorTitle] = authorDiv?.querySelectorAll('p') || [];

  const wrapper = document.createElement('div');
  wrapper.className = 'quote-wrapper';

  const hasImage = componentType !== 'none' && picture?.querySelector('img')?.getAttribute('src');
  if (hasImage) {
    picture.classList.add('quote-image');
    if (imagePosition === 'right') wrapper.classList.add('image-right');
    wrapper.append(picture);
  }

  const text = document.createElement('blockquote');
  text.className = 'quote-text';
  if (componentType === 'none' && alignment === 'center') text.classList.add('ta-center', 'ai-center');

  const icon = document.createElement('span');
  icon.className = 'icon-quote';
  icon.setAttribute('aria-hidden', 'true');
  text.append(icon);

  if (quote) {
    const sizeClass = RINGSIDE_SIZE_CLASS[fontSize];
    if (sizeClass) {
      const targets = quote.children.length ? quote.querySelectorAll('*') : [quote];
      targets.forEach((el) => el.classList.add(sizeClass));
    }
    const content = document.createElement('div');
    content.className = 'quote-content';
    content.append(quote);
    text.append(content);
  }

  const authorText = author?.textContent.trim();
  if (authorText) {
    const isLarge = quote?.querySelector('h1, h2');
    const authorEl = document.createElement('p');
    authorEl.className = `quote-author ${isLarge ? 'quote-author-large' : 'quote-author-small'}`;
    authorEl.textContent = authorText;
    text.append(authorEl);
  }

  const titleText = authorTitle?.textContent.trim();
  if (titleText) {
    const titleEl = document.createElement('p');
    titleEl.className = 'quote-author-title';
    titleEl.textContent = titleText;
    text.append(titleEl);
  }

  wrapper.append(text);
  block.replaceChildren(wrapper);
}
