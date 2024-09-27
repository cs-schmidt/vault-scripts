import { OPEN_TITLE_REGEX, PATH_TITLE_REGEX, CITATION_KEY_MATCH } from './constants.js';
import { getAPI } from 'obsidian-dataview';

/**
 * Requests an open title for the template from the user (see specification note).
 * @param {Object} tp - The Templater object.
 * @param {boolean} swapSlashes - If slashes should be swapped to hyphens.
 * @returns {string}
 * @throws {Error} The title doesn't match OPEN_TITLE_REGEX or equals 'Untitled'.
 */
export async function requestOpenTitle(tp, swapSlashes = false) {
  const title = (await tp.system.prompt('Open Title:', '', true)).trim();
  if (!isOpenTitle(title)) throw Error('Creation Error: Invalid open title.');
  if (swapSlashes) return swapSlashes(title, '-');
  return title;
}

/**
 * Requests a path title for the template from the user (see specification note).
 * @param {Object} tp - The Templater object.
 * @returns {string}
 * @throws {Error} The title doesn't match PATH_TITLE_REGEX or equals 'Untitled'.
 */
export async function requestPathTitle(tp) {
  const title = (await tp.system.prompt('Path Title:', '', true)).trim();
  if (!isPathTitle(title)) throw Error('Creation Error: Invalid path title.');
  return title;
}

/**
 * Asks the user if the template pertains to a citeable source.
 * @param {Object} tp - The Templater object.
 * @return {boolean}
 */
export async function isForCitableSource(tp) {
  return tp.system.suggester(
    ['Citable', 'Noncitable'],
    [true, false],
    true,
    'Citable or noncitable source?'
  );
}

/**
 * Checks if `title` is in OPEN_TITLE format.
 * @param {string} title
 * @returns {boolean}
 */
export function isOpenTitle(title) {
  return title !== 'Untitled' && OPEN_TITLE_REGEX.test(title);
}

/**
 * Checks if `title` is in PATH_TITLE format.
 * @param {string} title
 * @returns {boolean}
 */
export function isPathTitle(title) {
  return title !== 'Untitled' && PATH_TITLE_REGEX.test(title);
}

/**
 * Return a citation key match from `title` if it exists or an empty string otherwise.
 * @param {string} title
 * @returns {string}
 */
export function grabCitationKey(title) {
  return title.match(`^${CITATION_KEY_MATCH}`) || '';
}

/**
 * Replace all slashes in `title` to `str`.
 * @param {string} title
 * @param {string} str
 * @returns {string}
 */
export function swapSlashes(title, str) {
  return title.replaceAll(/[\/\\]/g, str);
}

/**
 * Check if `filename` is unique under the "entries/" folder.
 * @param {string} filename
 * @returns {boolean}
 */
export function isUniqueFilename(filename) {
  // TODO: Make this throw an error when Dataview isn't available.
  return getAPI()
    .pages('"entries"')
    .map((page) => page.file.name)
    .every((pageFilename) => pageFilename !== filename);
}
