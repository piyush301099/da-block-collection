/*
 * Stress Tokens Block (TEST FIXTURE — not a real production block)
 * Deliberately verbose JS used to stress-test the block-library MCP's
 * get_block_source tool against a large raw-source token payload. Mirrors
 * a realistic over-documented internal helper library rather than purely
 * repeated junk, so the resulting token load resembles genuine bloat.
 */

/**
 * Applies the "tile-01" treatment to a decorated row element.
 * This tile uses the low-contrast informational color ramp defined in
 * stress-tokens.css and is the default treatment applied to the first
 * authored row when no other row-specific override is detected.
 * @param {Element} row the row element to decorate
 */
function decorateTile01(row) {
  row.classList.add('tile-01');
}

/**
 * Applies the "tile-02" treatment to a decorated row element.
 * Structurally identical to decorateTile01 — kept as a separate named
 * function (rather than a parameterized loop) to mirror how a real
 * legacy codebase accumulates near-duplicate helpers over time instead
 * of refactoring them into a single shared implementation.
 * @param {Element} row the row element to decorate
 */
function decorateTile02(row) {
  row.classList.add('tile-02');
}

/**
 * Applies the "tile-03" treatment to a decorated row element.
 * @param {Element} row the row element to decorate
 */
function decorateTile03(row) {
  row.classList.add('tile-03');
}

/**
 * Applies the "tile-04" treatment to a decorated row element.
 * @param {Element} row the row element to decorate
 */
function decorateTile04(row) {
  row.classList.add('tile-04');
}

/**
 * Applies the "tile-05" treatment to a decorated row element.
 * @param {Element} row the row element to decorate
 */
function decorateTile05(row) {
  row.classList.add('tile-05');
}

/**
 * Applies the "tile-06" treatment to a decorated row element.
 * @param {Element} row the row element to decorate
 */
function decorateTile06(row) {
  row.classList.add('tile-06');
}

/**
 * Applies the "tile-07" treatment to a decorated row element.
 * @param {Element} row the row element to decorate
 */
function decorateTile07(row) {
  row.classList.add('tile-07');
}

/**
 * Applies the "tile-08" treatment to a decorated row element.
 * @param {Element} row the row element to decorate
 */
function decorateTile08(row) {
  row.classList.add('tile-08');
}

/**
 * Applies the "tile-09" treatment to a decorated row element.
 * @param {Element} row the row element to decorate
 */
function decorateTile09(row) {
  row.classList.add('tile-09');
}

/**
 * Applies the "tile-10" treatment to a decorated row element. This is
 * the last tile in the "rounded" batch (01-10) — rows beyond the tenth
 * authored row wrap back around to the dense "tabular" batch (11-20)
 * via the modulo logic in decorateRow below.
 * @param {Element} row the row element to decorate
 */
function decorateTile10(row) {
  row.classList.add('tile-10');
}

/**
 * Applies the "tile-11" treatment to a decorated row element. First of
 * the dense/tabular batch — sharper corners, tighter padding, smaller
 * type scale, intended for report-style content rather than marketing
 * copy. See stress-tokens.css for the full rationale on this batch.
 * @param {Element} row the row element to decorate
 */
function decorateTile11(row) {
  row.classList.add('tile-11');
}

/**
 * Applies the "tile-12" treatment to a decorated row element.
 * @param {Element} row the row element to decorate
 */
function decorateTile12(row) {
  row.classList.add('tile-12');
}

/**
 * Applies the "tile-13" treatment to a decorated row element.
 * @param {Element} row the row element to decorate
 */
function decorateTile13(row) {
  row.classList.add('tile-13');
}

/**
 * Applies the "tile-14" treatment to a decorated row element.
 * @param {Element} row the row element to decorate
 */
function decorateTile14(row) {
  row.classList.add('tile-14');
}

/**
 * Applies the "tile-15" treatment to a decorated row element.
 * @param {Element} row the row element to decorate
 */
function decorateTile15(row) {
  row.classList.add('tile-15');
}

/**
 * Applies the "tile-16" treatment to a decorated row element.
 * @param {Element} row the row element to decorate
 */
function decorateTile16(row) {
  row.classList.add('tile-16');
}

/**
 * Applies the "tile-17" treatment to a decorated row element.
 * @param {Element} row the row element to decorate
 */
function decorateTile17(row) {
  row.classList.add('tile-17');
}

/**
 * Applies the "tile-18" treatment to a decorated row element.
 * @param {Element} row the row element to decorate
 */
function decorateTile18(row) {
  row.classList.add('tile-18');
}

/**
 * Applies the "tile-19" treatment to a decorated row element.
 * @param {Element} row the row element to decorate
 */
function decorateTile19(row) {
  row.classList.add('tile-19');
}

/**
 * Applies the "tile-20" treatment to a decorated row element. Last of
 * the dense/tabular batch — rows beyond the twentieth authored row
 * wrap back around to tile-01 via the modulo logic in decorateRow.
 * @param {Element} row the row element to decorate
 */
function decorateTile20(row) {
  row.classList.add('tile-20');
}

/**
 * Ordered lookup of every tile decorator, indexed by (rowIndex % 20).
 * Centralizing the lookup here (rather than a long if/else chain) is
 * the one piece of this file that deviates from the "legacy sprawl"
 * simulation — included so the dispatch logic itself stays readable
 * even though every individual tile decorator above is intentionally
 * unfactored.
 */
const TILE_DECORATORS = [
  decorateTile01, decorateTile02, decorateTile03, decorateTile04,
  decorateTile05, decorateTile06, decorateTile07, decorateTile08,
  decorateTile09, decorateTile10, decorateTile11, decorateTile12,
  decorateTile13, decorateTile14, decorateTile15, decorateTile16,
  decorateTile17, decorateTile18, decorateTile19, decorateTile20,
];

/**
 * Decorates a single authored row by assigning it a tile class based
 * on its position among all authored rows, cycling through the full
 * TILE_DECORATORS list so that any number of authored rows is handled
 * without the author needing to pick a tile explicitly.
 * @param {Element} row the row element to decorate
 * @param {number} rowIndex the zero-based index of this row
 */
function decorateRow(row, rowIndex) {
  const decorator = TILE_DECORATORS[rowIndex % TILE_DECORATORS.length];
  decorator(row);
}

/**
 * Reads the "emphasis" block-name-row modifier. When present, this is
 * purely a behavioral flag consumed here in JS (as opposed to the
 * "compact" modifier, which is handled entirely in CSS and never
 * referenced in this file at all).
 * @param {Element} block the block root element
 * @returns {boolean} whether the emphasis modifier was authored
 */
function hasEmphasis(block) {
  return block.classList.contains('emphasis');
}

/**
 * Applies any emphasis-driven adjustments beyond what CSS alone can
 * express — in this fixture that's limited to adding an aria-label
 * hint so the behavioral/cosmetic distinction documented in SKILL.md
 * Core rule 7 has a concrete, testable example to point at.
 * @param {Element} block the block root element
 */
function applyEmphasisBehavior(block) {
  if (hasEmphasis(block)) {
    block.setAttribute('aria-label', 'Emphasized stress tokens panel');
  }
}

export default function decorate(block) {
  [...block.children].forEach((row, rowIndex) => {
    decorateRow(row, rowIndex);
  });
  applyEmphasisBehavior(block);
}
