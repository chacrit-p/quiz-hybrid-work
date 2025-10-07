
import { Root, SignInRequest } from '@/types/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://cis.kku.ac.th/api/classroom';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || '';

export class AuthService {
  static async signIn(credentials: SignInRequest): Promise<Root> {
    try {
      const response = await fetch(`${API_URL}/signin`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Authentication failed');
      }

      const data: Root = await response.json();
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    // Clear stored token and user data
    // Implementation depends on your storage solution
  }
}
