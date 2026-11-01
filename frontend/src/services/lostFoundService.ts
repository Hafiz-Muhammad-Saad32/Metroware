import { LostFoundItem } from '../types';
import { api } from './api';
import { EP } from './endpoints';

interface LostFoundInput {
  itemName: string;
  description: string;
  itemType: 'lost' | 'found';
}

const clean = (d: LostFoundInput): LostFoundInput => ({
  itemName: d.itemName.trim(),
  description: d.description.trim(),
  itemType: d.itemType,
});

export const getLostFound = () => api<LostFoundItem[]>(EP.lostFound);

export const addLostFound = (data: LostFoundInput) =>
  api<LostFoundItem>(EP.lostFound, { method: 'POST', body: clean(data) });

export const updateLostFound = (itemId: number, data: LostFoundInput) =>
  api<LostFoundItem>(EP.lostFoundItem(itemId), { method: 'PUT', body: clean(data) });

export async function deleteLostFound(itemId: number): Promise<void> {
  await api(EP.lostFoundItem(itemId), { method: 'DELETE' });
}