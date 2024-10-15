import { Plugin } from 'obsidian';
import * as templates from './templates';
import * as dataviews from './dataviews';
import { setupCommands } from './commands';

export default class VaultScripts extends Plugin {
  static templates = templates;
  static dataviews = dataviews;

  async onload() {
    setupCommands(this);
    window.VaultScripts = VaultScripts;
  }

  async onunload() {
    delete window.VaultScripts;
  }
}
