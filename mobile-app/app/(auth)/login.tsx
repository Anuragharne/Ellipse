import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '../../src/services/auth.service';
import { Phone } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      // Format phone number to E.164 format roughly for Indian numbers
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      
      await AuthService.sendOtp(formattedPhone);
      router.push({ pathname: '/(auth)/otp', params: { phone: formattedPhone } });
    } catch (error: any) {
      console.error('Login Error:', error.message, error.response?.data);
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const isBtnDisabled = !phone || phone.length < 10 || loading;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Ellipse</Text>
        <Text style={styles.subtitle}>Enter your phone number to continue</Text>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Phone size={20} color={colors.tealLight} style={styles.icon} />
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor={colors.gray200}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
            editable={!loading}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.buttonContainer} 
        onPress={handleSendOtp}
        disabled={isBtnDisabled}
      >
        <LinearGradient
          colors={isBtnDisabled ? [colors.surfaceElevated, colors.surfaceElevated] : [colors.lime, colors.limeMuted]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color={colors.forest} />
          ) : (
            <Text style={[styles.buttonText, isBtnDisabled && styles.buttonTextDisabled]}>SEND OTP</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
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
  header: {
    marginBottom: 40,
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
    fontFamily: 'Philosopher-Regular',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.teal,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: colors.midnight,
  },
  icon: {
    marginRight: 8,
  },
  prefix: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: 8,
    fontFamily: 'Philosopher-Bold',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.white,

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
  },
});
