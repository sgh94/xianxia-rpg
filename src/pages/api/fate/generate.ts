import type { NextApiRequest, NextApiResponse } from 'next';
import { generateFate } from '@modules/fate/service';
import { FateRequest, FateResult } from '@modules/fate/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, prompt, locale = 'ko' } = req.body as FateRequest;
    
    if (!userId || !prompt) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const fateResult = await generateFate({ userId, prompt, locale });
    
    return res.status(200).json(fateResult);
  } catch (error) {
    console.error('Error generating fate:', error);
    return res.status(500).json({ message: 'Failed to generate fate' });
  }
}