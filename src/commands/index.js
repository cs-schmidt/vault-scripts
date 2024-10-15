import { Plugin, Notice } from 'obsidian';
import { requestFormalID } from '../utils/helpers';

/**
 * Sets up all commands on the plugin object.
 * @param {Plugin} plugin An Obsidian plugin object.
 * @returns {void}
 */
export function setupCommands(plugin) {
  if (!(plugin instanceof Plugin))
    throw TypeError('Cannot add commands to non-Plugin object.');

  // Lets the user create and insert a formal ID into the editor.
  plugin.addCommand({
    name: 'Create formal ID',
    id: 'vault-scripts__create-formal-id',
    editorCallback: async (editor) => {
      try {
        const formalID = await requestFormalID();
        const cursorPosition = editor.getCursor();
        editor.replaceRange(formalID, cursorPosition);
      } catch (errorMessage) {
        new Notice(errorMessage);
      }
    },
  });
}
