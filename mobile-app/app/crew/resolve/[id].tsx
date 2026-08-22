import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ComplaintService } from '../../../src/services/complaint.service';
import { colors } from '../../../src/theme/colors';
import { ArrowLeft, Camera, CheckSquare, Square, Upload } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ResolveComplaintScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [ppeChecked, setPpeChecked] = useState({
    gloves: false,
    boots: false,
    vest: false,
  });
  
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allPpeChecked = ppeChecked.gloves && ppeChecked.boots && ppeChecked.vest;

  const togglePpe = (item: keyof typeof ppeChecked) => {
    setPpeChecked(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!allPpeChecked) {
      Alert.alert('PPE Required', 'Please confirm you are wearing all required PPE.');
      return;
    }
    if (!photoUri) {
      Alert.alert('Photo Required', 'Please provide an "After" photo of the cleaned site.');
      return;
    }

    try {
      setSubmitting(true);
      await ComplaintService.resolveComplaint(id as string, photoUri, true);
      Alert.alert('Success', 'Complaint resolved successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error) {
      console.error('Resolution Error:', error);
      Alert.alert('Error', 'Failed to resolve the complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resolve Task</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* PPE Checklist */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Safety Checklist</Text>
          <Text style={styles.cardSubtitle}>Please confirm you are wearing the following PPE before proceeding with cleanup:</Text>
          
          <TouchableOpacity style={styles.checkboxRow} onPress={() => togglePpe('gloves')}>
            {ppeChecked.gloves ? <CheckSquare color={colors.lime} size={24} /> : <Square color={colors.gray200} size={24} />}
            <Text style={styles.checkboxText}>Safety Gloves</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.checkboxRow} onPress={() => togglePpe('boots')}>
            {ppeChecked.boots ? <CheckSquare color={colors.lime} size={24} /> : <Square color={colors.gray200} size={24} />}
            <Text style={styles.checkboxText}>Steel-toe Boots</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.checkboxRow} onPress={() => togglePpe('vest')}>
            {ppeChecked.vest ? <CheckSquare color={colors.lime} size={24} /> : <Square color={colors.gray200} size={24} />}
            <Text style={styles.checkboxText}>High-Visibility Vest</Text>
          </TouchableOpacity>
        </View>

        {/* After Photo Capture */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>After Photo</Text>
          <Text style={styles.cardSubtitle}>Capture a clear photo of the cleaned area to verify resolution.</Text>
          
          {photoUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: photoUri }} style={styles.imagePreview} />
              <View style={styles.retakeButtons}>
                <TouchableOpacity style={styles.iconButton} onPress={takePhoto}>
                  <Camera color={colors.forest} size={20} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
                  <Upload color={colors.forest} size={20} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                <Camera color={colors.white} size={32} />
                <Text style={styles.photoBtnText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.photoBtn, { backgroundColor: colors.surface }]} onPress={pickImage}>
                <Upload color={colors.teal} size={32} />
                <Text style={[styles.photoBtnText, { color: colors.teal }]}>Upload</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={styles.submitContainer}
          onPress={handleSubmit}
          disabled={!allPpeChecked || !photoUri || submitting}
        >
          <LinearGradient
            colors={(!allPpeChecked || !photoUri || submitting) ? [colors.surfaceElevated, colors.surfaceElevated] : [colors.lime, colors.limeMuted]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitBtn}
          >
            {submitting ? (
              <ActivityIndicator color={colors.forest} />
            ) : (
              <Text style={[styles.submitBtnText, (!allPpeChecked || !photoUri) && { color: colors.gray200 }]}>
                Complete Resolution
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.forest,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.surfaceElevated,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: 'Philosopher-Bold',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 18,
    fontFamily: 'Philosopher-Bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  checkboxText: {
    color: colors.white,
    fontSize: 16,
    marginLeft: 12,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: colors.teal,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoBtnText: {
    color: colors.white,
    marginTop: 8,
    fontFamily: 'Philosopher-Bold',
  },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  retakeButtons: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.lime,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
  },
  submitBtn: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: colors.forest,
    fontSize: 16,
    fontFamily: 'Philosopher-Bold',
  },
});
