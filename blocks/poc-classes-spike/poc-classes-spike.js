export default async function decorate(block) {
  // Spike output: shows exactly which classes DA UE put on the block.
  const classes = [...block.classList].filter((c) => c !== 'poc-classes-spike' && c !== 'block');
  const rows = block.children.length;
  const text = block.querySelector(':scope > div > div')?.innerHTML || '';

  const report = document.createElement('div');
  report.className = 'poc-classes-spike-report';
  report.innerHTML = `
    <p><strong>rows:</strong> ${rows}</p>
    <p><strong>block classes (${classes.length}):</strong> ${classes.length ? classes.map((c) => `<code>${c}</code>`).join(' ') : '<em>none</em>'}</p>
    <div class="poc-classes-spike-text">${text}</div>`;
  block.replaceChildren(report);
}
