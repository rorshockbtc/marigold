"use client";

import React, { useRef } from 'react';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { terracottaGardenTheme } from './theme';
import { Download, Sparkles } from 'lucide-react';

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
    alert("Downloading high-resolution publication-ready vector image...");
  };

  const getAxisBottomConfig = (dataLength: number, sampleLabel: string) => {
    const isDense = dataLength > 5;
    const isLongLabel = sampleLabel && sampleLabel.toString().length > 8;
    
    return {
      legendPosition: 'middle' as const,
      legendOffset: (isDense || isLongLabel) ? 55 : 42,
      tickRotation: (isDense || isLongLabel) ? -35 : 0,
    };
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
      case 'line_chart':
      case 'trend':
        const lineData = [{
          id: config?.title || 'Trend Line',
          data: data.map(d => ({
            x: config?.xAxisKey ? d[config.xAxisKey] : Object.values(d)[0],
            y: config?.yAxisKey ? d[config.yAxisKey] : Object.values(d)[1]
          }))
        }];
        const lineAxisBottom = getAxisBottomConfig(data.length, lineData[0].data[0]?.x?.toString() || '');

        return (
          <ResponsiveLine
            data={lineData}
            margin={{ top: 20, right: 30, bottom: lineAxisBottom.legendOffset + 25, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
            curve="monotoneX"
            colors={terracottaGardenTheme.colors.primary}
            theme={terracottaGardenTheme.nivoTheme}
            pointSize={8}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            enableArea={true}
            areaOpacity={0.15}
            useMesh={true}
            axisBottom={{
              legend: config?.xAxisLabel || 'Timeline',
              ...lineAxisBottom
            }}
            axisLeft={{
              legend: config?.yAxisLabel || 'Metric Value',
              legendPosition: 'middle',
              legendOffset: -48
            }}
          />
        );

      case 'bar':
      case 'bar_chart':
        const indexBy = config?.xAxisKey || Object.keys(data[0])[0];
        const barKeys = config?.seriesKeys || Object.keys(data[0]).filter(k => k !== indexBy);
        const barAxisBottom = getAxisBottomConfig(data.length, data[0]?.[indexBy]?.toString() || '');

        return (
          <ResponsiveBar
            data={data}
            keys={barKeys}
            indexBy={indexBy}
            margin={{ top: 20, right: 20, bottom: barAxisBottom.legendOffset + 25, left: 60 }}
            padding={0.35}
            borderRadius={6}
            colors={terracottaGardenTheme.colors.primary}
            theme={terracottaGardenTheme.nivoTheme}
            borderColor={{ from: 'color', modifiers: [['darker', 1.4]] }}
            axisBottom={{
              legend: config?.xAxisLabel || indexBy,
              ...barAxisBottom
            }}
            axisLeft={{
              legend: config?.yAxisLabel || barKeys.join(', '),
              legendPosition: 'middle',
              legendOffset: -48,
            }}
            enableLabel={false}
            animate={true}
          />
        );

      case 'scatter':
      case 'scatter_plot':
      default:
        const scatterData = [{
          id: config?.title || 'Insight',
          data: data.map(d => ({
            x: config?.xAxisKey ? d[config.xAxisKey] : Object.values(d)[0],
            y: config?.yAxisKey ? d[config.yAxisKey] : Object.values(d)[1]
          }))
        }];
        const scatterAxisBottom = getAxisBottomConfig(data.length, scatterData[0].data[0]?.x?.toString() || '');

        return (
          <ResponsiveScatterPlot
            data={scatterData}
            margin={{ top: 20, right: 20, bottom: scatterAxisBottom.legendOffset + 25, left: 60 }}
            xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            colors={terracottaGardenTheme.colors.primary}
            theme={terracottaGardenTheme.nivoTheme}
            nodeSize={10}
            useMesh={true}
            axisBottom={{
              legend: config?.xAxisLabel || 'X Axis',
              ...scatterAxisBottom
            }}
            axisLeft={{
              legend: config?.yAxisLabel || 'Y Axis',
              legendPosition: 'middle',
              legendOffset: -48,
            }}
          />
        );
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3 relative overflow-hidden group">
      {config?.title && (
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {config.title}
          </h4>
          <button 
            onClick={exportChart}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
            title="Download Publication Vector"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      )}
      <div ref={containerRef} className="h-[360px] w-full pt-2">
        {renderChart()}
      </div>
    </div>
  );
};

