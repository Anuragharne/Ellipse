import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/auth.store';
import { Camera, Map, ShieldCheck } from 'lucide-react-native';
import { colors } from '../src/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Report Issues Instantly',
    description: 'See a pothole or broken streetlight? Snap a photo and let us know.',
    icon: <Camera size={100} color={colors.lime} />
  },
  {
    id: '2',
    title: 'Location Tagged',
    description: 'We automatically grab the exact location of your photo for faster resolutions.',
    icon: <Map size={100} color={colors.lime} />
  },
  {
    id: '3',
    title: 'Secure & Verified',
    description: 'Anti-fraud mechanisms ensure your reports are authentic and reliable.',
    icon: <ShieldCheck size={100} color={colors.lime} />
  }
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const setIsFirstLaunch = useAuthStore(state => state.setIsFirstLaunch);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsFirstLaunch(false);
    router.replace('/(auth)/login');
  };

  const slide = slides[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {slide.icon}
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.dotActive : styles.dotInactive
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={handleComplete} style={styles.skipButton}>
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} style={styles.nextButtonContainer}>
            <LinearGradient
              colors={[colors.lime, colors.limeMuted]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextButton}
            >
              <Text style={styles.nextText}>
                {currentIndex === slides.length - 1 ? 'GET STARTED' : 'NEXT'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Philosopher-Bold',
  },
  description: {
    fontSize: 16,
    color: colors.gray100,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 32,
    paddingBottom: 48,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.lime,
    width: 24,
  },
  dotInactive: {
    backgroundColor: colors.surfaceElevated,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 16,
  },
  skipText: {
    fontSize: 16,
    color: colors.gray200,
    fontWeight: '600',
    fontFamily: 'Philosopher-Bold',
  },
  nextButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  nextText: {
    fontSize: 16,
    color: colors.gray800,
    fontWeight: 'bold',
    fontFamily: 'Philosopher-Bold',
  },
});
