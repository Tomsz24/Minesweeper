export class UI {
  UiSelectors = {
    board: '[data-board]',
    cell: '[data-cell]',
    counter: '[data-counter]',
    timer: '[data-timer]',
    resetButton: '[data-button-reset]',
    easyButton: '[data-button-easy]',
    normalButton: '[data-button-normal]',
    expertButton: '[data-button-expert]',
    customButton: '[data-button-custom]',
    modal: '[data-modal]',
    modalHeader: '[data-modal-header]',
    modalButton: '[data-modal-button]',
    inputRows: '[data-input-rows]',
    inputCols: '[data-input-cols]',
    inputMines: '[data-input-mines]',
    formButton: '[data-form-button]',
    formWrapper: '[data-form-wrapper]',
    closeButton: '[data-close-form-button]',
    infoError: '[data-error]',
  };

  getElement(selector) {
    return document.querySelector(selector);
  }

  getElements(selector) {
    return document.querySelectorAll(selector);
  }
}