// POST /api/visits/plan - Create new visit plan
import { NextApiRequest, NextApiResponse } from 'next';
import { createVisitPlan } from '../../../visit-planning-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  return await createVisitPlan(req, res);
}