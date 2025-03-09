import { Cell, Difficulty, GameState, Position } from '../types/sudoku';

const BOARD_SIZE = 9;
const BOX_SIZE = 3;

export const INITIAL_GIVENS = {
  [Difficulty.EASY]: 40,
  [Difficulty.MEDIUM]: 30,
  [Difficulty.HARD]: 25,
};

export function createEmptyCell(): Cell {
  return {
    value: 0,
    isGiven: false,
    candidates: new Set(),
    notes: new Set(),
    isError: false,
  };
}

export function createEmptyBoard(): Cell[][] {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() =>
      Array(BOARD_SIZE)
        .fill(null)
        .map(() => createEmptyCell())
    );
}

export function isValidPlacement(board: Cell[][], row: number, col: number, value: number): boolean {
  // Check row
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (i !== col && board[row][i].value === value) {
      return false;
    }
  }

  // Check column
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (i !== row && board[i][col].value === value) {
      return false;
    }
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      const currentRow = boxRow + i;
      const currentCol = boxCol + j;
      if (currentRow !== row && currentCol !== col && board[currentRow][currentCol].value === value) {
        return false;
      }
    }
  }

  return true;
}

export function validateBoard(board: Cell[][]): Cell[][] {
  // Create a new board with error flags reset
  const validatedBoard = board.map(row =>
    row.map(cell => ({
      ...cell,
      isError: false,
    }))
  );

  // Check each non-empty cell
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const value = validatedBoard[row][col].value;
      if (value === 0) continue;

      // Check row
      for (let i = 0; i < BOARD_SIZE; i++) {
        if (i !== col && validatedBoard[row][i].value === value) {
          validatedBoard[row][col].isError = true;
          validatedBoard[row][i].isError = true;
          console.log(`Row conflict found: Value ${value} appears at (${row},${col}) and (${row},${i})`);
          // Return immediately when we find the first error
          return validatedBoard;
        }
      }

      // Check column
      for (let i = 0; i < BOARD_SIZE; i++) {
        if (i !== row && validatedBoard[i][col].value === value) {
          validatedBoard[row][col].isError = true;
          validatedBoard[i][col].isError = true;
          console.log(`Column conflict found: Value ${value} appears at (${row},${col}) and (${i},${col})`);
          // Return immediately when we find the first error
          return validatedBoard;
        }
      }

      // Check 3x3 box
      const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
      const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
      for (let i = 0; i < BOX_SIZE; i++) {
        for (let j = 0; j < BOX_SIZE; j++) {
          const currentRow = boxRow + i;
          const currentCol = boxCol + j;
          if ((currentRow !== row || currentCol !== col) && 
              validatedBoard[currentRow][currentCol].value === value) {
            validatedBoard[row][col].isError = true;
            validatedBoard[currentRow][currentCol].isError = true;
            console.log(`Box conflict found: Value ${value} appears at (${row},${col}) and (${currentRow},${currentCol})`);
            // Return immediately when we find the first error
            return validatedBoard;
          }
        }
      }
    }
  }

  return validatedBoard;
}

function findEmptyCell(board: Cell[][]): Position | null {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col].value === 0) {
        return { row, col };
      }
    }
  }
  return null;
}

export function solveSudoku(board: Cell[][]): boolean {
  const emptyCell = findEmptyCell(board);
  
  if (!emptyCell) {
    return true; // Board is complete
  }

  const { row, col } = emptyCell;

  for (let num = 1; num <= 9; num++) {
    if (isValidPlacement(board, row, col, num)) {
      // Try placing the number
      const prevValue = board[row][col].value;
      board[row][col].value = num;

      if (solveSudoku(board)) {
        return true;
      }

      // If placing the number didn't lead to a solution, backtrack
      board[row][col].value = prevValue;
    }
  }

  return false;
}

export function generatePuzzle(difficulty: Difficulty): Cell[][] {
  const board = createEmptyBoard();
  solveSudoku(board); // Generate a complete solution

  // Create a copy of the solved board
  const puzzle = board.map(row =>
    row.map(cell => ({
      ...cell,
      isGiven: true,
      isError: false,
    }))
  );

  // Remove numbers based on difficulty
  const cellsToRemove = 81 - INITIAL_GIVENS[difficulty];
  let removedCells = 0;

  while (removedCells < cellsToRemove) {
    const row = Math.floor(Math.random() * BOARD_SIZE);
    const col = Math.floor(Math.random() * BOARD_SIZE);

    if (puzzle[row][col].value !== 0) {
      puzzle[row][col].value = 0;
      puzzle[row][col].isGiven = false;
      removedCells++;
    }
  }

  return puzzle;
}

export function checkWinCondition(board: Cell[][]): boolean {
  // Check if all cells are filled
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col].value === 0) {
        return false;
      }
    }
  }

  // Validate the board
  const validatedBoard = validateBoard(board);
  
  // Check if there are any errors
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (validatedBoard[row][col].isError) {
        return false;
      }
    }
  }

  return true;
}

export function createInitialGameState(difficulty: Difficulty): GameState {
  return {
    board: generatePuzzle(difficulty),
    selectedCell: null,
    difficulty,
    isComplete: false,
    isPencilMode: false,
    timer: 0,
    isGameOver: false,
  };
}

export function getCandidates(board: Cell[][], row: number, col: number): Set<number> {
  const candidates = new Set<number>();
  
  for (let num = 1; num <= 9; num++) {
    if (isValidPlacement(board, row, col, num)) {
      candidates.add(num);
    }
  }
  
  return candidates;
}

export function findHintCell(board: Cell[][]): { row: number; col: number; possibleNumbers: number[]; isError?: boolean; currentValue?: number } | null {
  // First check for errors in filled cells
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const value = board[row][col].value;
      if (value !== 0) {
        // Temporarily remove the value to check if it's valid
        const originalValue = value;
        board[row][col].value = 0;
        const isValid = isValidPlacement(board, row, col, originalValue);
        board[row][col].value = originalValue;

        if (!isValid) {
          return {
            row,
            col,
            possibleNumbers: [],
            isError: true,
            currentValue: originalValue
          };
        }
      }
    }
  }

  // If no errors, find most constrained empty cell
  let bestCell = null;
  let minPossibilities = 10;
  let bestPossibleNumbers: number[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col].value === 0) {
        const possibleNumbers = [];
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(board, row, col, num)) {
            possibleNumbers.push(num);
          }
        }

        if (possibleNumbers.length > 0 && possibleNumbers.length < minPossibilities) {
          minPossibilities = possibleNumbers.length;
          bestCell = { row, col };
          bestPossibleNumbers = possibleNumbers;
        }
      }
    }
  }

  if (bestCell) {
    return {
      row: bestCell.row,
      col: bestCell.col,
      possibleNumbers: bestPossibleNumbers,
      isError: false
    };
  }

  return null;
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

export function getSolution(board: Cell[][]): Cell[][] | null {
  // Create a deep copy of the board
  const solution = board.map(row =>
    row.map(cell => ({
      ...cell,
      value: cell.value,
      isGiven: cell.isGiven,
      candidates: new Set<number>(),
      notes: new Set<number>(),
      isError: false,
    }))
  );

  // Try to solve the puzzle
  if (solveSudoku(solution)) {
    return solution;
  }
  return null;
} 