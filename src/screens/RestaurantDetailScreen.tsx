import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { MoreStackParamList } from '../types/navigation';
import { RestaurantService } from '../services/RestaurantService';
import { NotificationService } from '../services/NotificationService';
import { Restaurant, MenuItem } from '../types/card';
import { MenuItemCard } from '../components/MenuItemCard';
import { Colors, Typography, Spacing } from '../constants/theme';

type Route = RouteProp<MoreStackParamList, 'RestaurantDetail'>;

export function RestaurantDetailScreen() {
  const route = useRoute<Route>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orderedItems, setOrderedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  useEffect(() => {
    RestaurantService.getById(route.params.restaurantId).then(setRestaurant);
  }, []);

  if (!restaurant) return null;

  const categories = ['全部', ...new Set(restaurant.menu.map((m) => m.category))];
  const filteredMenu = selectedCategory === '全部'
    ? restaurant.menu
    : restaurant.menu.filter((m) => m.category === selectedCategory);

  const totalPrice = restaurant.menu
    .filter((m) => orderedItems.has(m.id))
    .reduce((sum, m) => sum + m.price, 0);

  const handleOrder = (item: MenuItem) => {
    setOrderedItems((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  };

  const handleSubmitOrder = () => {
    if (orderedItems.size === 0) {
      Alert.alert('提示', '请先选择菜品');
      return;
    }
    const items = restaurant.menu.filter((m) => orderedItems.has(m.id));
    const summary = items.map((m) => `${m.name} ¥${m.price}`).join('\n');
    Alert.alert(
      '确认下单',
      `${summary}\n\n合计: ¥${totalPrice}`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认', onPress: async () => {
            await NotificationService.sendInAppNotification('下单成功', `已向 ${restaurant.name} 提交订单`);
            Alert.alert('成功', '订单已提交！');
            setOrderedItems(new Set());
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.address}>{restaurant.address}</Text>
        <TouchableOpacity onPress={() => NotificationService.makePhoneCall(restaurant.phone)}>
          <Text style={styles.phone}>📞 {restaurant.phone}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryBtn, selectedCategory === cat && styles.categoryActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredMenu}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            ordered={orderedItems.has(item.id)}
            onOrder={handleOrder}
          />
        )}
      />

      {orderedItems.size > 0 && (
        <View style={styles.orderBar}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderCount}>{orderedItems.size} 道菜</Text>
            <Text style={styles.orderTotal}>¥{totalPrice}</Text>
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitOrder}>
            <Text style={styles.submitText}>提交订单</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl, paddingBottom: Spacing.md, gap: Spacing.xs },
  name: { color: Colors.text, ...Typography.title },
  address: { color: Colors.textSecondary, ...Typography.body },
  phone: { color: Colors.primary, ...Typography.body },
  categoryRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, paddingVertical: Spacing.md },
  categoryBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: 16, backgroundColor: Colors.surface },
  categoryActive: { backgroundColor: Colors.primary },
  categoryText: { color: Colors.textSecondary, ...Typography.caption },
  categoryTextActive: { color: Colors.background, fontWeight: '700' },
  orderBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surface, padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  orderInfo: { gap: 2 },
  orderCount: { color: Colors.textSecondary, ...Typography.caption },
  orderTotal: { color: Colors.accent, ...Typography.subtitle, fontWeight: '700' },
  submitBtn: { backgroundColor: Colors.accent, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: 12 },
  submitText: { color: Colors.text, ...Typography.body, fontWeight: '700' },
});
