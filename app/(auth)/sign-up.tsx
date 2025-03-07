import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { signUp, createProfile } from '@/lib/supabase';
import AvatarSelector from '@/components/AvatarSelector';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!avatar) {
      setError('Please select an avatar');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { user } = await signUp(email, password);
      if (user) {
        await createProfile(user.id, { name, avatar });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={['#000', '#1C1C1E']}
        style={StyleSheet.absoluteFill}
      />
      
      <Animated.Text 
        entering={FadeInDown.delay(200)}
        style={styles.title}
      >
        Create Account
      </Animated.Text>

      <Animated.View 
        entering={FadeInDown.delay(400)}
        style={styles.form}
      >
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#8E8E93"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8E8E93"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#8E8E93"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>Choose your avatar</Text>
        <AvatarSelector
          selectedAvatar={avatar}
          onSelect={setAvatar}
        />

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Text>
        </Pressable>

        <View style={styles.links}>
          <Link href="/sign-in" style={styles.link}>
            Already have an account? Sign in
          </Link>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    minHeight: '100%',
  },
  title: {
    fontSize: 34,
    fontFamily: 'SpaceGrotesk-Bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  form: {
    gap: 16,
  },
  input: {
    height: 50,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#FFF',
    fontFamily: 'Inter-Regular',
  },
  label: {
    color: '#8E8E93',
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  button: {
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontFamily: 'Inter-Bold',
  },
  error: {
    color: '#FF3B30',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  links: {
    alignItems: 'center',
    marginTop: 16,
  },
  link: {
    color: '#007AFF',
    fontFamily: 'Inter-Regular',
    fontSize: 15,
  },
});