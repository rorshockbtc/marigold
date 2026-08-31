export const terracottaGardenTheme = {
  colors: {
    primary: ['#C85A32', '#2D3A34', '#E6A15C', '#8C9E8C', '#5C4033'],
    contrast: ['#111111', '#C85A32', '#707070', '#E5E5E5'],
  },
  nivoTheme: {
    background: 'transparent',
    text: {
      fontSize: 12,
      fontFamily: 'Inter, system-ui, sans-serif',
      fill: '#D1D5DB', // text-gray-300 to match dark mode text
    },
    axis: {
      domain: { line: { stroke: '#4B5563', strokeWidth: 1 } },
      ticks: { 
        line: { stroke: '#4B5563', strokeWidth: 1 },
        text: { fill: '#9CA3AF' }
      },
      legend: { text: { fontSize: 13, fontWeight: 600, fill: '#D1D5DB' } },
    },
    grid: {
      line: { stroke: '#374151', strokeWidth: 1, strokeDasharray: '4 4' },
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
