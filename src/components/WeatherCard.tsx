import React from 'react';
import { Sun, Cloud, CloudRain, MapPin, Navigation } from 'lucide-react';
import { weatherService } from '../services/weatherService';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  pressure: number;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    windSpeed: number;
    windDirection: number;
  }>;
  weeklyWindData: any[];
}

interface WeatherCardProps {
  data: WeatherData;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ data }) => {
  const getWeatherIcon = (condition: string, size: number = 64) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
      return <Sun size={size} style={{ color: '#fbbf24', filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }} />;
    } else if (lowerCondition.includes('rain')) {
      return <CloudRain size={size} style={{ color: '#60a5fa', filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }} />;
    } else {
      return <Cloud size={size} style={{ color: '#9ca3af', filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }} />;
    }
  };

  const getConditionGradient = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
      return 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)';
    } else if (lowerCondition.includes('rain')) {
      return 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%)';
    } else {
      return 'linear-gradient(135deg, rgba(156, 163, 175, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)';
    }
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        padding: '32px',
        color: 'white',
        position: 'relative',
        minHeight: '400px'
      }}
    >
      {/* Background gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: getConditionGradient(data.condition),
          opacity: 0.5,
          borderRadius: '24px',
          pointerEvents: 'none'
        }}
      />

      {/* Content - positioned above the gradient */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Header section with location and temperature */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px'
        }}>
          <div>
            {/* Location */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <MapPin size={20} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
              <span style={{
                fontSize: '1.125rem',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                {data.location}
              </span>
            </div>

            {/* Temperature */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <span style={{
                fontSize: '4rem',
                fontWeight: '300',
                color: 'white',
                lineHeight: 1
              }}>
                {data.temperature}
              </span>
              <span style={{
                fontSize: '1.5rem',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                °C
              </span>
            </div>

            {/* Condition */}
            <p style={{
              fontSize: '1.25rem',
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: '500',
              margin: 0
            }}>
              {data.condition}
            </p>
          </div>

          {/* Weather Icon */}
          <div style={{ flexShrink: 0 }}>
            {getWeatherIcon(data.condition)}
          </div>
        </div>

        {/* Weather details grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
              Humidity
            </div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
              {data.humidity}%
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
              Wind
            </div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
              {data.windSpeed} km/h
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px'
            }}>
              <Navigation
                size={16}
                style={{
                  transform: `rotate(${data.windDirection}deg)`,
                  color: 'rgba(255, 255, 255, 0.7)'
                }}
              />
              {weatherService.getWindDirectionText(data.windDirection)}
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
              Visibility
            </div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
              {data.visibility} km
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '8px' }}>
              Pressure
            </div>
            <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
              {data.pressure} hPa
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div>
          <h4 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '16px'
          }}>
            5-Day Forecast
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '12px'
          }}>
            {data.forecast.map((day, index) => (
              <div
                key={day.day}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  margin: '0 0 8px 0'
                }}>
                  {day.day === 'Today' ? 'Today' : day.day.slice(0, 3)}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  {getWeatherIcon(day.condition, 32)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}>
                    {day.high}°
                  </span>
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem'
                  }}>
                    {day.low}°
                  </span>
                </div>

                {/* Wind information */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '8px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.75rem'
                  }}>
                    <Navigation
                      size={12}
                      style={{
                        transform: `rotate(${day.windDirection}deg)`,
                        color: 'rgba(255, 255, 255, 0.7)'
                      }}
                    />
                    <span style={{ fontWeight: '600' }}>
                      {weatherService.getWindDirectionText(day.windDirection)}
                    </span>
                  </div>
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.75rem'
                  }}>
                    {day.windSpeed}km/h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;