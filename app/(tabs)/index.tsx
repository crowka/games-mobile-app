import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';

const games = [
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    image: 'https://images.unsplash.com/photo-1642516303080-431f6681f864?w=800&q=80',
    gradient: ['#FF2D55', '#FF375F'],
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    image: 'https://images.unsplash.com/photo-1580541832626-2a7131ee809f?w=800&q=80',
    gradient: ['#5856D6', '#7A79E0'],
  },
  {
    id: 'chess',
    title: 'Chess',
    image: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=800&q=80',
    gradient: ['#007AFF', '#409CFF'],
  },
];

export default function GamesScreen() {
  return (
    <View style={styles.container}>
      <Animated.Text 
        entering={FadeInDown.delay(200)} 
        style={styles.title}
      >
        Choose your game
      </Animated.Text>
      
      <View style={styles.gamesGrid}>
        {games.map((game, index) => (
          <Animated.View
            key={game.id}
            entering={FadeInUp.delay(400 + index * 100)}
            style={styles.gameCard}
          >
            <Pressable
              style={styles.gameButton}
              onPress={() => router.push(`/game/${game.id}`)}
            >
              <Image
                source={{ uri: game.image }}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                colors={game.gradient}
                style={styles.gradient}
              >
                <Text style={styles.gameTitle}>{game.title}</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontFamily: 'SpaceGrotesk-Bold',
    color: '#FFF',
    marginBottom: 30,
  },
  gamesGrid: {
    flex: 1,
    gap: 20,
  },
  gameCard: {
    flex: 1,
    maxHeight: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gameButton: {
    flex: 1,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
    justifyContent: 'flex-end',
    padding: 20,
  },
  gameTitle: {
    color: '#FFF',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
});