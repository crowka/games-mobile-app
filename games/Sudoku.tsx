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

  useEffect(() => {
    if (!gameState.isComplete) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.isComplete]);

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
          // Validate the board and mark errors
          const validatedBoard = validateBoard(newBoard);
          let hasErrors = false;

          // Check for errors
          for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
              if (validatedBoard[r][c].isError) {
                hasErrors = true;
              }
            }
          }

          return {
            ...prev,
            board: validatedBoard,
            isComplete: !hasErrors,
          };
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

    const hint = findHintCell(gameState.board);
    
    if (!hint) {
      Alert.alert('No Hints', 'No hints available at this time.');
      return;
    }

    // Set the hint cell and select it
    setHintCell({ row: hint.row, col: hint.col });
    setGameState(prev => ({
      ...prev,
      selectedCell: { row: hint.row, col: hint.col }
    }));

    // Handle error cells differently from hint cells
    if (hint.isError) {
      const message = `❌ Error found! The number ${hint.currentValue} at row ${hint.row + 1}, column ${hint.col + 1} conflicts with another cell. Please fix this error first.`;
      setHintMessage(message);
      Alert.alert('Error Found', message);
      
      // Keep error highlighting longer
      setTimeout(() => {
        setHintCell(null);
        setHintMessage(null);
      }, 8000);
      return;
    }

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
      // First hide the quit banner
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

      // Show an alert with a close button
      Alert.alert(
        'Solution',
        'Take your time to study the solution. Press Close when you are ready to return to the main menu.',
        [
          {
            text: 'Close',
            onPress: () => router.push('/'),
          },
        ],
        { cancelable: false }
      );
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
        <View style={styles.testBanner}>
          <Text style={styles.testText}>SUDOKU</Text>
        </View>

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
          <Text style={styles.timer}>{formatTime(timer)}</Text>
        </View>
      </View>

      <View style={styles.gameSection}>
        <View style={[styles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
          {gameState.board.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, colIndex) => (
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
                  onPress={handleCellPress}
                  size={CELL_SIZE}
                />
              ))}
            </View>
          ))}
        </View>

        <View style={styles.controlsSection}>
          <SudokuControls
            onNumberPress={handleNumberPress}
            onErase={handleErase}
            onHint={handleHint}
            onQuit={handleQuit}
            isNotesMode={isNotesMode}
            onToggleMode={() => setIsNotesMode(!isNotesMode)}
          />
        </View>
      </View>

      {(gameState.isComplete || showQuitBanner) && (
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
            isQuitDialog={showQuitBanner && !gameState.isComplete}
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
  testBanner: {
    backgroundColor: '#007AFF',
    padding: 4,
    borderRadius: 4,
    marginBottom: 4,
    alignItems: 'center',
  },
  testText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    backgroundColor: '#1a1a1a',
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3C3C3E',
  },
  difficultyContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  difficultyButton: {
    flex: 1,
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3C3C3E',
  },
  activeDifficulty: {
    backgroundColor: '#007AFF',
    borderColor: '#0A84FF',
  },
  difficultyText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeDifficultyText: {
    color: '#FFF',
  },
  timer: {
    color: '#4a9eff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
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
}); 