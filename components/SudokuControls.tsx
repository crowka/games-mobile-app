import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SudokuModeToggle from './SudokuModeToggle';

interface SudokuControlsProps {
  onNumberPress: (number: number) => void;
  onErase: () => void;
  onHint: () => void;
  onQuit: () => void;
  isNotesMode: boolean;
  onToggleMode: () => void;
}

const SudokuControls: React.FC<SudokuControlsProps> = ({
  onNumberPress,
  onErase,
  onHint,
  onQuit,
  isNotesMode,
  onToggleMode,
}) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <SudokuModeToggle isNotesMode={isNotesMode} onToggle={onToggleMode} />
        <View style={styles.controlButtons}>
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: '#32CD32' }]} 
            onPress={onErase}
          >
            <Ionicons name="backspace" size={14} color="#fff" />
            <Text style={styles.controlText}>Erase</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: '#007AFF' }]} 
            onPress={onHint}
          >
            <Ionicons name="bulb-outline" size={14} color="#fff" />
            <Text style={styles.controlText}>Hint</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: '#FF3B30' }]} 
            onPress={onQuit}
          >
            <Ionicons name="exit-outline" size={14} color="#fff" />
            <Text style={styles.controlText}>Quit</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.numberGrid}>
        {numbers.map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.numberButton,
              isNotesMode && styles.noteModeButton
            ]}
            onPress={() => onNumberPress(num)}
          >
            <Text style={[
              styles.numberText,
              isNotesMode && styles.noteModeText
            ]}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  numberButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3C3C3E',
  },
  noteModeButton: {
    backgroundColor: '#1C1C1E',
    borderColor: '#2C2C2E',
  },
  numberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  noteModeText: {
    color: '#8E8E93',
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  controlText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SudokuControls; 