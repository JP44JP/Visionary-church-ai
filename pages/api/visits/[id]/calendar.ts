// GET /api/visits/:id/calendar - Generate calendar file
import { NextApiRequest, NextApiResponse } from 'next';
import { generateVisitCalendar } from '../../../../visit-planning-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  return await generateVisitCalendar(req, res);
}