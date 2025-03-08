import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Sudoku() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sudoku Game Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Inter-Regular',
  },
}); 