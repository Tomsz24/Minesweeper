import { Cell } from './Cell.js';
import { UI } from './UI.js';
import { Counter } from "./Counter.js";
import { Timer } from "./Timer.js";
import { ResetButton } from "./ResetButton.js";
import { Modal } from "./Modal.js";
import { Form }  from "./Form.js";

class Game extends UI {
  #config = {
    easy: {
      rows: 8,
      cols: 8,
      mines: 10,
    },
    medium: {
      rows: 16,
      cols: 16,
      mines: 40,
    },
    expert: {
      rows: 16,
      cols: 30,
      mines: 99,
    }
  }

  #counter = new Counter();
  #timer = new Timer();
  #modal = new Modal();
  #formWrapper = new Form();

  #numberOfRows = null;
  #numberOfCols = null;
  #numberOfMines = null;

  #isGameFinished = false;

  #cells = [];
  #cellsElement = null;
  #cellsToReveal = 0;
  #revealedCells = 0;
  #board = null;
  #buttons = {
    modal: null,
    easy: null,
    normal: null,
    expert: null,
    reset: new ResetButton(),
    custom: null,
    close: null,
    submit: null,
  }

  initializeGame() {
    this.#handleElements();
    this.#timer.init();
    this.#counter.init();
    this.#addButtonsEventListeners();
    this.#newGame();
  }

  #handleElements() {
    this.#board = this.getElement(this.UiSelectors.board);
    this.#buttons.modal = this.getElement(this.UiSelectors.modalButton);
    this.#buttons.easy = this.getElement(this.UiSelectors.easyButton);
    this.#buttons.normal = this.getElement(this.UiSelectors.normalButton);
    this.#buttons.expert = this.getElement(this.UiSelectors.expertButton);
    this.#buttons.custom = this.getElement(this.UiSelectors.customButton);
    this.#buttons.close = this.getElement(this.UiSelectors.closeButton);
    this.#buttons.submit = this.getElement(this.UiSelectors.formButton);
  }

  #newGame(
    rows = this.#config.medium.rows,
    cols = this.#config.medium.cols,
    mines = this.#config.medium.mines) {
    this.#numberOfRows = rows;
    this.#numberOfCols = cols;
    this.#numberOfMines = mines;

    this.#counter.setValue(this.#numberOfMines);
    this.#timer.resetTimer();

    this.#cellsToReveal = this.#numberOfCols * this.#numberOfRows - this.#numberOfMines;

    this.#setStyles();
    this.#generateCells();
    this.#renderBoard();

    this.#placeMinesInCells();

    this.#cellsElement = this.getElements(this.UiSelectors.cell);

    this.#buttons.reset.changeEmotion('neutral');
    this.#isGameFinished = false;
    this.#revealedCells = 0;


    this.#addCellsHandlers();
  }

  #endGame(isWin) {
    this.#isGameFinished = true;
    this.#timer.stopTimer();
    this.#modal.buttonText = 'Close';

    if(!isWin) {
      this.#revealMines();
      this.#modal.infoText = 'You Lost, try again!';
      this.#buttons.reset.changeEmotion('negative');
      this.#modal.setText();
      this.#modal.toggleModal();
      return;
    }

    this.#modal.infoText = this.#timer.numberOfSeconds >= this.#timer.maxNumberOfSeconds ?
      `Congratulations!!! 🥳🥳🥳 You Won !!! 🥳🥳🥳` :
      `Congratulations!!! 🥳🥳🥳 You Won !!! 🥳🥳🥳 it took only ${this.#timer.numberOfSeconds} seconds 😁💪🏻`;
    this.#buttons.reset.changeEmotion('positive');
    this.#modal.setText();
    this.#modal.toggleModal();
  }

  #addCellsHandlers() {
    this.#cellsElement.forEach(el => {
      el.addEventListener('click', this.#handleCellClick);
      el.addEventListener('contextmenu', this.#handleCellContextMenu);
    })
  }

  #removeCellsListeners() {
    this.#cellsElement.forEach(el => {
      el.removeEventListener('click', this.#handleCellClick)
      el.removeEventListener('click', this.#handleCellContextMenu)
    })
  }

  #addButtonsEventListeners() {
    this.#buttons.easy.addEventListener('click', () => (
      this.#handleNewGameClick(this.#config.easy.rows, this.#config.easy.cols, this.#config.easy.mines)
    ));
    this.#buttons.normal.addEventListener('click', () => (
      this.#handleNewGameClick(this.#config.medium.rows, this.#config.medium.cols, this.#config.medium.mines)
    ));
    this.#buttons.expert.addEventListener('click', () => (
      this.#handleNewGameClick(this.#config.expert.rows, this.#config.expert.cols, this.#config.expert.mines)
    ));
    this.#buttons.reset.element.addEventListener('click', () => (
      this.#handleNewGameClick()
    ));
    this.#buttons.modal.addEventListener('click', () => (
      this.#modal.toggleModal()
    ));
    this.#buttons.custom.addEventListener('click', () => (
      this.#formWrapper.toggleForm()
    ));
    this.#buttons.close.addEventListener('click', () => (
      this.#formWrapper.toggleForm()
    ));
    this.#buttons.submit.addEventListener('click', () => (
      this.#createCustomBoard()
    ));
  }

  #handleNewGameClick(rows = this.#numberOfRows, cols = this.#numberOfCols, mines = this.#numberOfMines) {
    this.#removeCellsListeners();
    this.#newGame(rows, cols, mines)
  }

  #createCustomBoard() {
    if(this.#formWrapper.validateForm()) {
      const {inputRows, inputCols, inputMines} = this.#formWrapper;
      this.#handleNewGameClick(
        parseFloat(inputRows.value),
        parseFloat(inputCols.value),
        parseFloat(inputMines.value),
        );
      this.#formWrapper.toggleForm();
    }
  }

  #setStyles() {
    document.documentElement.style.setProperty('--cells-in-row', this.#numberOfCols);
  }

  #generateCells() {
    this.#cells.length = 0;
    for(let row = 0; row < this.#numberOfRows; row++) {
      this.#cells[row] = [];
      for(let col = 0; col < this.#numberOfCols; col++) {
        this.#cells[row].push(new Cell(col, row));
      }
    }
  }

  #renderBoard() {
    while (this.#board.firstChild) {
      this.#board.removeChild(this.#board.lastChild)
    }
    this.#cells.flat().forEach(cell => {
      this.#board.insertAdjacentHTML('beforeend', cell.createElement());
      cell.element = cell.getElement(cell.selector);
    })
  }

  #revealMines() {
    this.#cells.flat().filter(({isMine}) => isMine).forEach(cell => cell.revealCell());
  }

  #placeMinesInCells() {
    let minesToPlace = this.#numberOfMines;

    while(minesToPlace) {
      const rowIndex = Game.#getRandomInteger(0, this.#numberOfRows - 1);
      const colIndex = Game.#getRandomInteger(0, this.#numberOfCols - 1);

      const cell = this.#cells[rowIndex][colIndex];

      const hasCellMine = cell.isMine;

      if(!hasCellMine) {
        cell.addMine();
        minesToPlace--;
      }
    }
  }

  #handleCellClick = e => {
    const target = e.target;
    const rowIndex = parseInt(target.getAttribute('data-y'), 10);
    const colIndex = parseInt(target.getAttribute('data-x'), 10);

    const cell = this.#cells[rowIndex][colIndex];

    this.#clickCell(cell);
  }

  #clickCell(cell) {
    if(this.#isGameFinished || cell.isFlagged) return;

    if(cell.isMine) {
      this.#endGame(false);
    }
    this.#setCellValue(cell)

    if(this.#revealedCells === this.#cellsToReveal && !this.#isGameFinished) {
      this.#endGame(true);
    }
  }

  #setCellValue(cell){
    let minesCount = 0;

    for(let rowIndex = Math.max(cell.y - 1, 0); rowIndex <= Math.min(cell.y + 1, this.#numberOfRows - 1); rowIndex++) {
      for(let colIndex = Math.max(cell.x - 1, 0); colIndex <= Math.min(cell.x + 1, this.#numberOfCols - 1); colIndex++) {
        if(this.#cells[rowIndex][colIndex].isMine) minesCount++
      }
    }

    cell.value = minesCount;
    cell.revealCell();

    this.#revealedCells++;
    if(!cell.value) {
      for(let rowIndex = Math.max(cell.y - 1, 0); rowIndex <= Math.min(cell.y + 1, this.#numberOfRows - 1); rowIndex++) {
        for(let colIndex = Math.max(cell.x - 1, 0); colIndex <= Math.min(cell.x + 1, this.#numberOfCols - 1); colIndex++) {
          const cell = this.#cells[rowIndex][colIndex];
          if(!cell.isReveal) {
            this.#clickCell(cell);
          }
        }
      }
    }
  }

  #handleCellContextMenu = e => {
    e.preventDefault();
    const target = e.target;
    const rowIndex = parseInt(target.getAttribute('data-y'), 10);
    const colIndex = parseInt(target.getAttribute('data-x'), 10);

    const cell = this.#cells[rowIndex][colIndex];

    if(cell.isReveal || this.#isGameFinished) return;

    if(cell.isFlagged) {
      this.#counter.increment()
      cell.toggleFlag();
      return
    }

    if(!!this.#counter.value) {
      this.#counter.decrement()
      cell.toggleFlag();
    }
  }

  static #getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}


window.onload = function() {
  const game = new Game();

  game.initializeGame();
}