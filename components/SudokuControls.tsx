import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const BUTTON_SIZE = 30;

  return (
    <View style={styles.container}>
      <SudokuModeToggle isNotesMode={isNotesMode} onToggle={onToggleMode} />
      <View style={styles.numberGrid}>
        {numbers.map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.numberButton}
            onPress={() => onNumberPress(num)}
          >
            <Text style={styles.numberText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.controlButtons}>
        <TouchableOpacity style={styles.controlButton} onPress={onErase}>
          <Text style={styles.controlText}>Erase</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={onHint}>
          <Text style={styles.controlText}>Hint</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={onQuit}>
          <Text style={styles.controlText}>Quit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 5,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 4,
  },
  numberButton: {
    width: 30,
    height: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '500',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  controlButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#4a90e2',
    borderRadius: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  controlText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SudokuControls; 