import { Modal } from 'obsidian';
import { isValidFormalID } from '../utils/helpers';

// NOTE: Obsidian scrubs the DOM using the DOMPurify package, so there's limited ability
//       to add  custom elements: You'll need use Obsidian's API to get the most control.

// TODO: Add validation for FormalIDPrompt's constructor parameter.

/** A modal that helps the user narrow down available formal IDs. */
export default class FormalIDPrompt extends Modal {
  static getFormalIDs() {
    return new Set(
      app.vault
        .getMarkdownFiles()
        .filter((file) => file.parent.name === 'entries')
        .map((file) => app.metadataCache.getFileCache(file).frontmatter?.['formal-id'])
        .filter((formalID) => formalID != undefined)
        .sort(),
    );
  }

  #asyncFuncs = null;
  #submitted = false;
  #formalIDs = FormalIDPrompt.getFormalIDs();
  #idBoxEl = null;
  #value = '';

  constructor(asyncFuncs) {
    super(app);
    if (asyncFuncs && typeof asyncFuncs == 'object') this.#asyncFuncs = asyncFuncs;
  }

  onOpen() {
    // Create and display prompt.
    this.modalEl.id = 'fid-prompt';
    this.titleEl.addClass('fid-prompt__title');
    this.titleEl.setText('Formal ID:');
    this.contentEl.addClass('fid-prompt__content');
    this.#idBoxEl = this.contentEl.createDiv();
    this.#idBoxEl.addClass('fid-prompt__id-box');
    const inputEl = this.contentEl.createEl('input', {
      attr: {
        class: 'fid-prompt__input fid-prompt__input--valid',
        type: 'text',
        placeholder: 'Enter formal ID.',
        maxLength: 4,
      },
      prepend: true,
    });
    inputEl.focus();
    inputEl.addEventListener('keydown', this.#trySubmission.bind(this));
    inputEl.addEventListener('input', this.#updateState.bind(this));
  }

  onClose() {
    if (this.#submitted && this.#asyncFuncs?.reject)
      this.#asyncFuncs.reject('Prompt cancelled');
  }

  #trySubmission(keyboardEvent) {
    if (keyboardEvent.key === 'Enter' && this.#hasAvailableID()) {
      // NOTE: Calling preventDefault() stops the inclusion of a linebreak in the result.
      keyboardEvent.preventDefault();
      if (this.#asyncFuncs?.resolve) this.#asyncFuncs.resolve(this.#value);
      this.#submitted = true;
      this.close();
    }
  }

  #updateState(inputEvent) {
    this.#value = inputEvent.target.value;
    // Toggle classes on the input for valid, invalid, and empty states.
    if (this.#hasAvailableID()) {
      inputEvent.target.classList.add('fid-prompt__input--valid');
      inputEvent.target.classList.remove('fid-prompt__input--invalid');
    } else if (this.#value) {
      inputEvent.target.classList.add('fid-prompt__input--invalid');
      inputEvent.target.classList.remove('fid-prompt__input--valid');
    } else {
      inputEvent.target.classList.remove('fid-prompt__input--valid');
      inputEvent.target.classList.remove('fid-prompt__input--invalid');
    }
    // Filter formal IDs that match the input and display them.
    const filteredIDElements = this.#filterFormalIDs().map((id) => {
      const idElement = document.createElement('span');
      idElement.textContent = id;
      return idElement;
    });
    this.#idBoxEl.innerHTML = '';
    this.#idBoxEl.append(...filteredIDElements);
  }

  #hasAvailableID() {
    return isValidFormalID(this.#value) && !this.#formalIDs.has(this.#value);
  }

  #filterFormalIDs() {
    return Array.of(...this.#formalIDs).filter((id) => id.startsWith(this.#value));
  }
}
