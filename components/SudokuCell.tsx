import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Cell } from '../types/sudoku';

interface SudokuCellProps {
  cell: Cell;
  row: number;
  col: number;
  isSelected: boolean;
  size: number;
  onPress: (row: number, col: number) => void;
}

export default function SudokuCell({ cell, row, col, isSelected, size, onPress }: SudokuCellProps) {
  const isEdgeCellRight = (col + 1) % 3 === 0 && col !== 8;
  const isEdgeCellBottom = (row + 1) % 3 === 0 && row !== 8;

  const dynamicStyles = {
    cell: {
      width: size,
      height: size,
    },
    number: {
      fontSize: size * 0.5,
    },
    noteText: {
      fontSize: size * 0.2,
      width: size / 3,
      height: size / 3,
    },
  };

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        dynamicStyles.cell,
        isEdgeCellRight && styles.rightBorder,
        isEdgeCellBottom && styles.bottomBorder,
        isSelected && styles.selectedCell,
        cell.isGiven && styles.givenCell,
      ]}
      onPress={() => onPress(row, col)}
    >
      {cell.value > 0 ? (
        <Text
          style={[
            styles.number,
            dynamicStyles.number,
            cell.isGiven ? styles.givenNumber : styles.userNumber,
            cell.isError && styles.errorNumber,
          ]}
        >
          {cell.value}
        </Text>
      ) : (
        <View style={styles.notesContainer}>
          {Array.from(cell.notes).map((note) => (
            <Text key={note} style={[styles.noteText, dynamicStyles.noteText]}>
              {note}
            </Text>
          ))}
          {cell.candidates.size > 0 && (
            <Text style={[styles.candidateText, { fontSize: size * 0.3 }]}>
              {Array.from(cell.candidates)[0]}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    borderWidth: 0.5,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  rightBorder: {
    borderRightWidth: 2,
    borderRightColor: '#999',
  },
  bottomBorder: {
    borderBottomWidth: 2,
    borderBottomColor: '#999',
  },
  selectedCell: {
    backgroundColor: '#2a2a2a',
  },
  givenCell: {
    backgroundColor: '#262626',
  },
  number: {
    fontFamily: 'Inter-Medium',
  },
  givenNumber: {
    color: '#fff',
  },
  userNumber: {
    color: '#4a9eff',
  },
  errorNumber: {
    color: '#ff4a4a',
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
  candidateText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    color: '#4a9eff',
    fontFamily: 'Inter-Medium',
  },
}); 