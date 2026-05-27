import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CardStackParamList } from '../types/navigation';
import { useCards } from '../hooks/useCards';
import { Card, CardType, CardField, ParkingCard } from '../types/card';
import { Colors, Typography, Spacing } from '../constants/theme';
import { generateId } from '../utils/uuid';

type Route = RouteProp<CardStackParamList, 'CardEditor'>;

const CARD_TYPES = [
  { type: CardType.PERSONAL, label: '个人名片', icon: '👤' },
  { type: CardType.PARKING, label: '停车卡', icon: '🅿️' },
  { type: CardType.RESUME, label: '简历卡', icon: '📋' },
  { type: CardType.CUSTOM, label: '自定义', icon: '✨' },
];

const COLORS = ['#00d2ff', '#e94560', '#7ed321', '#f5a623', '#9b59b6', '#e67e22', '#1abc9c', '#3498db'];

export function CardEditorScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { cards, create, update } = useCards();
  const editingId = route.params?.cardId;
  const existingCard = editingId ? cards.find((c) => c.id === editingId) : null;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<CardType>(CardType.PERSONAL);
  const [fields, setFields] = useState<CardField[]>([]);
  const [color, setColor] = useState(COLORS[0]);
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);

  // Parking-specific
  const [licensePlate, setLicensePlate] = useState('');
  const [parkingSpot, setParkingSpot] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');

  useEffect(() => {
    if (existingCard) {
      setTitle(existingCard.title);
      setType(existingCard.type);
      setFields(existingCard.fields);
      setColor(existingCard.color || COLORS[0]);
      setIsActive(existingCard.isActive);
      setIsDefault(existingCard.isDefault);
      if (existingCard.type === CardType.PARKING) {
        const pc = existingCard as ParkingCard;
        setLicensePlate(pc.licensePlate || '');
        setParkingSpot(pc.parkingSpot || '');
        setOwnerName(pc.ownerName || '');
        setOwnerPhone(pc.ownerPhone || '');
        setVehicleModel(pc.vehicleModel || '');
      }
    } else {
      setFields([
        { key: generateId(), label: '姓名', value: '', icon: '👤' },
        { key: generateId(), label: '电话', value: '', icon: '📞', actionType: 'phone' },
        { key: generateId(), label: '邮箱', value: '', icon: '📧', actionType: 'email' },
        { key: generateId(), label: '微信', value: '', icon: '💬', actionType: 'wechat' },
        { key: generateId(), label: '抖音', value: '', icon: '🎵', actionType: 'douyin' },
        { key: generateId(), label: '小红书', value: '', icon: '📕', actionType: 'xiaohongshu' },
        { key: generateId(), label: '微博', value: '', icon: '🔴', actionType: 'weibo' },
        { key: generateId(), label: 'QQ', value: '', icon: '🐧', actionType: 'qq' },
        { key: generateId(), label: 'B站', value: '', icon: '📺', actionType: 'bilibili' },
      ]);
    }
    navigation.setOptions({ title: editingId ? '编辑卡片' : '新建卡片' });
  }, [editingId]);

  const addField = () => {
    setFields([...fields, { key: generateId(), label: '', value: '', icon: '📌' }]);
  };

  const updateField = (index: number, updates: Partial<CardField>) => {
    const next = [...fields];
    next[index] = { ...next[index], ...updates };
    setFields(next);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('提示', '请输入卡片标题');
      return;
    }
    const data: any = {
      type,
      title: title.trim(),
      fields: fields.filter((f) => f.label.trim()),
      color,
      isActive,
      isDefault,
    };
    if (type === CardType.PARKING) {
      data.licensePlate = licensePlate;
      data.parkingSpot = parkingSpot;
      data.ownerName = ownerName;
      data.ownerPhone = ownerPhone;
      data.vehicleModel = vehicleModel;
    }
    if (editingId) {
      await update(editingId, data);
    } else {
      await create(data);
    }
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>卡片类型</Text>
      <View style={styles.typeRow}>
        {CARD_TYPES.map((ct) => (
          <TouchableOpacity
            key={ct.type}
            style={[styles.typeButton, type === ct.type && styles.typeActive]}
            onPress={() => setType(ct.type)}
          >
            <Text style={styles.typeIcon}>{ct.icon}</Text>
            <Text style={[styles.typeLabel, type === ct.type && styles.typeLabelActive]}>{ct.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>标题</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="输入卡片标题"
        placeholderTextColor={Colors.textMuted}
      />

      <Text style={styles.sectionTitle}>颜色</Text>
      <View style={styles.colorRow}>
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorSelected]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>

      {type === CardType.PARKING && (
        <>
          <Text style={styles.sectionTitle}>车辆信息</Text>
          <TextInput style={styles.input} value={licensePlate} onChangeText={setLicensePlate} placeholder="车牌号" placeholderTextColor={Colors.textMuted} />
          <TextInput style={styles.input} value={parkingSpot} onChangeText={setParkingSpot} placeholder="车位号" placeholderTextColor={Colors.textMuted} />
          <TextInput style={styles.input} value={ownerName} onChangeText={setOwnerName} placeholder="车主姓名" placeholderTextColor={Colors.textMuted} />
          <TextInput style={styles.input} value={ownerPhone} onChangeText={setOwnerPhone} placeholder="车主电话" placeholderTextColor={Colors.textMuted} keyboardType="phone-pad" />
          <TextInput style={styles.input} value={vehicleModel} onChangeText={setVehicleModel} placeholder="车型" placeholderTextColor={Colors.textMuted} />
        </>
      )}

      <Text style={styles.sectionTitle}>卡片字段</Text>
      {fields.map((field, i) => (
        <View key={field.key} style={styles.fieldRow}>
          <TextInput
            style={[styles.input, styles.fieldLabel]}
            value={field.label}
            onChangeText={(v) => updateField(i, { label: v })}
            placeholder="标签"
            placeholderTextColor={Colors.textMuted}
          />
          <TextInput
            style={[styles.input, styles.fieldValue]}
            value={field.value}
            onChangeText={(v) => updateField(i, { value: v })}
            placeholder="值"
            placeholderTextColor={Colors.textMuted}
          />
          <TouchableOpacity onPress={() => removeField(i)} style={styles.removeBtn}>
            <Text style={styles.removeText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={addField} style={styles.addFieldBtn}>
        <Text style={styles.addFieldText}>+ 添加字段</Text>
      </TouchableOpacity>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>通过UWB广播</Text>
        <Switch value={isActive} onValueChange={setIsActive} trackColor={{ false: Colors.border, true: Colors.primary }} />
      </View>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>设为默认卡片</Text>
        <Switch value={isDefault} onValueChange={setIsDefault} trackColor={{ false: Colors.border, true: Colors.primary }} />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>{editingId ? '保存修改' : '创建卡片'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 60 },
  sectionTitle: { color: Colors.textSecondary, ...Typography.caption, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.surface, borderRadius: 10, padding: Spacing.md, color: Colors.text, ...Typography.body, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  typeRow: { flexDirection: 'row', gap: Spacing.sm },
  typeButton: { flex: 1, alignItems: 'center', padding: Spacing.md, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  typeActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  typeIcon: { fontSize: 24, marginBottom: Spacing.xs },
  typeLabel: { color: Colors.textSecondary, ...Typography.caption },
  typeLabelActive: { color: Colors.primary },
  colorRow: { flexDirection: 'row', gap: Spacing.sm },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorSelected: { borderWidth: 3, borderColor: Colors.text },
  fieldRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  fieldLabel: { width: 80 },
  fieldValue: { flex: 1 },
  removeBtn: { justifyContent: 'center', paddingHorizontal: Spacing.sm },
  removeText: { color: Colors.accent, fontSize: 16 },
  addFieldBtn: { padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed', borderRadius: 10, marginBottom: Spacing.lg },
  addFieldText: { color: Colors.primary, ...Typography.body },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  toggleLabel: { color: Colors.text, ...Typography.body },
  saveButton: { backgroundColor: Colors.primary, borderRadius: 12, padding: Spacing.lg, alignItems: 'center', marginTop: Spacing.xl },
  saveText: { color: Colors.background, ...Typography.subtitle, fontWeight: '700' },
});
