"use client";

import React, { useRef } from 'react';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { ResponsiveBar } from '@nivo/bar';
import { terracottaGardenTheme } from './theme';
import { Download } from 'lucide-react';

interface EditorialChartProps {
  chartType: string;
  data: any[]; 
  config?: {
    xAxisKey?: string;
    yAxisKey?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    title?: string;
    seriesKeys?: string[];
  };
}

export const EditorialChart: React.FC<EditorialChartProps> = ({ chartType, data, config }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) return null;

  const exportChart = () => {
    // Basic export utility (mock for now, or simple canvas grab)
    alert("In production, this will download a high-res PNG of the interactive chart!");
  };

  const renderChart = () => {
    // Heuristic for X-axis label collision
    const getAxisBottomConfig = (dataLength: number, sampleLabel: string) => {
      const isDense = dataLength > 5;
      const isLongLabel = sampleLabel && sampleLabel.toString().length > 8;
      
      return {
        legendPosition: 'middle' as const,
        legendOffset: (isDense || isLongLabel) ? 60 : 46, // push legend down if labels are rotated
        tickRotation: (isDense || isLongLabel) ? -45 : 0,
      };
    };

    switch (chartType) {
      case 'scatter':
      case 'scatter_plot':
        const scatterData = [{
          id: config?.title || 'Insight',
          data: data.map(d => ({
            x: config?.xAxisKey ? d[config.xAxisKey] : Object.values(d)[0],
            y: config?.yAxisKey ? d[config.yAxisKey] : Object.values(d)[1]
          }))
        }];
        
        const scatterAxisBottom = getAxisBottomConfig(
          data.length, 
          scatterData[0].data[0]?.x?.toString() || ''
        );

        return (
          <ResponsiveScatterPlot
            data={scatterData}
            margin={{ top: 20, right: 20, bottom: scatterAxisBottom.legendOffset + 20, left: 60 }}
            xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            colors={terracottaGardenTheme.colors.primary}
            theme={terracottaGardenTheme.nivoTheme}
            nodeSize={8}
            useMesh={true}
            axisBottom={{
              legend: config?.xAxisLabel || 'X Axis',
              ...scatterAxisBottom
            }}
            axisLeft={{
              legend: config?.yAxisLabel || 'Y Axis',
              legendPosition: 'middle',
              legendOffset: -46,
            }}
          />
        );

      case 'bar':
        const indexBy = config?.xAxisKey || Object.keys(data[0])[0];
        const barKeys = config?.seriesKeys || Object.keys(data[0]).filter(k => k !== indexBy);
        
        const barAxisBottom = getAxisBottomConfig(
          data.length,
          data[0]?.[indexBy]?.toString() || ''
        );

        return (
          <ResponsiveBar
            data={data}
            keys={barKeys}
            indexBy={indexBy}
            margin={{ top: 20, right: 20, bottom: barAxisBottom.legendOffset + 20, left: 60 }}
            padding={0.3}
            colors={terracottaGardenTheme.colors.primary}
            theme={terracottaGardenTheme.nivoTheme}
            labelSkipWidth={12}
            labelSkipHeight={12}
            axisBottom={{
              legend: config?.xAxisLabel || indexBy,
              ...barAxisBottom
            }}
            axisLeft={{
              legend: config?.yAxisLabel || barKeys.join(', '),
              legendPosition: 'middle',
              legendOffset: -46,
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
    <div className="w-full border border-gray-700 bg-[#1E2025] rounded-xl shadow-2xl relative overflow-hidden group">
      {config?.title && (
        <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center bg-[#2A2D35]/30">
          <h3 className="text-[#D1D5DB] font-serif font-medium tracking-wide">{config.title}</h3>
          <button 
            onClick={exportChart}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
            title="Download Chart as PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      )}
      <div ref={containerRef} className="h-[400px] w-full p-4">
        {renderChart()}
      </div>
    </div>
  );
};
