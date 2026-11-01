import { Complaint } from '../types';
import { api } from './api';
import { EP } from './endpoints';

export const getComplaints = () => api<Complaint[]>(EP.complaints);

// userId token se aata hai, isliye parameter hata diya
export const addComplaint = (complaintText: string) =>
  api<Complaint>(EP.complaints, { method: 'POST', body: { complaintText: complaintText.trim() } });

export const updateComplaint = (complaintId: number, complaintText: string) =>
  api<Complaint>(EP.complaint(complaintId), {
    method: 'PUT',
    body: { complaintText: complaintText.trim() },
  });

export async function deleteComplaint(complaintId: number): Promise<void> {
  await api(EP.complaint(complaintId), { method: 'DELETE' });
}