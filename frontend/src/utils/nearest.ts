import { BusRoute, Stop } from '../types';

export interface Point {
  lat: number;
  lng: number;
}

export interface Plan {
  route: BusRoute;
  board: Stop;
  drop: Stop;
  walkToBoardKm: number;
  walkFromDropKm: number;
  ride: Stop[]; // board se drop tak ke stops, tarteeb se
  busNumbers: string[];
}