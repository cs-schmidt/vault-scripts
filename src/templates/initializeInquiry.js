import {
  isOpenTitle,
  isPathTitle,
  isUniqueFilename,
  grabCitationKey,
} from '../utils/templates.js';

// NOTE: Files created in Obsidian are always named "Untitled" initially.
// NOTE: When "Show inline title" and "Show tab title bar" are toggled off you'll get an
//       extra naming prompt when creating an entry.

/**
 * The initialization function for the inquiry template.
 * @param {Object} tp - The Templater object.
 * @returns {Object} User-gathered data for instantiation.
 * @throws {Error} If any of the initialization steps throw an error.
 */
export default async function initializeInquiry(tp) {
  const title = (await isCitableSource(tp))
    ? await requestPathTitle(tp)
    : await requestOpenTitle(tp, true);
  if (!isUniqueFilename(title)) throw Error('Creation Error: Title is not unique.');
  await tp.file.rename(title);
  return { title, citationKey: grabCitationKey(title) };
}

/**
 * Asks the user if the inquiry pertains to a citeable source.
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
 * Requests a path title for the inquiry from the user (see specification note).
 * @param {Object} tp - The Templater object.
 * @returns {string}
 * @throws {Error} The title doesn't match PATH_TITLE_REGEX or equals 'Untitled'.
 */
async function requestPathTitle(tp) {
  const title = (await tp.system.prompt('Path Title:', '', true)).trim();
  if (!isPathTitle(title)) throw Error('Creation Error: Invalid path title format.');
  return title;
}

/**
 * Requests an open title for the inquiry from the user (see specification note).
 * @param {Object} tp - The Templater object.
 * @param {boolean} stripSlashes - If slashes should be stripped or not.
 * @returns {string}
 * @throws {Error} The title doesn't match OPEN_TITLE_REGEX or equals 'Untitled'.
 */
async function requestOpenTitle(tp, stripSlashes = false) {
  const title = (await tp.system.prompt('Open Title:', '', true)).trim();
  if (!isOpenTitle(title)) throw Error('Creation Error: Invalid open title format.');
  if (stripSlashes) return title.replaceAll(/[\/\\]/g, '-');
  return title;
}
