import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, fate } = req.body;
    
    if (!userId || !fate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // KV 스토어에 운명 데이터 저장
    await kv.set(`user:${userId}:fate`, fate);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving fate:', error);
    return res.status(500).json({ message: 'Failed to save fate' });
  }
}