import { Card, ParkingCard, CardType } from '../types/card';
import { CARD_STORAGE_KEY } from '../constants/config';
import { getStorage, setStorage, getOne, addOne, updateOne, removeOne } from '../utils/storage';
import { generateId } from '../utils/uuid';

class CardServiceImpl {
  async getAll(): Promise<Card[]> {
    return getStorage<Card>(CARD_STORAGE_KEY);
  }

  async getById(id: string): Promise<Card | null> {
    return getOne<Card>(CARD_STORAGE_KEY, id);
  }

  async create(data: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    const card: Card = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await addOne(CARD_STORAGE_KEY, card);
    return card;
  }

  async update(id: string, data: Partial<Card>): Promise<Card | null> {
    return updateOne<Card>(CARD_STORAGE_KEY, id, { ...data, updatedAt: Date.now() });
  }

  async delete(id: string): Promise<void> {
    await removeOne(CARD_STORAGE_KEY, id);
  }

  async setDefault(id: string): Promise<void> {
    const cards = await this.getAll();
    for (const card of cards) {
      if (card.id === id) {
        await this.update(card.id, { isDefault: true, isActive: true });
      } else if (card.isDefault) {
        await this.update(card.id, { isDefault: false });
      }
    }
  }

  async setActive(id: string, active: boolean): Promise<void> {
    await this.update(id, { isActive: active });
  }

  async getParkingCards(): Promise<ParkingCard[]> {
    const cards = await this.getAll();
    return cards.filter((c) => c.type === CardType.PARKING) as ParkingCard[];
  }

  async initDefaults(): Promise<void> {
    const cards = await this.getAll();
    if (cards.length === 0) {
      await this.create({
        type: CardType.PERSONAL,
        title: '我的名片',
        fields: [
          { key: 'name', label: '姓名', value: '用户', icon: '👤' },
          { key: 'phone', label: '电话', value: '13800138000', icon: '📞', actionType: 'phone' },
          { key: 'email', label: '邮箱', value: 'user@example.com', icon: '📧', actionType: 'email' },
          { key: 'wechat', label: '微信', value: 'my_wechat', icon: '💬', actionType: 'wechat' },
          { key: 'douyin', label: '抖音', value: '', icon: '🎵', actionType: 'douyin' },
          { key: 'xiaohongshu', label: '小红书', value: '', icon: '📕', actionType: 'xiaohongshu' },
          { key: 'weibo', label: '微博', value: '', icon: '🔴', actionType: 'weibo' },
        ],
        color: '#00d2ff',
        isActive: true,
        isDefault: true,
      });
      await this.create({
        type: CardType.PARKING,
        title: '我的停车卡',
        fields: [
          { key: 'owner', label: '车主', value: '用户', icon: '🚗' },
          { key: 'phone', label: '电话', value: '13800138000', icon: '📞', actionType: 'phone' },
        ],
        color: '#f5a623',
        isActive: true,
        isDefault: false,
      } as any);
    }
  }
}

export const CardService = new CardServiceImpl();
