import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Cell } from '../types/sudoku';

interface SudokuCellProps {
  cell: Cell;
  row: number;
  col: number;
  isSelected: boolean;
  isHighlighted: boolean;
  onPress: (row: number, col: number) => void;
  size: number;
}

const SudokuCell: React.FC<SudokuCellProps> = ({
  cell,
  row,
  col,
  isSelected,
  isHighlighted,
  onPress,
  size,
}) => {
  // Add debug logging for highlighted cells
  if (isHighlighted) {
    console.log('Rendering highlighted cell:', { row, col });
  }

  const backgroundColor = cell.isError
    ? '#ffebee'
    : isHighlighted
    ? '#007AFF' // Brighter blue for better visibility
    : isSelected
    ? '#2C2C2E'
    : '#1a1a1a';

  const textColor = cell.isError
    ? '#d32f2f'
    : cell.isGiven
    ? '#fff'
    : isHighlighted
    ? '#ffffff'
    : '#4a9eff';

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor,
          borderRightWidth: (col + 1) % 3 === 0 ? 2 : 1,
          borderBottomWidth: (row + 1) % 3 === 0 ? 2 : 1,
        },
        isHighlighted && styles.highlightedCell,
      ]}
      onPress={() => onPress(row, col)}
    >
      {cell.value > 0 ? (
        <Text
          style={[
            styles.number,
            {
              color: textColor,
              fontSize: size * 0.5,
              fontWeight: cell.isGiven ? '600' : '400',
            },
          ]}
        >
          {cell.value}
        </Text>
      ) : cell.notes.size > 0 ? (
        <View style={styles.notesContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Text
              key={num}
              style={[
                styles.noteText,
                {
                  fontSize: size * 0.2,
                  opacity: cell.notes.has(num) ? 1 : 0,
                },
              ]}
            >
              {num}
            </Text>
          ))}
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    borderWidth: 0.5,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightedCell: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  number: {
    fontFamily: 'Inter-Medium',
  },
  notesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
    padding: 2,
  },
  noteText: {
    color: '#888',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});

export default SudokuCell; 