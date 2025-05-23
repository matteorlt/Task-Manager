import axios from 'axios';
import { API_ENDPOINTS } from '../config';

interface Invitation {
  id: string;
  senderEmail: string;
  receiverEmail: string;
  eventId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  sender_name?: string;
  senderName?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

class InvitationService {
  async getInvitations(): Promise<Invitation[]> {
    try {
      const response = await axios.get(API_ENDPOINTS.INVITATIONS.GET_ALL, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des invitations:', error);
      throw error;
    }
  }

  async sendInvitation(email: string, eventId: string): Promise<void> {
    try {
      await axios.post(API_ENDPOINTS.INVITATIONS.SEND, { recipientEmail: email, eventId }, {
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', error);
      throw error;
    }
  }

  async acceptInvitation(invitationId: string): Promise<void> {
    try {
      await axios.post(API_ENDPOINTS.INVITATIONS.ACCEPT(invitationId), {}, {
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
      throw error;
    }
  }

  async rejectInvitation(invitationId: string): Promise<void> {
    try {
      await axios.post(API_ENDPOINTS.INVITATIONS.DECLINE(invitationId), {}, {
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Erreur lors du rejet de l\'invitation:', error);
      throw error;
    }
  }
}

export const invitationService = new InvitationService(); 