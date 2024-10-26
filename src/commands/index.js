import { Plugin, Notice } from 'obsidian';
import { requestFormalID } from '../utils/entries';
import updateFormalAutoTitles from './updateFormalAutoTitles';

/**
 * Sets up all commands on the plugin object.
 * @param {Plugin} plugin An Obsidian plugin object.
 * @returns {void}
 */
export function setupCommands(plugin) {
  if (!(plugin instanceof Plugin)) throw TypeError('Commands added to non-plugin object');

  // Lets the user create and insert a formal ID into the editor.
  plugin.addCommand({
    name: 'Create formal ID',
    id: 'vault-scripts__create-formal-id',
    editorCallback: async (editor) => {
      try {
        editor.replaceRange(await requestFormalID(), editor.getCursor());
      } catch (error) {
        new Notice(error.message);
      }
    },
  });

  // Lets the user update formal auto-titles.
  plugin.addCommand({
    name: 'Update formal auto-titles',
    id: 'vault-scripts__update-formal-auto-titles',
    callback: updateFormalAutoTitles,
  });
}
