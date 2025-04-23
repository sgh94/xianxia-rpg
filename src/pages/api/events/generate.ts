import type { NextApiRequest, NextApiResponse } from 'next';
import { generateEvent } from '@modules/events/service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, eventId, locale = 'ko' } = req.body;

  if (!userId || !eventId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const event = await generateEvent(userId, eventId, locale);
    
    if (!event) {
      return res.status(404).json({ message: 'Failed to generate event' });
    }
    
    return res.status(200).json(event);
  } catch (error) {
    console.error('Error generating event:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}