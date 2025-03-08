import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

type GameBannerProps = {
  isGameOver: boolean;
  onNextGame: () => void;
  startTime: number;
  gameState: 'playing' | 'won' | 'lost';
};

export default function GameBanner({ isGameOver, onNextGame, startTime, gameState }: GameBannerProps) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, gameState]);

  if (!isGameOver) {
    return (
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{time}s</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {gameState === 'won' ? 'Congratulations!' : 'Game Over'}
      </Text>
      <Text style={styles.subtitle}>Time: {time}s</Text>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={onNextGame}>
          <Text style={styles.buttonText}>Next Game</Text>
        </Pressable>
        <Pressable 
          style={styles.button} 
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.buttonText}>Choose Another Game</Text>
        </Pressable>
        <Pressable 
          style={[styles.button, styles.quitButton]} 
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={[styles.buttonText, styles.quitButtonText]}>Quit</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  timerContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#2C2C2E',
    padding: 8,
    borderRadius: 8,
  },
  timer: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  title: {
    fontSize: 32,
    color: '#FFF',
    fontFamily: 'SpaceGrotesk-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
    fontFamily: 'Inter-Regular',
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 16,
    width: '100%',
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontFamily: 'Inter-Bold',
  },
  quitButton: {
    backgroundColor: '#FF3B30',
  },
  quitButtonText: {
    color: '#FFF',
  },
}); 