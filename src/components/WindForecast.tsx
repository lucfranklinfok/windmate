import React from 'react';
import { Navigation, Wind } from 'lucide-react';
import { weatherService } from '../services/weatherService';

interface WindForecastProps {
  forecast: Array<{
    day: string;
    windSpeed: number;
    windDirection: number;
  }>;
}

const WindForecast: React.FC<WindForecastProps> = ({ forecast }) => {
  const getWindStrength = (speed: number) => {
    if (speed < 10) return { color: '#22c55e', label: 'Light' };
    if (speed < 20) return { color: '#eab308', label: 'Moderate' };
    if (speed < 30) return { color: '#f97316', label: 'Strong' };
    return { color: '#ef4444', label: 'Very Strong' };
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      padding: '24px',
      marginTop: '24px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <Wind size={24} style={{ color: 'white' }} />
        <h3 style={{
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: '600',
          margin: 0
        }}>
          Wind Forecast
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px'
      }}>
        {forecast.map((day, index) => {
          const windStrength = getWindStrength(day.windSpeed);
          const compassDirection = weatherService.getWindDirectionText(day.windDirection);

          return (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '16px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {/* Day */}
              <div style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '12px'
              }}>
                {day.day}
              </div>

              {/* Wind Direction Icon */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${windStrength.color}40, ${windStrength.color}20)`,
                  border: `2px solid ${windStrength.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Navigation
                    size={20}
                    style={{
                      transform: `rotate(${day.windDirection}deg)`,
                      color: windStrength.color
                    }}
                  />
                </div>
              </div>

              {/* Compass Direction */}
              <div style={{
                color: 'white',
                fontSize: '1rem',
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {compassDirection}
              </div>

              {/* Wind Speed */}
              <div style={{
                color: windStrength.color,
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                {day.windSpeed} km/h
              </div>

              {/* Wind Strength Label */}
              <div style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.75rem'
              }}>
                {windStrength.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px'
      }}>
        <div style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.75rem',
          marginBottom: '8px'
        }}>
          Wind Speed Guide:
        </div>
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          fontSize: '0.75rem'
        }}>
          <span style={{ color: '#22c55e' }}>Light (&lt;10km/h)</span>
          <span style={{ color: '#eab308' }}>Moderate (10-20km/h)</span>
          <span style={{ color: '#f97316' }}>Strong (20-30km/h)</span>
          <span style={{ color: '#ef4444' }}>Very Strong (&gt;30km/h)</span>
        </div>
      </div>
    </div>
  );
};

export default WindForecast;