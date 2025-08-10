'use client';

import React, { useMemo } from 'react';
import { FunnelChart, Funnel, LabelList, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { VisitorFunnelMetrics, AnalyticsPeriod } from '../../../types/analytics';
import { clsx } from 'clsx';

interface VisitorFunnelChartProps {
  data: VisitorFunnelMetrics;
  period: AnalyticsPeriod;
  loading?: boolean;
}

const STAGE_COLORS = {
  awareness: '#3B82F6',     // blue-500
  interest: '#10B981',      // emerald-500  
  consideration: '#F59E0B', // amber-500
  conversion: '#EF4444',    // red-500
  retention: '#8B5CF6',     // violet-500
  advocacy: '#06B6D4'       // cyan-500
};

const STAGE_LABELS = {
  awareness: 'Awareness',
  interest: 'Interest', 
  consideration: 'Consideration',
  conversion: 'Conversion',
  retention: 'Retention',
  advocacy: 'Advocacy'
};

export function VisitorFunnelChart({ data, period, loading = false }: VisitorFunnelChartProps) {
  const funnelData = useMemo(() => {
    const stages = ['awareness', 'interest', 'consideration', 'conversion', 'retention', 'advocacy'] as const;
    
    return stages.map((stage, index) => {
      const value = data[stage] || 0;
      const previousValue = index > 0 ? (data[stages[index - 1]] || 0) : value;
      const conversionRate = previousValue > 0 ? (value / previousValue) * 100 : 0;
      
      return {
        name: STAGE_LABELS[stage],
        value,
        conversionRate: Math.round(conversionRate * 10) / 10,
        color: STAGE_COLORS[stage],
        stage
      };
    }).filter(item => item.value > 0); // Only show stages with data
  }, [data]);

  const totalVisitors = data.awareness || 0;
  const finalConversions = data.conversion || 0;
  const overallConversionRate = totalVisitors > 0 ? (finalConversions / totalVisitors) * 100 : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Visitors: <span className="font-medium">{data.value.toLocaleString()}</span>
          </p>
          <p className="text-sm text-gray-600">
            Conversion: <span className="font-medium">{data.conversionRate}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = (props: any) => {
    const { x, y, width, value, name, conversionRate } = props;
    return (
      <g>
        <text 
          x={x + width / 2} 
          y={y + 20} 
          fill="#fff" 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="text-sm font-medium"
        >
          {name}
        </text>
        <text 
          x={x + width / 2} 
          y={y + 40} 
          fill="#fff" 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="text-xs"
        >
          {value.toLocaleString()}
        </text>
        <text 
          x={x + width / 2} 
          y={y + 55} 
          fill="#fff" 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="text-xs"
        >
          {conversionRate}%
        </text>
      </g>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (funnelData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitor Journey Funnel</h3>
        <div className="text-center py-12">
          <p className="text-gray-500">No funnel data available for the selected period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Visitor Journey Funnel</h3>
          <p className="text-sm text-gray-600">
            Track how visitors progress through your conversion funnel
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {overallConversionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Overall conversion rate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Chart */}
        <div className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={400}>
            <FunnelChart>
              <Tooltip content={<CustomTooltip />} />
              <Funnel
                dataKey="value"
                data={funnelData}
                isAnimationActive
              >
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList content={<CustomLabel />} />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel Statistics */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Funnel Breakdown</h4>
          
          <div className="space-y-3">
            {funnelData.map((item, index) => {
              const dropOffRate = index > 0 ? 
                (data.drop_off_rates?.[`${funnelData[index-1].stage}_to_${item.stage}`] || 0) : 0;
              
              return (
                <div key={item.stage} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.value.toLocaleString()} visitors</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {item.conversionRate}%
                    </div>
                    {index > 0 && dropOffRate > 0 && (
                      <div className="text-xs text-red-600">
                        -{dropOffRate.toFixed(1)}% drop-off
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Insights */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <h5 className="text-sm font-medium text-blue-900 mb-2">Key Insights</h5>
            <div className="space-y-1 text-xs text-blue-800">
              <p>• {((finalConversions / totalVisitors) * 100).toFixed(1)}% of visitors convert</p>
              <p>• Biggest drop-off: {
                Object.entries(data.drop_off_rates || {})
                  .reduce((max, [key, value]) => value > max.value ? { key, value } : max, { key: '', value: 0 })
                  .key.replace(/_/g, ' → ')
              }</p>
              {data.retention > 0 && (
                <p>• {data.retention} visitors retained</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}