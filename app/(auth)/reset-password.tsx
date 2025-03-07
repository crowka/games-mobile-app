import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { recoverPassword } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      await recoverPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000', '#1C1C1E']}
        style={StyleSheet.absoluteFill}
      />
      
      <Animated.Text 
        entering={FadeInDown.delay(200)}
        style={styles.title}
      >
        Reset Password
      </Animated.Text>

      <Animated.View 
        entering={FadeInDown.delay(400)}
        style={styles.form}
      >
        {!success ? (
          <>
            <Text style={styles.description}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#8E8E93"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
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
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.success}>
            <Text style={styles.successText}>
              Check your email for password reset instructions.
            </Text>
          </View>
        )}

        <View style={styles.links}>
          <Link href="/sign-in" style={styles.link}>
            Back to Sign In
          </Link>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontFamily: 'SpaceGrotesk-Bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    color: '#8E8E93',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
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
  success: {
    backgroundColor: '#32D74B20',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  successText: {
    color: '#32D74B',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
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