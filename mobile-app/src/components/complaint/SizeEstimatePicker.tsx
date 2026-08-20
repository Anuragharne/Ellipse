import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { Box, Package, Archive, Truck } from 'lucide-react-native';

export type SizeEstimate = 'S' | 'M' | 'L' | 'XL';

interface SizeEstimatePickerProps {
  value: SizeEstimate | null;
  onChange: (size: SizeEstimate) => void;
}

const SIZES = [
  { id: 'S', label: 'Small', icon: Box, desc: 'Fits in a bag' },
  { id: 'M', label: 'Medium', icon: Package, desc: 'Fits in a bin' },
  { id: 'L', label: 'Large', icon: Archive, desc: 'Fits in a cart' },
  { id: 'XL', label: 'Huge', icon: Truck, desc: 'Needs a truck' },
] as const;

export function SizeEstimatePicker({ value, onChange }: SizeEstimatePickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estimate Size (Optional)</Text>
      <View style={styles.grid}>
        {SIZES.map((size) => {
          const Icon = size.icon;
          const isSelected = value === size.id;
          
          return (
            <TouchableOpacity
              key={size.id}
              style={[
                styles.card,
                isSelected && styles.cardSelected
              ]}
              onPress={() => onChange(size.id)}
            >
              <Icon 
                color={isSelected ? colors.midnight : colors.lime} 
                size={24} 
              />
              <Text style={[
                styles.label,
                isSelected && styles.textSelected
              ]}>{size.label}</Text>
              <Text style={[
                styles.desc,
                isSelected && styles.textSelected
              ]}>{size.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'Philosopher-Bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.teal,
    alignItems: 'flex-start',
  },
  cardSelected: {
    backgroundColor: colors.lime,
    borderColor: colors.lime,
  },
  label: {
    fontSize: 16,
    color: colors.white,
    fontWeight: 'bold',
    marginTop: 8,
  },
  desc: {
    fontSize: 12,
    color: colors.gray200,
    marginTop: 4,
  },
  textSelected: {
    color: colors.midnight,
  }
});
