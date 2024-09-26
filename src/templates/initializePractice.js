/**
 * The Templater user script used by the practice template to instantiate practice
 * entries.
 */

import {
  CITATION_KEY_MATCH,
  PATH_TITLE_REGEX,
  OPEN_TITLE_REGEX,
} from '../utils/constants.js';
import isUniqueFilename from '../utils/isUniqueFilename.js';

// NOTE: Files created in Obsidian are always named "Untitled" initially.
// NOTE: When "Show inline title" and "Show tab title bar" are toggled off you'll get an
//       extra naming prompt when creating an entry.

/**
 * The initialization function for the practice template.
 * @param {Object} tp - The Templater object.
 * @returns {Object} User-gathered data for instantiation.
 * @throws {Error} If any of the initialization steps throw an error.
 */
export default async function initializePractice(tp) {
  const title = (await isCitableSource(tp))
    ? await requestPathTitle(tp)
    : await requestOpenTitle(tp);
  const citationKey = title.match(`^${CITATION_KEY_MATCH}`) || '';
  const countType = await isOneQuestion(tp);
  if (!isUniqueFilename(title)) throw Error('Creation Error: Title is not unique.');
  await tp.file.rename(title);
  return Object.freeze({ title, citationKey, countType });
}

/**
 * Asks the user if the practice entry pertains to a citeable source.
 * @param {Object} tp - The Templater object.
 * @return {boolean}
 */
async function isCitableSource(tp) {
  return tp.system.suggester(
    ['Citable', 'Noncitable'],
    [true, false],
    true,
    'Citable or noncitable source?'
  );
}

/**
 * Asks the user if the practice entry is for a single-question-source.
 * @param {Object} tp - The Templater object.
 * @returns {('one'|'many')}
 */
async function isOneQuestion(tp) {
  return tp.system.suggester(
    ['One Question', 'Many Questions'],
    ['one', 'many'],
    true,
    'One or many questions from source?'
  );
}

/**
 * Requests a path title for the practice entry from the user (see specification note).
 * @param {Object} tp - The Templater object.
 * @returns {string}
 * @throws {Error} When the submitted path title is invalid.
 */
async function requestPathTitle(tp) {
  const result = (await tp.system.prompt('Path Title:', '', true)).trim();
  if (!PATH_TITLE_REGEX.test(result) || result === 'Untitled')
    throw Error('Creation Error: Invalid path title.');
  return result;
}

/**
 * Requests an open title for the practice entry from the user (see specification note).
 * @param {Object} tp - The Templater object.
 * @returns {string}
 * @throws {Error} When the title submitted is invalid.
 */
async function requestOpenTitle(tp) {
  const result = (await tp.system.prompt('Open Title:', '', true))
    .trim()
    .replaceAll(/[\/\\]/g, '-');
  if (!OPEN_TITLE_REGEX.test(result) || result === 'Untitled')
    throw Error('Creation Error: Invalid open title.');
  return result;
}
