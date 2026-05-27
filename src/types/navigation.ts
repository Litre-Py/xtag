export type RootTabParamList = {
  Home: undefined;
  Scanner: undefined;
  Cards: undefined;
  More: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  CardDetail: { cardId: string };
  ParkingCard: { cardId: string };
  NotificationHistory: undefined;
};

export type CardStackParamList = {
  CardList: undefined;
  CardEditor: { cardId?: string };
  ResumeEditor: { cardId?: string };
  ResumePreview: { cardId: string };
};

export type ScannerStackParamList = {
  ScannerMain: undefined;
  DeviceCard: { deviceId: string };
};

export type MoreStackParamList = {
  MoreMain: undefined;
  AIChat: undefined;
  FileShare: undefined;
  FileDetail: { fileId: string };
  RestaurantList: undefined;
  RestaurantDetail: { restaurantId: string };
  ParkingLotList: undefined;
  ParkingLotDetail: { lotId: string };
};
