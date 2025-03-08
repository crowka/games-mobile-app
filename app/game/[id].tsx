import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Minesweeper from '@/games/Minesweeper';
import Sudoku from '@/games/Sudoku';
import Chess from '@/games/Chess';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const renderGame = () => {
    switch (id) {
      case 'minesweeper':
        return <Minesweeper />;
      case 'sudoku':
        return <Sudoku />;
      case 'chess':
        return <Chess />;
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Game not found</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderGame()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Inter-Regular',
  },
}); 