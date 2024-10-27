import { FuzzySuggestModal } from 'obsidian';
import { isValidSourceKey, fetchSourceKeys } from '../../utils/entries';
import { SOURCELESS_KEY } from '../../utils/constants';
import is from '../../utils/types';
import './index.css';

// NOTE: Obsidian scrubs the DOM using the DOMPurify package, so there's limited ability
//       to add  custom elements: You'll need use Obsidian's API to get the most control.

// TODO: Add validation for constructor parameter.

/** A modal that helps the user create new source keys or select existing ones. */
export default class SourceKeyPrompt extends FuzzySuggestModal {
  #asyncFuncs = null;
  #sourceKeys = [];
  #submitted = false;
  #value = '';

  constructor(asyncFuncs, noSourceless = true) {
    super(app);
    if (is.object(asyncFuncs)) this.#asyncFuncs = asyncFuncs;
    const sourceKeySet = new Set(fetchSourceKeys());
    if (noSourceless) sourceKeySet.delete(SOURCELESS_KEY);
    else sourceKeySet.add(SOURCELESS_KEY);
    this.#sourceKeys = Array.from(sourceKeySet);
  }

  onOpen() {
    this.modalEl.addClass('src-key-prompt');
    this.inputEl.addClass('src-key-prompt__input');
    this.setPlaceholder('Create/Select a source key.');
    this.resultContainerEl.addClass('src-key-prompt__results');
    this.inputEl.addEventListener('keydown', this.#trySubmission.bind(this));
    this.inputEl.addEventListener('input', this.#updateState.bind(this));
  }

  onClose() {
    if (!this.#submitted && this.#asyncFuncs?.reject)
      this.#asyncFuncs.reject(new Error('Prompt cancelled'));
  }

  #trySubmission(keyboardEvent) {
    if (keyboardEvent.key === 'Enter' && isValidSourceKey(this.#value))
      this.selectSuggestion({ item: this.#value }, keyboardEvent);
  }

  #updateState(inputEvent) {
    this.#value = inputEvent.target.value;
    console.log(this.#value);
    console.log(isValidSourceKey(this.#value));
    if (isValidSourceKey(this.#value)) {
      this.inputEl.classList.add('src-key-prompt__input--valid');
      this.inputEl.classList.remove('src-key-prompt__input--invalid');
    } else if (this.#value) {
      this.inputEl.classList.add('src-key-prompt__input--invalid');
      this.inputEl.classList.remove('src-key-prompt__input--valid');
    } else {
      this.inputEl.classList.remove('src-key-prompt__input--valid');
      this.inputEl.classList.remove('src-key-prompt__input--invalid');
    }
  }

  getItems() {
    return this.#sourceKeys;
  }

  getItemText(sourceKey) {
    return sourceKey;
  }

  selectSuggestion(suggestion, event) {
    this.onChooseSuggestion(suggestion, event);
  }

  onChooseItem(sourceKey) {
    if (this.#asyncFuncs?.resolve) this.#asyncFuncs.resolve(sourceKey);
    this.#submitted = true;
    this.close();
  }
}
