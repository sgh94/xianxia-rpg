import type { NextApiRequest, NextApiResponse } from 'next';
import { createUserProfile, getUserProfile, updateUserProfile } from '@modules/stats/service';
import { UserProfile } from '@modules/stats/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query;

  if (!userId || Array.isArray(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // 프로필 조회
        const profile = await getUserProfile(userId);
        
        if (!profile) {
          return res.status(404).json({ message: 'User profile not found' });
        }
        
        return res.status(200).json(profile);
        
      case 'POST':
        // 새 프로필 생성
        const { username, locale } = req.body;
        
        if (!username) {
          return res.status(400).json({ message: 'Username is required' });
        }
        
        const newProfile = await createUserProfile(userId, username, locale);
        return res.status(201).json(newProfile);
        
      case 'PATCH':
        // 프로필 업데이트
        const updates = req.body as Partial<UserProfile>;
        
        const updatedProfile = await updateUserProfile(userId, updates);
        return res.status(200).json(updatedProfile);
        
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling profile request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}