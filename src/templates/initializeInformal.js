/**
 * The Templater user script used by the informal template to instantiate informal
 * entries.
 */

import { OPEN_TITLE_REGEX } from '../utils/constants.js';
import isUniqueFilename from '../utils/isUniqueFilename.js';

// NOTE: Files created in Obsidian are always named "Untitled" initially.
// NOTE: When "Show inline title" and "Show tab title bar" are toggled off you'll get an
//       extra naming prompt when creating an entry.

/**
 * The initialization function for the informal template.
 * @param {Object} tp - The Templater object.
 * @returns {Object} User-gathered data for instantiation.
 * @throws {Error} If any of the initialization steps throw an error.
 */
export default async function initializeInformal(tp) {
  const title = await requestOpenTitle(tp);
  const filename = title.replaceAll(/[\/\\]/g, '-');
  if (!isUniqueFilename(filename)) throw Error('Creation Error: Title is not unique');
  const formalID = 'test';
  // const formalID = await requestFormalID(tp);
  // await tp.file.rename(filename);
  return { title, formalID };
}

/**
 * Requests an open title for the informal entry from the user (see specification note).
 * @param {Object} tp - The Templater object.
 * @returns {string}
 * @throws {Error} When the title submitted is invalid.
 */
async function requestOpenTitle(tp) {
  const result = (await tp.system.prompt('Open Title:', '', true)).trim();
  if (!OPEN_TITLE_REGEX.test(result) || result === 'Untitled')
    throw Error('Creation Error: Invalid open title.');
  return result;
}
