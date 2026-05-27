import { useState, useEffect, useCallback } from 'react';
import { Card, CardType } from '../types/card';
import { CardService } from '../services/CardService';

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    await CardService.initDefaults();
    const all = await CardService.getAll();
    setCards(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(async (data: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => {
    const card = await CardService.create(data);
    await reload();
    return card;
  }, [reload]);

  const update = useCallback(async (id: string, data: Partial<Card>) => {
    const card = await CardService.update(id, data);
    await reload();
    return card;
  }, [reload]);

  const remove = useCallback(async (id: string) => {
    await CardService.delete(id);
    await reload();
  }, [reload]);

  const setDefault = useCallback(async (id: string) => {
    await CardService.setDefault(id);
    await reload();
  }, [reload]);

  const setActive = useCallback(async (id: string, active: boolean) => {
    await CardService.setActive(id, active);
    await reload();
  }, [reload]);

  return { cards, loading, create, update, remove, setDefault, setActive, reload };
}
