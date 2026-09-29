export const terracottaGardenTheme = {
  colors: {
    primary: ['#D86B3E', '#2D3A34', '#E6A15C', '#8C9E8C', '#5C4033'],
    executive: ['#C85A32', '#10B981', '#F59E0B', '#6366F1', '#EC4899'],
    contrast: ['#111111', '#C85A32', '#707070', '#E5E5E5'],
  },
  nivoTheme: {
    background: 'transparent',
    text: {
      fontSize: 12,
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fill: '#9CA3AF', // subtle grey for tick labels
    },
    axis: {
      domain: { line: { stroke: '#374151', strokeWidth: 1 } },
      ticks: { 
        line: { stroke: '#4B5563', strokeWidth: 1 },
        text: { fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }
      },
      legend: { text: { fontSize: 13, fontWeight: 600, fill: '#E5E7EB', letterSpacing: '0.025em' } },
    },
    grid: {
      line: { stroke: '#1F2937', strokeWidth: 1, strokeDasharray: '4 4' }, // extremely subtle grid
    },
    tooltip: {
      container: {
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        color: '#F9FAFB',
        fontSize: 13,
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '12px 16px',
      },
    },
  },
};

