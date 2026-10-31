import { lostFound } from '../data/lostFound';
import { users } from '../data/user';
import { LostFoundItem } from '../types';

const wait = (ms = 300) => new Promise((r) => setTimeout(r, ms));

const withName = (i: LostFoundItem): LostFoundItem => ({
  ...i,
  userName: users.find((u) => u.userId === i.userId)?.userName,
});

export async function getLostFound(): Promise<LostFoundItem[]> {
  await wait();
  return lostFound.map(withName).sort((a, b) => b.date.localeCompare(a.date));
}

export async function addLostFound(
  userId: number,
  data: { itemName: string; description: string; itemType: 'lost' | 'found' }
) {
  await wait();
  lostFound.push({
    itemId: Math.max(0, ...lostFound.map((i) => i.itemId)) + 1,
    userId,
    itemName: data.itemName.trim(),
    description: data.description.trim(),
    itemType: data.itemType,
    date: new Date().toISOString(),
  });
}

export async function deleteLostFound(itemId: number) {
  await wait();
  const i = lostFound.findIndex((x) => x.itemId === itemId);
  if (i >= 0) lostFound.splice(i, 1);
}