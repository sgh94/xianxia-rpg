import type { NextApiRequest, NextApiResponse } from 'next';
import { resolveEvent } from '@modules/events/service';
import { addEP } from '@modules/stats/service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, sessionId, optionId } = req.body;

  if (!userId || !sessionId || !optionId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const result = await resolveEvent(userId, sessionId, optionId);
    
    // EP 보상 처리 (성공했을 경우에만)
    if (result.success && result.rewards?.ep) {
      const epPromises = Object.entries(result.rewards.ep).map(([statKey, amount]) => {
        return addEP(userId, statKey as any, amount);
      });
      
      await Promise.all(epPromises);
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error resolving event:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}