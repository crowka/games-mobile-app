import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NumberPadProps {
  onNumberPress: (number: number) => void;
  onErase: () => void;
  onHint: () => void;
  onQuit: () => void;
  isNotesMode: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PAD_WIDTH = SCREEN_WIDTH * 0.85; // 85% of screen width
const BUTTON_SIZE = PAD_WIDTH / 9; // Divide available width by 9 for the number buttons

export default function NumberPad({
  onNumberPress,
  onErase,
  onHint,
  onQuit,
  isNotesMode,
}: NumberPadProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <View style={styles.container}>
      <View style={styles.numberGrid}>
        {numbers.map((number) => (
          <TouchableOpacity
            key={number}
            style={[styles.numberButton, isNotesMode && styles.noteModeButton]}
            onPress={() => onNumberPress(number)}
          >
            <Text style={[styles.numberText, isNotesMode && styles.noteModeText]}>
              {number}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={onHint}>
          <Ionicons name="bulb-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={onErase}>
          <Ionicons name="backspace" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.controlButton, styles.quitButton]} 
          onPress={onQuit}
        >
          <Ionicons name="exit-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 5,
    gap: 2,
  },
  numberButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    backgroundColor: '#333',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteModeButton: {
    backgroundColor: '#1a3f66',
  },
  numberText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  noteModeText: {
    color: '#4a9eff',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  controlButton: {
    width: BUTTON_SIZE * 1.2,
    height: BUTTON_SIZE * 1.2,
    backgroundColor: '#333',
    borderRadius: BUTTON_SIZE * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quitButton: {
    backgroundColor: '#661a1a',
  },
}); 