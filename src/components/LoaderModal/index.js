import { Modal } from 'obsidian';
import is from '../../utils/types';
import './index.css';

/** A modal that indicates a loading event. */
export default class LoaderModal extends Modal {
  #closeable = true;
  #earlyClose = false;

  constructor(delay) {
    super(app);
    if (delay != null) {
      if (!is.number(delay)) throw TypeError("The delay parameter isn't a number");
      if (delay > 0) {
        this.#closeable = false;
        setTimeout(() => {
          this.#closeable = true;
          if (this.#earlyClose) this.close();
        }, delay);
      }
    }
  }

  onOpen() {
    // Setup the loader modal component.
    this.modalEl.addClass('loader-modal');
    this.contentEl.createDiv({ attr: { class: 'loader-modal__loader' } });
    this.contentEl.createEl('p', {
      attr: { class: 'loader-modal__message' },
      text: 'Please wait...',
    });
  }

  close() {
    if (this.#closeable) super.close();
    else this.#earlyClose = true;
  }
}
