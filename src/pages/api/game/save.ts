import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { getUserProfile, updateUserProfile } from '@modules/stats/service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, gameState } = req.body;
    
    if (!userId || !gameState) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // 사용자 프로필 업데이트 (stats, traits 등 변경 가능)
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    // 프로필 업데이트 데이터 준비
    const updatedData = {
      ...profile,
      stats: gameState.stats || profile.stats,
      traits: gameState.traits || profile.traits,
      life: gameState.life !== undefined ? gameState.life : profile.life,
      maxLife: gameState.maxLife !== undefined ? gameState.maxLife : profile.maxLife,
    };
    
    // 프로필 업데이트
    await updateUserProfile(userId, updatedData);
    
    // 게임 상태 저장
    await kv.set(`user:${userId}:game_state`, {
      ...gameState,
      lastSaved: Date.now()
    });
    
    return res.status(200).json({ 
      success: true,
      lastSaved: Date.now()
    });
  } catch (error) {
    console.error('Error saving game state:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to save game'
    });
  }
}