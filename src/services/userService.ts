/**
 * User Service
 * Mock implementation for user functionality
 */

export class UserService {
  static async getUserProfile(userId: string): Promise<{ profile: any; artistProfile?: any }> {
    // Mock implementation
    return {
      profile: {
        user_id: userId,
        user_type: 'user',
        display_name: 'User',
        first_name: 'User',
        last_name: 'Name'
      }
    };
  }

  static async createUserProfile(data: {
    user_id: string;
    user_type: string;
    display_name: string;
    first_name?: string;
    last_name?: string;
  }): Promise<void> {
    // Mock implementation
    console.log('Creating user profile:', data);
  }
}