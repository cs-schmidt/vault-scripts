import { Modal } from 'obsidian';
import { isValidFormalID, fetchFormalIDs } from '../utils/entries';
import is from '../utils/types';

// NOTE: Obsidian scrubs the DOM using the DOMPurify package, so there's limited ability
//       to add  custom elements: You'll need use Obsidian's API to get the most control.

// TODO: Add validation for constructor parameter.
// TODO: Style ID box members as inline code in pill labels.

/** A modal that helps the user narrow down available formal IDs. */
export default class FormalIDPrompt extends Modal {
  #asyncFuncs = null;
  #submitted = false;
  #formalIDs = new Set(fetchFormalIDs().sort());
  #idBoxEl = null;
  #value = '';

  constructor(asyncFuncs) {
    super(app);
    if (is.object(asyncFuncs)) this.#asyncFuncs = asyncFuncs;
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
      this.#asyncFuncs.reject(new Error('Prompt cancelled'));
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
    this.#populateIDBox();
  }

  #hasAvailableID() {
    return isValidFormalID(this.#value) && !this.#formalIDs.has(this.#value);
  }

  #populateIDBox() {
    this.#idBoxEl.innerHTML = '';
    if (this.#value) {
      const idLabels = this.#filterFormalIDs().map((id) => {
        const idLabel = document.createElement('span');
        idLabel.textContent = id;
        return idLabel;
      });
      this.#idBoxEl.append(...idLabels);
    }
  }

  #filterFormalIDs() {
    return Array.of(...this.#formalIDs).filter((id) => id.startsWith(this.#value));
  }
}
