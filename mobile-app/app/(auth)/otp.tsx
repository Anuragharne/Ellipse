import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthService } from '../../src/services/auth.service';
import { useAuthStore } from '../../src/stores/auth.store';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

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

  const isBtnDisabled = !fullName || loading;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={loading}>
        <ArrowLeft color={colors.white} size={24} />
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
              placeholderTextColor={colors.gray200}
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
              placeholderTextColor={colors.gray200}
              value={fullName}
              onChangeText={setFullName}
              editable={!loading}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.buttonContainer} 
            onPress={handleRegister}
            disabled={isBtnDisabled}
          >
            <LinearGradient
              colors={isBtnDisabled ? [colors.surfaceElevated, colors.surfaceElevated] : [colors.lime, colors.limeMuted]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              {loading ? <ActivityIndicator color={colors.forest} /> : <Text style={[styles.buttonText, isBtnDisabled && styles.buttonTextDisabled]}>COMPLETE REGISTRATION</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}
      
      {loading && !needsRegistration && otp.length === 6 && (
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.lime} size="large" />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.forest,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
  },
  header: {
    marginBottom: 40,
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
    fontFamily: 'Philosopher-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray100,
    lineHeight: 24,
    fontFamily: 'Philosopher-Regular',
  },
  inputContainer: {
    marginBottom: 24,
  },
  otpInput: {
    borderWidth: 1.5,
    borderColor: colors.teal,
    borderRadius: 12,
    height: 64,
    backgroundColor: colors.midnight,
    fontSize: 24,
    letterSpacing: 8,
    color: colors.lime,
    fontFamily: 'SpaceMono',
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.teal,
    borderRadius: 12,
    height: 56,
    backgroundColor: colors.midnight,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.white,

  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: colors.gray100,
    fontSize: 14,

  },
  timerText: {
    color: colors.gray200,
    fontSize: 14,
    fontWeight: '500',

  },
  resendLink: {
    color: colors.lime,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-Regular',
  },
  buttonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  button: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.gray800,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Philosopher-Bold',
    letterSpacing: 0.5,
  },
  buttonTextDisabled: {
    color: colors.gray200,
  }
});
