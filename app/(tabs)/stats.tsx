import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function StatsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Stats</Text>
      
      {['Minesweeper', 'Sudoku', 'Chess'].map((game, gameIndex) => (
        <Animated.View
          key={game}
          entering={FadeInDown.delay(200 + gameIndex * 100)}
          style={styles.gameStats}
        >
          <LinearGradient
            colors={['#2C2C2E', '#1C1C1E']}
            style={styles.gradient}
          >
            <Text style={styles.gameTitle}>{game}</Text>
            
            {['Easy', 'Medium', 'Hard'].map((difficulty) => (
              <View key={difficulty} style={styles.difficultyStats}>
                <Text style={styles.difficultyTitle}>{difficulty}</Text>
                <View style={styles.statsGrid}>
                  <StatItem title="Games" value="0" />
                  <StatItem title="Best Time" value="--" />
                  <StatItem title="Avg Time" value="--" />
                </View>
              </View>
            ))}
          </LinearGradient>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

function StatItem({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
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
  gameStats: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
  },
  gameTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFF',
    marginBottom: 20,
  },
  difficultyStats: {
    marginBottom: 20,
  },
  difficultyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFF',
  },
  statTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 4,
  },
});