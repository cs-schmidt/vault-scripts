import { Plugin } from 'obsidian';
import * as templates from './templates';
import * as dataviews from './dataviews';

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
