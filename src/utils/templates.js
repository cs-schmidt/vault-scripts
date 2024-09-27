import { OPEN_TITLE_REGEX, PATH_TITLE_REGEX, CITATION_KEY_MATCH } from './constants.js';
import { getAPI } from 'obsidian-dataview';

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
