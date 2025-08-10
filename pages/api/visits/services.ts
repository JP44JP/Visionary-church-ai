// GET /api/visits/services - Get available service times
import { NextApiRequest, NextApiResponse } from 'next';
import { getAvailableServices } from '../../../visit-planning-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  return await getAvailableServices(req, res);
}