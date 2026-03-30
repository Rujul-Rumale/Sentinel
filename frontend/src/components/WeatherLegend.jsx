import React from 'react';

const legendData = {
  precipitation: {
    title: 'Precipitation',
    colors: ['#E6E6E6', '#9FD2D2', '#82C8C8', '#42A5A5', '#1E8C8C', '#007373', '#FFD800', '#FF8C00', '#FF0000', '#D20000'],
    labels: ['0', '0.1', '0.5', '1', '2', '5', '10', '25', '50', '100+']
  },
  temperature: {
    title: 'Temperature (°C)',
    colors: ['#0000FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF7F00', '#FF0000'],
    labels: ['-40', '-20', '0', '20', '30', '40+']
  },
  clouds: {
    title: 'Cloud Cover (%)',
    colors: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.8)', 'rgba(200,200,200,0.9)'],
    labels: ['0', '33', '66', '100']
  },
  wind: {
    title: 'Wind Speed (m/s)',
    colors: ['#FFFFFF', '#E1E1E1', '#C3C3C3', '#A5A5A5', '#878787', '#696969', '#4B4B4B', '#2D2D2D'],
    labels: ['0', '5', '10', '15', '20', '25', '30', '35+']
  }
};

export default function WeatherLegend({ layers }) {
  const activeKeys = Object.keys(legendData).filter(k => layers[k]);
  
  if (activeKeys.length === 0) return null;

  return (
    <div className="weather-legend" style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      background: 'rgba(23, 23, 23, 0.85)',
      backdropFilter: 'blur(8px)',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#fff',
      fontSize: '11px',
      maxWidth: '200px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
    }}>
      {activeKeys.map(k => {
        const d = legendData[k];
        return (
          <div key={k} style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '12px', color: '#7eb8f7' }}>{d.title}</div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                height: '8px', 
                flexGrow: 1, 
                background: `linear-gradient(to right, ${d.colors.join(',')})`,
                borderRadius: '4px',
                marginRight: '8px'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', opacity: 0.8 }}>
              {d.labels.map((l, i) => (i === 0 || i === d.labels.length - 1) && <span key={i}>{l}</span>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
