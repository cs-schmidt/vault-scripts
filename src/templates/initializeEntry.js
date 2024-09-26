import { Notice } from 'obsidian';

// NOTE: Files created in Obsidian are always named "Untitled" initially.
// NOTE: When "Show inline title" and "Show tab title bar" are toggled off you'll get an
//       extra naming prompt when creating an entry.

/**
 * The initialization function used by the 'ENTRY' template to handle the beginning of
 * the entry creation process.
 * @param {Object} tp - The Templater object.
 * @returns {string}
 * @throws {Error} - When the user escapes selecting a template type or an error occurs
 *   during the on creation flow of a selected template.
 */
export default async function initializeEntry(tp) {
  try {
    const choices = ['Inquiry', 'Informal', 'Formal', 'Thought', 'Practice', 'Log'];
    const templates = choices.map((type) => `[[{T} ${type.toUpperCase()}]]`);
    const template = await tp.system.suggester(choices, templates, true, 'Entry Type:');
    return await tp.file.include(template);
  } catch (err) {
    new Notice(err?.message || 'Something went wrong.');
    // NOTE: It appears that deleting the target file synchronously causes templater to
    //       get stuck in a "deletion-creation loop". So `setTimeout()` is being used as
    //       a work around: I'm assuming that templater will be done processing the file
    //       after a short delay and the file deletion will be safe.
    const targetFile = tp.config.target_file;
    setTimeout(async () => await app.vault.delete(targetFile), 150);
  }
}
