// NOTE: `SOURCE_KEY_REGEX` must match Better Bibtex citation key format in Zotero or "*":
//       - Bibtex Format: auth.lower + "_" + shorttitle(3,3) + "_" + (year || N.D.)
//       - Also, ensure the citation key format in Zotero and log date code prefixes don't
//         overlap.

/** Matches SOURCE_KEY format strings. */
export const SOURCE_KEY_REGEX =
  /^(?:[a-z]+(?:_(?:(?:[A-Z]|\d)+[a-z\d]*)+)?_(?:\d{4}|N\.D\.)|\$)$/;

/** Matches SOURCE_KEY format string prefixes. */
export const SOURCE_KEY_PARSE_REGEX = new RegExp(
  `^\\{(${SOURCE_KEY_REGEX.source.replace(/(?:^\^|\$$)/g, '')})\\}`,
);

/** Matches OPEN_TITLE format strings (see specification). */
export const OPEN_TITLE_REGEX = (() => {
  // Matches alphanumeric strings that may have periods and be possessive or contractive.
  const alphanumDotsAposMatch = "[\\p{L}\\d]+(?:\\.[\\p{L}\\d]+)*(?:'\\p{L}+){0,2}";
  // Matches alphanumeric strings that are in a period and may have them in other spots.
  const alphanumDotEndedMatch = '[\\p{L}\\d]+(?:\\.[\\p{L}\\d]+)*\\.';
  const wordMatch = [
    `${alphanumDotsAposMatch}`,
    `(?:-${alphanumDotsAposMatch})*`,
    `(?:-${alphanumDotEndedMatch})?`,
  ].join('');
  const phraseMatch = `(?:${[
    `${wordMatch}`,
    `"${wordMatch}(?: ${wordMatch})*"`,
    `<${wordMatch}(?: ${wordMatch})*>`,
    `\\(${wordMatch}(?: ${wordMatch})*\\)`,
  ].join('|')})`;
  return new RegExp(`^${phraseMatch}(?: ${phraseMatch})*$`, 'ui');
})();

/** Matches PATH_TITLE format strings (see specification). */
export const PATH_TITLE_REGEX = (() => {
  const sourceKeyMatch = SOURCE_KEY_REGEX.source.replace(/(?:^\^|\$$)/g, '');
  const midTrailPartMatch = '[a-z]{2,3}(?:\\d{1,4}(?:\\.\\d{1,4})*)?';
  const endTrailPartMatch = OPEN_TITLE_REGEX.source.replace(/(?:^\^|\$$)/g, '');
  const subSourceTrailMatch = `(?:${[
    `${midTrailPartMatch}(?: > ${midTrailPartMatch})*(?: > ${endTrailPartMatch})?`,
    `${endTrailPartMatch}`,
  ].join('|')})`;
  return new RegExp(`^\\{(?:${sourceKeyMatch})\\}(?: ${subSourceTrailMatch})?$`, 'ui');
})();

/** Matches strings that are equal/similar to Obsidian's default for new notes. */
export const RESERVED_TITLE_REGEX = /^Untitled(?: (?:0|[1-9]\d*))?$/i;

/** Matches FORMAL_ID format strings (see specification). */
export const FORMAL_ID_REGEX = /^[A-Z]{2,4}$/;
