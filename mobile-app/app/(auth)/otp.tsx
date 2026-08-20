import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthService } from '../../src/services/auth.service';
import { useAuthStore } from '../../src/stores/auth.store';
import { ArrowLeft } from 'lucide-react-native';

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(120);
  
  // Registration flow state
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [fullName, setFullName] = useState('');
  
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (code: string) => {
    if (code.length !== 6) return;
    
    try {
      setLoading(true);
      const res = await AuthService.verifyOtp(phone!, code);
      if (res.registered === false) {
        setNeedsRegistration(true);
      } else if (res.accessToken) {
        useAuthStore.getState().setToken(res.accessToken);
        await AuthService.fetchProfile();
        router.replace('/');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid OTP');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    try {
      setLoading(true);
      const res = await AuthService.register(phone!, otp, fullName);
      if (res.accessToken) {
        router.replace('/');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      await AuthService.sendOtp(phone!);
      setTimer(120);
      setOtp('');
      Alert.alert('Success', 'OTP resent successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={loading}>
        <ArrowLeft color="#111827" size={24} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{needsRegistration ? 'Complete Profile' : 'Verify OTP'}</Text>
        <Text style={styles.subtitle}>
          {needsRegistration 
            ? 'Please enter your full name to complete registration'
            : `We sent a 6-digit code to ${phone}`
          }
        </Text>
      </View>

      {!needsRegistration ? (
        <>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.otpInput}
              placeholder="••••••"
              keyboardType="number-pad"
              value={otp}
              onChangeText={(text) => {
                setOtp(text);
                if (text.length === 6) {
                  handleVerify(text);
                }
              }}
              maxLength={6}
              editable={!loading}
              textAlign="center"
            />
          </View>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend in {formatTime(timer)}</Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={loading}>
                <Text style={styles.resendLink}>Resend Now</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : (
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              editable={!loading}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.button, (!fullName || loading) && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={!fullName || loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Complete Registration</Text>}
          </TouchableOpacity>
        </>
      )}
      
      {loading && !needsRegistration && otp.length === 6 && (
        <ActivityIndicator style={{ marginTop: 24 }} color="#3b82f6" size="large" />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  header: {
    marginBottom: 40,
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    height: 64,
    backgroundColor: '#f9fafb',
    fontSize: 24,
    letterSpacing: 8,
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    height: 56,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: '#6b7280',
    fontSize: 14,
  },
  timerText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  resendLink: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#3b82f6',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
