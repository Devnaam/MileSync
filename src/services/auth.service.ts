 // src/services/auth.service.ts
import { prisma } from '@/lib/prisma';
import type { User } from '@/types/auth.types';

export class AuthService {
  /**
   * Create or update user in database after Firebase auth
   */
  static async syncUser(firebaseUid: string, email: string, fullName?: string): Promise<User> {
    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: {
        email,
        fullName: fullName || undefined,
        updatedAt: new Date(),
      },
      create: {
        firebaseUid,
        email,
        fullName: fullName || null,
        timezone: 'Asia/Kolkata',
        preferredLanguage: 'en',
      },
    });

    return user;
  }

  /**
   * Get user by Firebase UID
   */
  static async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    return user;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string,
    data: { fullName?: string; timezone?: string; preferredLanguage?: string }
  ): Promise<User> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return user;
  }
}
