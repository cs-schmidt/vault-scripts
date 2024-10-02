import { Plugin } from 'obsidian';
import * as templates from './templates/index.js';
import * as dataviews from './dataviews/index.js';

export default class VaultScripts extends Plugin {
  static templates = templates;
  static dataviews = dataviews;

  async onload() {
    globalThis.VaultScripts = VaultScripts;
  }

  async onunload() {
    delete globalThis.VaultScripts;
  }
}
