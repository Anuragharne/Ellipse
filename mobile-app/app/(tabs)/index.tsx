import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../src/stores/auth.store';
import { colors } from '../../src/theme/colors';
import { useRouter, useFocusEffect } from 'expo-router';
import { Camera, MapPin, Navigation } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ComplaintService } from '../../src/services/complaint.service';
import { darkMapStyle } from '../../src/theme/mapStyle';

interface Complaint {
  id: string;
  latitude: number;
  longitude: number;
  status: string;
  createdAt: string;
  aiAnalysis?: {
    severityScore: number;
    wasteTypes: string[];
  };
}

const getSeverityColor = (score?: number, status?: string) => {
  if (status === 'RESOLVED') return colors.lime;
  if (!score) return colors.severityLow;
  if (score >= 0.75) return colors.severityCritical;
  if (score >= 0.5) return colors.severityHigh;
  return colors.severityLow;
};

export default function TabOneScreen() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['15%', '50%', '90%'];

  const fetchComplaints = async () => {
    try {
      const data = await ComplaintService.getNearbyComplaints();
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch nearby complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [])
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        customMapStyle={darkMapStyle}
        initialRegion={{
          latitude: 40.7128, // Default to NYC or current location (can be updated with expo-location)
          longitude: -74.0060,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {complaints.map((complaint) => (
          <Marker
            key={complaint.id}
            coordinate={{ latitude: complaint.latitude, longitude: complaint.longitude }}
            onPress={() => router.push(`/complaint/${complaint.id}`)}
          >
            <MapPin color={getSeverityColor(complaint.aiAnalysis?.severityScore, complaint.status)} size={32} fill={colors.forest} />
          </Marker>
        ))}
      </MapView>

      {/* FAB */}
      <TouchableOpacity style={styles.fabContainer} onPress={() => router.push('/camera')}>
        <LinearGradient
          colors={[colors.lime, colors.limeMuted]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Camera color={colors.forest} size={28} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: colors.surfaceElevated }}
        handleIndicatorStyle={{ backgroundColor: colors.teal }}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Nearby Issues</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{complaints.length}</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.lime} style={{ marginTop: 40 }} />
        ) : (
          <BottomSheetScrollView contentContainerStyle={styles.listContent}>
            {complaints.map((complaint) => (
              <TouchableOpacity
                key={complaint.id}
                style={styles.listItem}
                onPress={() => router.push(`/complaint/${complaint.id}`)}
              >
                <View style={[styles.statusDot, { backgroundColor: getSeverityColor(complaint.aiAnalysis?.severityScore, complaint.status) }]} />
                <View style={styles.listTextContainer}>
                  <Text style={styles.listTitle}>
                    {complaint.aiAnalysis?.wasteTypes?.[0] || 'Unclassified Waste'}
                  </Text>
                  <Text style={styles.listSubtitle}>
                    {new Date(complaint.createdAt).toLocaleDateString()} • {complaint.status}
                  </Text>
                </View>
                <Navigation color={colors.teal} size={20} />
              </TouchableOpacity>
            ))}
          </BottomSheetScrollView>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.forest,
  },
  map: {
    flex: 1,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 140, // Above bottom sheet's resting point
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  fab: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sheetTitle: {
    color: colors.white,
    fontFamily: 'Philosopher-Bold',
    fontSize: 20,
    marginRight: 10,
  },
  badge: {
    backgroundColor: colors.teal,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.forest,
    fontWeight: 'bold',
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  listTextContainer: {
    flex: 1,
  },
  listTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
});
