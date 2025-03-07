import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <Animated.View 
        entering={FadeInDown.delay(200)}
        style={styles.section}
      >
        <Text style={styles.sectionTitle}>Game Settings</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Sound Effects</Text>
          <Switch />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Haptic Feedback</Text>
          <Switch />
        </View>
      </Animated.View>
      
      <Animated.View 
        entering={FadeInDown.delay(300)}
        style={styles.section}
      >
        <Text style={styles.sectionTitle}>Account</Text>
        
        <Pressable style={styles.settingButton}>
          <Text style={styles.settingLabel}>Profile</Text>
          <ChevronRight color="#8E8E93" size={20} />
        </Pressable>
        
        <Pressable style={styles.settingButton}>
          <Text style={styles.settingLabel}>Achievements</Text>
          <ChevronRight color="#8E8E93" size={20} />
        </Pressable>
      </Animated.View>
      
      <Animated.View 
        entering={FadeInDown.delay(400)}
        style={[styles.section, styles.dangerSection]}
      >
        <Pressable style={styles.settingButton}>
          <Text style={[styles.settingLabel, styles.dangerText]}>Reset All Progress</Text>
        </Pressable>
      </Animated.View>
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
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#8E8E93',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  settingLabel: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    color: '#FFF',
  },
  dangerSection: {
    marginTop: 40,
  },
  dangerText: {
    color: '#FF3B30',
  },
});