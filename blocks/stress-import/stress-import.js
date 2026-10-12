/**
 * Stress Import Block (TEST FIXTURE — not a real production block)
 * Deliberately thin wrapper that delegates all real logic to an external
 * helper module living OUTSIDE blocks/ (scripts/stress-import-helpers.js) —
 * mirroring a real-world pattern (seen in a production AEM block) where a
 * block's actual implementation is imported from a shared src/ directory.
 * get_block_source only fetches blocks/{name}/{name}.js + .css, so it can
 * never see what's inside the imported helper — this is the architectural
 * blind spot this fixture is built to expose.
 */
import { decorateStressImport } from '../../scripts/stress-import-helpers.js';

export default function decorate(block) {
  decorateStressImport(block);
}
