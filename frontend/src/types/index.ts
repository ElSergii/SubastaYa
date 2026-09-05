export interface EventCatalogItem {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  sectorsCount: number;
  totalSeats: number;
  availableSeats: number;
}

export interface SeatStatus {
  id: string;
  sectorId: string;
  sectorName: string;
  price: number;
  seatNumber: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  version: number;
  expiresAt?: string;
  reservedByMe?: boolean;
}

export interface ActiveReservation {
  reservationId: string;
  seatId: string;
  seatNumber: number;
  sectorName: string;
  price: number;
  expiresAt: string;
}

export interface AuditRecord {
  id: number;
  userId: string;
  action: string;
  resource: string;
  details: string;
  timestampMs: number;
  createdAt?: string;
}

export interface AdminStats {
  totalEvents: number;
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number;
  soldSeats: number;
  totalRevenue: number;
  totalAuditLogs: number;
}
