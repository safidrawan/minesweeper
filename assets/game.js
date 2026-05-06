const gameBoard = document.getElementById("game-board");
const minesLeftElement = document.getElementById("mines-left");
const levelChooser = document.getElementById("level-chooser");
// const gameSizeContainer = document.getElementById("game-size");
// const gameLevelContainer = document.getElementById("game-level");

const header = document.querySelector("header");
const gameOverMessage = document.getElementById("game-over-message");
const gameOverText = document.getElementById("game-over-text");

const playAgainButton = document.getElementById("play-again-button");
const resetButton = document.getElementById("reset-button");

const explosionSound = new Audio("assets/sounds/explosion.ogg");
const flagSound = new Audio("assets/sounds/flag.ogg");
const defeatSound = new Audio("assets/sounds/defeat.ogg");
const revealSound = new Audio("assets/sounds/reveal.ogg");

const unflagSound = new Audio("assets/sounds/unflag.mp3");
const winSound = new Audio("assets/sounds/win.mp3");

explosionSound.loop = false;
flagSound.loop = false;
defeatSound.loop = false;
revealSound.loop = false;
unflagSound.loop = false;
winSound.loop = false;

resetButton.addEventListener("click", () => {
  location.reload();
});
playAgainButton.addEventListener("click", () => {
  location.reload();
});

levelChooser.addEventListener("click", (e) => {
  if (e.target.dataset.type === "size") {
    size = e.target.dataset.value;
  } else if (e.target.dataset.type === "difficulty") {
    difficulty = e.target.dataset.value;
  } else if (e.target.dataset.value === "start") {
    if (!size || !difficulty) return;
    rows = difficulties[size][difficulty].w;
    cols = difficulties[size][difficulty].h;
    totalMines = difficulties[size][difficulty].m;
    document.documentElement.style.setProperty("--cols", cols);
    initializeGame();
  }
  if (e.target.tagName === "BUTTON") {
    const parentContainer = e.target.parentElement;
    parentContainer.querySelector(".selected")?.classList.remove("selected");
    e.target.classList.add("selected");
  }
});

const difficulties = {
  small: {
    easy: { w: 9, h: 9, m: 10 },
    normal: { w: 9, h: 9, m: 13 },
    hard: { w: 9, h: 9, m: 16 },
  },
  medium: {
    easy: { w: 16, h: 16, m: 30 },
    normal: { w: 16, h: 16, m: 40 },
    hard: { w: 16, h: 16, m: 52 },
  },
  large: {
    easy: { w: 16, h: 30, m: 60 },
    normal: { w: 16, h: 30, m: 99 },
    hard: { w: 16, h: 30, m: 120 },
  },
};

let size = "";
let difficulty = "";
let rows = 0;
let cols = 0;
let totalMines = 0;

function initializeGame() {
  let minesLeft = totalMines;
  minesLeftElement.textContent = minesLeft;
  levelChooser.style.display = "none";
  const board = createBoard(rows, cols, totalMines);
  setMinePositions(board, totalMines);
  board.forEach((row) => {
    row.forEach((tile) => {
      gameBoard.appendChild(tile);
    });
  });
}

function createBoard(rows, cols, totalMines) {
  const board = [];
  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < cols; j++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");

      tile.addEventListener("click", () => {
        handleTileClick(tile, board, totalMines);
      });

      tile.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        handleRightClick(tile, minesLeftElement);
      });

      tile.dataset.row = i;
      tile.dataset.col = j;
      board[i].push(tile);
    }
  }
  return board;
}

function handleRightClick(tile, minesLeftElement) {
  if (tile.classList.contains("revealed")) return;
  tile.classList.toggle("flagged");
  if (tile.classList.contains("flagged")) {
    flagSound.play();
  } else {
    unflagSound.play();
  }

  const flaggedCount = document.querySelectorAll(".flagged").length;
  minesLeftElement.textContent =
    parseInt(minesLeftElement.textContent) -
    (tile.classList.contains("flagged") ? 1 : -1);
}

function setMinePositions(board, totalMines) {
  const minePositions = new Set();

  while (minePositions.size < totalMines) {
    let row = Math.floor(Math.random() * board.length);
    let col = Math.floor(Math.random() * board[0].length);
    const cell = `${row},${col}`;
    minePositions.add(cell);
  }

  minePositions.forEach((cell) => {
    const [row, col] = cell.split(",").map(Number);
    board[row][col].classList.add("mine");
  });
}

function handleTileClick(tile, board, totalMines) {
  if (tile.classList.contains("flagged")) return;
  if (tile.classList.contains("mine")) {
    tile.classList.add("exploded");
    explosionSound.play();
    endGame(board, false);
  } else {
    tile.classList.add("revealed");
    revealSound.play();
    const row = parseInt(tile.dataset.row);
    const col = parseInt(tile.dataset.col);

    const minesAround = countMinesAround(board, row, col);

    tile.textContent = minesAround;
    if (minesAround === "") {
      revealEmptyTiles(board, row, col);
    }
    if (
      countRevealedTiles(board) ===
      board.length * board[0].length - totalMines
    ) {
      endGame(board, true);
    }
  }
}

function endGame(board, won) {
  header.style.visibility = "hidden";
  board.forEach((row) => {
    row.forEach((tile) => {
      if (tile.classList.contains("mine")) {
        tile.classList.add("exploded");
        tile.classList.remove("flagged");
      } else {
        tile.classList.add("revealed");
        tile.classList.remove("flagged");
      }
      tile.removeEventListener("click", handleTileClick);
    });
  });
  minesLeftElement.textContent = 0;
  if (won) {
    winSound.play();
  } else {
    defeatSound.play();
  }
  const message = won
    ? "Congratulations! You won!"
    : "Game Over! You hit a mine!";
  gameOverMessage.style.display = "flex";
  gameOverText.textContent = message;
}

function countMinesAround(board, row, col) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const newRow = row + i;
      const newCol = col + j;
      if (
        newRow >= 0 &&
        newRow < board.length &&
        newCol >= 0 &&
        newCol < board[0].length
      ) {
        if (board[newRow][newCol].classList.contains("mine")) {
          count++;
        }
      }
    }
  }
  return count === 0 ? "" : count;
}

function countRevealedTiles(board) {
  let count = 0;
  board.forEach((row) => {
    row.forEach((tile) => {
      if (tile.classList.contains("revealed")) {
        count++;
      }
    });
  });
  document.getElementById("tiles-revealed").textContent = count;
  return count;
}

function revealEmptyTiles(board, row, col) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newRow = row + i;
      const newCol = col + j;
      if (
        newRow < 0 ||
        newRow >= board.length ||
        newCol < 0 ||
        newCol >= board[0].length
      )
        continue;
      const tile = board[newRow][newCol];
      if (
        !tile.classList.contains("revealed") &&
        !tile.classList.contains("mine")
      ) {
        tile.classList.add("revealed");
        tile.classList.remove("flagged");
        const minesAround = countMinesAround(board, newRow, newCol);
        tile.textContent = minesAround;
        if (minesAround === "") {
          revealEmptyTiles(board, newRow, newCol);
        }
      }
    }
  }
}
