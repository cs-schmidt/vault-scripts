/** The Templater user script used by the thought template to instantiate a thought. */

// NOTE: Files created in Obsidian are always named "Untitled" initially.
// NOTE: When "Show inline title" and "Show tab title bar" are toggled off you'll get an
//       extra naming prompt when creating an entry.

import { OPEN_TITLE_REGEX } from '../utils/constants.js';
import isUniqueFilename from '../utils/isUniqueFilename.js';

/**
 * The initialization function used to instantiate thoughts. This procedure is used by
 * the thought template.
 * @param {Object} tp - The Templater object.
 * @returns {Object} Data gathered from the user for instantiation.
 * @throws {Error} When any of the initialization procedures throw an error.
 */
export default async function initializeThought(tp) {
  const result = { title: await requestTitle(tp) };
  const filename = result.title.replaceAll(/[\/\\]/g, '-');
  if (isUniqueFilename(filename)) await tp.file.rename(filename);
  else throw Error("Creation Error: Title isn't unique.");
  return result;
}

/**
 * Requests a title for the thought from the user.
 * @param {Object} tp - The Templater object.
 * @returns {string}
 * @throws {Error} When the input's format is improper or equal to Obsidian's default.
 */
async function requestTitle(tp) {
  const result = (await tp.system.prompt('Unique Title:', '', true)).trim();
  if (!OPEN_TITLE_REGEX.test(result))
    throw Error('Creation Error: Invalid title format.');
  if (result === 'Untitled') throw Error('Creation Error: Default title is reserved.');
  return result;
}
