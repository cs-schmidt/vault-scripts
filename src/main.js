import { Plugin } from 'obsidian';
import dataviews from './dataviews/index.js';
import templates from './templates/index.js';

export default class VaultScripts extends Plugin {
  static dataviews = dataviews;
  static templates = templates;

  async onload() {
    globalThis.VaultScripts = VaultScripts;
  }

  async onunload() {
    delete globalThis.VaultScripts;
  }
}
