import { UI } from "./UI.js";

export class Form extends UI {
  inputRows = this.getElement(this.UiSelectors.inputRows);
  inputCols = this.getElement(this.UiSelectors.inputCols);
  inputMines = this.getElement(this.UiSelectors.inputMines);
  #formWrapper = this.getElement(this.UiSelectors.formWrapper);
  #allInputs = this.getElements('input');
  #infoError = this.getElement(this.UiSelectors.infoError);

  toggleForm = () => {
    this.#formWrapper.classList.toggle('hide');
    this.#allInputs.forEach(input => {
      input.classList.remove('error');
      input.value = '';
    });
    this.#infoError.classList.add('hide');
  }

  validateForm = () => {
    const minValue = 5;
    let allRightValue = true;

    this.#allInputs.forEach(input => {
      if(parseFloat(input.value) < minValue || isNaN(parseFloat(input.value))) {
        input.classList.add('error');
        input.value = '';
        this.#infoError.classList.remove('hide');
        allRightValue = false;
      }
    });

    return allRightValue;
  }
}