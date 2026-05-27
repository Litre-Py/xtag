import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getStorage<T>(key: string): Promise<T[]> {
  try {
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function setStorage<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export async function getOne<T extends { id: string }>(key: string, id: string): Promise<T | null> {
  const items = await getStorage<T>(key);
  return items.find((item) => item.id === id) || null;
}

export async function addOne<T extends { id: string }>(key: string, item: T): Promise<void> {
  const items = await getStorage<T>(key);
  items.push(item);
  await setStorage(key, items);
}

export async function updateOne<T extends { id: string }>(
  key: string,
  id: string,
  updates: Partial<T>
): Promise<T | null> {
  const items = await getStorage<T>(key);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates };
  await setStorage(key, items);
  return items[index];
}

export async function removeOne<T extends { id: string }>(key: string, id: string): Promise<void> {
  const items = await getStorage<T>(key);
  await setStorage(
    key,
    items.filter((item) => item.id !== id)
  );
}
