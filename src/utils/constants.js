// NOTE: Filenames can use letters, digits, hyphens, underscores, periods, and
//       apostrophes. Characters in the parentheses cannot be used: (/\|:*?#<>[]").
// NOTE: Ensure the BibTeX key format in Zotero and log date code prefixes don't overlap.

/** The sourceless key (see specification). */
export const SOURCELESS_KEY = '_';

/** Matches the Better BibTeX Key format in Zotero. */
export const BIBTEX_KEY_REGEX =
  /^[a-z]+(?:_(?:(?:[A-Z]|\d)+[a-z\d]*)+)?_(?:\d{4}|N\.D\.)$/;

/** Matches SOURCE_KEY format strings (see specification). */
export const SOURCE_KEY_REGEX = new RegExp(
  `(?:${SOURCELESS_KEY}|${stripAnchors(BIBTEX_KEY_REGEX.source)})`,
);

/** Matches SOURCE_KEY format string prefixes. */
export const SOURCE_KEY_PARSE_REGEX = new RegExp(
  `^\\{(${stripAnchors(SOURCE_KEY_REGEX.source)})\\}`,
);

/** Matches FORMAL_ID format strings (see specification). */
export const FORMAL_ID_REGEX = /^[A-Z]{2,4}$/;

/** Matches strings that are equal/similar to Obsidian's default for new notes. */
export const RESERVED_TITLE_REGEX = /^Untitled(?: (?:0|[1-9]\d*))?$/i;

/** Matches OPEN_TITLE format strings (see specification). */
export const OPEN_TITLE_REGEX = (() => {
  const alphaClass = '[a-zA-Z]';
  const alphanumClass = '[a-zA-Z\\d]';
  // Matches alphanumeric strings that can have periods and be possesive or contractive.
  const alphanumDotsAposMatch = [
    `${alphanumClass}+`,
    `(?:\\.${alphanumClass}+)*`,
    `(?:'${alphaClass}+){0,2}`,
  ].join('');
  // Matches alphanumeric strings that are in a period and may have them in other spots.
  const alphanumDotEndedMatch = `${alphanumClass}+(?:\\.${alphanumClass}+)*\\.`;
  const wordMatch = [
    `${alphanumDotsAposMatch}`,
    `(?:-${alphanumDotsAposMatch})*`,
    `(?:-${alphanumDotEndedMatch})?`,
  ].join('');
  const phraseMatch = `(?:${wordMatch}|\\(${wordMatch}(?: ${wordMatch})*\\))`;
  return new RegExp(`^${phraseMatch}(?: ${phraseMatch})*$`);
})();

/** Matches trails in PATH_TITLE format strings (see specification). */
export const SOURCE_TRAIL_MATCH = (() => {
  const midTrailPartMatch = '[a-z]{2,3}(?:\\d{1,4}(?:\\.\\d{1,4})*)?';
  const endTrailPartMatch = stripAnchors(OPEN_TITLE_REGEX.source);
  const subsourceTrailMatch = `(?:${[
    `${midTrailPartMatch}(?: > ${midTrailPartMatch})*(?: > ${endTrailPartMatch})?`,
    `${endTrailPartMatch}`,
  ].join('|')})`;
  return new RegExp(`^${subsourceTrailMatch}$`);
})();

/** Matches PATH_TITLE format strings (see specification). */
export const PATH_TITLE_REGEX = (() => {
  const sourceKeyMatch = stripAnchors(SOURCE_KEY_REGEX.source);
  const sourceTrailMatch = stripAnchors(SOURCE_TRAIL_MATCH.source);
  return new RegExp(`^\\{${sourceKeyMatch}\\}(?: ${sourceTrailMatch})?$`);
})();

/** The list of all formal types that are unprovable. */
export const UNPROVABLE_FORMAL_TYPES = ['definition'];

/** The list of all formal types that are provable. */
export const PROVABLE_FORMAL_TYPES = ['theorem', 'lemma', 'proposition'];

/** The list of all formal types. */
export const FORMAL_TYPES = Array.of(
  ...UNPROVABLE_FORMAL_TYPES,
  ...PROVABLE_FORMAL_TYPES,
);

/**
 * Strips the start and end regex anchors from a string.
 * @param {string} str
 * @returns {string}
 */
function stripAnchors(str) {
  return str.replace(/(?:^\^|\$$)/g, '');
}
