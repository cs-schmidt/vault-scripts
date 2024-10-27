import { Modal } from 'obsidian';
import is from '../../utils/types';
import './index.css';

/** A modal lets the user confirm or deny file updates. */
export default class ConfirmationModal extends Modal {
  #buttonClicked = false;
  #acceptButton = null;
  #refuseButton = null;
  #resolveFunc = null;

  constructor(resolveFunc) {
    super(app);
    if (is.function(resolveFunc)) this.#resolveFunc = resolveFunc;
  }

  onOpen() {
    // Setup the confirmation prompt component.
    this.modalEl.addClass('confirmation-modal');
    this.titleEl.addClass('confirmation-modal__title');
    this.titleEl.setText('Update Formal Auto-Titles');
    this.#refuseButton = window.createEl('button', {
      attr: { class: 'confirmation-modal__button-refute' },
      text: 'Refuse',
    });
    this.#acceptButton = window.createEl('button', {
      attr: { class: 'confirmation-modal__button-confirm' },
      text: 'Accept',
    });
    this.#refuseButton.focus();
    this.contentEl.append(this.#refuseButton);
    this.contentEl.append(this.#acceptButton);
    this.#refuseButton.addEventListener('click', this.#refuse.bind(this));
    this.#acceptButton.addEventListener('click', this.#accept.bind(this));
  }

  onClose() {
    if (!this.#buttonClicked && this.#resolveFunc) this.#resolveFunc(false);
  }

  #refuse() {
    if (this.#resolveFunc) this.#resolveFunc(false);
    this.#buttonClicked = true;
    this.close();
  }

  #accept() {
    if (this.#resolveFunc) this.#resolveFunc(true);
    this.#buttonClicked = true;
    this.close();
  }
}
