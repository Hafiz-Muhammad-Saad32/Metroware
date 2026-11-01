export type Role = 'user' | 'admin';

export interface User {
  userId: number;
  userName: string;
  userRole: Role;
  userEmail: string;
  userPassword: string;
}
export type SessionUser = Omit<User, 'userPassword'>;

export interface BusRoute {
  routeId: number;
  routeName: string;
  startStop: string;
  endStop: string;
}
export interface Bus {
  busId: number;
  busNumber: string;
  routeId: number | null;
}

export interface Stop {
  stopId: number;
  stopName: string;
  routeId: number;
  latitude: number;   
  longitude: number;  
  stopOrder: number;  
}

export interface Complaint {
  complaintId: number;
  userId: number;
  userName?: string;
  complaintText: string;
  complaintDate: string;
}

export interface LostFoundItem {
  itemId: number;
  userId: number;
  userName?: string;
  itemName: string;           
  description: string;
  itemType: 'lost' | 'found'; 
  date: string;
}

export type PaymentMethod = 'cash' | 'easypaisa';

export interface Ticket {
  ticketId: number;
  bookingId: number;
  userId: number;
  busId: number | null;
  pickupStopId: number;
  dropStopId: number;
  price: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending';
  transactionId: string | null;
  bookedAt: string;
  // join se (backend join karke bhejega)
  userName?: string;
  busNumber?: string;
  routeName?: string;
  pickupName?: string;
  dropName?: string;
}