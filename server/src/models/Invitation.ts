import { RowDataPacket } from 'mysql2';

export interface Invitation extends RowDataPacket {
  id: number;
  sender_id: number;
  sender_email: string;
  sender_name: string;
  recipient_email: string;
  event_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Date;
  updated_at: Date;
} 