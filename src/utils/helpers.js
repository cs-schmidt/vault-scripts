import { isValidSourceKey, isValidFormalID } from './entries';
import is from './types';

/** @typedef {import('obsidian').TFile} TFile */

/**
 * Finds all markdown files under the "entries" folder and return them.
 * @returns {TFile[]}
 */
export function fetchEntries() {
  return app.vault.getMarkdownFiles().filter((file) => file.parent.path === 'entries');
}

/**
 * Finds all source keys and returns them in an array.
 * @returns {string[]}
 */
export function fetchSourceKeys() {
  return fetchEntries()
    .map((file) => app.metadataCache.getFileCache(file).frontmatter?.['source-key'])
    .filter(isValidSourceKey);
}

/**
 * Finds all formal IDs and returns them in an array.
 * @returns {string[]}
 */
export function fetchFormalIDs() {
  return fetchEntries()
    .map((file) => app.metadataCache.getFileCache(file).frontmatter?.['formal-id'])
    .filter(isValidFormalID);
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
 * Takes a string and returns a copy with the first letter capitalized.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!is.string(str)) throw Error('Capitalize must be called on a string.');
  if (str == '') return str;
  return str[0].toUpperCase() + str.slice(1);
}
