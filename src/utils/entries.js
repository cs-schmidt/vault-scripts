import { ConfirmationModal, FormalIDPrompt, SourceKeyPrompt } from '../components';
import {
  SOURCE_KEY_REGEX,
  SOURCE_TRAIL_MATCH,
  SOURCE_KEY_PREFIX_REGEX,
  PATH_TITLE_REGEX,
  OPEN_TITLE_REGEX,
  RESERVED_TITLE_REGEX,
  BIBTEX_KEY_REGEX,
  FORMAL_ID_REGEX,
  FORMAL_AUTO_TITLE_REGEX,
} from './constants';
import { isEmpty } from 'lodash-es';
import is from './types';

/** @typedef {import('obsidian').TFile} TFile */

/**
 * Requests confirmation from the user.
 * @returns {boolean}
 */
export async function requestConfirmation() {
  return new Promise((resolve) => new ConfirmationModal(resolve).open());
}

/**
 * Requests a source key from the user.
 * @param {boolean} noSourceless Allows the sourceless key as an option.
 * @returns {Promise<string>}
 * @throws {Error} Throws an when the prompt is cancelled.
 */
export async function requestSourceKey(noSourceless = true) {
  return new Promise((resolve, reject) =>
    new SourceKeyPrompt({ resolve, reject }, noSourceless).open(),
  );
}

/**
 * Requests a subsource trail from the user.
 * @param {object} tp The Templater object.
 * @returns {string}
 * @throws {Error} Subsource trail doesn't match SUBSOURCE_TRAIL_REGEX.
 */
export async function requestSourceTrail(tp) {
  const sourceTrail = (await tp.system.prompt('Subsource Trail:', '', true)).trim();
  if (!isValidSourceTrail(sourceTrail)) throw Error('Invalid source trail.');
  return sourceTrail;
}

/**
 * Requests a path title from the user.
 * @param {object} tp The Templater object.
 * @param {boolean} noSourceless Allows the sourceless key as an option.
 * @returns {object} An object with the title, source key, and subsource trail.
 * @throws {Error} The source key prompt is cancelled or the subsource trail is invalid.
 */
export async function requestPathTitle(tp, noSourceless = true) {
  const sourceKey = await requestSourceKey(noSourceless);
  const sourceTrail = await requestSourceTrail(tp);
  const title = `{${sourceKey}} ${sourceTrail}`;
  return { title, sourceKey, sourceTrail };
}

/**
 * Requests an open title from the user.
 * @param {object} tp The Templater object.
 * @returns {string}
 * @throws {Error} Title matches RESERVED_TITLE_REGEX or doesn't match OPEN_TITLE_REGEX.
 */
export async function requestOpenTitle(tp) {
  const title = (await tp.system.prompt('Open Title:', '', true)).trim();
  if (!isValidOpenTitle(title)) throw Error('Invalid open title.');
  return title;
}

/**
 * Requests a formal ID from the user.
 * @returns {Promise<string>}
 * @throws {string} Throws an error message when the prompt is cancelled.
 */
export async function requestFormalID() {
  return new Promise((resolve, reject) => new FormalIDPrompt({ resolve, reject }).open());
}

/**
 * Check if the string `str` is a valid BibTeX key.
 * @param {string} str
 * @returns {boolean}
 */
export function isValidBibtexKey(str) {
  return BIBTEX_KEY_REGEX.test(str);
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
 * Check if the string `str` is a valid source trail.
 * @param {string} str
 * @returns {boolean}
 */
export function isValidSourceTrail(str) {
  return SOURCE_TRAIL_MATCH.test(str);
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
 * Checks if `title` is in OPEN_TITLE format and valid.
 * @param {string} title
 * @returns {boolean}
 */
export function isValidOpenTitle(title) {
  return !RESERVED_TITLE_REGEX.test(title) && OPEN_TITLE_REGEX.test(title);
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
 * Check if the string `str` is an auto-formal title.
 * @param {string} str
 * @returns {boolean}
 */
export function isFormalAutoTitle(str) {
  return FORMAL_AUTO_TITLE_REGEX.test(str);
}

/**
 * Return a source key from `title` if it exists or an empty string otherwise.
 * @param {string} title
 * @returns {string}
 */
export function parseSourceKeyPrefix(title) {
  return title.match(SOURCE_KEY_PREFIX_REGEX)?.[1] || '';
}

/**
 * Finds the code-class that corresponds to a list of parent links. Codes are only
 * resolved from string links.
 * @param {any[]} parents - The parent array of an entry.
 * @returns {string};
 */
export function getCodeClassFromParents(parents) {
  const resolvedIDs = new Set();
  for (const value of parents) {
    const name = parseNameFromLink(value);
    if (name) {
      const id = app.metadataCache.getCache(`entries/${name}.md`).frontmatter?.[
        'formal-id'
      ];
      if (isValidFormalID(id) && !resolvedIDs.has(id)) resolvedIDs.add(id);
    }
  }
  return !isEmpty(resolvedIDs) ? [...resolvedIDs].sort().join('.') : '$';

  // **************************************************
  function parseNameFromLink(str) {
    return is.string(str) ? str.match(/^\[\[([^|]+).*\]\]$/)?.[1] || null : null;
  }
}

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
