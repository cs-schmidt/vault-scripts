import { Notice, moment } from 'obsidian';
import {
  requestOpenTitle,
  requestPathTitle,
  isUniqueEntry,
  capitalize,
} from '../utils/helpers';
import {
  UNPROVABLE_FORMAL_TYPES,
  PROVABLE_FORMAL_TYPES,
  FORMAL_TYPES,
} from '../utils/constants';

// NOTE: New files in Obsidian are always initially named "Untitled".
// NOTE: When "Show inline title" and "Show tab title bar" are turned off you'll see an
//       extra naming prompt upon entry creation.

/**
 * The initialization function for the entry template.
 * @param {object} tp The Templater object.
 * @returns {string} The entry's content.
 * @throws {Error} Template selection is escaped or the chosen template threw an error.
 */
export async function initializeEntry(tp) {
  try {
    // Prompt the user to create an entry.
    const options = ['Inquiry', 'Informal', 'Formal', 'Thought', 'Practice', 'Log'];
    const templates = options.map((option) => `[[{+} ${option.toUpperCase()}]]`);
    const template = await tp.system.suggester(options, templates, true, 'Entry Type:');
    return await tp.file.include(template);
  } catch (error) {
    // Display the error and delete the target file.
    new Notice(error?.message || 'Something went wrong.');
    // NOTE: The target file can't be deleted before this function finishes execution:
    //       Templater stalls in a "delete-create loop". As a "work around" `setTimeout()`
    //       is used with a closure around the target file reference, deleting the file
    //       after a small delay.
    const targetFile = tp.config.target_file;
    setTimeout(() => app.vault.delete(targetFile), 100);
  }
}

/**
 * The initialization function for the inquiry template.
 * @param {object} tp The Templater object.
 * @returns {object} User-collected data for instantiation.
 * @throws {Error} If any of the initialization steps throw an error.
 */
export async function initializeInquiry(tp) {
  const { title, sourceKey } = await requestPathTitle(tp);
  if (!isUniqueEntry(title)) throw Error('Title is not unique.');
  await tp.file.rename(title);
  return { sourceKey };
}

/**
 * The initialization function for the practice template.
 * @param {object} tp The Templater object.
 * @returns {object} User-collected data for instantiation.
 * @throws {Error} If any of the initialization steps throw an error.
 */
export async function initializePractice(tp) {
  const { title, sourceKey } = await requestPathTitle(tp, false);
  if (!isUniqueEntry(title)) throw Error('Title is not unique.');
  await tp.file.rename(title);
  return { sourceKey, oneOrMany: await oneOrManyQuestions(tp) };

  // **************************************************
  async function oneOrManyQuestions(tp) {
    return tp.system.suggester(
      ['One', 'Many'],
      ['one', 'many'],
      true,
      'Contains one or many questions?',
    );
  }
}

/**
 * The initialization function for the informal template.
 * @param {object} tp The Templater object.
 * @returns {void}
 * @throws {Error} If any of the initialization steps throw an error.
 */
export async function initializeInformal(tp) {
  const title = await requestOpenTitle(tp);
  if (!isUniqueEntry(title)) throw Error('Title is not unique.');
  await tp.file.rename(title);
}

/**
 * The initialization function for the formal template.
 * @param {object} tp The Templater object.
 * @returns {object} User-collected data for instantiation.
 * @throws {Error} If any of the initialization steps throw an error.
 */
export async function initializeFormal(tp) {
  const type = await tp.system.suggester(capitalize, FORMAL_TYPES, true, 'Formal Type:');
  const unprovables = new Set(UNPROVABLE_FORMAL_TYPES);
  const provables = new Set(PROVABLE_FORMAL_TYPES);
  let title;
  if (unprovables.has(type) || !(await useAutoTitle(tp))) {
    title = await requestOpenTitle(tp);
    if (!isUniqueEntry(title)) throw Error('Title is not unique.');
  } else title = generateAutoTitle(type);
  await tp.file.rename(title);
  return { type: type };

  // **************************************************
  async function useAutoTitle(tp) {
    return tp.system.suggester(['Yes', 'No'], [true, false], true, 'Autogenerate title?');
  }

  function generateAutoTitle(formalType) {
    if (!provables.has(formalType)) throw Error('');
    const typeInCapitals = capitalize(formalType);
    const autoTitleRegex = new RegExp(`${typeInCapitals} \\$(0|[1-9]\\d*)`);
    const autoTitleCodes = new Set(
      app.vault
        .getMarkdownFiles()
        .filter((file) => file.parent.name == 'entries')
        .map((file) => Number(file.basename.match(autoTitleRegex)?.[1]))
        .filter((code) => !Number.isNaN(code)),
    );
    let code = 0;
    while (autoTitleCodes.has(code)) code += 1;
    return `${typeInCapitals} $${code}`;
  }
}

/**
 * The initialization function for the thought template.
 * @param {object} tp The Templater object.
 * @returns {void}
 * @throws {Error} If any of the initialization steps throw an error.
 */
export async function initializeThought(tp) {
  const title = await requestOpenTitle(tp);
  if (!isUniqueEntry(title)) throw Error('Title is not unique.');
  await tp.file.rename(title);
}

/**
 * The initialization function for the log template.
 * @param {object} tp The Templater object.
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
