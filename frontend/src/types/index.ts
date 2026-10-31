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
  start_stop: string;
  end_stop: string;
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
  itemName: string;           // backend se add karwana
  description: string;
  itemType: 'lost' | 'found'; // backend se add karwana
  date: string;
}