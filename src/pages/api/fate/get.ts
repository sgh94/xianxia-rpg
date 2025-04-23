import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFate } from '@modules/fate/service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const fateResult = await getUserFate(userId);
    
    if (!fateResult) {
      return res.status(404).json({ message: 'Fate not found' });
    }
    
    return res.status(200).json(fateResult);
  } catch (error) {
    console.error('Error getting fate:', error);
    return res.status(500).json({ message: 'Failed to get fate' });
  }
}