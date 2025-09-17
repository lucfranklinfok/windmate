import React from 'react';
import { motion } from 'framer-motion';
import { Waves, Fish, Sailboat, Mountain, Star, CheckCircle } from 'lucide-react';
import DayVisualization from './DayVisualization';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
  }>;
}

interface ActivityDashboardProps {
  activity: 'surf' | 'fish' | 'sail' | 'hike';
  weatherData: WeatherData;
}

const ActivityDashboard: React.FC<ActivityDashboardProps> = ({ activity, weatherData }) => {
  const getActivityIcon = () => {
    switch (activity) {
      case 'surf': return <Waves className="w-8 h-8 text-blue-400" />;
      case 'fish': return <Fish className="w-8 h-8 text-green-400" />;
      case 'sail': return <Sailboat className="w-8 h-8 text-cyan-400" />;
      case 'hike': return <Mountain className="w-8 h-8 text-orange-400" />;
    }
  };

  const getActivityTitle = () => {
    switch (activity) {
      case 'surf': return 'Surfing Conditions';
      case 'fish': return 'Fishing Forecast';
      case 'sail': return 'Sailing Weather';
      case 'hike': return 'Hiking Conditions';
    }
  };

  const getActivityMetrics = () => {
    switch (activity) {
      case 'surf':
        return [
          {
            label: 'Wave Height',
            value: '2-3m',
            status: 'good',
            icon: <Waves className="w-5 h-5" />
          },
          {
            label: 'Wind Direction',
            value: 'Offshore',
            status: 'excellent',
            icon: <CheckCircle className="w-5 h-5" />
          },
          {
            label: 'Tide',
            value: 'High at 2:30pm',
            status: 'good',
            icon: <Star className="w-5 h-5" />
          },
          {
            label: 'Water Temp',
            value: '22°C',
            status: 'good',
            icon: <CheckCircle className="w-5 h-5" />
          }
        ];
      case 'fish':
        return [
          {
            label: 'Best Time',
            value: '6-9am, 5-7pm',
            status: 'excellent',
            icon: <CheckCircle className="w-5 h-5" />
          },
          {
            label: 'Barometric Pressure',
            value: 'Rising',
            status: 'good',
            icon: <Star className="w-5 h-5" />
          },
          {
            label: 'Moon Phase',
            value: 'New Moon',
            status: 'excellent',
            icon: <CheckCircle className="w-5 h-5" />
          },
          {
            label: 'Water Clarity',
            value: 'Clear',
            status: 'good',
            icon: <Star className="w-5 h-5" />
          }
        ];
      case 'sail':
        return [
          {
            label: 'Wind Speed',
            value: `${weatherData.windSpeed} km/h`,
            status: weatherData.windSpeed > 10 && weatherData.windSpeed < 25 ? 'excellent' : 'moderate',
            icon: <CheckCircle className="w-5 h-5" />
          },
          {
            label: 'Wind Consistency',
            value: 'Steady',
            status: 'good',
            icon: <Star className="w-5 h-5" />
          },
          {
            label: 'Wave Conditions',
            value: '1-2m',
            status: 'good',
            icon: <Waves className="w-5 h-5" />
          },
          {
            label: 'Visibility',
            value: `${weatherData.visibility} km`,
            status: weatherData.visibility > 8 ? 'excellent' : 'moderate',
            icon: <CheckCircle className="w-5 h-5" />
          }
        ];
      case 'hike':
        return [
          {
            label: 'Temperature',
            value: `${weatherData.temperature}°C`,
            status: weatherData.temperature > 15 && weatherData.temperature < 30 ? 'excellent' : 'moderate',
            icon: <CheckCircle className="w-5 h-5" />
          },
          {
            label: 'Rain Chance',
            value: '10%',
            status: 'excellent',
            icon: <CheckCircle className="w-5 h-5" />
          },
          {
            label: 'UV Index',
            value: 'Moderate',
            status: 'good',
            icon: <Star className="w-5 h-5" />
          },
          {
            label: 'Trail Conditions',
            value: 'Dry',
            status: 'excellent',
            icon: <CheckCircle className="w-5 h-5" />
          }
        ];
    }
  };


  const getOverallRating = () => {
    const metrics = getActivityMetrics();
    const excellentCount = metrics.filter(m => m.status === 'excellent').length;
    const goodCount = metrics.filter(m => m.status === 'good').length;

    if (excellentCount >= 3) return { rating: 'Excellent', color: 'text-green-400', score: 9 };
    if (excellentCount >= 2 || goodCount >= 3) return { rating: 'Good', color: 'text-yellow-400', score: 7 };
    if (goodCount >= 2) return { rating: 'Moderate', color: 'text-orange-400', score: 5 };
    return { rating: 'Poor', color: 'text-red-400', score: 3 };
  };

  const metrics = getActivityMetrics();
  const overall = getOverallRating();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-morphism card"
      style={{ padding: '40px' }}
    >
      <div className="activity-header">
        <div className="activity-info">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="activity-icon-wrapper"
          >
            {getActivityIcon()}
          </motion.div>
          <div>
            <h2 className="activity-title">{getActivityTitle()}</h2>
            <p className="activity-subtitle">Personalized forecast for your activity</p>
          </div>
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="activity-rating"
        >
          <div className="activity-rating-header">
            <div className={`rating-indicator ${
              overall.rating === 'Excellent' ? 'rating-excellent' :
              overall.rating === 'Good' ? 'rating-good' :
              overall.rating === 'Moderate' ? 'rating-moderate' : 'rating-poor'
            }`} />
            <span className={`rating-text ${overall.rating.toLowerCase()}`}>{overall.rating}</span>
          </div>
          <div className="rating-bars">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, delay: 0.4 + i * 0.05 }}
                className={`rating-bar ${
                  i < overall.score ? 'active' : ''
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            whileHover={{ scale: 1.02, y: -5 }}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div style={{
                background: metric.status === 'excellent'
                  ? 'rgba(34, 197, 94, 0.2)'
                  : metric.status === 'good'
                  ? 'rgba(251, 191, 36, 0.2)'
                  : 'rgba(156, 163, 175, 0.2)',
                padding: '12px',
                borderRadius: '12px',
                color: metric.status === 'excellent'
                  ? '#22c55e'
                  : metric.status === 'good'
                  ? '#fbbf24'
                  : '#9ca3af'
              }}>
                {metric.icon}
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: metric.status === 'excellent'
                    ? '#22c55e'
                    : metric.status === 'good'
                    ? '#fbbf24'
                    : '#9ca3af'
                }}
              />
            </div>
            <h3 style={{
              color: '#1f2937',
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 8px 0'
            }}>
              {metric.label || 'Loading...'}
            </h3>
            <p style={{
              color: '#374151',
              fontSize: '18px',
              fontWeight: '700',
              margin: '0'
            }}>
              {metric.value || 'N/A'}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}
      >
        <div style={{
          background: 'rgba(251, 191, 36, 0.2)',
          padding: '12px',
          borderRadius: '12px',
          color: '#fbbf24'
        }}>
          <Star size={24} />
        </div>
        <div>
          <h4 style={{
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 0 8px 0'
          }}>
            Pro Tip
          </h4>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px',
            margin: '0',
            lineHeight: '1.5'
          }}>
            {activity === 'surf' && "Best surfing conditions are typically 2-3 hours before and after high tide with offshore winds."}
            {activity === 'fish' && "Fish are most active during dawn and dusk when barometric pressure is stable or rising."}
            {activity === 'sail' && "Ideal sailing conditions are steady winds between 10-20 km/h with good visibility."}
            {activity === 'hike' && "Start early to avoid afternoon heat and always check weather updates before heading out."}
          </p>
        </div>
      </motion.div>

      {/* Day Visualization */}
      <DayVisualization activity={activity} />
    </motion.div>
  );
};

export default ActivityDashboard;