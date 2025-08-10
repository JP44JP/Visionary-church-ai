'use client';

import React, { useState } from 'react';
import { XMarkIcon, DocumentArrowDownIcon, ClockIcon } from '@heroicons/react/24/outline';
import { AnalyticsPeriod, AnalyticsFilter, ExportFormat } from '../../types/analytics';
import { clsx } from 'clsx';

interface ExportModalProps {
  churchId: string;
  period: AnalyticsPeriod;
  filters: AnalyticsFilter;
  onClose: () => void;
}

const EXPORT_FORMATS: { value: ExportFormat; label: string; description: string }[] = [
  { value: 'json', label: 'JSON', description: 'Raw data in JSON format' },
  { value: 'csv', label: 'CSV', description: 'Spreadsheet-compatible format' },
  { value: 'excel', label: 'Excel', description: 'Excel workbook with charts' },
  { value: 'pdf', label: 'PDF', description: 'Formatted report with visuals' }
];

const REPORT_TYPES: { value: string; label: string; description: string }[] = [
  { value: 'summary', label: 'Summary Report', description: 'High-level KPIs and overview' },
  { value: 'detailed', label: 'Detailed Report', description: 'Complete analytics breakdown' },
  { value: 'custom', label: 'Custom Report', description: 'Tailored to your selection' }
];

export function ExportModal({ churchId, period, filters, onClose }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [selectedType, setSelectedType] = useState('summary');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const params = new URLSearchParams({
        type: selectedType,
        period,
        format: selectedFormat,
        ...filters
      });

      const response = await fetch(`/api/analytics/reports?${params}`, {
        headers: {
          'x-church-id': churchId
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate report');
      }

      // Handle different export formats
      if (selectedFormat === 'json') {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { 
          type: 'application/json' 
        });
        downloadFile(blob, `analytics-${selectedType}-${Date.now()}.json`);
      } else if (selectedFormat === 'csv') {
        const blob = await response.blob();
        downloadFile(blob, `analytics-${selectedType}-${Date.now()}.csv`);
      } else if (selectedFormat === 'excel') {
        const blob = await response.blob();
        downloadFile(blob, `analytics-${selectedType}-${Date.now()}.xlsx`);
      } else if (selectedFormat === 'pdf') {
        const blob = await response.blob();
        downloadFile(blob, `analytics-${selectedType}-${Date.now()}.pdf`);
      }

      onClose();
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Export Analytics Data</h3>
            <p className="text-sm text-gray-600">
              Download your analytics data in various formats
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Current Filters Info */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-900 mb-1">Export Configuration</div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Period: {period === '1d' ? '24 hours' : period === '7d' ? '7 days' : period === '30d' ? '30 days' : period === '90d' ? '90 days' : '1 year'}</div>
            {Object.keys(filters).length > 0 && (
              <div>
                Filters: {Object.entries(filters)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Report Type
          </label>
          <div className="space-y-2">
            {REPORT_TYPES.map((type) => (
              <label key={type.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  value={type.value}
                  checked={selectedType === type.value}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{type.label}</div>
                  <div className="text-xs text-gray-600">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EXPORT_FORMATS.map((format) => (
              <label
                key={format.value}
                className={clsx(
                  'flex items-center p-3 border rounded-lg cursor-pointer transition-colors',
                  selectedFormat === format.value
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                )}
              >
                <input
                  type="radio"
                  name="format"
                  value={format.value}
                  checked={selectedFormat === format.value}
                  onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                  className="sr-only"
                />
                <div className="text-center w-full">
                  <div className="text-sm font-medium text-gray-900">{format.label}</div>
                  <div className="text-xs text-gray-600">{format.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {exportError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-800">{exportError}</div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isExporting ? (
              <>
                <ClockIcon className="h-4 w-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>Export Data</span>
              </>
            )}
          </button>
        </div>

        {/* Export Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Export Information:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>PDF reports include charts and visualizations</li>
              <li>Excel exports contain multiple sheets with raw data</li>
              <li>CSV files are compatible with most spreadsheet applications</li>
              <li>JSON format provides raw data for technical use</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}