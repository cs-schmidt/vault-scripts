import {
  isForCitableSource,
  requestOpenTitle,
  requestPathTitle,
  isUniqueFilename,
  grabCitationKey,
} from '../utils/templates.js';

// NOTE: Files created in Obsidian are always named "Untitled" initially.
// NOTE: When "Show inline title" and "Show tab title bar" are turned off you'll get an
//       extra naming prompt upon entry creation.

/**
 * The initialization function for the inquiry template.
 * @param {Object} tp - The Templater object.
 * @returns {Object} User-collected data for instantiation.
 * @throws {Error} If any of the initialization steps throw an error.
 */
export default async function initializeInquiry(tp) {
  const title = (await isForCitableSource(tp))
    ? await requestPathTitle(tp)
    : await requestOpenTitle(tp, true);
  if (!isUniqueFilename(title)) throw Error('Creation Error: Title is not unique.');
  await tp.file.rename(title);
  return { title, citationKey: grabCitationKey(title) };
}
