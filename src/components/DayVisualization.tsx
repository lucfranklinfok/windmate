import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Wind, Waves, Thermometer, Eye, Gauge, Sun, CloudRain } from 'lucide-react';

interface HourlyData {
  hour: number;
  windSpeed: number;
  windDirection: number; // degrees
  waveHeight: number;
  waterTemp: number;
  tideHeight: number;
  visibility: number;
  pressure: number;
  uvIndex: number;
  airTemp: number;
}

interface DayVisualizationProps {
  activity: 'surf' | 'fish' | 'sail' | 'hike';
}

const DayVisualization: React.FC<DayVisualizationProps> = ({ activity }) => {
  const getDefaultMetric = () => {
    switch (activity) {
      case 'surf': return 'waves';
      case 'fish': return 'tide';
      case 'sail': return 'wind';
      case 'hike': return 'temp';
      default: return 'wind';
    }
  };

  const [selectedMetric, setSelectedMetric] = useState<string>(getDefaultMetric());
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; hour: number; value: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [lastHoveredHour, setLastHoveredHour] = useState<number | null>(null);

  // Update selectedMetric when activity changes
  useEffect(() => {
    setSelectedMetric(getDefaultMetric());
  }, [activity]);

  // Generate realistic hourly data for the day
  const generateHourlyData = (): HourlyData[] => {
    const data: HourlyData[] = [];
    for (let hour = 0; hour < 24; hour++) {
      // Create realistic patterns
      const windSpeed = 8 + Math.sin((hour - 6) * Math.PI / 12) * 5 + Math.random() * 3;
      const windDirection = 225 + Math.sin(hour * Math.PI / 8) * 30; // SW varying
      const waveHeight = 1.2 + Math.sin((hour - 3) * Math.PI / 10) * 0.8 + Math.random() * 0.3;
      const waterTemp = 20 + Math.sin((hour - 8) * Math.PI / 16) * 3; // warmer in afternoon
      const tideHeight = 1.5 + Math.sin((hour - 2) * Math.PI / 6.2) * 1.2; // ~12.4hr cycle
      const visibility = 8 + Math.sin((hour - 6) * Math.PI / 12) * 3 + Math.random() * 2; // better midday
      const pressure = 1013 + Math.sin((hour - 12) * Math.PI / 24) * 8 + Math.random() * 3;
      const uvIndex = hour < 6 || hour > 18 ? 0 : Math.max(0, 2 + Math.sin((hour - 6) * Math.PI / 12) * 8);
      const airTemp = 18 + Math.sin((hour - 6) * Math.PI / 12) * 8 + Math.random() * 2; // peak afternoon

      data.push({
        hour,
        windSpeed: Math.max(0, windSpeed),
        windDirection: windDirection % 360,
        waveHeight: Math.max(0.5, waveHeight),
        waterTemp: Math.max(15, waterTemp),
        tideHeight: Math.max(0, tideHeight),
        visibility: Math.max(2, Math.min(15, visibility)),
        pressure: Math.max(995, Math.min(1030, pressure)),
        uvIndex: Math.max(0, Math.min(11, uvIndex)),
        airTemp: Math.max(10, Math.min(35, airTemp))
      });
    }
    return data;
  };

  const hourlyData = generateHourlyData();

  const getActivityMetrics = () => {
    switch (activity) {
      case 'surf':
        return [
          { key: 'waves', label: 'Wave Height', icon: <Waves size={16} /> },
          { key: 'wind', label: 'Wind Speed', icon: <Wind size={16} /> },
          { key: 'tide', label: 'Tide Level', icon: <TrendingUp size={16} /> },
          { key: 'waterTemp', label: 'Water Temp', icon: <Thermometer size={16} /> }
        ];
      case 'fish':
        return [
          { key: 'tide', label: 'Tide Level', icon: <TrendingUp size={16} /> },
          { key: 'pressure', label: 'Pressure', icon: <Gauge size={16} /> },
          { key: 'waterTemp', label: 'Water Temp', icon: <Thermometer size={16} /> },
          { key: 'wind', label: 'Wind Speed', icon: <Wind size={16} /> }
        ];
      case 'sail':
        return [
          { key: 'wind', label: 'Wind Speed', icon: <Wind size={16} /> },
          { key: 'visibility', label: 'Visibility', icon: <Eye size={16} /> },
          { key: 'waves', label: 'Wave Height', icon: <Waves size={16} /> },
          { key: 'pressure', label: 'Pressure', icon: <Gauge size={16} /> }
        ];
      case 'hike':
        return [
          { key: 'airTemp', label: 'Air Temp', icon: <Thermometer size={16} /> },
          { key: 'uvIndex', label: 'UV Index', icon: <Sun size={16} /> },
          { key: 'visibility', label: 'Visibility', icon: <Eye size={16} /> },
          { key: 'wind', label: 'Wind Speed', icon: <Wind size={16} /> }
        ];
      default:
        return [
          { key: 'wind', label: 'Wind Speed', icon: <Wind size={16} /> },
          { key: 'waves', label: 'Wave Height', icon: <Waves size={16} /> },
          { key: 'tide', label: 'Tide Level', icon: <TrendingUp size={16} /> },
          { key: 'waterTemp', label: 'Water Temp', icon: <Thermometer size={16} /> }
        ];
    }
  };

  const getMetricValue = (data: HourlyData, metric: string) => {
    switch (metric) {
      case 'wind': return data.windSpeed;
      case 'waves': return data.waveHeight;
      case 'tide': return data.tideHeight;
      case 'waterTemp': return data.waterTemp;
      case 'visibility': return data.visibility;
      case 'pressure': return data.pressure;
      case 'uvIndex': return data.uvIndex;
      case 'airTemp': return data.airTemp;
      default: return 0;
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'wind': return '#10b981'; // green
      case 'waves': return '#3b82f6'; // blue
      case 'tide': return '#8b5cf6'; // purple
      case 'waterTemp': return '#f59e0b'; // amber
      case 'visibility': return '#06b6d4'; // cyan
      case 'pressure': return '#ec4899'; // pink
      case 'uvIndex': return '#f97316'; // orange
      case 'airTemp': return '#ef4444'; // red
      default: return '#6b7280';
    }
  };

  const getMetricUnit = (metric: string) => {
    switch (metric) {
      case 'wind': return 'km/h';
      case 'waves': return 'm';
      case 'tide': return 'm';
      case 'waterTemp': return '°C';
      case 'visibility': return 'km';
      case 'pressure': return 'hPa';
      case 'uvIndex': return 'UV';
      case 'airTemp': return '°C';
      default: return '';
    }
  };

  const getMetricRange = (metric: string) => {
    switch (metric) {
      case 'wind': return { min: 0, max: 25 };
      case 'waves': return { min: 0, max: 3 };
      case 'tide': return { min: 0, max: 3 };
      case 'waterTemp': return { min: 15, max: 25 };
      case 'visibility': return { min: 0, max: 15 };
      case 'pressure': return { min: 995, max: 1030 };
      case 'uvIndex': return { min: 0, max: 11 };
      case 'airTemp': return { min: 10, max: 35 };
      default: return { min: 0, max: 100 };
    }
  };

  const renderChart = () => {
    const chartWidth = 600;
    const chartHeight = 200;
    const padding = 40;
    const range = getMetricRange(selectedMetric);

    const points = hourlyData.map((data, index) => {
      const x = padding + (index * (chartWidth - padding * 2)) / (hourlyData.length - 1);
      const value = getMetricValue(data, selectedMetric);
      const y = chartHeight - padding - ((value - range.min) / (range.max - range.min)) * (chartHeight - padding * 2);
      return { x, y, value, hour: data.hour };
    });

    const pathData = points.map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    const handleMouseMove = (event: React.MouseEvent<SVGElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Find the closest point
      let closestPoint = points[0];
      let minDistance = Math.abs(mouseX - closestPoint.x);

      points.forEach(point => {
        const distance = Math.abs(mouseX - point.x);
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      });

      // Only show tooltip if mouse is close enough to a point (within 25px)
      // and only update if it's a different point to prevent flickering
      if (minDistance < 25) {
        if (lastHoveredHour !== closestPoint.hour) {
          setHoveredPoint(closestPoint);
          setLastHoveredHour(closestPoint.hour);
          // Position tooltip relative to the chart point, not the mouse
          const chartRect = event.currentTarget.getBoundingClientRect();
          setMousePos({
            x: chartRect.left + closestPoint.x,
            y: chartRect.top + closestPoint.y
          });
        }
      } else {
        if (hoveredPoint) {
          setHoveredPoint(null);
          setLastHoveredHour(null);
        }
      }
    };

    const handleMouseLeave = () => {
      setHoveredPoint(null);
      setLastHoveredHour(null);
    };

    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        position: 'relative'
      }}>
        <svg
          width={chartWidth}
          height={chartHeight}
          style={{ overflow: 'visible' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => {
            const y = padding + (i * (chartHeight - padding * 2)) / 4;
            return (
              <line
                key={`grid-${i}`}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="1"
              />
            );
          })}

          {/* Time markers */}
          {[0, 6, 12, 18, 24].map(hour => {
            const x = padding + (hour * (chartWidth - padding * 2)) / 24;
            return (
              <g key={`time-${hour}`}>
                <line
                  x1={x}
                  y1={padding}
                  x2={x}
                  y2={chartHeight - padding}
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={chartHeight - padding + 15}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#666"
                >
                  {hour === 24 ? '00' : hour.toString().padStart(2, '0')}:00
                </text>
              </g>
            );
          })}

          {/* Chart line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke={getMetricColor(selectedMetric)}
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              {/* Invisible larger circle for better hover detection */}
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="transparent"
                style={{ cursor: 'pointer' }}
              />
              {/* Visible data point */}
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint?.hour === point.hour ? "6" : "4"}
                fill={getMetricColor(selectedMetric)}
                stroke="white"
                strokeWidth={hoveredPoint?.hour === point.hour ? "2" : "1"}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                style={{ cursor: 'pointer' }}
              />
            </g>
          ))}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map(i => {
            const y = padding + (i * (chartHeight - padding * 2)) / 4;
            const value = range.max - (i * (range.max - range.min)) / 4;
            return (
              <text
                key={`y-label-${i}`}
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#666"
              >
                {value.toFixed(1)}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  const currentHour = new Date().getHours();
  const currentData = hourlyData[currentHour];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        marginTop: '24px'
      }}
    >
      <h3 style={{
        color: 'white',
        fontSize: '24px',
        fontWeight: '600',
        margin: '0 0 24px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <TrendingUp size={24} style={{ color: '#10b981' }} />
        Daily Conditions Timeline
      </h3>

      {/* Metric selector buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {getActivityMetrics().map(metric => (
          <motion.button
            key={metric.key}
            onClick={() => setSelectedMetric(metric.key as any)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: selectedMetric === metric.key
                ? getMetricColor(metric.key)
                : 'rgba(255, 255, 255, 0.8)',
              color: selectedMetric === metric.key ? 'white' : '#374151',
              border: selectedMetric === metric.key
                ? 'none'
                : '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            {metric.icon}
            {metric.label}
          </motion.button>
        ))}
      </div>

      {/* Chart */}
      {renderChart()}

      {/* Current conditions summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginTop: '24px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <Wind size={20} style={{ color: '#10b981', marginBottom: '8px' }} />
          <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
            {currentData.windSpeed.toFixed(1)} km/h
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
            Wind Speed Now
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <Waves size={20} style={{ color: '#3b82f6', marginBottom: '8px' }} />
          <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
            {currentData.waveHeight.toFixed(1)} m
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
            Wave Height Now
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <TrendingUp size={20} style={{ color: '#8b5cf6', marginBottom: '8px' }} />
          <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
            {currentData.tideHeight.toFixed(1)} m
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
            Tide Level Now
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <Thermometer size={20} style={{ color: '#f59e0b', marginBottom: '8px' }} />
          <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
            {currentData.waterTemp.toFixed(1)}°C
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
            Water Temp Now
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px',
          margin: '0',
          lineHeight: '1.5'
        }}>
          💡 <strong>Best times for {activity}ing today:</strong> Based on current conditions,
          optimal windows appear to be around 9-11am and 3-5pm when conditions align favorably.
        </p>
      </div>

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          style={{
            position: 'fixed',
            left: mousePos.x + 15,
            top: mousePos.y - 80,
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            pointerEvents: 'none',
            zIndex: 1000,
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            border: `2px solid ${getMetricColor(selectedMetric)}`,
            backdropFilter: 'blur(10px)',
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
        >
          <div style={{
            color: getMetricColor(selectedMetric),
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            {hoveredPoint.hour.toString().padStart(2, '0')}:00
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700' }}>
            {hoveredPoint.value.toFixed(1)} {getMetricUnit(selectedMetric)}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DayVisualization;