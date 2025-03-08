import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Dimensions } from 'react-native';
import { Flag, Pickaxe } from 'lucide-react-native';
import GameBanner from '@/components/GameBanner';

type Difficulty = 'easy' | 'medium' | 'hard';
type CellState = 'hidden' | 'revealed' | 'flagged';
type GameState = 'playing' | 'won' | 'lost';

interface Cell {
  isMine: boolean;
  state: CellState;
  adjacentMines: number;
}

// Add custom props type for the cell component
interface CellProps extends React.ComponentProps<typeof Pressable> {
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDoubleClick?: () => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const CustomPressable: React.FC<CellProps> = Pressable as any;

const DIFFICULTY_SETTINGS = {
  easy: { mines: 15, size: 9 },
  medium: { mines: 40, size: 16 },
  hard: { mines: 99, size: { width: 30, height: 16 } },
};

export default function Minesweeper() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [startTime, setStartTime] = useState(Date.now());
  const [isFlagMode, setIsFlagMode] = useState(false);

  // Calculate the maximum board size that will fit on screen
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const headerHeight = 80; // Approximate height of the header
  const bannerHeight = 100; // Approximate height of the game banner
  const padding = 40; // Total horizontal padding (20 * 2)
  
  const availableWidth = screenWidth - padding;
  const availableHeight = screenHeight - headerHeight - bannerHeight - padding;
  
  const getBoardDimensions = () => {
    const { size } = DIFFICULTY_SETTINGS[difficulty];
    const width = typeof size === 'number' ? size : size.width;
    const height = typeof size === 'number' ? size : size.height;
    const aspectRatio = width / height;

    let boardWidth = availableWidth;
    let boardHeight = boardWidth / aspectRatio;

    if (boardHeight > availableHeight) {
      boardHeight = availableHeight;
      boardWidth = boardHeight * aspectRatio;
    }

    return {
      width: boardWidth,
      height: boardHeight,
    };
  };

  const boardDimensions = getBoardDimensions();
  const boardStyle = {
    width: boardDimensions.width,
    height: boardDimensions.height,
    gap: 1,
    backgroundColor: '#48484A',
    padding: 1,
    borderRadius: 8,
    alignSelf: 'center',
  };

  const initializeBoard = (diff: Difficulty = difficulty) => {
    const { size, mines } = DIFFICULTY_SETTINGS[diff];
    const height = typeof size === 'number' ? size : size.height;
    const width = typeof size === 'number' ? size : size.width;
    
    const newBoard: Cell[][] = Array(height).fill(null).map(() =>
      Array(width).fill(null).map(() => ({
        isMine: false,
        state: 'hidden',
        adjacentMines: 0,
      }))
    );

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      if (!newBoard[y][x].isMine) {
        newBoard[y][x].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate adjacent mines
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!newBoard[y][x].isMine) {
          let count = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ny = y + dy;
              const nx = x + dx;
              if (ny >= 0 && ny < height && nx >= 0 && nx < width && newBoard[ny][nx].isMine) {
                count++;
              }
            }
          }
          newBoard[y][x].adjacentMines = count;
        }
      }
    }

    setBoard(newBoard);
    setGameState('playing');
    setStartTime(Date.now());
  };

  useEffect(() => {
    initializeBoard();
  }, [difficulty]);

  const revealEmpty = (y: number, x: number, newBoard: Cell[][]) => {
    const height = newBoard.length;
    const width = newBoard[0].length;
    
    if (y < 0 || y >= height || x < 0 || x >= width) return;
    if (newBoard[y][x].state !== 'hidden') return;
    if (newBoard[y][x].isMine) return;

    newBoard[y][x].state = 'revealed';
    
    // If it's a zero, reveal all surrounding cells
    if (newBoard[y][x].adjacentMines === 0) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dy === 0 && dx === 0) continue;
          revealEmpty(y + dy, x + dx, newBoard);
        }
      }
    }
  };

  const revealCell = (y: number, x: number) => {
    if (gameState !== 'playing' || board[y][x].state !== 'hidden') return;

    const newBoard = [...board.map(row => [...row])];
    const height = board.length;
    const width = board[0].length;
    
    if (board[y][x].isMine) {
      // Game over - reveal all mines
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          if (board[i][j].isMine) {
            newBoard[i][j].state = 'revealed';
          }
        }
      }
      setBoard(newBoard);
      setGameState('lost');
      return;
    }

    revealEmpty(y, x, newBoard);
    setBoard(newBoard);

    // Check for win
    let hiddenNonMines = 0;
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (!board[i][j].isMine && board[i][j].state === 'hidden') {
          hiddenNonMines++;
        }
      }
    }
    if (hiddenNonMines === 0) {
      setGameState('won');
    }
  };

  const toggleFlag = (y: number, x: number) => {
    if (gameState !== 'playing' || board[y][x].state === 'revealed') return;

    const newBoard = [...board.map(row => [...row])];
    newBoard[y][x].state = board[y][x].state === 'flagged' ? 'hidden' : 'flagged';
    setBoard(newBoard);
  };

  const getCellColor = (cell: Cell) => {
    if (cell.state !== 'revealed') return '#2C2C2E';
    if (cell.isMine) return '#FF3B30';
    return '#1C1C1E';
  };

  const getNumberColor = (count: number) => {
    const colors = ['#007AFF', '#32D74B', '#FF9500', '#FF2D55', '#AF52DE', '#FF3B30'];
    return colors[count - 1] || colors[0];
  };

  const revealSurroundingCells = (y: number, x: number) => {
    if (gameState !== 'playing' || board[y][x].state !== 'revealed') return;
    
    const cell = board[y][x];
    if (cell.adjacentMines === 0) return;

    const height = board.length;
    const width = board[0].length;

    // Count surrounding flags and check if they match mines
    let surroundingFlags = 0;
    let correctFlags = true;
    let hiddenCells = [];
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dy === 0 && dx === 0) continue;
        
        const ny = y + dy;
        const nx = x + dx;
        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
          const neighborCell = board[ny][nx];
          if (neighborCell.state === 'flagged') {
            surroundingFlags++;
            if (!neighborCell.isMine) {
              correctFlags = false;
            }
          } else if (neighborCell.state === 'hidden') {
            hiddenCells.push({ y: ny, x: nx });
          }
        }
      }
    }

    // Only proceed if flags match the number and all flags are correct
    if (surroundingFlags === cell.adjacentMines && correctFlags && hiddenCells.length > 0) {
      const newBoard = [...board.map(row => [...row])];

      // Reveal all hidden cells
      for (const { y: ny, x: nx } of hiddenCells) {
        if (board[ny][nx].isMine) {
          // This shouldn't happen as we checked correctFlags, but just in case
          for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
              if (board[i][j].isMine) {
                newBoard[i][j].state = 'revealed';
              }
            }
          }
          setBoard(newBoard);
          setGameState('lost');
          return;
        }
        
        // Reveal the cell and its surrounding empty cells
        revealEmpty(ny, nx, newBoard);
      }

      setBoard(newBoard);

      // Check for win
      let hiddenNonMines = 0;
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          if (!newBoard[i][j].isMine && newBoard[i][j].state === 'hidden') {
            hiddenNonMines++;
          }
        }
      }
      if (hiddenNonMines === 0) {
        setGameState('won');
      }
    }
  };

  const handleCellInteraction = (y: number, x: number, action: 'press' | 'longPress' | 'doubleClick') => {
    if (gameState !== 'playing') return;

    const cell = board[y][x];
    
    if (action === 'doubleClick' || (Platform.OS !== 'web' && action === 'longPress' && cell.state === 'revealed')) {
      revealSurroundingCells(y, x);
    } else if (Platform.OS !== 'web' && action === 'longPress') {
      toggleFlag(y, x);
    } else if (Platform.OS !== 'web' && isFlagMode) {
      toggleFlag(y, x);
    } else {
      revealCell(y, x);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.difficultyContainer}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
            <Pressable
              key={diff}
              style={[styles.difficultyButton, diff === difficulty && styles.activeDifficulty]}
              onPress={() => setDifficulty(diff)}
            >
              <Text style={[
                styles.difficultyText,
                diff === difficulty && styles.activeDifficultyText
              ]}>
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
        {Platform.OS !== 'web' && (
          <Pressable
            style={[styles.modeButton, isFlagMode && styles.activeModeButton]}
            onPress={() => setIsFlagMode(!isFlagMode)}
          >
            {isFlagMode ? (
              <Flag size={24} color={isFlagMode ? '#FFF' : '#8E8E93'} />
            ) : (
              <Pickaxe size={24} color={isFlagMode ? '#8E8E93' : '#FFF'} />
            )}
          </Pressable>
        )}
      </View>

      <View style={[styles.board, boardStyle]}>
        {board.map((row, y) => (
          <View key={y} style={styles.row}>
            {row.map((cell, x) => (
              <CustomPressable
                key={x}
                style={[
                  styles.cell,
                  { backgroundColor: getCellColor(cell) }
                ]}
                onPress={() => handleCellInteraction(y, x, 'press')}
                onLongPress={() => handleCellInteraction(y, x, 'longPress')}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggleFlag(y, x);
                }}
                onClick={(e) => {
                  // Handle double click for web
                  if (e.detail === 2) {
                    handleCellInteraction(y, x, 'doubleClick');
                  }
                }}
              >
                {cell.state === 'revealed' && !cell.isMine && cell.adjacentMines > 0 && (
                  <Text style={[
                    styles.number,
                    {
                      color: getNumberColor(cell.adjacentMines),
                      fontSize: Math.min(boardDimensions.width / (typeof DIFFICULTY_SETTINGS[difficulty].size === 'number' ? DIFFICULTY_SETTINGS[difficulty].size : DIFFICULTY_SETTINGS[difficulty].size.width) / 2, 24)
                    }
                  ]}>
                    {cell.adjacentMines}
                  </Text>
                )}
                {cell.state === 'flagged' && (
                  <Flag size={Math.min(boardDimensions.width / (typeof DIFFICULTY_SETTINGS[difficulty].size === 'number' ? DIFFICULTY_SETTINGS[difficulty].size : DIFFICULTY_SETTINGS[difficulty].size.width) / 3, 16)} color="#FF9500" />
                )}
              </CustomPressable>
            ))}
          </View>
        ))}
      </View>

      <GameBanner
        isGameOver={gameState !== 'playing'}
        onNextGame={() => initializeBoard()}
        startTime={startTime}
        gameState={gameState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    width: '100%',
  },
  difficultyContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  modeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  activeModeButton: {
    backgroundColor: '#007AFF',
  },
  difficultyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
  },
  activeDifficulty: {
    backgroundColor: '#007AFF',
  },
  difficultyText: {
    color: '#8E8E93',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  activeDifficultyText: {
    color: '#FFF',
  },
  board: {
    gap: 1,
    backgroundColor: '#48484A',
    padding: 1,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 1,
    flex: 1,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: '#2C2C2E',
  },
  number: {
    fontFamily: 'Inter-Bold',
    fontWeight: '600',
  },
}); 