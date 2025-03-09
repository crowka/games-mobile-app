export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export interface Cell {
  value: number;
  isGiven: boolean;
  candidates: Set<number>;
  notes: Set<number>;
  isError: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: Cell[][];
  selectedCell: Position | null;
  difficulty: Difficulty;
  isComplete: boolean;
  isPencilMode: boolean;
  timer: number;
  isGameOver: boolean;
}

export interface BoardProps {
  gameState: GameState;
  onCellPress: (row: number, col: number) => void;
  onNumberPress: (number: number) => void;
  onErase: () => void;
  onTogglePencilMode: () => void;
  onNewGame: (difficulty: Difficulty) => void;
  onQuit: () => void;
} 