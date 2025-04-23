import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllEventMetadata } from '@modules/events/service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const events = await getAllEventMetadata();
    return res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}