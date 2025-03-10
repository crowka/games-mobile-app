import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { Cell } from '../types/sudoku';

interface SudokuCellProps {
  cell: Cell;
  row: number;
  col: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isCompleted?: boolean;
  isVictory?: boolean;
  onPress: (row: number, col: number) => void;
  size: number;
}

const SudokuCell: React.FC<SudokuCellProps> = ({
  cell,
  row,
  col,
  isSelected,
  isHighlighted,
  isCompleted = false,
  isVictory = false,
  onPress,
  size,
}) => {
  const flashAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCompleted) {
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        })
      ]).start();
    }
  }, [isCompleted]);

  const backgroundColor = cell.isError
    ? '#ffebee'
    : isVictory
    ? '#4CAF50'
    : isSelected
    ? '#2C2C2E'
    : '#1a1a1a';

  const textColor = cell.isError
    ? '#d32f2f'
    : cell.isGiven
    ? '#fff'
    : isVictory
    ? '#ffffff'
    : isHighlighted
    ? '#ffffff'
    : '#4a9eff';

  const borderColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#666', '#4CAF50']
  });

  return (
    <Animated.View
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor,
          borderRightWidth: (col + 1) % 3 === 0 ? 3 : 0.5,
          borderBottomWidth: (row + 1) % 3 === 0 ? 3 : 0.5,
          borderLeftWidth: col % 3 === 0 ? 3 : 0.5,
          borderTopWidth: row % 3 === 0 ? 3 : 0.5,
          borderColor,
        },
        isHighlighted && styles.highlightedCell,
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cell: {
    borderWidth: 0.5,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchable: {
    width: '100%',
    height: '100%',
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