import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import SudokuCell from '../components/SudokuCell';
import SudokuControls from '../components/SudokuControls';
import GameOverBanner from '../components/GameOverBanner';
import { Cell, Difficulty, GameState, Position } from '../types/sudoku';
import {
  createInitialGameState,
  isValidPlacement,
  checkWinCondition,
  getCandidates,
  validateBoard,
  findHintCell,
  getSolution,
} from '../lib/sudokuLogic';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const headerHeight = 60;
const controlsHeight = 80; // Reduced from 120
const padding = 20;

const availableWidth = SCREEN_WIDTH - padding * 2;
const availableHeight = SCREEN_HEIGHT - headerHeight - controlsHeight - padding * 2;

const BOARD_SIZE = Math.min(
  availableWidth,
  availableHeight * 0.85 // Reduced from 0.9 to give more space to controls
);
const CELL_SIZE = BOARD_SIZE / 9;

const INITIAL_SCORES = {
  [Difficulty.EASY]: 1000,
  [Difficulty.MEDIUM]: 2000,
  [Difficulty.HARD]: 3000,
};

const TARGET_TIMES = {
  [Difficulty.EASY]: 300,    // 5 minutes
  [Difficulty.MEDIUM]: 600,  // 10 minutes
  [Difficulty.HARD]: 900,    // 15 minutes
};

const PENALTIES = {
  HINT: 50,          // -50 points per hint
  WRONG_NUMBER: 30,  // -30 points per wrong number
  TIME: 10,          // -10 points per minute
};

export default function Sudoku() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(Difficulty.EASY)
  );
  const [timer, setTimer] = useState(0);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [showQuitBanner, setShowQuitBanner] = useState(false);
  const [solution, setSolution] = useState<Cell[][] | null>(null);
  const [hintCell, setHintCell] = useState<Position | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [score, setScore] = useState(INITIAL_SCORES[Difficulty.EASY]);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [isVictoryAnimating, setIsVictoryAnimating] = useState(false);

  useEffect(() => {
    if (!gameState.isComplete) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          const newTime = prev + 1;
          // Apply time penalty every 30 seconds
          if (newTime % 30 === 0) {
            setScore(prevScore => 
              Math.max(0, prevScore - PENALTIES.TIME)
            );
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.isComplete]);

  const checkCompletions = (board: Cell[][]) => {
    const newCompletions = new Set<string>();
    
    // Check rows
    for (let row = 0; row < 9; row++) {
      const values = new Set(board[row].map(cell => cell.value));
      if (values.size === 9 && !values.has(0)) {
        newCompletions.add(`row-${row}`);
      }
    }
    
    // Check columns
    for (let col = 0; col < 9; col++) {
      const values = new Set(board.map(row => row[col].value));
      if (values.size === 9 && !values.has(0)) {
        newCompletions.add(`col-${col}`);
      }
    }
    
    // Check 3x3 squares
    for (let blockRow = 0; blockRow < 3; blockRow++) {
      for (let blockCol = 0; blockCol < 3; blockCol++) {
        const values = new Set();
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            values.add(board[blockRow * 3 + i][blockCol * 3 + j].value);
          }
        }
        if (values.size === 9 && !values.has(0)) {
          newCompletions.add(`block-${blockRow}-${blockCol}`);
        }
      }
    }

    // Only update if there are new completions
    if (newCompletions.size > 0) {
      setCompletedSections(newCompletions);
      // Clear the completions after 400ms (matches the animation duration)
      setTimeout(() => {
        setCompletedSections(new Set());
      }, 400);
    }
  };

  const handleCellPress = (row: number, col: number) => {
    if (gameState.isComplete) return;

    setGameState((prev) => ({
      ...prev,
      selectedCell: { row, col },
    }));
  };

  const handleNumberPress = (number: number) => {
    if (!gameState.selectedCell || gameState.isComplete) return;

    const { row, col } = gameState.selectedCell;
    const cell = gameState.board[row][col];

    if (cell.isGiven) return;

    if (isNotesMode) {
      setGameState((prev) => {
        const newBoard = [...prev.board];
        const notes = new Set(newBoard[row][col].notes);
        
        if (notes.has(number)) {
          notes.delete(number);
        } else {
          notes.add(number);
        }
        
        newBoard[row][col] = {
          ...newBoard[row][col],
          notes,
        };
        
        return {
          ...prev,
          board: newBoard,
        };
      });
    } else {
      setGameState((prev) => {
        const newBoard = [...prev.board];
        const oldValue = newBoard[row][col].value;
        newBoard[row][col] = {
          ...newBoard[row][col],
          value: number,
          notes: new Set(),
          candidates: new Set(),
        };

        // Check if board is filled
        let isFilled = true;
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (newBoard[r][c].value === 0) {
              isFilled = false;
              break;
            }
          }
          if (!isFilled) break;
        }

        if (isFilled) {
          const validatedBoard = validateBoard(newBoard);
          let hasErrors = false;

          for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
              if (validatedBoard[r][c].isError) {
                hasErrors = true;
                if (!prev.board[r][c].isError) {
                  setScore(prevScore => Math.max(0, prevScore - PENALTIES.WRONG_NUMBER));
                }
              }
            }
          }

          const isComplete = !hasErrors;
          if (isComplete) {
            // Trigger victory animation
            setIsVictoryAnimating(true);
            setTimeout(() => {
              setIsVictoryAnimating(false);
            }, 2000);
          }

          return {
            ...prev,
            board: newBoard,
            isComplete,
          };
        }

        // Check for completions after each move
        checkCompletions(newBoard);

        // Check if the new number creates a conflict but don't show it
        const validatedBoard = validateBoard(newBoard);
        if (validatedBoard[row][col].isError) {
          setScore(prevScore => Math.max(0, prevScore - PENALTIES.WRONG_NUMBER));
        }

        return {
          ...prev,
          board: newBoard,
        };
      });
    }
  };

  const handleErase = () => {
    if (!gameState.selectedCell || gameState.isComplete) return;

    const { row, col } = gameState.selectedCell;
    const cell = gameState.board[row][col];

    if (cell.isGiven) return;

    setGameState((prev) => {
      const newBoard = [...prev.board];
      newBoard[row][col] = {
        ...newBoard[row][col],
        value: 0,
        notes: new Set(),
        candidates: new Set(),
      };
      return {
        ...prev,
        board: newBoard,
      };
    });
  };

  const handleHint = () => {
    // Clear console
    if (typeof window !== 'undefined' && window.console) {
      window.console.clear();
      // Force clear by adding empty lines
      console.log('\n'.repeat(50));
    }

    if (gameState.isComplete) {
      Alert.alert('Game Complete', 'Congratulations! You have completed the puzzle!');
      return;
    }

    // First check for user-filled cells with errors
    const validatedBoard = validateBoard(gameState.board);
    let userErrorFound = false;
    let errorCell = null;

    // Look for errors in user-filled cells only
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (validatedBoard[r][c].isError && !gameState.board[r][c].isGiven) {
          userErrorFound = true;
          errorCell = { row: r, col: c, currentValue: gameState.board[r][c].value };
          break;
        }
      }
      if (userErrorFound) break;
    }

    if (userErrorFound && errorCell) {
      // Set the hint cell and select it
      setHintCell({ row: errorCell.row, col: errorCell.col });
      setGameState(prev => ({
        ...prev,
        selectedCell: { row: errorCell.row, col: errorCell.col }
      }));

      const message = `❌ Error found! The number ${errorCell.currentValue} at row ${errorCell.row + 1}, column ${errorCell.col + 1} conflicts with another cell. Please fix this error first.`;
      setHintMessage(message);
      Alert.alert('Error Found', message);
      
      // Keep error highlighting longer
      setTimeout(() => {
        setHintCell(null);
        setHintMessage(null);
      }, 8000);
      return;
    }

    // If no user errors found, proceed with regular hint
    const hint = findHintCell(gameState.board);
    
    if (!hint) {
      Alert.alert('No Hints', 'No hints available at this time.');
      return;
    }

    // Increment hints used and deduct points
    setHintsUsed(prev => {
      const newCount = prev + 1;
      console.log(`Hints used: ${newCount}`);
      return newCount;
    });
    setScore(prev => Math.max(0, prev - PENALTIES.HINT));

    // Set the hint cell and select it
    setHintCell({ row: hint.row, col: hint.col });
    setGameState(prev => ({
      ...prev,
      selectedCell: { row: hint.row, col: hint.col }
    }));

    // Handle regular hints based on difficulty
    let message = '';
    const cellLocation = `row ${hint.row + 1}, column ${hint.col + 1}`;
    
    switch (gameState.difficulty) {
      case Difficulty.EASY:
        message = `💡 Hint: The cell at ${cellLocation} can only be filled with ${hint.possibleNumbers.join(' or ')}`;
        break;
      case Difficulty.MEDIUM:
        message = `💡 Hint: The cell at ${cellLocation} has ${hint.possibleNumbers.length} possible numbers. Try to deduce which ones!`;
        break;
      case Difficulty.HARD:
        message = `💡 Hint: Focus on the cell at ${cellLocation}. This is your most constrained option.`;
        break;
    }

    setHintMessage(message);
    Alert.alert('Hint Available', message);

    // Clear hint after 5 seconds for regular hints
    setTimeout(() => {
      setHintCell(null);
      setHintMessage(null);
    }, 5000);
  };

  const handleQuit = () => {
    setShowQuitBanner(true);
  };

  const handleSaveAndQuit = () => {
    Alert.alert(
      'Save and Quit',
      'Do you want to save your progress and quit?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setShowQuitBanner(false),
        },
        {
          text: 'Save & Quit',
          onPress: () => {
            // Here you would implement actual save functionality
            Alert.alert(
              'Game Saved',
              'Your progress has been saved.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    setShowQuitBanner(false);
                    router.push('/');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleShowSolution = () => {
    const solvedBoard = getSolution([...gameState.board]);
    if (solvedBoard) {
      // Hide the quit banner
      setShowQuitBanner(false);
      
      // Update the board with the solution
      setGameState(prev => ({
        ...prev,
        board: solvedBoard.map(row => 
          row.map(cell => ({
            ...cell,
            isGiven: true,
          }))
        ),
        isComplete: true,
      }));
    }
  };

  const handleContinuePlaying = () => {
    setShowQuitBanner(false);
  };

  const handleNextGame = (difficulty: Difficulty) => {
    setGameState(createInitialGameState(difficulty));
    setTimer(0);
    setShowQuitBanner(false);
    setSolution(null);
    setHintsUsed(0);
    setScore(INITIAL_SCORES[difficulty]);
  };

  const handleShowRules = () => {
    Alert.alert(
      'Sudoku Rules & Scoring',
      `HOW TO PLAY:
• Fill the 9×9 grid with numbers 1-9
• Each row, column, and 3×3 box must contain numbers 1-9 exactly once
• Some numbers are given as starting clues

DIFFICULTY LEVELS:
• Easy: Start with 1000 points
• Medium: Start with 2000 points
• Hard: Start with 3000 points

SCORING SYSTEM:
• Time Penalty: -10 points per minute
• Wrong Number: -30 points
• Using Hint: -50 points
• Notes Mode: No penalties for using notes!

Tips: Use Notes Mode to mark possible numbers in cells. Switch difficulty levels using buttons at the top.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Hint message at the top level */}
      {hintMessage && (
        <View style={styles.hintMessageContainer}>
          <Text style={hintMessage.includes('ERROR') ? styles.errorMessageText : styles.hintMessageText}>
            {hintMessage}
          </Text>
        </View>
      )}

      <View style={styles.topSection}>
        <View style={styles.header}>
          <View style={styles.difficultyContainer}>
            {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.difficultyButton, 
                  diff === gameState.difficulty && styles.activeDifficulty
                ]}
                onPress={() => {
                  setGameState(createInitialGameState(diff));
                  setTimer(0);
                  setScore(INITIAL_SCORES[diff]);
                  setHintsUsed(0);
                }}
              >
                <Text style={[
                  styles.difficultyText,
                  diff === gameState.difficulty && styles.activeDifficultyText
                ]}>
                  {diff.charAt(0) + diff.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Time</Text>
              <Text style={styles.timer}>{formatTime(timer)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Score</Text>
              <Text style={styles.score}>{score}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.gameSection}>
        <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
          {gameState.board.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, colIndex) => {
                const blockRow = Math.floor(rowIndex / 3);
                const blockCol = Math.floor(colIndex / 3);
                const isCompleted = 
                  completedSections.has(`row-${rowIndex}`) ||
                  completedSections.has(`col-${colIndex}`) ||
                  completedSections.has(`block-${blockRow}-${blockCol}`);

                return (
                  <SudokuCell
                    key={`${rowIndex}-${colIndex}`}
                    cell={cell}
                    row={rowIndex}
                    col={colIndex}
                    isSelected={
                      gameState.selectedCell?.row === rowIndex &&
                      gameState.selectedCell?.col === colIndex
                    }
                    isHighlighted={
                      hintCell?.row === rowIndex &&
                      hintCell?.col === colIndex
                    }
                    isCompleted={isCompleted}
                    isVictory={isVictoryAnimating}
                    onPress={handleCellPress}
                    size={CELL_SIZE}
                  />
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.controlsSection}>
          {gameState.isComplete ? (
            <TouchableOpacity
              style={styles.quitButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.quitButtonText}>Quit</Text>
            </TouchableOpacity>
          ) : (
            <View>
              <SudokuControls
                onNumberPress={handleNumberPress}
                onErase={handleErase}
                onHint={handleHint}
                onQuit={handleQuit}
                isNotesMode={isNotesMode}
                onToggleMode={() => setIsNotesMode(!isNotesMode)}
              />
            </View>
          )}
        </View>
      </View>

      {(showQuitBanner && !gameState.isComplete) && (
        <View style={styles.bannerContainer}>
          <GameOverBanner
            isVisible={true}
            onNextGame={handleNextGame}
            onChooseAnotherGame={() => router.push('/')}
            onQuit={() => router.push('/')}
            onShowSolution={handleShowSolution}
            onSaveAndQuit={handleSaveAndQuit}
            onContinue={handleContinuePlaying}
            currentDifficulty={gameState.difficulty}
            timeElapsed={timer}
            isQuitDialog={true}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 10,
    paddingHorizontal: padding,
  },
  topSection: {
    height: headerHeight,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: '#1a1a1a',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3C3C3E',
    height: headerHeight - 10,
  },
  difficultyContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3C3C3E',
    height: '100%',
  },
  activeDifficulty: {
    backgroundColor: '#007AFF',
    borderColor: '#0A84FF',
  },
  difficultyText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeDifficultyText: {
    color: '#FFF',
  },
  timer: {
    color: '#4a9eff',
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    minWidth: 60,
    textAlign: 'center',
  },
  gameSection: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  board: {
    borderWidth: 2,
    borderColor: '#999',
  },
  row: {
    flexDirection: 'row',
  },
  controlsSection: {
    width: '100%',
    height: controlsHeight,
    justifyContent: 'flex-end',
  },
  bannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  hintMessageContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    zIndex: 3000,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    margin: 10,
  },
  hintMessageText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  errorMessageText: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  quitButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0A84FF',
  },
  quitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingRight: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  score: {
    color: '#4a9eff',
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    minWidth: 60,
    textAlign: 'center',
  },
}); 