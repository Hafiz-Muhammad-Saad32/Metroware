import { complaints } from '../data/complaints';
import { users } from '../data/user';
import { Complaint } from '../types';

const wait = (ms = 300) => new Promise((r) => setTimeout(r, ms));

const withName = (c: Complaint): Complaint => ({
  ...c,
  userName: users.find((u) => u.userId === c.userId)?.userName,
});

export async function getComplaints(): Promise<Complaint[]> {
  await wait();
  return complaints.map(withName).sort((a, b) => b.complaintDate.localeCompare(a.complaintDate));
}

// backend mein userId token se aayega, tab ye parameter hat jayega
export async function addComplaint(userId: number, complaintText: string) {
  await wait();
  complaints.push({
    complaintId: Math.max(0, ...complaints.map((c) => c.complaintId)) + 1,
    userId,
    complaintText: complaintText.trim(),
    complaintDate: new Date().toISOString(),
  });
}

export async function deleteComplaint(complaintId: number) {
  await wait();
  const i = complaints.findIndex((c) => c.complaintId === complaintId);
  if (i >= 0) complaints.splice(i, 1);
}