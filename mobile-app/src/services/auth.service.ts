import { api } from './api';
import { useAuthStore } from '../stores/auth.store';

export class AuthService {
  static async sendOtp(phone: string) {
    const response = await api.post('/auth/send-otp', { phone });
    return response.data;
  }

  static async verifyOtp(phone: string, otp: string) {
    const response = await api.post('/auth/verify-otp', { phone, otp });
    return response.data;
  }

  static async register(phone: string, otp: string, fullName: string) {
    const response = await api.post('/auth/register', { phone, otp, fullName });
    if (response.data.accessToken) {
      useAuthStore.getState().setToken(response.data.accessToken);
      await this.fetchProfile();
    }
    return response.data;
  }

  static async fetchProfile() {
    const response = await api.get('/auth/me');
    useAuthStore.getState().setUser(response.data);
    return response.data;
  }
}
