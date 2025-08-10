'use client';

import React from 'react';
import { AnalyticsDashboard } from '../../../components/analytics/AnalyticsDashboard';
import { useUser } from '@supabase/auth-helpers-react';
import { redirect } from 'next/navigation';

export default function AnalyticsPage() {
  const user = useUser();
  
  if (!user) {
    redirect('/login');
  }

  // In a real app, you'd get these from your auth context or user session
  const churchId = user.user_metadata?.church_id || '';
  const userRole = user.user_metadata?.role || 'member';

  if (!churchId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Church Association</h2>
          <p className="text-gray-600">You need to be associated with a church to view analytics.</p>
        </div>
      </div>
    );
  }

  // Check permissions
  const canViewAnalytics = ['church_admin', 'super_admin', 'staff'].includes(userRole);
  
  if (!canViewAnalytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">You don't have permission to view analytics data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalyticsDashboard 
          churchId={churchId} 
          userRole={userRole}
        />
      </div>
    </div>
  );
}