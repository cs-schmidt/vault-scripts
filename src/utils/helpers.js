import {
  RESERVED_TITLE_REGEX,
  OPEN_TITLE_REGEX,
  PATH_TITLE_REGEX,
  SOURCE_KEY_REGEX,
  SOURCE_KEY_PARSE_REGEX,
  FORMAL_ID_REGEX,
} from './constants';
import { FormalIDPrompt, SourceKeyPrompt } from '../components';

/**
 * Requests an open title for the template from the user.
 * @param {object} tp The Templater object.
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
 * @param {object} tp The Templater object.
 * @returns {string}
 * @throws {Error} Title matches RESERVED_TITLE_REGEX or doesn't match PATH_TITLE_REGEX.
 */
export async function requestPathTitle(tp) {
  const title = (await tp.system.prompt('Path Title:', '', true)).trim();
  if (!isValidPathTitle(title)) throw Error('Creation Error: Invalid path title.');
  return title;
}

/**
 * Generates a prompt to request a formal ID from the user.
 * @returns {Promise<string>}
 * @throws {string} Throws an error message when the prompt is cancelled.
 */
export async function requestFormalID() {
  return new Promise((resolve, reject) => new FormalIDPrompt({ resolve, reject }).open());
}

/**
 * Generates a prompt to request a source key from the user.
 * @param {boolean} noSourceless Allows the sourceless key ($) to be a valid option.
 * @returns {Promise<string>}
 * @throws {string} Throws an error message when the prompt is cancelled.
 */
export async function requestSourceKey(noSourceless = true) {
  return new Promise((resolve, reject) =>
    new SourceKeyPrompt({ resolve, reject }, noSourceless).open(),
  );
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
 * Check if `title` is unique under the "entries/" folder.
 * @param {string} [title='']
 * @returns {boolean}
 */
export function isUniqueEntry(title = '') {
  return app.vault.getMarkdownFiles().every((file) => file.path != `entries/${title}.md`);
}

/**
 * Finds all source keys and returns them in an array.
 * @returns {string[]}
 */
export function fetchSourceKeys() {
  return app.vault
    .getMarkdownFiles()
    .filter((file) => file.parent.name === 'entries')
    .map((file) => app.metadataCache.getFileCache(file).frontmatter?.['source-key'])
    .filter(isValidSourceKey);
}

/**
 * Finds all formal IDs and returns them in an array.
 * @returns {string[]}
 */
export function fetchFormalIDs() {
  return app.vault
    .getMarkdownFiles()
    .filter((file) => file.parent.name === 'entries')
    .map((file) => app.metadataCache.getFileCache(file).frontmatter?.['formal-id'])
    .filter(isValidFormalID);
}

/**
 * Takes a string and returns a copy with the first letter capitalized.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (typeof str != 'string') throw Error('Capitalize must be called on a string.');
  if (str == '') return str;
  return str[0].toUpperCase() + str.slice(1);
}
