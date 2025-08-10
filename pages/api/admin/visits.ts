// GET /api/admin/visits - Get all visits for church admin
import { NextApiRequest, NextApiResponse } from 'next';
import { getAdminVisits } from '../../../visit-planning-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  // TODO: Add authentication/authorization middleware here
  // Verify user has admin or staff permissions
  
  return await getAdminVisits(req, res);
}