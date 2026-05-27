import { ParkingLot, ParkingSpot } from '../types/card';

function generateSpots(total: number, available: number): ParkingSpot[] {
  const zones = ['A', 'B', 'C'];
  const spots: ParkingSpot[] = [];
  const types: ParkingSpot['type'][] = ['standard', 'standard', 'standard', 'compact', 'ev', 'handicap'];
  for (let i = 0; i < total; i++) {
    const zone = zones[Math.floor(i / 20)] || 'A';
    const row = String.fromCharCode(65 + (Math.floor(i / 5) % 4));
    const number = String((i % 5) + 1).padStart(2, '0');
    spots.push({
      id: `spot-${i}`,
      zone,
      row,
      number: `${zone}${row}${number}`,
      status: i < available ? (Math.random() > 0.3 ? 'available' : 'reserved') : 'occupied',
      type: types[i % types.length],
    });
  }
  return spots;
}

const MOCK_LOTS: ParkingLot[] = [
  {
    id: 'lot-001',
    name: '万达广场停车场',
    address: '北京市朝阳区建国路93号',
    totalSpots: 500,
    availableSpots: 127,
    hourlyRate: 8,
    dailyRate: 60,
    openHours: '00:00 - 24:00',
    spots: generateSpots(500, 127),
    evCharging: true,
  },
  {
    id: 'lot-002',
    name: '国贸中心地下车库',
    address: '北京市朝阳区建国门外大街1号',
    totalSpots: 800,
    availableSpots: 203,
    hourlyRate: 10,
    dailyRate: 80,
    openHours: '00:00 - 24:00',
    spots: generateSpots(800, 203),
    evCharging: true,
  },
  {
    id: 'lot-003',
    name: '中关村科技园停车场',
    address: '北京市海淀区中关村大街27号',
    totalSpots: 300,
    availableSpots: 45,
    hourlyRate: 6,
    dailyRate: 40,
    openHours: '06:00 - 23:00',
    spots: generateSpots(300, 45),
    evCharging: false,
  },
];

class ParkingLotServiceImpl {
  private lots: ParkingLot[] = MOCK_LOTS;

  async getAll(): Promise<ParkingLot[]> {
    return this.lots;
  }

  async getById(id: string): Promise<ParkingLot | null> {
    return this.lots.find((l) => l.id === id) || null;
  }

  async getAvailableSpots(lotId: string): Promise<ParkingSpot[]> {
    const lot = await this.getById(lotId);
    return lot ? lot.spots.filter((s) => s.status === 'available') : [];
  }
}

export const ParkingLotService = new ParkingLotServiceImpl();
