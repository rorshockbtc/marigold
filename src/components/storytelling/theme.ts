export const terracottaGardenTheme = {
  colors: {
    primary: ['#C85A32', '#2D3A34', '#E6A15C', '#8C9E8C', '#5C4033'],
    contrast: ['#111111', '#C85A32', '#707070', '#E5E5E5'],
  },
  nivoTheme: {
    background: 'transparent',
    text: {
      fontSize: 12,
      fontFamily: '"Helvetica Neue", Helvetica, Inter, system-ui, sans-serif',
      fill: '#9CA3AF', // subtle grey for tick labels
    },
    axis: {
      domain: { line: { stroke: 'transparent', strokeWidth: 0 } }, // Remove axis domain line for maximum data-ink ratio
      ticks: { 
        line: { stroke: '#374151', strokeWidth: 1 },
        text: { fill: '#6B7280' } // Very subtle text for ticks
      },
      legend: { text: { fontSize: 13, fontWeight: 500, fill: '#D1D5DB' } },
    },
    grid: {
      line: { stroke: '#1F2937', strokeWidth: 1, strokeDasharray: '2 4' }, // extremely subtle grid
    },
    tooltip: {
      container: {
        background: 'rgba(31, 41, 55, 0.9)', // bg-gray-800 with opacity
        backdropFilter: 'blur(8px)',
        color: '#F3F4F6',
        fontSize: 13,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        border: '1px solid #4B5563',
      },
    },
  },
};
