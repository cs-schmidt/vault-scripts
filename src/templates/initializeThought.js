import { requestOpenTitle, swapSlashes, isUniqueFilename } from '../utils/templates.js';

// NOTE: Files created in Obsidian are always named "Untitled" initially.
// NOTE: When "Show inline title" and "Show tab title bar" are turned off you'll get an
//       extra naming prompt upon entry creation.

/**
 * The initialization function for the thought template.
 * @param {Object} tp - The Templater object.
 * @returns {Object} User-collected data for instantiation.
 * @throws {Error} If any of the initialization steps throw an error.
 */
export default async function initializeThought(tp) {
  const title = await requestOpenTitle(tp);
  const filename = swapSlashes(title, '-');
  if (!isUniqueFilename(filename)) throw Error("Creation Error: Title isn't unique.");
  await tp.file.rename(filename);
  return { title };
}
