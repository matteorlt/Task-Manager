import axios from 'axios';
import { API_ENDPOINTS } from '../config';

export const invitationService = {
  async sendInvitation(email: string): Promise<void> {
    try {
      await axios.post(`${API_ENDPOINTS.INVITATIONS.SEND}`, { email });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', error);
      throw error;
    }
  },

  async getInvitations(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_ENDPOINTS.INVITATIONS.GET_ALL}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des invitations:', error);
      throw error;
    }
  },

  async acceptInvitation(invitationId: string): Promise<void> {
    try {
      await axios.post(`${API_ENDPOINTS.INVITATIONS.ACCEPT}/${invitationId}/accept`);
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
      throw error;
    }
  },

  async rejectInvitation(invitationId: string): Promise<void> {
    try {
      await axios.post(`${API_ENDPOINTS.INVITATIONS.REJECT}/${invitationId}/reject`);
    } catch (error) {
      console.error('Erreur lors du rejet de l\'invitation:', error);
      throw error;
    }
  }
}; 