import type { NextApiRequest, NextApiResponse } from 'next';
import { addEP } from '@modules/stats/service';
import { StatKey } from '@modules/stats/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, statKey, amount } = req.body;

  if (!userId || !statKey || amount === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const updatedStat = await addEP(userId, statKey as StatKey, Number(amount));
    
    return res.status(200).json({
      success: true,
      stat: updatedStat
    });
  } catch (error) {
    console.error('Error adding EP:', error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to add EP' 
    });
  }
}