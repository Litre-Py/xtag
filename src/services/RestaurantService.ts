import { Restaurant, MenuItem } from '../types/card';
import { generateId } from '../utils/uuid';

const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-001',
    name: '川味坊',
    address: '北京市朝阳区建国路88号',
    phone: '010-88886666',
    rating: 4.5,
    menu: [
      { id: 'm-001', name: '宫保鸡丁', description: '经典川菜，鸡丁配花生米', price: 38, category: '热菜', spicy: 2, isAvailable: true },
      { id: 'm-002', name: '麻婆豆腐', description: '麻辣鲜香，嫩滑可口', price: 28, category: '热菜', spicy: 3, isAvailable: true },
      { id: 'm-003', name: '回锅肉', description: '传统川菜，肥而不腻', price: 42, category: '热菜', spicy: 1, isAvailable: true },
      { id: 'm-004', name: '担担面', description: '成都特色小吃', price: 18, category: '主食', spicy: 2, isAvailable: true },
      { id: 'm-005', name: '冰粉', description: '夏日清凉甜品', price: 12, category: '甜品', isAvailable: true },
      { id: 'm-006', name: '酸辣汤', description: '开胃暖身', price: 22, category: '汤品', spicy: 2, isAvailable: true },
    ],
  },
  {
    id: 'rest-002',
    name: '粤点轩',
    address: '北京市海淀区中关村大街100号',
    phone: '010-62228888',
    rating: 4.8,
    menu: [
      { id: 'm-010', name: '虾饺皇', description: '水晶虾饺，鲜美弹牙', price: 36, category: '点心', isAvailable: true },
      { id: 'm-011', name: '叉烧包', description: '蜜汁叉烧馅，松软可口', price: 22, category: '点心', isAvailable: true },
      { id: 'm-012', name: '肠粉', description: '布拉肠粉，嫩滑入味', price: 28, category: '点心', isAvailable: true },
      { id: 'm-013', name: '烧鹅饭', description: '脆皮烧鹅配白米饭', price: 48, category: '主食', isAvailable: true },
      { id: 'm-014', name: '杨枝甘露', description: '芒果椰汁甜品', price: 26, category: '甜品', isAvailable: true },
    ],
  },
  {
    id: 'rest-003',
    name: '日式料理·樱花',
    address: '北京市东城区王府井大街55号',
    phone: '010-65559999',
    rating: 4.6,
    menu: [
      { id: 'm-020', name: '三文鱼刺身', description: '新鲜挪威三文鱼', price: 88, category: '刺身', isAvailable: true },
      { id: 'm-021', name: '鳗鱼饭', description: '炭烤鳗鱼配秘制酱汁', price: 68, category: '主食', isAvailable: true },
      { id: 'm-022', name: '味噌汤', description: '传统日式味噌', price: 18, category: '汤品', isAvailable: true },
      { id: 'm-023', name: '天妇罗拼盘', description: '酥脆天妇罗', price: 58, category: '热菜', isAvailable: true },
      { id: 'm-024', name: '抹茶冰淇淋', description: '宇治抹茶', price: 28, category: '甜品', isAvailable: true },
    ],
  },
];

class RestaurantServiceImpl {
  private restaurants: Restaurant[] = MOCK_RESTAURANTS;

  async getAll(): Promise<Restaurant[]> {
    return this.restaurants;
  }

  async getById(id: string): Promise<Restaurant | null> {
    return this.restaurants.find((r) => r.id === id) || null;
  }

  async search(query: string): Promise<Restaurant[]> {
    const q = query.toLowerCase();
    return this.restaurants.filter(
      (r) => r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q)
    );
  }
}

export const RestaurantService = new RestaurantServiceImpl();
