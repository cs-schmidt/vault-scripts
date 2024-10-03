import { Notice } from 'obsidian';
import {
  requestOpenTitle,
  requestPathTitle,
  isUniqueEntry,
  parseSourceKey,
} from '../utils/templates.js';

// NOTE: New files in Obsidian are always initially named "Untitled".
// NOTE: When "Show inline title" and "Show tab title bar" are turned off you'll get an
//       extra naming prompt upon entry creation.

/**
 * The initialization function for the entry template.
 * @param {object} tp - The Templater object.
 * @returns {string} The entry's content.
 * @throws {Error} The user escaped template selection or the selected template's
 *   initialization threw an error.
 */
export async function initializeEntry(tp) {
  try {
    // Prompt the user to create an entry.
    const options = ['Inquiry', 'Informal', 'Formal', 'Thought', 'Practice', 'Log'];
    const templates = options.map((option) => `[[{+} ${option.toUpperCase()}]]`);
    const template = await tp.system.suggester(options, templates, true, 'Entry:');
    return await tp.file.include(template);
  } catch (error) {
    // Display the error and delete the target file.
    new Notice(error?.message || 'Something went wrong.');
    // NOTE: You can't delete the target file before this function finishes execution:
    //       Templater will get stuck in a "delete-create loop". As a "work around" I'm
    //       using `setTimeout()` with a closure around the target file reference to
    //       preform deletion after a small delay.
    const targetFile = tp.config.target_file;
    setTimeout(() => app.vault.delete(targetFile), 100);
  }
}

/**
 * The initialization function for the inquiry template.
 * @param {object} tp - The Templater object.
 * @returns {object} User-collected data for instantiation.
 * @throws {Error} If any of the initialization steps throw an error.
 */
export async function initializeInquiry(tp) {
  const title = await requestPathTitle(tp);
  if (!isUniqueEntry(title)) throw Error('Creation Error: Title is not unique.');
  await tp.file.rename(title);
  return { sourceKey: parseSourceKey(title) };
}

/**
 * The initialization function for the practice template.
 * @param {object} tp - The Templater object.
 * @returns {object} User-collected data for instantiation.
 * @throws {Error} If any of the initialization steps throw an error.
 */
export async function initializePractice(tp) {
  const type = await tp.system.suggester(
    ['One', 'Many'],
    ['one', 'many'],
    true,
    'Contains one or many questions?'
  );
  const title = await requestPathTitle(tp);
  if (!isUniqueEntry(title)) throw Error('Creation Error: Title is not unique.');
  await tp.file.rename(title);
  return { sourceKey: parseSourceKey(title), type };
}

/**
 * The initialization function for open-titled-type templates without metadata (e.g.,
 * informal entries and thoughts).
 * @param {object} tp - The Templater object.
 */
export async function initializeOpenEntry(tp) {
  const title = await requestOpenTitle(tp);
  if (!isUniqueEntry(title)) throw Error('Creation Error: Title is not unique.');
  await tp.file.rename(title);
}

// TODO: Implement `initializeFormal` function.
/**
 * The initialization function for the formal template.
 * @param {object} tp - The Templater object.
 * @returns {void}
 * @throws {Error} If any of the initialization steps throw an error.
 */
export async function initializeFormal(params) {}

/**
 * The initialization function for the log template.
 * @param {object} tp - The Templater object.
 * @returns {object} User-collected data for instantiation.
 * @throws {Error} If any of the initialization steps throw an error.
 */
export async function initializeLog(tp) {
  const title = await requestOpenTitle(tp);
  const date = moment().format();
  const dateCode = moment.utc(date).format().replaceAll(/[-:]/g, '.');
  await tp.file.rename(`{${dateCode}} ${title}`);
  return { title, date };
}
