import { Plugin } from 'obsidian';

export default class VaultScripts extends Plugin {
  async onload() {
    console.log('Loading plugin.');
  }
  async onunload() {
    console.log('Unloading plugin.');
  }
}
