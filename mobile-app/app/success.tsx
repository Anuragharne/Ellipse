import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { colors } from '../src/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle2 color={colors.lime} size={120} strokeWidth={1.5} />
        </View>
        
        <Text style={styles.title}>Report Submitted!</Text>
        <Text style={styles.description}>
          Thank you for keeping the city clean. Our AI is analyzing your report and an officer will review it shortly.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.homeButtonContainer}
          onPress={() => router.replace('/(tabs)')}
        >
          <LinearGradient
            colors={[colors.lime, colors.limeMuted]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.homeButton}
          >
            <Text style={styles.homeText}>RETURN TO HOME</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.forest,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 40,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    fontFamily: 'Philosopher-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.gray100,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  homeButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  homeButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeText: {
    color: colors.forest,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Philosopher-Bold',
    letterSpacing: 0.5,
  },
});
