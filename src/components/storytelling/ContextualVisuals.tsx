"use client";

import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';

interface ContextualVisualsProps {
  chartType: 'bar' | 'scatter' | 'map';
  data: any[];
  keys?: string[];
  indexBy?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export function ContextualVisuals({
  chartType,
  data,
  keys,
  indexBy,
  xAxisLabel,
  yAxisLabel
}: ContextualVisualsProps) {

  // Terracotta Garden Design Tokens for Nivo Theme
  const terracottaTheme = {
    background: 'transparent',
    textColor: '#5E544A',
    fontSize: 12,
    axis: {
      domain: { line: { stroke: '#EAE5DC', strokeWidth: 1 } },
      legend: { text: { fontSize: 13, fill: '#5E544A', fontWeight: 600 } },
      ticks: {
        line: { stroke: '#EAE5DC', strokeWidth: 1 },
        text: { fontSize: 11, fill: '#8C8276' }
      }
    },
    grid: {
      line: { stroke: '#EAE5DC', strokeWidth: 1, strokeDasharray: '4 4' }
    },
    tooltip: {
      container: {
        background: '#FFFFFF',
        color: '#2A2520',
        fontSize: 12,
        borderRadius: 8,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '8px 12px'
      }
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        if (!keys || !indexBy) return <div className="p-10 text-center text-text-body">Missing Bar Chart Config</div>;
        return (
          <ResponsiveBar
            data={data}
            keys={keys}
            indexBy={indexBy}
            margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={['#D86B3E', '#528B65', '#D36C95']}
            theme={terracottaTheme}
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: xAxisLabel,
              legendPosition: 'middle',
              legendOffset: 40
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: yAxisLabel,
              legendPosition: 'middle',
              legendOffset: -50
            }}
            enableLabel={false}
            animate={true}
          />
        );

      case 'scatter':
        return (
          <ResponsiveScatterPlot
            data={data}
            margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
            xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            blendMode="multiply"
            colors={['#D86B3E', '#528B65']}
            theme={terracottaTheme}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: xAxisLabel,
              legendPosition: 'middle',
              legendOffset: 40
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: yAxisLabel,
              legendPosition: 'middle',
              legendOffset: -50
            }}
          />
        );

      case 'map':
        return (
          <div className="flex items-center justify-center h-full text-text-body border-2 border-dashed border-border-soft rounded-xl">
            [ Geographic Map Placeholder - Requires TopoJSON ]
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-[400px] bg-white rounded-2xl border border-border p-6 shadow-sm mt-8">
      {renderChart()}
    </div>
  );
}
