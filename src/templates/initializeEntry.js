import { Notice } from 'obsidian';

// NOTE: Files created in Obsidian are always named "Untitled" initially.
// NOTE: When "Show inline title" and "Show tab title bar" are turned off you'll get an
//       extra naming prompt upon entry creation.

/**
 * The initialization function used by the 'ENTRY' template to produce an entry.
 * @param {Object} tp - The Templater object.
 * @returns {string} The entry's contents.
 * @throws {Error} The user escaped template selection or theselected template's
 *   initialization threw an error.
 */
export default async function initializeEntry(tp) {
  try {
    /* Prompt the user to create an entry. */
    const options = ['Inquiry', 'Informal', 'Formal', 'Thought', 'Practice', 'Log'];
    const templates = options.map((option) => `[[{T} ${option.toUpperCase()}]]`);
    const template = await tp.system.suggester(options, templates, true, 'Entry:');
    return await tp.file.include(template);
  } catch (err) {
    /* Display the error and delete the target file.  */
    new Notice(err?.message || 'Something went wrong.');
    // NOTE: You can't delete the target file before this function finishes executing,
    //       otherwise templater gets stuck in a "deletion-creation loop". As a "work
    //       around" I'm using `setTimeout()` with a closure around the target file
    //       reference to execute deletion after a small delay.
    const targetFile = tp.config.target_file;
    setTimeout(() => app.vault.delete(targetFile), 100);
  }
}
