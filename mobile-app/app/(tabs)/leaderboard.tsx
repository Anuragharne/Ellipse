import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { colors } from '../../src/theme/colors';
import { Trophy, Medal, Award } from 'lucide-react-native';

const MOCK_LEADERBOARD = [
  { id: '1', name: 'Sarah Jenkins', points: 1250, rank: 1 },
  { id: '2', name: 'David Chen', points: 980, rank: 2 },
  { id: '3', name: 'Maria Garcia', points: 850, rank: 3 },
  { id: '4', name: 'James Wilson', points: 720, rank: 4 },
  { id: '5', name: 'You (Citizen)', points: 450, rank: 5 },
  { id: '6', name: 'Lisa Taylor', points: 310, rank: 6 },
];

export default function LeaderboardScreen() {
  const renderItem = ({ item }: { item: any }) => {
    const isTop3 = item.rank <= 3;
    const isYou = item.name.includes('You');
    
    return (
      <View style={[styles.itemCard, isYou && styles.itemCardHighlight]}>
        <View style={styles.rankContainer}>
          {item.rank === 1 ? (
            <Trophy color="#FFD700" size={24} />
          ) : item.rank === 2 ? (
            <Medal color="#C0C0C0" size={24} />
          ) : item.rank === 3 ? (
            <Medal color="#CD7F32" size={24} />
          ) : (
            <Text style={styles.rankText}>#{item.rank}</Text>
          )}
        </View>
        
        <View style={styles.nameContainer}>
          <Text style={[styles.nameText, isYou && styles.nameTextHighlight]}>{item.name}</Text>
        </View>
        
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>{item.points}</Text>
          <Award color={colors.lime} size={16} style={{ marginLeft: 4 }} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Trophy color={colors.lime} size={48} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>City Champions</Text>
        <Text style={styles.headerSubtitle}>Top reporters this month</Text>
      </View>
      
      <FlatList
        data={MOCK_LEADERBOARD}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.forest,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    backgroundColor: colors.surfaceElevated,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerIcon: {
    marginBottom: 16,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 28,
    fontFamily: 'Philosopher-Bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  itemCardHighlight: {
    backgroundColor: 'rgba(216, 255, 115, 0.1)',
    borderColor: colors.lime,
    borderWidth: 1,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nameContainer: {
    flex: 1,
  },
  nameText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  nameTextHighlight: {
    color: colors.lime,
    fontWeight: 'bold',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pointsText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Philosopher-Bold',
  },
});
