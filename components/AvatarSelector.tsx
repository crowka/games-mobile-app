import React from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const avatars = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&q=80',
];

type Props = {
  selectedAvatar: string | null;
  onSelect: (avatar: string) => void;
};

export default function AvatarSelector({ selectedAvatar, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {avatars.map((avatar, index) => (
          <Animated.View
            key={avatar}
            entering={FadeIn.delay(index * 100)}
            style={styles.avatarContainer}
          >
            <Pressable
              onPress={() => onSelect(avatar)}
              style={[
                styles.avatarButton,
                selectedAvatar === avatar && styles.selectedAvatar,
              ]}
            >
              <Image source={{ uri: avatar }} style={styles.avatar} />
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  avatarContainer: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  avatarButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  selectedAvatar: {
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});