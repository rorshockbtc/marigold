import { ArticleChart } from '@/lib/types';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

export function ChartRenderer({ chart }: { chart: ArticleChart }) {
  if (!chart || !chart.series || chart.series.length === 0) return null;

  const c = chart;

  const commonLegends: any[] = [
    {
      dataFrom: 'keys',
      anchor: 'right',
      direction: 'column',
      justify: false,
      translateX: 140,
      translateY: 0,
      itemsSpacing: 10,
      itemWidth: 140,
      itemHeight: 20,
      itemDirection: 'left-to-right',
      itemOpacity: 0.85,
      symbolSize: 15,
      effects: [{ on: 'hover', style: { itemOpacity: 1 } }]
    }
  ];

  const axisBottom = { 
    tickSize: 5, 
    tickPadding: 5, 
    tickRotation: 0, 
    legend: c.xAxisLabel || '', 
    legendPosition: 'middle' as const, 
    legendOffset: 40 
  };

  const axisLeft = { 
    tickSize: 5, 
    tickPadding: 5, 
    tickRotation: 0, 
    legend: c.yAxisLabel || '', 
    legendPosition: 'middle' as const, 
    legendOffset: -50 
  };

  return (
    <figure className="my-10 bg-white border border-border-soft rounded-xl p-6 shadow-sm">
      <figcaption className="text-xs font-bold text-text-header uppercase tracking-wider flex items-center gap-2 mb-6 pb-4 border-b border-border-soft">
        {c.type === 'bar' ? <BarChart3 className="w-4 h-4 text-primary" /> : 
         c.type === 'pie' ? <PieChart className="w-4 h-4 text-primary" /> : 
         <TrendingUp className="w-4 h-4 text-primary" />}
        Data Visualization: {c.type.toUpperCase()}
      </figcaption>
      
      <div className="h-[550px] w-full">
        {(() => {
          if (c.type === 'bar') {
            // Transpose series into Nivo Bar format (group by X)
            const barDataMap = new Map<string | number, any>();
            const keys = c.series.map(s => s.id);
            
            c.series.forEach(s => {
              s.data.forEach(d => {
                if (!barDataMap.has(d.x)) {
                  barDataMap.set(d.x, { label: d.x });
                }
                barDataMap.get(d.x)[s.id] = d.y;
              });
            });
            
            const barData = Array.from(barDataMap.values());
            
            // Calculate max label length for rotation
            let maxLabelLength = 0;
            barData.forEach(d => {
              if (d.label && String(d.label).length > maxLabelLength) {
                maxLabelLength = String(d.label).length;
              }
            });

            let isHorizontal = maxLabelLength > 12;
            let leftMargin = isHorizontal ? Math.min(200, maxLabelLength * 7) : 60;
            let bottomMargin = isHorizontal ? 60 : 60;
            
            let rotation = 0;
            let legendOffset = 40;

            if (!isHorizontal && maxLabelLength > 12) {
              rotation = -45;
              bottomMargin = Math.max(100, maxLabelLength * 5);
              legendOffset = bottomMargin - 20;
            }

            axisBottom.tickRotation = rotation;
            axisBottom.legendOffset = isHorizontal ? 40 : legendOffset;
            
            // For horizontal, swap X and Y axis labels
            if (isHorizontal) {
              axisBottom.legend = c.yAxisLabel || '';
              axisLeft.legend = c.xAxisLabel || '';
              axisLeft.legendOffset = -leftMargin + 20;
            }

            return (
              <ResponsiveBar
                data={barData}
                keys={keys}
                indexBy="label"
                margin={{ top: 20, right: 180, bottom: bottomMargin, left: leftMargin }}
                padding={0.3}
                layout={isHorizontal ? 'horizontal' : 'vertical'}
                colors={{ scheme: 'nivo' }}
                colorBy={keys.length === 1 ? 'indexValue' : 'id'}
                axisBottom={axisBottom}
                axisLeft={axisLeft}
                labelSkipWidth={12}
                labelSkipHeight={12}
                legends={commonLegends}
              />
            );
          }

          if (c.type === 'line' || c.type === 'scatter') {
            const isScatter = c.type === 'scatter';
            const lineMin = c.yScaleMin !== undefined ? c.yScaleMin : 'auto';
            const lineMax = c.yScaleMax !== undefined ? c.yScaleMax : 'auto';
            
            const sortedSeries = c.series.map(s => {
              const sortedData = [...s.data].sort((a, b) => {
                const aVal = String(a.x);
                const bVal = String(b.x);
                return aVal.localeCompare(bVal, undefined, { numeric: true });
              });
              return { ...s, data: sortedData };
            });
            
            return (
              <ResponsiveLine
                data={sortedSeries}
                margin={{ top: 20, right: 180, bottom: 60, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: lineMin, max: lineMax, stacked: false, reverse: false }}
                axisTop={null}
                axisRight={null}
                axisBottom={axisBottom}
                axisLeft={axisLeft}
                pointSize={isScatter ? 12 : 8}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                useMesh={true}
                enableArea={false}
                enableGridX={!isScatter}
                enableGridY={true}
                lineWidth={isScatter ? 0 : 2}
                colors={{ scheme: 'nivo' }}
                legends={commonLegends.map(l => ({ ...l, dataFrom: undefined }))}
              />
            );
          }

          if (c.type === 'pie') {
            if (c.series.length === 0) return null;
            const pieData = c.series[0].data.map(d => ({
              id: String(d.x),
              label: String(d.x),
              value: d.y
            }));

            const tooManySlices = pieData.length > 10;
            
            return (
              <ResponsivePie
                data={pieData}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                colors={{ scheme: 'nivo' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                enableArcLinkLabels={!tooManySlices}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                legends={commonLegends.map(l => ({ ...l, dataFrom: undefined, direction: 'column', anchor: 'right', translateY: 0, translateX: 140 }))}
              />
            );
          }

          return (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-surface-secondary rounded-lg border border-dashed border-border">
              {c.type} charts coming soon.
            </div>
          );
        })()}
      </div>
    </figure>
  );
}
