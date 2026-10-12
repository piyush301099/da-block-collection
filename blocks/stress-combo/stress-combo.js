/*
 * Stress Combo Block (TEST FIXTURE — not a real production block)
 * 12 fully independent block-name-row modifier classes, each checked via
 * classList.contains() with no mutual-exclusivity logic between them.
 * 2^12 = 4096 possible combinations — deliberately adversarial input for
 * SKILL.md Core rule 9's "enumerate the full combination set" instruction.
 */

const MODIFIERS = [
  'mod-a', 'mod-b', 'mod-c', 'mod-d', 'mod-e', 'mod-f',
  'mod-g', 'mod-h', 'mod-i', 'mod-j', 'mod-k', 'mod-l',
];

export default function decorate(block) {
  const active = MODIFIERS.filter((name) => block.classList.contains(name));
  block.dataset.activeModifiers = active.join(',');
}
