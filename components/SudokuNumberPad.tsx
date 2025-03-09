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
const PAD_WIDTH = SCREEN_WIDTH - 40; // Account for container padding
const BUTTON_SIZE = Math.min(PAD_WIDTH / 15, 30); // Much smaller maximum button size

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
            onPress={() => {
              Alert.alert('Number Pressed', `You pressed ${number}`);
              onNumberPress(number);
            }}
          >
            <Text style={[styles.numberText, isNotesMode && styles.noteModeText]}>
              {number}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: '#007AFF' }]} 
          onPress={() => {
            Alert.alert('Hint', 'Hint button pressed');
            onHint();
          }}
        >
          <Ionicons name="bulb-outline" size={20} color="#fff" />
          <Text style={styles.controlText}>Hint</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: '#32CD32' }]} 
          onPress={() => {
            Alert.alert('Erase', 'Erase button pressed');
            onErase();
          }}
        >
          <Ionicons name="backspace" size={20} color="#fff" />
          <Text style={styles.controlText}>Erase</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.controlButton, styles.quitButton]} 
          onPress={() => {
            Alert.alert('Quit', 'Quit button pressed');
            onQuit();
          }}
        >
          <Ionicons name="exit-outline" size={20} color="#fff" />
          <Text style={styles.controlText}>Quit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3C3C3E',
    width: '100%',
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 4,
    gap: 4,
    width: '100%',
  },
  numberButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    backgroundColor: '#333',
    borderRadius: 4,
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  noteModeText: {
    color: '#4a9eff',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
    width: '100%',
  },
  controlButton: {
    width: BUTTON_SIZE * 2,
    height: BUTTON_SIZE * 1.5,
    backgroundColor: '#333',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3C3C3E',
  },
  controlText: {
    color: '#fff',
    fontSize: 8,
    marginTop: 2,
    fontWeight: '500',
  },
  quitButton: {
    backgroundColor: '#661a1a',
  },
}); 