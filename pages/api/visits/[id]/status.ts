// PUT /api/visits/:id/status - Update visit status
import { NextApiRequest, NextApiResponse } from 'next';
import { updateVisitStatus } from '../../../../visit-planning-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  return await updateVisitStatus(req, res);
}