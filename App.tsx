import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import { UWBProvider } from './src/context/UWBContext';
import { HomeStackParamList, ScannerStackParamList, CardStackParamList, MoreStackParamList, RootTabParamList } from './src/types/navigation';
import { HomeScreen } from './src/screens/HomeScreen';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { CardListScreen } from './src/screens/CardListScreen';
import { CardEditorScreen } from './src/screens/CardEditorScreen';
import { CardDetailScreen } from './src/screens/CardDetailScreen';
import { ParkingCardScreen } from './src/screens/ParkingCardScreen';
import { NotificationHistoryScreen } from './src/screens/NotificationHistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { MoreScreen } from './src/screens/MoreScreen';
import { ResumeEditorScreen } from './src/screens/ResumeEditorScreen';
import { ResumePreviewScreen } from './src/screens/ResumePreviewScreen';
import { FileShareScreen } from './src/screens/FileShareScreen';
import { RestaurantListScreen } from './src/screens/RestaurantListScreen';
import { RestaurantDetailScreen } from './src/screens/RestaurantDetailScreen';
import { ParkingLotListScreen } from './src/screens/ParkingLotListScreen';
import { ParkingLotDetailScreen } from './src/screens/ParkingLotDetailScreen';
import { AIChatScreen } from './src/screens/AIChatScreen';
import { Colors } from './src/constants/theme';

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ScannerStack = createNativeStackNavigator<ScannerStackParamList>();
const CardStack = createNativeStackNavigator<CardStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const defaultScreenOptions = {
  headerStyle: { backgroundColor: Colors.background },
  headerTintColor: Colors.text,
  headerShadowVisible: false,
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={defaultScreenOptions}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="CardDetail" component={CardDetailScreen} options={{ title: '卡片详情' }} />
      <HomeStack.Screen name="ParkingCard" component={ParkingCardScreen} options={{ title: '停车卡' }} />
      <HomeStack.Screen name="NotificationHistory" component={NotificationHistoryScreen} options={{ title: '通知历史' }} />
    </HomeStack.Navigator>
  );
}

function ScannerStackNavigator() {
  return (
    <ScannerStack.Navigator screenOptions={defaultScreenOptions}>
      <ScannerStack.Screen name="ScannerMain" component={ScannerScreen} options={{ headerShown: false }} />
    </ScannerStack.Navigator>
  );
}

function CardStackNavigator() {
  return (
    <CardStack.Navigator screenOptions={defaultScreenOptions}>
      <CardStack.Screen name="CardList" component={CardListScreen} options={{ headerShown: false }} />
      <CardStack.Screen name="CardEditor" component={CardEditorScreen} options={{ title: '编辑卡片' }} />
      <CardStack.Screen name="ResumeEditor" component={ResumeEditorScreen} options={{ title: '编辑简历' }} />
      <CardStack.Screen name="ResumePreview" component={ResumePreviewScreen} options={{ title: '简历预览' }} />
    </CardStack.Navigator>
  );
}

function MoreStackNavigator() {
  return (
    <MoreStack.Navigator screenOptions={defaultScreenOptions}>
      <MoreStack.Screen name="MoreMain" component={MoreScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="AIChat" component={AIChatScreen} options={{ title: 'AI 助手' }} />
      <MoreStack.Screen name="FileShare" component={FileShareScreen} options={{ title: '文件分享' }} />
      <MoreStack.Screen name="RestaurantList" component={RestaurantListScreen} options={{ title: '菜单分享' }} />
      <MoreStack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{ title: '餐厅详情' }} />
      <MoreStack.Screen name="ParkingLotList" component={ParkingLotListScreen} options={{ title: '停车场' }} />
      <MoreStack.Screen name="ParkingLotDetail" component={ParkingLotDetailScreen} options={{ title: '停车场详情' }} />
    </MoreStack.Navigator>
  );
}

const tabIcons: Record<string, string> = {
  Home: '🏠',
  Scanner: '📡',
  Cards: '💳',
  More: '📎',
  Settings: '⚙️',
};

export default function App() {
  return (
    <AppProvider>
      <UWBProvider>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: Colors.primary,
              background: Colors.background,
              card: Colors.surface,
              text: Colors.text,
              border: Colors.border,
              notification: Colors.accent,
            },
            fonts: {
              regular: { fontFamily: 'System', fontWeight: '400' },
              medium: { fontFamily: 'System', fontWeight: '500' },
              bold: { fontFamily: 'System', fontWeight: '700' },
              heavy: { fontFamily: 'System', fontWeight: '900' },
            },
          }}
        >
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: {
                backgroundColor: Colors.surface,
                borderTopColor: Colors.border,
                paddingBottom: 4,
                height: 56,
              },
              tabBarActiveTintColor: Colors.primary,
              tabBarInactiveTintColor: Colors.textMuted,
              tabBarIcon: ({ focused }) => (
                <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
                  {tabIcons[route.name]}
                </Text>
              ),
            })}
          >
            <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: '首页' }} />
            <Tab.Screen name="Scanner" component={ScannerStackNavigator} options={{ title: '扫描' }} />
            <Tab.Screen name="Cards" component={CardStackNavigator} options={{ title: '卡片' }} />
            <Tab.Screen name="More" component={MoreStackNavigator} options={{ title: '更多' }} />
            <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: '设置' }} />
          </Tab.Navigator>
        </NavigationContainer>
      </UWBProvider>
    </AppProvider>
  );
}
