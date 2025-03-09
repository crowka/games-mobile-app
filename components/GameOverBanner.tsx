import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Difficulty } from '../types/sudoku';

interface GameOverBannerProps {
  isVisible: boolean;
  onNextGame: (difficulty: Difficulty) => void;
  onChooseAnotherGame: () => void;
  onQuit: () => void;
  onShowSolution: () => void;
  onSaveAndQuit: () => void;
  onContinue: () => void;
  currentDifficulty: Difficulty;
  timeElapsed: number;
  isQuitDialog?: boolean;
}

export default function GameOverBanner({
  isVisible,
  onNextGame,
  onChooseAnotherGame,
  onQuit,
  onShowSolution,
  onSaveAndQuit,
  onContinue,
  currentDifficulty,
  timeElapsed,
  isQuitDialog,
}: GameOverBannerProps) {
  if (!isVisible) return null;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isQuitDialog) {
    return (
      <View style={styles.overlay}>
        <View style={styles.banner}>
          <Text style={styles.title}>Quit Game</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={onSaveAndQuit}
            >
              <Text style={styles.buttonText}>Save & Quit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.button}
              onPress={onShowSolution}
            >
              <Text style={styles.buttonText}>Show Solution & Quit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.quitButton]}
              onPress={onQuit}
            >
              <Text style={styles.buttonText}>Quit Without Saving</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onContinue}
            >
              <Text style={styles.buttonText}>Continue Playing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.banner}>
        <Text style={styles.title}>Game Complete!</Text>
        <Text style={styles.time}>Time: {formatTime(timeElapsed)}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => onNextGame(currentDifficulty)}
          >
            <Text style={styles.buttonText}>Next Game</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={onChooseAnotherGame}
          >
            <Text style={styles.buttonText}>Choose Another Game</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.quitButton]}
            onPress={onQuit}
          >
            <Text style={styles.buttonText}>Quit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  banner: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 10,
  },
  time: {
    color: '#4a9eff',
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  button: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  quitButton: {
    backgroundColor: '#661a1a',
  },
  cancelButton: {
    backgroundColor: '#1a3f66',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
}); 