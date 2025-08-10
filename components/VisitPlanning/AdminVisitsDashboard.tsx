// Admin Visits Dashboard Component
'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

interface VisitPlan {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone?: string;
  planned_date: string;
  party_size: number;
  adults_count: number;
  children_count: number;
  status: 'planned' | 'confirmed' | 'attended' | 'no_show' | 'cancelled' | 'rescheduled';
  lead_source: string;
  created_at: string;
  service_times: {
    name: string;
    start_time: string;
    location: string;
  };
  follow_up_completed?: boolean;
  next_contact_date?: string;
}

interface VisitAnalytics {
  totalVisits: number;
  confirmedVisits: number;
  attendedVisits: number;
  noShows: number;
  conversionRate: number;
  averagePartySize: number;
  popularServices: { name: string; count: number }[];
  leadSources: { source: string; count: number }[];
}

interface AdminVisitsDashboardProps {
  tenantId: string;
}

const STATUS_COLORS = {
  planned: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  attended: 'bg-green-100 text-green-800 border-green-200',
  no_show: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  rescheduled: 'bg-purple-100 text-purple-800 border-purple-200'
};

export default function AdminVisitsDashboard({ tenantId }: AdminVisitsDashboardProps) {
  const [visits, setVisits] = useState<VisitPlan[]>([]);
  const [analytics, setAnalytics] = useState<VisitAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState<VisitPlan | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('upcoming');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadVisits();
    loadAnalytics();
  }, [statusFilter, dateFilter, searchQuery, currentPage]);

  const loadVisits = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '25'
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (dateFilter === 'upcoming') {
        params.append('start_date', format(new Date(), 'yyyy-MM-dd'));
      } else if (dateFilter === 'past_week') {
        params.append('start_date', format(subDays(new Date(), 7), 'yyyy-MM-dd'));
        params.append('end_date', format(new Date(), 'yyyy-MM-dd'));
      } else if (dateFilter === 'past_month') {
        params.append('start_date', format(subDays(new Date(), 30), 'yyyy-MM-dd'));
        params.append('end_date', format(new Date(), 'yyyy-MM-dd'));
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/admin/visits?${params}`);
      const data = await response.json();

      if (data.success) {
        setVisits(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error loading visits:', error);
      toast.error('Failed to load visits');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');
      
      const response = await fetch(`/api/admin/visits/analytics?start_date=${startDate}&end_date=${endDate}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const updateVisitStatus = async (visitId: string, status: string) => {
    try {
      const response = await fetch(`/api/visits/${visitId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Visit status updated successfully');
        loadVisits();
        setSelectedVisit(null);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error updating visit status:', error);
      toast.error(error.message || 'Failed to update visit status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'attended':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'no_show':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-gray-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Visit Management</h1>
        <p className="mt-2 text-gray-600">Manage visitor plans and track attendance</p>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Visits</h3>
                <p className="text-2xl font-semibold text-gray-900">{analytics.totalVisits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Attended</h3>
                <p className="text-2xl font-semibold text-gray-900">{analytics.attendedVisits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
                <p className="text-2xl font-semibold text-gray-900">{analytics.conversionRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">No Shows</h3>
                <p className="text-2xl font-semibold text-gray-900">{analytics.noShows}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search visitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="planned">Planned</option>
              <option value="confirmed">Confirmed</option>
              <option value="attended">Attended</option>
              <option value="no_show">No Show</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="upcoming">Upcoming</option>
              <option value="past_week">Past Week</option>
              <option value="past_month">Past Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Party Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visits.map((visit) => (
                <tr key={visit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {visit.visitor_name}
                      </div>
                      <div className="text-sm text-gray-500">{visit.visitor_email}</div>
                      {visit.visitor_phone && (
                        <div className="text-sm text-gray-500">{visit.visitor_phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{visit.service_times.name}</div>
                    <div className="text-sm text-gray-500">{visit.service_times.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(visit.planned_date), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {visit.service_times.start_time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <UserGroupIcon className="w-4 h-4 mr-1" />
                      {visit.party_size}
                      {visit.children_count > 0 && (
                        <span className="text-gray-500 ml-1">
                          ({visit.adults_count}a, {visit.children_count}c)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[visit.status as keyof typeof STATUS_COLORS]}`}>
                      {getStatusIcon(visit.status)}
                      <span className="ml-1">{formatStatus(visit.status)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {visit.lead_source.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedVisit(visit)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      
                      {visit.status === 'planned' && (
                        <button
                          onClick={() => updateVisitStatus(visit.id, 'confirmed')}
                          className="text-green-600 hover:text-green-900"
                          title="Mark as Confirmed"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                        </button>
                      )}
                      
                      {(visit.status === 'planned' || visit.status === 'confirmed') && (
                        <button
                          onClick={() => updateVisitStatus(visit.id, 'attended')}
                          className="text-green-600 hover:text-green-900"
                          title="Mark as Attended"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visit Details Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Visit Details</h3>
              <button
                onClick={() => setSelectedVisit(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Visitor Name</label>
                  <p className="text-sm text-gray-900">{selectedVisit.visitor_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedVisit.visitor_email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-sm text-gray-900">{selectedVisit.visitor_phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Party Size</label>
                  <p className="text-sm text-gray-900">
                    {selectedVisit.party_size} total ({selectedVisit.adults_count} adults, {selectedVisit.children_count} children)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service</label>
                  <p className="text-sm text-gray-900">{selectedVisit.service_times.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                  <p className="text-sm text-gray-900">
                    {format(new Date(selectedVisit.planned_date), 'MMM d, yyyy')} at {selectedVisit.service_times.start_time}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[selectedVisit.status as keyof typeof STATUS_COLORS]}`}>
                    {getStatusIcon(selectedVisit.status)}
                    <span className="ml-1">{formatStatus(selectedVisit.status)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lead Source</label>
                  <p className="text-sm text-gray-900">{selectedVisit.lead_source.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedVisit(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
                
                {selectedVisit.status === 'planned' && (
                  <button
                    onClick={() => updateVisitStatus(selectedVisit.id, 'confirmed')}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Mark as Confirmed
                  </button>
                )}
                
                {(selectedVisit.status === 'planned' || selectedVisit.status === 'confirmed') && (
                  <button
                    onClick={() => updateVisitStatus(selectedVisit.id, 'attended')}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    Mark as Attended
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}