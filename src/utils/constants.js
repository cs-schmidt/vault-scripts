/** Regex that matches OPEN_TITLE format (see specification). */
export const OPEN_TITLE_REGEX = (() => {
  const affixMatches = [
    "(?:\\.?[\\p{L}\\d]+(?:[-–/\\\\][\\p{L}\\d]+)*)+(?:(?:'[\\p{L}]+){0,2}|\\.?)",
    "'[\\p{L}]+(?:'[\\p{L}]+){0,2}",
    "[\\p{L}]'",
  ];
  const centerMatch = `${affixMatches.join('|')}|'[\\p{L}]'`;
  const wordMatch = [
    `(?:${affixMatches.join('|')})`,
    `(?:(?:[-–]${centerMatch})*(?:[-–]${affixMatches.join('|')}))?`,
  ].join('');
  const phraseMatch = `(?:${[
    wordMatch,
    `"(?:${wordMatch}|\\(${wordMatch}\\))(?: (?:${wordMatch}|\\(${wordMatch}\\)))"`,
    `\\((?:${wordMatch}|"${wordMatch}")(?: (?:${wordMatch}|"${wordMatch}"))*\\)`,
    `<${wordMatch}>`,
  ].join('|')})`;
  return new RegExp(`^${phraseMatch}(?: ${phraseMatch})*$`, 'ui');
})();

/** Regex pattern string that matches a citation key. */
export const CITATION_KEY_MATCH = '[a-z]+(?:[A-Z][a-z]*)*(?:\\d{4})?';

/** Regex that matches PATH_TITLE format (see specification). */
export const PATH_TITLE_REGEX = (() => {
  const nonHeadingMatch = '[a-z]{2,3}(?:\\d{1,4}(?:\\.\\d{1,4})*)?';
  const headingMatch = '[a-z]+(?:-?[a-z]+)*\\.?(?: [a-z]+(?:-?[a-z]+)*\\.?)*';
  return new RegExp(
    `^${CITATION_KEY_MATCH}(?: > ${nonHeadingMatch})*(?: > ${headingMatch})?$`
  );
})();
