// GET /api/visits/confirm/:token - Confirm visit via email token
import { NextApiRequest, NextApiResponse } from 'next';
import { confirmVisitByToken } from '../../../../visit-planning-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  return await confirmVisitByToken(req, res);
}