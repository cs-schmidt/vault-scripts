/** The Templater user script used by the log template to instantiate a log. */

import { OPEN_TITLE_REGEX } from '../utils/constants.js';

// NOTE: Files created in Obsidian are always named "Untitled" initially.
// NOTE: When "Show inline title" and "Show tab title bar" are toggled off you'll get an
//       extra naming prompt when creating an entry.

/**
 * The initialization function used to instantiate logs. This procedure is used by the
 * log template.
 * @param {Object} tp - The Templater object.
 * @returns {Object} Data gathered from the user for instantiation.
 * @throws {Error} When any of the initialization procedures throw an error.
 */
export default async function initializeLog(tp) {
  const result = {
    title: await requestTitle(tp),
    date: moment().format(),
  };
  await tp.file.rename(convertToFilename(result.title, result.date));
  return result;

  // Internal Helpers
  // *****************************************************************
  function convertToFilename(title, date) {
    const utcDate = moment.utc(date).format();
    const dateCode = utcDate.replace(
      /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})Z$/,
      (match) => match.replaceAll(/[-:]/g, '.')
    );
    return `{${dateCode}} ${title.replaceAll(/[\/\\]/g, '-')}`;
  }
}

/**
 * Requests a title for the log from the user.
 * @param {Object} tp - The Templater object.
 * @returns {string}
 * @throws {Error} When the input's format is improper or equal to Obsidian's default.
 */
async function requestTitle(tp) {
  const result = (await tp.system.prompt('Log Title:', '', true)).trim();
  if (!OPEN_TITLE_REGEX.test(result))
    throw Error('Creation Error: Invalid title format.');
  if (result === 'Untitled') throw Error('Creation Error: Default title is reserved.');
  return result;
}
