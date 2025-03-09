import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import SudokuCell from '../components/SudokuCell';
import NumberPad from '../components/SudokuNumberPad';
import GameOverBanner from '../components/GameOverBanner';
import { Cell, Difficulty, GameState, Position } from '../types/sudoku';
import {
  createInitialGameState,
  isValidPlacement,
  checkWinCondition,
  getCandidates,
  validateBoard,
  getHint,
  getSolution,
} from '../lib/sudokuLogic';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_WIDTH * 0.9, SCREEN_HEIGHT * 0.5);
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
    if (gameState.isComplete) return;

    // Get the solution for validation
    const solvedBoard = getSolution([...gameState.board]);
    if (!solvedBoard) {
      Alert.alert('Hint', 'No solution available for the current board state.');
      return;
    }

    if (gameState.selectedCell) {
      const { row, col } = gameState.selectedCell;
      const cell = gameState.board[row][col];
      
      if (cell.isGiven || cell.value !== 0) {
        Alert.alert('Hint', 'Please select an empty cell for a specific hint.');
        return;
      }

      // First show general hint
      const generalHint = getHint(gameState.board, gameState.difficulty);
      Alert.alert(
        'Hint Available',
        generalHint,
        [
          { text: 'OK', style: 'default' },
          {
            text: 'More Specific',
            onPress: () => {
              const correctValue = solvedBoard[row][col].value;
              Alert.alert('Specific Hint', `Try placing ${correctValue} in this cell.`);
            },
          },
        ]
      );
    } else {
      // If no cell is selected, just show general hint
      const generalHint = getHint(gameState.board, gameState.difficulty);
      Alert.alert('Hint', generalHint);
    }
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
      <View style={styles.header}>
        <Text style={styles.timer}>{formatTime(timer)}</Text>
        <Text style={styles.difficulty}>{gameState.difficulty}</Text>
      </View>

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
                onPress={handleCellPress}
                size={CELL_SIZE}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <NumberPad
          onNumberPress={handleNumberPress}
          onErase={handleErase}
          onHint={handleHint}
          onQuit={handleQuit}
          isNotesMode={isNotesMode}
        />
        <TouchableOpacity
          style={[styles.modeToggle, isNotesMode && styles.modeToggleActive]}
          onPress={() => setIsNotesMode(!isNotesMode)}
        >
          <Text style={styles.modeToggleText}>
            {isNotesMode ? 'Notes Mode' : 'Normal Mode'}
          </Text>
        </TouchableOpacity>
      </View>

      <GameOverBanner
        isVisible={gameState.isComplete || showQuitBanner}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  timer: {
    color: '#4a9eff',
    fontSize: 24,
    fontFamily: 'Inter-Medium',
  },
  difficulty: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-Regular',
  },
  board: {
    alignSelf: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#999',
  },
  row: {
    flexDirection: 'row',
  },
  inputContainer: {
    gap: 5,
  },
  modeToggle: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeToggleActive: {
    backgroundColor: '#1a3f66',
  },
  modeToggleText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
}); 