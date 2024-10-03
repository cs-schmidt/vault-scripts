import {
  RESERVED_TITLE_REGEX,
  OPEN_TITLE_REGEX,
  PATH_TITLE_REGEX,
  SOURCE_KEY_REGEX,
  SOURCE_KEY_PARSE_REGEX,
  FORMAL_ID_REGEX,
} from './constants.js';

/**
 * Requests an open title for the template from the user.
 * @param {object} tp - The Templater object.
 * @returns {string}
 * @throws {Error} Title matches RESERVED_TITLE_REGEX or doesn't match OPEN_TITLE_REGEX.
 */
export async function requestOpenTitle(tp) {
  const title = (await tp.system.prompt('Open Title:', '', true)).trim();
  if (!isValidOpenTitle(title)) throw Error('Creation Error: Invalid open title.');
  return title;
}

/**
 * Requests a path title for the template from the user.
 * @param {object} tp - The Templater object.
 * @returns {string}
 * @throws {Error} Title matches RESERVED_TITLE_REGEX or doesn't match PATH_TITLE_REGEX.
 */
export async function requestPathTitle(tp) {
  const title = (await tp.system.prompt('Path Title:', '', true)).trim();
  if (!isValidPathTitle(title)) throw Error('Creation Error: Invalid path title.');
  return title;
}

/**
 * Checks if `title` is in OPEN_TITLE format and valid.
 * @param {string} title
 * @returns {boolean}
 */
export function isValidOpenTitle(title) {
  return !RESERVED_TITLE_REGEX.test(title) && OPEN_TITLE_REGEX.test(title);
}

/**
 * Checks if `title` is in PATH_TITLE format and valid.
 * @param {string} title
 * @returns {boolean}
 */
export function isValidPathTitle(title) {
  return !RESERVED_TITLE_REGEX.test(title) && PATH_TITLE_REGEX.test(title);
}

/**
 * Check if the string `str` is a valid source key.
 * @param {string} str
 * @returns {boolean}
 */
export function isValidSourceKey(str) {
  return SOURCE_KEY_REGEX.test(str);
}

/**
 * Check if the string `str` is a valid formal id.
 * @param {string} str
 * @returns {boolean}
 */
export function isValidFormalID(str) {
  return FORMAL_ID_REGEX.test(str);
}

/**
 * Return a source key from `title` if it exists or an empty string otherwise.
 * @param {string} title
 * @returns {string}
 */
export function parseSourceKey(title) {
  return title.match(SOURCE_KEY_PARSE_REGEX)?.[1] || '';
}

/**
 * Check if `fileTitle` is unique under the "entries/" folder.
 * @param {string} [fileTitle='']
 * @returns {boolean}
 */
export function isUniqueEntry(fileTitle = '') {
  return app.vault
    .getMarkdownFiles()
    .every((file) => file.path != `entries/${fileTitle}.md`);
}

/**
 * Finds all formal IDs and returns them as an array.
 * @returns {string[]}
 */
export function fetchFormalIDs() {
  return app.vault
    .getMarkdownFiles()
    .map(
      (file) =>
        file.parent.name === 'entries' &&
        app.metadataCache.getFileCache(file).frontmatter?.['formal-id']
    )
    .filter(Boolean);
}
