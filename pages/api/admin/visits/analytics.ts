// GET /api/admin/visits/analytics - Get visit analytics
import { NextApiRequest, NextApiResponse } from 'next';
import { getVisitAnalytics } from '../../../../visit-planning-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  // TODO: Add authentication/authorization middleware here
  // Verify user has admin permissions
  
  return await getVisitAnalytics(req, res);
}