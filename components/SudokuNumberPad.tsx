import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NumberPadProps {
  onNumberPress: (number: number) => void;
  onErase: () => void;
  onHint: () => void;
  onQuit: () => void;
  isNotesMode: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PAD_WIDTH = SCREEN_WIDTH - 40;
const BUTTON_SIZE = Math.min(PAD_WIDTH / 30, 20); // Drastically smaller buttons

export default function NumberPad({
  onNumberPress,
  onErase,
  onHint,
  onQuit,
  isNotesMode,
}: NumberPadProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <View style={styles.leftSection}>
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
        </View>
        <View style={styles.rightSection}>
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: '#007AFF' }]} 
            onPress={onHint}
          >
            <Ionicons name="bulb-outline" size={14} color="#fff" />
            <Text style={styles.controlText}>Hint</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: '#32CD32' }]} 
            onPress={onErase}
          >
            <Ionicons name="backspace" size={14} color="#fff" />
            <Text style={styles.controlText}>Erase</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.controlButton, styles.quitButton]} 
            onPress={onQuit}
          >
            <Ionicons name="exit-outline" size={14} color="#fff" />
            <Text style={styles.controlText}>Quit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    gap: 4,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3C3C3E',
    padding: 4,
    height: 120,
  },
  leftSection: {
    flex: 3,
    height: '100%',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    height: '100%',
    justifyContent: 'space-around',
    paddingLeft: 4,
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 2,
  },
  numberButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    backgroundColor: '#333',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3C3C3E',
  },
  noteModeButton: {
    backgroundColor: '#1a3f66',
  },
  numberText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  noteModeText: {
    color: '#4a9eff',
  },
  controlButton: {
    width: '100%',
    height: BUTTON_SIZE * 1.2,
    backgroundColor: '#333',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3C3C3E',
  },
  controlText: {
    color: '#fff',
    fontSize: 8,
    marginTop: 1,
    fontWeight: '500',
  },
  quitButton: {
    backgroundColor: '#661a1a',
  },
  modeToggle: {
    backgroundColor: '#333',
    padding: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  modeToggleActive: {
    backgroundColor: '#1a3f66',
  },
  modeToggleText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
}); 