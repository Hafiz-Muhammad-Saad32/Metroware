import { PaymentMethod, Ticket } from '../types';
import { api } from './api';
import { EP } from './endpoints';

export interface Quote {
  unitPrice: number;
  total: number;
  distanceKm: number;
  quantity: number;
}

// price backend nikalta hai
export const getQuote = (pickupStopId: number, dropStopId: number, quantity: number) =>
  api<Quote>(
    `${EP.tickets}/quote?pickupStopId=${pickupStopId}&dropStopId=${dropStopId}&quantity=${quantity}`
  );

export interface BookInput {
  busId: number;
  pickupStopId: number;
  dropStopId: number;
  quantity: number;
  paymentMethod: PaymentMethod;
  mobile?: string; // sirf easypaisa
  pin?: string; // sirf easypaisa
}

// userId token se aata hai. Easypaisa payment bhi isi call mein hoti hai.
export const bookTickets = (input: BookInput) =>
  api<Ticket[]>(EP.tickets, { method: 'POST', body: input });

export const getMyTickets = () => api<Ticket[]>(EP.myTickets);

// admin
export const getAllTickets = () => api<Ticket[]>(EP.adminTickets);

export const markBookingPaid = (bookingId: number) =>
  api<Ticket[]>(EP.bookingPaid(bookingId), { method: 'PUT' });