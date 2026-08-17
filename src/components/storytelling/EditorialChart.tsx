"use client";

import React from 'react';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { ResponsiveBar } from '@nivo/bar';

interface EditorialChartProps {
  chartType: string;
  data: any[]; // The aggregated output from DuckDB
}

// Vignelli/Terracotta Theme for Nivo
const terracottaTheme = {
  background: 'transparent',
  textColor: '#E5E7EB', // Tailwind gray-200
  fontSize: 12,
  axis: {
    domain: {
      line: {
        stroke: '#4B5563', // Tailwind gray-600
        strokeWidth: 1,
      },
    },
    ticks: {
      line: {
        stroke: '#4B5563',
        strokeWidth: 1,
      },
      text: {
        fill: '#9CA3AF', // Tailwind gray-400
      },
    },
  },
  grid: {
    line: {
      stroke: '#374151', // Tailwind gray-700
      strokeWidth: 1,
      strokeDasharray: '4 4',
    },
  },
  tooltip: {
    container: {
      background: 'rgba(31, 41, 55, 0.85)', // Glassmorphic gray-800
      backdropFilter: 'blur(8px)',
      color: '#F3F4F6',
      fontSize: 14,
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #4B5563',
    },
  },
};

export const EditorialChart: React.FC<EditorialChartProps> = ({ chartType, data }) => {
  if (!data || data.length === 0) return null;

  const renderChart = () => {
    switch (chartType) {
      case 'scatter':
      case 'scatter_plot':
        // Nivo Scatterplot expects data in { id: string, data: [{x, y}] } format
        // We do a basic mapping assuming the DuckDB query returned generic x and y columns
        const scatterData = [{
          id: 'Insight',
          data: data.map(d => ({
            x: d.x !== undefined ? d.x : Object.values(d)[0],
            y: d.y !== undefined ? d.y : Object.values(d)[1]
          }))
        }];
        
        return (
          <ResponsiveScatterPlot
            data={scatterData}
            margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
            xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            colors={['#E27D60']} // Terracotta primary
            theme={terracottaTheme}
            nodeSize={8}
            useMesh={true}
            axisBottom={{
              legend: 'X Axis',
              legendPosition: 'middle',
              legendOffset: 46,
            }}
            axisLeft={{
              legend: 'Y Axis',
              legendPosition: 'middle',
              legendOffset: -46,
            }}
          />
        );

      case 'bar':
        // Expects { [keyField]: value, [valueField]: amount }
        const keys = Object.keys(data[0]);
        const indexBy = keys[0];
        const barKeys = keys.slice(1);

        return (
          <ResponsiveBar
            data={data}
            keys={barKeys}
            indexBy={indexBy}
            margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
            padding={0.3}
            colors={['#E27D60', '#C38D9E', '#41B3A3']} // Terracotta palette
            theme={terracottaTheme}
            labelSkipWidth={12}
            labelSkipHeight={12}
            axisBottom={{
              legend: indexBy,
              legendPosition: 'middle',
              legendOffset: 46,
            }}
          />
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400 font-serif">
            Chart type '{chartType}' not explicitly mapped yet. Please review raw data.
          </div>
        );
    }
  };

  return (
    <div className="h-[400px] w-full border border-gray-700 bg-surface rounded-lg p-4 shadow-xl">
      {renderChart()}
    </div>
  );
};
