import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../types/navigation';
import { RestaurantService } from '../services/RestaurantService';
import { Restaurant } from '../types/card';
import { Colors, Typography, Spacing } from '../constants/theme';

type Nav = NativeStackNavigationProp<MoreStackParamList, 'RestaurantList'>;

export function RestaurantListScreen() {
  const navigation = useNavigation<Nav>();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    RestaurantService.getAll().then(setRestaurants);
  }, []);

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>菜单分享</Text>
        <Text style={styles.subtitle}>发现附近美食，一键点菜</Text>
      </View>

      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.rating}>{renderStars(item.rating)}</Text>
            </View>
            <Text style={styles.address}>{item.address}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.menuCount}>{item.menu.length} 道菜</Text>
              <Text style={styles.phone}>{item.phone}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl, paddingBottom: Spacing.lg },
  title: { color: Colors.text, ...Typography.title },
  subtitle: { color: Colors.textSecondary, ...Typography.body, marginTop: Spacing.xs },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.lg, marginHorizontal: Spacing.lg, marginVertical: Spacing.xs },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: Colors.text, ...Typography.subtitle, fontWeight: '700' },
  rating: { color: Colors.warning, fontSize: 14 },
  address: { color: Colors.textSecondary, ...Typography.caption, marginTop: Spacing.xs },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md },
  menuCount: { color: Colors.primary, ...Typography.caption, fontWeight: '600' },
  phone: { color: Colors.textMuted, ...Typography.caption },
});
