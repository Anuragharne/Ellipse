import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useAuthStore } from '../../src/stores/auth.store';
import { colors } from '../../src/theme/colors';
import { useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabOneScreen() {
  const { logout, setIsFirstLaunch } = useAuthStore();
  const router = useRouter();

  const handleResetOnboarding = () => {
    logout();
    setIsFirstLaunch(true); // Resets back to onboarding screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home (Logged In)</Text>
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.fabContainer} onPress={() => router.push('/camera')}>
          <LinearGradient
            colors={[colors.lime, colors.limeMuted]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Camera color={colors.forest} size={32} />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.fabText}>Report Issue</Text>
      </View>

      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout (Test Login Flow)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={handleResetOnboarding}>
        <Text style={[styles.buttonText, { color: colors.lime }]}>Reset App (Test Onboarding)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    fontFamily: 'Philosopher-Bold',
    marginTop: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabContainer: {
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  fab: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: colors.lime,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Philosopher-Bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    backgroundColor: colors.teal,
  },
  button: {
    backgroundColor: colors.severityCritical,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.lime,
    marginBottom: 40,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  }
});
