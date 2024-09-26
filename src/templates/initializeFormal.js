/**
 * The Templater user script used by the formal template for instantiating formal
 * entries.
 */

import { getAPI } from 'obsidian-dataview';
import { OPEN_TITLE_REGEX } from '../utils/constants.js';
import isUniqueFilename from '../utils/isUniqueFilename.js';

// NOTE: Files created in Obsidian are always named "Untitled" initially.
// NOTE: When "Show inline title" and "Show tab title bar" are toggled off you'll get an
//       extra naming prompt when creating an entry.

const formalTypes = ['Definition', 'Theorem', 'Lemma', 'Proposition'];

/**
 * The initialization function used to instantiate formal entries. This procedure is
 * used by the formal template.
 * @param {Object} tp - The Templater object.
 * @returns {Object} Data gathered from the user for instantiation.
 * @throws {Error} If any of the initialization steps throw an error.
 */
export default async function initializeFormal(tp) {
  const type = await requestFormalType(tp);
  const result = { type, title: await requestTitle(tp, type) };
  const filename = result.title.replaceAll(/[\/\\]/g, '-');
  if (isUniqueFilename(filename)) await tp.file.rename(filename);
  else throw Error("Creation Error: Title isn't unique.");
  return result;
}

/**
 * Requests the type of the formal entry from the user.
 * @param {Object} tp - The Templater object.
 * @returns {string}
 */
async function requestFormalType(tp) {
  const result = await tp.system.suggester(
    formalTypes,
    formalTypes.map((type) => type.toLowerCase()),
    true,
    'Formal Type:'
  );
  return result;
}

/**
 * Requests a title for the formal entry from the user.
 * @param {Object} tp - The Templater object.
 * @param {string} type - The formal entry's type.
 * @return {string}
 * @throws {Error} When the title submitted in invalid or Obsidian's default.
 */
async function requestTitle(tp, type) {
  const usesGeneratedTitle = await tp.system.suggester(
    ['Yes', 'No'],
    [true, false],
    true,
    'Generated title?'
  );
  const result = (
    await tp.system.prompt(
      `${type.charAt(0).toUpperCase() + type.slice(1)} Title:`,
      '',
      true
    )
  ).trim();
  if (!usesGeneratedTitle) {
    if (!OPEN_TITLE_REGEX.test(result))
      throw Error('Creation Error: Invalid title format.');
  } else {
    const pages = getAPI().pages('"entries"');
    const defaultTitleMatch = `/^(?:${formalTypes.join('|')}) XXXX-(?:0|[1-9]\d*)$/`;
    const defaultTitleRegExp = new RegExp(defaultTitleMatch);
    const remainingDefaultTitles = pages.where((page) =>
      defaultTitleRegExp.test(page.file.name.trim())
    );
  }
  return result;
}
