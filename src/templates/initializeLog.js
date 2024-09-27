import { requestOpenTitle, swapSlashes } from '../utils/templates.js';

// NOTE: Files created in Obsidian are always named "Untitled" initially.
// NOTE: When "Show inline title" and "Show tab title bar" are turned off you'll get an
//       extra naming prompt upon entry creation.

/**
 * The initialization function for the log template.
 * @param {Object} tp - The Templater object.
 * @returns {Object} User-collected data for instantiation.
 * @throws {Error} If any of the initialization steps throw an error.
 */
export default async function initializeLog(tp) {
  const title = await requestOpenTitle(tp);
  const date = moment().format();
  const dateCode = moment.utc(date).format().replaceAll(/[-:]/g, '.');
  await tp.file.rename(`{${dateCode}} ${swapSlashes(title, '-')}`);
  return { title, date };
}
