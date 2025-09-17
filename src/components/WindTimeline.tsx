import React, { useState, useRef } from 'react';
import { Navigation, Wind } from 'lucide-react';
import { weatherService, DailyWindData, HourlyWindData } from '../services/weatherService';

interface WindTimelineProps {
  weeklyWindData: DailyWindData[];
  selectedActivity: 'surf' | 'fish' | 'sail' | 'hike';
}

interface TooltipData {
  x: number;
  y: number;
  hour: HourlyWindData;
  day: string;
  visible: boolean;
}

interface HoverLineData {
  x: number;
  visible: boolean;
  timeLabel: string;
}

const WindTimeline: React.FC<WindTimelineProps> = ({ weeklyWindData, selectedActivity }) => {
  const [tooltip, setTooltip] = useState<TooltipData>({
    x: 0,
    y: 0,
    hour: {} as HourlyWindData,
    day: '',
    visible: false
  });
  const [hoverLine, setHoverLine] = useState<HoverLineData>({
    x: 0,
    visible: false,
    timeLabel: ''
  });
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const svgRef = useRef<SVGSVGElement>(null);

  const chartWidth = 800;
  const chartHeight = 500;
  const padding = 40;
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  // Color functions
  const getWindColor = (speed: number) => {
    if (speed < 10) return '#22c55e';
    if (speed < 20) return '#eab308';
    if (speed < 30) return '#f97316';
    return '#ef4444';
  };

  const getOffshoreColor = (strength: string) => {
    switch (strength) {
      case 'perfect': return '#10b981';
      case 'good': return '#22c55e';
      case 'marginal': return '#eab308';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getWaveColor = (height: number) => {
    if (height < 0.5) return '#94a3b8';
    if (height < 1) return '#22c55e';
    if (height < 2) return '#3b82f6';
    if (height < 3) return '#f59e0b';
    return '#ef4444';
  };

  const getSurfConditionsColor = (conditions: string) => {
    switch (conditions) {
      case 'excellent': return '#10b981';
      case 'good': return '#22c55e';
      case 'fair': return '#eab308';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTideColor = (phase: string) => {
    switch (phase) {
      case 'high': return '#3b82f6';
      case 'rising': return '#22c55e';
      case 'low': return '#f59e0b';
      case 'falling': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getWaterTempColor = (temp: number) => {
    if (temp < 16) return '#3b82f6';
    if (temp < 18) return '#06b6d4';
    if (temp < 20) return '#10b981';
    if (temp < 22) return '#f59e0b';
    return '#ef4444';
  };

  const getBaroPressureColor = (pressure: number) => {
    if (pressure < 1005) return '#ef4444';
    if (pressure < 1015) return '#f59e0b';
    if (pressure < 1025) return '#22c55e';
    return '#3b82f6';
  };

  const getUVIndexColor = (uv: number) => {
    if (uv < 3) return '#22c55e';
    if (uv < 6) return '#eab308';
    if (uv < 8) return '#f97316';
    if (uv < 11) return '#ef4444';
    return '#7c3aed';
  };

  const getVisibilityColor = (visibility: number) => {
    if (visibility < 10) return '#ef4444';
    if (visibility < 15) return '#f59e0b';
    if (visibility < 20) return '#eab308';
    return '#22c55e';
  };

  const getHumidityColor = (humidity: number) => {
    if (humidity < 40) return '#ef4444';
    if (humidity < 60) return '#22c55e';
    if (humidity < 80) return '#eab308';
    return '#3b82f6';
  };

  // Activity-specific timeline configurations
  const getActivityConfig = (activity: 'surf' | 'fish' | 'sail' | 'hike') => {
    switch (activity) {
      case 'surf':
        return {
          title: 'Complete Surf Conditions Timeline',
          sections: [
            { name: 'Wind', dataKey: 'windSpeed', colorFunc: getWindColor, maxValue: 40, unit: 'km/h' },
            { name: 'Waves', dataKey: 'waveHeight', colorFunc: getWaveColor, maxValue: 4, unit: 'm' },
            { name: 'Tides', dataKey: 'tideHeight', colorFunc: getTideColor, maxValue: 1.8, unit: 'm', minValue: 0.2 },
            { name: 'Water', dataKey: 'waterTemperature', colorFunc: getWaterTempColor, maxValue: 24, unit: '°C', minValue: 15 }
          ]
        };
      case 'fish':
        return {
          title: 'Fishing Conditions Timeline',
          sections: [
            { name: 'Wind', dataKey: 'windSpeed', colorFunc: getWindColor, maxValue: 40, unit: 'km/h' },
            { name: 'Tides', dataKey: 'tideHeight', colorFunc: getTideColor, maxValue: 1.8, unit: 'm', minValue: 0.2 },
            { name: 'Pressure', dataKey: 'barometricPressure', colorFunc: getBaroPressureColor, maxValue: 1030, unit: 'hPa', minValue: 990 },
            { name: 'Water', dataKey: 'waterTemperature', colorFunc: getWaterTempColor, maxValue: 24, unit: '°C', minValue: 15 }
          ]
        };
      case 'sail':
        return {
          title: 'Sailing Conditions Timeline',
          sections: [
            { name: 'Wind', dataKey: 'windSpeed', colorFunc: getWindColor, maxValue: 40, unit: 'km/h' },
            { name: 'Gusts', dataKey: 'windGust', colorFunc: getWindColor, maxValue: 50, unit: 'km/h' },
            { name: 'Visibility', dataKey: 'visibility', colorFunc: getVisibilityColor, maxValue: 25, unit: 'km' },
            { name: 'Water', dataKey: 'waterTemperature', colorFunc: getWaterTempColor, maxValue: 24, unit: '°C', minValue: 15 }
          ]
        };
      case 'hike':
        return {
          title: 'Hiking Conditions Timeline',
          sections: [
            { name: 'Wind', dataKey: 'windSpeed', colorFunc: getWindColor, maxValue: 40, unit: 'km/h' },
            { name: 'Air Temp', dataKey: 'temperature', colorFunc: getWaterTempColor, maxValue: 35, unit: '°C', minValue: 10 },
            { name: 'Humidity', dataKey: 'humidity', colorFunc: getHumidityColor, maxValue: 100, unit: '%' },
            { name: 'UV Index', dataKey: 'uvIndex', colorFunc: getUVIndexColor, maxValue: 12, unit: '' }
          ]
        };
      default:
        return {
          title: 'Complete Surf Conditions Timeline',
          sections: [
            { name: 'Wind', dataKey: 'windSpeed', colorFunc: getWindColor, maxValue: 40, unit: 'km/h' },
            { name: 'Waves', dataKey: 'waveHeight', colorFunc: getWaveColor, maxValue: 4, unit: 'm' },
            { name: 'Tides', dataKey: 'tideHeight', colorFunc: getTideColor, maxValue: 1.8, unit: 'm', minValue: 0.2 },
            { name: 'Water', dataKey: 'waterTemperature', colorFunc: getWaterTempColor, maxValue: 24, unit: '°C', minValue: 15 }
          ]
        };
    }
  };

  const activityConfig = getActivityConfig(selectedActivity);
  const numSections = activityConfig.sections.length;
  const sectionHeight = innerHeight / numSections;
  const sectionPadding = 20;

  // Calculate optimal hours based on selected activity
  const calculateOptimalHours = (dayData: any, activity: 'surf' | 'fish' | 'sail' | 'hike') => {
    switch (activity) {
      case 'surf': {
        const excellentSurf = dayData.hourlyData.filter((h: any) => h.surfConditions === 'excellent');
        const goodSurf = dayData.hourlyData.filter((h: any) => h.surfConditions === 'good');
        const fairSurf = dayData.hourlyData.filter((h: any) => h.surfConditions === 'fair');
        const perfectWind = dayData.hourlyData.filter((h: any) => h.offshoreStrength === 'perfect');
        const avgWaveHeight = dayData.hourlyData.reduce((sum: number, h: any) => sum + h.waveHeight, 0) / dayData.hourlyData.length;

        return {
          excellent: excellentSurf.length,
          good: goodSurf.length,
          fair: fairSurf.length,
          perfectWind: perfectWind.length,
          avgValue: Math.round(avgWaveHeight * 10) / 10,
          avgLabel: 'waves',
          bestPeriod: excellentSurf.length > 0
            ? `${excellentSurf[0].time}-${excellentSurf[excellentSurf.length - 1].time}`
            : goodSurf.length > 0
              ? `${goodSurf[0].time}-${goodSurf[goodSurf.length - 1].time}`
              : 'No optimal periods'
        };
      }
      case 'fish': {
        const excellentFish = dayData.hourlyData.filter((h: any) =>
          weatherService.getFishingConditions(h.barometricPressure, h.tideDirection, h.windSpeed, h.waterTemperature) === 'excellent'
        );
        const goodFish = dayData.hourlyData.filter((h: any) =>
          weatherService.getFishingConditions(h.barometricPressure, h.tideDirection, h.windSpeed, h.waterTemperature) === 'good'
        );
        const fairFish = dayData.hourlyData.filter((h: any) =>
          weatherService.getFishingConditions(h.barometricPressure, h.tideDirection, h.windSpeed, h.waterTemperature) === 'fair'
        );
        const stablePressure = dayData.hourlyData.filter((h: any) => h.barometricPressure >= 1010 && h.barometricPressure <= 1020);
        const avgPressure = dayData.hourlyData.reduce((sum: number, h: any) => sum + h.barometricPressure, 0) / dayData.hourlyData.length;

        return {
          excellent: excellentFish.length,
          good: goodFish.length,
          fair: fairFish.length,
          perfectWind: stablePressure.length,
          avgValue: Math.round(avgPressure),
          avgLabel: 'hPa pressure',
          bestPeriod: excellentFish.length > 0
            ? `${excellentFish[0].time}-${excellentFish[excellentFish.length - 1].time}`
            : goodFish.length > 0
              ? `${goodFish[0].time}-${goodFish[goodFish.length - 1].time}`
              : 'No optimal periods'
        };
      }
      case 'sail': {
        const excellentSail = dayData.hourlyData.filter((h: any) =>
          weatherService.getSailingConditions(h.windSpeed, h.windGust, h.visibility) === 'excellent'
        );
        const goodSail = dayData.hourlyData.filter((h: any) =>
          weatherService.getSailingConditions(h.windSpeed, h.windGust, h.visibility) === 'good'
        );
        const fairSail = dayData.hourlyData.filter((h: any) =>
          weatherService.getSailingConditions(h.windSpeed, h.windGust, h.visibility) === 'fair'
        );
        const steadyWind = dayData.hourlyData.filter((h: any) => h.windSpeed >= 10 && h.windSpeed <= 25 && h.windGust - h.windSpeed <= 10);
        const avgVisibility = dayData.hourlyData.reduce((sum: number, h: any) => sum + h.visibility, 0) / dayData.hourlyData.length;

        return {
          excellent: excellentSail.length,
          good: goodSail.length,
          fair: fairSail.length,
          perfectWind: steadyWind.length,
          avgValue: Math.round(avgVisibility),
          avgLabel: 'km visibility',
          bestPeriod: excellentSail.length > 0
            ? `${excellentSail[0].time}-${excellentSail[excellentSail.length - 1].time}`
            : goodSail.length > 0
              ? `${goodSail[0].time}-${goodSail[goodSail.length - 1].time}`
              : 'No optimal periods'
        };
      }
      case 'hike': {
        const excellentHike = dayData.hourlyData.filter((h: any) =>
          weatherService.getHikingConditions(h.temperature, h.humidity, h.uvIndex, h.windSpeed) === 'excellent'
        );
        const goodHike = dayData.hourlyData.filter((h: any) =>
          weatherService.getHikingConditions(h.temperature, h.humidity, h.uvIndex, h.windSpeed) === 'good'
        );
        const fairHike = dayData.hourlyData.filter((h: any) =>
          weatherService.getHikingConditions(h.temperature, h.humidity, h.uvIndex, h.windSpeed) === 'fair'
        );
        const comfortableTemp = dayData.hourlyData.filter((h: any) => h.temperature >= 18 && h.temperature <= 25);
        const avgTemp = dayData.hourlyData.reduce((sum: number, h: any) => sum + h.temperature, 0) / dayData.hourlyData.length;

        return {
          excellent: excellentHike.length,
          good: goodHike.length,
          fair: fairHike.length,
          perfectWind: comfortableTemp.length,
          avgValue: Math.round(avgTemp),
          avgLabel: '°C temperature',
          bestPeriod: excellentHike.length > 0
            ? `${excellentHike[0].time}-${excellentHike[excellentHike.length - 1].time}`
            : goodHike.length > 0
              ? `${goodHike[0].time}-${goodHike[goodHike.length - 1].time}`
              : 'No optimal periods'
        };
      }
      default:
        return {
          excellent: 0,
          good: 0,
          fair: 0,
          perfectWind: 0,
          avgValue: 0,
          avgLabel: '',
          bestPeriod: 'No data'
        };
    }
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    const mouseX = event.clientX - svgRect.left;

    // Calculate which hour the mouse is over
    const hourWidth = innerWidth / 24;
    const hourIndex = Math.floor((mouseX - padding) / hourWidth);

    // Calculate the exact position for the hover line
    const lineX = padding + (mouseX - padding);
    const exactHour = ((mouseX - padding) / innerWidth) * 24;
    const displayHour = Math.max(0, Math.min(23.99, exactHour));

    // Format time label
    const hour24 = Math.floor(displayHour);
    const minutes = Math.floor((displayHour - hour24) * 60);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'pm' : 'am';
    const timeLabel = `${hour12}:${minutes.toString().padStart(2, '0')}${ampm}`;

    // Show hover line if mouse is within chart bounds
    if (mouseX >= padding && mouseX <= chartWidth - padding) {
      setHoverLine({
        x: lineX,
        visible: true,
        timeLabel
      });
    } else {
      setHoverLine(prev => ({ ...prev, visible: false }));
    }

    if (hourIndex >= 0 && hourIndex < 24 && weeklyWindData[selectedDay]) {
      const hourData = weeklyWindData[selectedDay].hourlyData[hourIndex];
      if (hourData) {
        setTooltip({
          x: event.clientX,
          y: event.clientY - 10,
          hour: hourData,
          day: weeklyWindData[selectedDay].day,
          visible: true
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
    setHoverLine(prev => ({ ...prev, visible: false }));
  };

  const selectedDayData = weeklyWindData[selectedDay];
  if (!selectedDayData) return null;

  const optimalHours = calculateOptimalHours(selectedDayData, selectedActivity);

  // Helper function to render section data
  const renderSectionData = (section: any, sectionIndex: number) => {
    const sectionY = padding + (sectionIndex * sectionHeight);
    const effectiveHeight = sectionHeight - sectionPadding;

    if (section.dataKey === 'tideHeight') {
      // Render tide as curve
      return selectedDayData.hourlyData.map((hour, index) => {
        if (index === selectedDayData.hourlyData.length - 1) return null;

        const x1 = padding + (index / 24) * innerWidth + (innerWidth / 48);
        const x2 = padding + ((index + 1) / 24) * innerWidth + (innerWidth / 48);
        const range = section.maxValue - (section.minValue || 0);
        const y1 = sectionY + ((section.maxValue - (hour as any)[section.dataKey]) / range) * effectiveHeight;
        const nextHour = selectedDayData.hourlyData[index + 1];
        const y2 = sectionY + ((section.maxValue - (nextHour as any)[section.dataKey]) / range) * effectiveHeight;

        return (
          <g key={`${section.name}-${index}`}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={section.colorFunc(hour.tidePhase)}
              strokeWidth={3}
              opacity={0.8}
            />
            <circle
              cx={x1}
              cy={y1}
              r={3}
              fill={section.colorFunc(hour.tidePhase)}
              opacity={0.9}
            />
          </g>
        );
      });
    } else {
      // Render as bars
      return selectedDayData.hourlyData.map((hour, index) => {
        const x = padding + (index / 24) * innerWidth;
        const barWidth = innerWidth / 24;
        const value = (hour as any)[section.dataKey];
        const maxVal = section.maxValue;
        const barHeight = Math.max(3, (value / maxVal) * effectiveHeight);

        return (
          <rect
            key={`${section.name}-${index}`}
            x={x}
            y={sectionY + effectiveHeight - barHeight}
            width={barWidth - 1}
            height={barHeight}
            fill={section.colorFunc(value)}
            opacity={0.6}
            rx={2}
          />
        );
      });
    }
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
      {/* Header */}
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
          {activityConfig.title}
        </h3>
      </div>

      {/* Day Selector */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {weeklyWindData.map((day, index) => (
          <button
            key={index}
            onClick={() => setSelectedDay(index)}
            style={{
              background: selectedDay === index
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(255, 255, 255, 0.05)',
              border: selectedDay === index
                ? '2px solid rgba(255, 255, 255, 0.4)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '8px 16px',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: selectedDay === index ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (selectedDay !== index) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedDay !== index) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }
            }}
          >
            {day.day}
          </button>
        ))}
      </div>

      {/* Activity Conditions Summary */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: getSurfConditionsColor('excellent')
              }} />
              <span style={{
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {optimalHours.excellent}h Excellent
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: getSurfConditionsColor('good')
              }} />
              <span style={{
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {optimalHours.good}h Good
              </span>
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem'
            }}>
              Avg: {optimalHours.avgValue}{optimalHours.avgLabel && `${optimalHours.avgLabel.includes('°C') || optimalHours.avgLabel.includes('hPa') ? '' : 'm'} ${optimalHours.avgLabel}`}
            </div>
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            Best: {optimalHours.bestPeriod}
          </div>
        </div>
      </div>

      {/* Wind Timeline Chart */}
      <div style={{
        position: 'relative',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '16px',
        padding: '20px',
        overflow: 'hidden'
      }}>
        <svg
          ref={svgRef}
          width={chartWidth}
          height={chartHeight}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            background: 'transparent',
            overflow: 'visible'
          }}
        >
          {/* Grid lines */}
          {[0, 6, 12, 18, 24].map(hour => (
            <line
              key={hour}
              x1={padding + (hour / 24) * innerWidth}
              y1={padding}
              x2={padding + (hour / 24) * innerWidth}
              y2={chartHeight - padding}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={hour % 12 === 0 ? 2 : 1}
            />
          ))}

          {/* Time labels */}
          {[0, 6, 12, 18].map(hour => (
            <text
              key={hour}
              x={padding + (hour / 24) * innerWidth}
              y={chartHeight - 10}
              fill="rgba(255, 255, 255, 0.7)"
              fontSize="12"
              textAnchor="middle"
            >
              {hour === 0 ? '12am' : hour === 12 ? '12pm' : `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'pm' : 'am'}`}
            </text>
          ))}

          {/* Surf conditions background highlights */}
          {selectedDayData.hourlyData.map((hour, index) => {
            const x = padding + (index / 24) * innerWidth;
            const barWidth = innerWidth / 24;

            return (
              <rect
                key={`surf-${index}`}
                x={x}
                y={padding}
                width={barWidth}
                height={innerHeight}
                fill={getSurfConditionsColor(hour.surfConditions)}
                opacity={0.1}
                rx={2}
              />
            );
          })}

          {/* Dynamic section rendering */}
          {activityConfig.sections.map((section, sectionIndex) => (
            <g key={`section-${sectionIndex}`}>
              {renderSectionData(section, sectionIndex)}
              {/* Last point for curve sections */}
              {section.dataKey === 'tideHeight' && (() => {
                const lastHour = selectedDayData.hourlyData[selectedDayData.hourlyData.length - 1];
                const x = padding + ((selectedDayData.hourlyData.length - 1) / 24) * innerWidth + (innerWidth / 48);
                const range = section.maxValue - (section.minValue || 0);
                const y = padding + (sectionIndex * sectionHeight) + ((section.maxValue - (lastHour as any)[section.dataKey]) / range) * (sectionHeight - sectionPadding);

                return (
                  <circle
                    cx={x}
                    cy={y}
                    r={3}
                    fill={getTideColor(lastHour.tidePhase)}
                    opacity={0.9}
                  />
                );
              })()}
            </g>
          ))}

          {/* Wind direction arrows */}
          {selectedDayData.hourlyData.map((hour, index) => {
            const x = padding + (index / 24) * innerWidth + (innerWidth / 24) / 2;
            const y = padding + 50;

            return (
              <g key={`arrow-${index}`} transform={`translate(${x - 8}, ${y - 8}) rotate(${hour.windDirection} 8 8)`}>
                <Navigation
                  width="16"
                  height="16"
                  fill={getWindColor(hour.windSpeed)}
                  stroke={getWindColor(hour.windSpeed)}
                  strokeWidth="1"
                  opacity={0.8}
                />
              </g>
            );
          })}

          {/* Dynamic section divider lines */}
          {activityConfig.sections.map((section, index) => {
            if (index === activityConfig.sections.length - 1) return null;
            const y = padding + ((index + 1) * sectionHeight) - (sectionPadding / 2);
            return (
              <line
                key={`divider-${index}`}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth={1}
              />
            );
          })}

          {/* Dynamic section labels */}
          {activityConfig.sections.map((section, index) => {
            const sectionY = padding + (index * sectionHeight);
            const maxValue = section.maxValue;
            const minValue = section.minValue || 0;

            return (
              <g key={`labels-${index}`}>
                {/* Section name */}
                <text x={15} y={sectionY + 15} fill="rgba(255, 255, 255, 0.7)" fontSize="10" fontWeight="600">
                  {section.name.toUpperCase()}
                </text>
                {/* Max value */}
                <text x={15} y={sectionY + 30} fill="rgba(255, 255, 255, 0.7)" fontSize="10">
                  {maxValue}{section.unit}
                </text>
                {/* Min value */}
                <text x={15} y={sectionY + sectionHeight - 5} fill="rgba(255, 255, 255, 0.7)" fontSize="10">
                  {minValue}{section.unit}
                </text>
              </g>
            );
          })}

          {/* Hover line */}
          {hoverLine.visible && (
            <g>
              <line
                x1={hoverLine.x}
                y1={padding}
                x2={hoverLine.x}
                y2={chartHeight - padding}
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth={2}
                strokeDasharray="5,5"
                opacity={0.9}
              />
              {/* Time label at top */}
              <rect
                x={hoverLine.x - 25}
                y={padding - 25}
                width={50}
                height={20}
                fill="rgba(0, 0, 0, 0.8)"
                rx={4}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth={1}
              />
              <text
                x={hoverLine.x}
                y={padding - 10}
                fill="white"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                {hoverLine.timeLabel}
              </text>
            </g>
          )}
        </svg>

        {/* Dynamic Activity-Specific Legend */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '16px'
        }}>
          {/* Wind Legend - Always shown */}
          <div>
            <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>
              Wind Speed
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {[
                { color: '#22c55e', label: '<10km/h' },
                { color: '#eab308', label: '10-20' },
                { color: '#f97316', label: '20-30' },
                { color: '#ef4444', label: '>30km/h' }
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: item.color,
                    borderRadius: '2px'
                  }} />
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.75rem'
                  }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity-specific legends */}
          {selectedActivity === 'surf' && (
            <>
              {/* Wave Height Legend */}
              <div>
                <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>
                  Wave Height
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {[
                    { color: '#94a3b8', label: '<0.5m' },
                    { color: '#22c55e', label: '0.5-1m' },
                    { color: '#3b82f6', label: '1-2m' },
                    { color: '#f59e0b', label: '2-3m' },
                    { color: '#ef4444', label: '>3m' }
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: item.color,
                        borderRadius: '2px'
                      }} />
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.75rem'
                      }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tide Legend */}
              <div>
                <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>
                  Tide Phase
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {[
                    { color: '#3b82f6', label: 'High' },
                    { color: '#22c55e', label: 'Rising' },
                    { color: '#f59e0b', label: 'Low' },
                    { color: '#ef4444', label: 'Falling' }
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: item.color,
                        borderRadius: '2px'
                      }} />
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.75rem'
                      }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Water Temperature Legend */}
              <div>
                <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>
                  Water Temperature
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {[
                    { color: '#3b82f6', label: '<16°C' },
                    { color: '#06b6d4', label: '16-18°C' },
                    { color: '#10b981', label: '18-20°C' },
                    { color: '#f59e0b', label: '20-22°C' },
                    { color: '#ef4444', label: '>22°C' }
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: item.color,
                        borderRadius: '2px'
                      }} />
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.75rem'
                      }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedActivity === 'fish' && (
            <>
              {/* Tide Legend */}
              <div>
                <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>
                  Tide Phase
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {[
                    { color: '#3b82f6', label: 'High' },
                    { color: '#22c55e', label: 'Rising' },
                    { color: '#f59e0b', label: 'Low' },
                    { color: '#ef4444', label: 'Falling' }
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: item.color,
                        borderRadius: '2px'
                      }} />
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.75rem'
                      }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barometric Pressure Legend */}
              <div>
                <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>
                  Barometric Pressure
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {[
                    { color: '#ef4444', label: '<1005 hPa' },
                    { color: '#f59e0b', label: '1005-1015' },
                    { color: '#22c55e', label: '1015-1025' },
                    { color: '#3b82f6', label: '>1025 hPa' }
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: item.color,
                        borderRadius: '2px'
                      }} />
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.75rem'
                      }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Water Temperature Legend */}
              <div>
                <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>
                  Water Temperature
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {[
                    { color: '#3b82f6', label: '<16°C' },
                    { color: '#06b6d4', label: '16-18°C' },
                    { color: '#10b981', label: '18-20°C' },
                    { color: '#f59e0b', label: '20-22°C' },
                    { color: '#ef4444', label: '>22°C' }
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: item.color,
                        borderRadius: '2px'
                      }} />
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.75rem'
                      }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedActivity === 'sail' && (
            <>
              {/* Visibility Legend */}
              <div>
                <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>
                  Visibility
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {[
                    { color: '#ef4444', label: '<10km' },
                    { color: '#f59e0b', label: '10-15km' },
                    { color: '#eab308', label: '15-20km' },
                    { color: '#22c55e', label: '>20km' }
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: item.color,
                        borderRadius: '2px'
                      }} />
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.75rem'
                      }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Water Temperature Legend */}
              <div>
                <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>
                  Water Temperature
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {[
                    { color: '#3b82f6', label: '<16°C' },
                    { color: '#06b6d4', label: '16-18°C' },
                    { color: '#10b981', label: '18-20°C' },
                    { color: '#f59e0b', label: '20-22°C' },
                    { color: '#ef4444', label: '>22°C' }
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: item.color,
                        borderRadius: '2px'
                      }} />
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.75rem'
                      }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedActivity === 'hike' && (
            <>
              {/* Air Temperature Legend */}
              <div>
                <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>
                  Air Temperature
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {[
                    { color: '#3b82f6', label: '<16°C' },
                    { color: '#06b6d4', label: '16-18°C' },
                    { color: '#10b981', label: '18-20°C' },
                    { color: '#f59e0b', label: '20-22°C' },
                    { color: '#ef4444', label: '>22°C' }
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: item.color,
                        borderRadius: '2px'
                      }} />
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.75rem'
                      }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Humidity Legend */}
              <div>
                <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>
                  Humidity
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {[
                    { color: '#ef4444', label: '<40%' },
                    { color: '#22c55e', label: '40-60%' },
                    { color: '#eab308', label: '60-80%' },
                    { color: '#3b82f6', label: '>80%' }
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: item.color,
                        borderRadius: '2px'
                      }} />
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.75rem'
                      }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* UV Index Legend */}
              <div>
                <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>
                  UV Index
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {[
                    { color: '#22c55e', label: '0-2 Low' },
                    { color: '#eab308', label: '3-5 Mod' },
                    { color: '#f97316', label: '6-7 High' },
                    { color: '#ef4444', label: '8-10 VHigh' },
                    { color: '#7c3aed', label: '11+ Extreme' }
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: item.color,
                        borderRadius: '2px'
                      }} />
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.75rem'
                      }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dynamic Activity-Specific Tooltip */}
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '0.875rem',
            pointerEvents: 'none',
            zIndex: 1000,
            minWidth: '180px'
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>
            {tooltip.day} - {tooltip.hour.time}
          </div>

          {/* Wind - Always shown for all activities */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Navigation
              size={14}
              style={{
                transform: `rotate(${tooltip.hour.windDirection}deg)`,
                color: getWindColor(tooltip.hour.windSpeed)
              }}
            />
            <span>
              {weatherService.getWindDirectionText(tooltip.hour.windDirection)} - {tooltip.hour.windSpeed} km/h
            </span>
          </div>

          {/* Activity-specific data */}
          {selectedActivity === 'surf' && (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getOffshoreColor(tooltip.hour.offshoreStrength)
                }} />
                <span style={{
                  fontSize: '0.875rem',
                  color: tooltip.hour.isOffshore ? getOffshoreColor(tooltip.hour.offshoreStrength) : 'rgba(255, 255, 255, 0.7)'
                }}>
                  {tooltip.hour.isOffshore
                    ? `Offshore - ${tooltip.hour.offshoreStrength.charAt(0).toUpperCase() + tooltip.hour.offshoreStrength.slice(1)}`
                    : 'Onshore'
                  }
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                Wave: {tooltip.hour.waveHeight}m @ {tooltip.hour.wavePeriod}s
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                marginBottom: '4px'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: getTideColor(tooltip.hour.tidePhase)
                }} />
                <span style={{ color: getTideColor(tooltip.hour.tidePhase) }}>
                  Tide: {tooltip.hour.tideHeight}m ({tooltip.hour.tidePhase} - {tooltip.hour.tideDirection})
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                Air: {tooltip.hour.temperature}°C | Water: {tooltip.hour.waterTemperature}°C
              </div>
            </>
          )}

          {selectedActivity === 'fish' && (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                marginBottom: '4px'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: getTideColor(tooltip.hour.tidePhase)
                }} />
                <span style={{ color: getTideColor(tooltip.hour.tidePhase) }}>
                  Tide: {tooltip.hour.tideHeight}m ({tooltip.hour.tidePhase} - {tooltip.hour.tideDirection})
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                marginBottom: '4px'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: getBaroPressureColor(tooltip.hour.barometricPressure)
                }} />
                <span style={{ color: getBaroPressureColor(tooltip.hour.barometricPressure) }}>
                  Pressure: {tooltip.hour.barometricPressure} hPa
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                Water: {tooltip.hour.waterTemperature}°C
              </div>
            </>
          )}

          {selectedActivity === 'sail' && (
            <>
              <div style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                Wind Gusts: {tooltip.hour.windGust} km/h
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                marginBottom: '4px'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: getVisibilityColor(tooltip.hour.visibility)
                }} />
                <span style={{ color: getVisibilityColor(tooltip.hour.visibility) }}>
                  Visibility: {tooltip.hour.visibility} km
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                Water: {tooltip.hour.waterTemperature}°C
              </div>
            </>
          )}

          {selectedActivity === 'hike' && (
            <>
              <div style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                Temperature: {tooltip.hour.temperature}°C
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                marginBottom: '4px'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: getHumidityColor(tooltip.hour.humidity)
                }} />
                <span style={{ color: getHumidityColor(tooltip.hour.humidity) }}>
                  Humidity: {tooltip.hour.humidity}%
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                marginBottom: '4px'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: getUVIndexColor(tooltip.hour.uvIndex)
                }} />
                <span style={{ color: getUVIndexColor(tooltip.hour.uvIndex) }}>
                  UV Index: {tooltip.hour.uvIndex}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <span style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.875rem'
        }}>
          Hover over the timeline to see hourly details • Activity-specific data visualization
        </span>
      </div>
    </div>
  );
};

export default WindTimeline;