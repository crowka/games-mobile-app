import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface SudokuModeToggleProps {
  isNotesMode: boolean;
  onToggle: () => void;
}

const SudokuModeToggle: React.FC<SudokuModeToggleProps> = ({
  isNotesMode,
  onToggle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, isNotesMode && styles.buttonActive]}
      onPress={() => {
        console.log('Mode toggle pressed');
        onToggle();
      }}
    >
      <Text style={[styles.text, isNotesMode && styles.textActive]}>
        {isNotesMode ? '✏️ Notes Mode' : '✍️ Normal Mode'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2C2C2E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3C3C3E',
    minWidth: 120,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonActive: {
    backgroundColor: '#1a3f66',
    borderColor: '#4a90e2',
  },
  text: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },
  textActive: {
    color: '#4a90e2',
  },
});

export default SudokuModeToggle; 