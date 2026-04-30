const gameBoard = document.getElementById("game-board");
const minesLeftElement = document.getElementById("mines-left");
const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", () => {
  location.reload();
});



function initializeGame() {
  const rows = 10;
  const cols = 10;
  const totalMines = 15;
  let minesLeft = totalMines;
  minesLeftElement.textContent = minesLeft;
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
  const flaggedCount = document.querySelectorAll(".flagged").length;
  minesLeftElement.textContent = parseInt(minesLeftElement.textContent) - (tile.classList.contains("flagged") ? 1 : -1);
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
  if (tile.classList.contains('flagged')) return
  if (tile.classList.contains("mine")) {
    tile.classList.add('exploded');
    endGame(board, false);
  } else {
    tile.classList.add("revealed");
    const row = parseInt(tile.dataset.row);
    const col = parseInt(tile.dataset.col);

    const minesAround = countMinesAround(board, row, col);

    tile.textContent = minesAround;
    if (minesAround === '') {
      revealEmptyTiles(board, row, col);
    }
    if (countRevealedTiles(board) === board.length * board[0].length - totalMines) {
      endGame(board, true);
    }
  }
}

function endGame(board, won) {
  board.forEach((row) => {
    row.forEach((tile) => {
      if (tile.classList.contains("mine")) {
        tile.classList.add('exploded');
      } else {
        tile.classList.add("revealed");
      }
      tile.removeEventListener("click", handleTileClick);

    });
  });
  minesLeftElement.textContent = 0;
  const message = won ? "Congratulations! You won!" : "Game Over! You hit a mine!";
  setTimeout(() => {
    alert(message);
  }, 100);
}

function countMinesAround(board, row, col) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {

      if (i === 0 && j === 0) continue;
      const newRow = row + i;
      const newCol = col + j;
      if (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[0].length) {
        if (board[newRow][newCol].classList.contains('mine')) {
          count++;
        }
      }
    }
  }
  return count === 0 ? '' : count;
}

function countRevealedTiles(board) {
  let count = 0;
  board.forEach(row => {
    row.forEach(tile => {
      if (tile.classList.contains('revealed')) {
        count++;
      }
    })
  })
  document.getElementById("tiles-revealed").textContent = count;
  return count;
}

function revealEmptyTiles(board, row, col) {

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newRow = row + i;
      const newCol = col + j;
      if (newRow < 0 || newRow >= board.length || newCol < 0 || newCol >= board[0].length) continue;
      const tile = board[newRow][newCol];
      if (!tile.classList.contains("revealed") && !tile.classList.contains("mine")) {
        tile.classList.add("revealed");
        const minesAround = countMinesAround(board, newRow, newCol);
        tile.textContent = minesAround;
        if (minesAround === '') {
          revealEmptyTiles(board, newRow, newCol);
        }

      }
    }
  }

}

document.addEventListener("DOMContentLoaded", initializeGame);
