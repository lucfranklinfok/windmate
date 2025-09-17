import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wind, Eye, Droplets, Navigation, Waves, Fish, Sailboat, Mountain, MessageCircle } from 'lucide-react';
import WeatherCard from './components/WeatherCard';
import LocationSearch from './components/LocationSearch';
import WindForecast from './components/WindForecast';
import WindTimeline from './components/WindTimeline';
import FeedbackModal from './components/FeedbackModal';
import FeedbackAdmin from './components/FeedbackAdmin';
import { WeatherData, weatherService } from './services/weatherService';
import './App.css';

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<'surf' | 'fish' | 'sail' | 'hike'>('surf');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Auto-detect user location and find closest Australian city
  useEffect(() => {
    const loadWeatherWithGeolocation = async () => {
      setLoading(true);
      setError(null);

      // Australian cities with coordinates
      const australianCities = [
        { name: 'Sydney', fullName: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
        { name: 'Melbourne', fullName: 'Melbourne, Australia', lat: -37.8136, lng: 144.9631 },
        { name: 'Brisbane', fullName: 'Brisbane, Australia', lat: -27.4698, lng: 153.0251 },
        { name: 'Perth', fullName: 'Perth, Australia', lat: -31.9505, lng: 115.8605 },
        { name: 'Adelaide', fullName: 'Adelaide, Australia', lat: -34.9285, lng: 138.6007 },
        { name: 'Gold Coast', fullName: 'Gold Coast, Australia', lat: -28.0167, lng: 153.4000 },
        { name: 'Newcastle', fullName: 'Newcastle, Australia', lat: -32.9283, lng: 151.7817 },
        { name: 'Canberra', fullName: 'Canberra, Australia', lat: -35.2809, lng: 149.1300 },
        { name: 'Central Coast', fullName: 'Central Coast, Australia', lat: -33.4269, lng: 151.3317 },
        { name: 'Wollongong', fullName: 'Wollongong, Australia', lat: -34.4278, lng: 150.8931 },
        { name: 'Geelong', fullName: 'Geelong, Australia', lat: -38.1499, lng: 144.3617 },
        { name: 'Hobart', fullName: 'Hobart, Australia', lat: -42.8821, lng: 147.3272 },
      ];

      // Function to calculate distance using Haversine formula
      const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      const findClosestCity = (userLat: number, userLng: number) => {
        let closestCity = australianCities[0]; // Default to Sydney
        let minDistance = calculateDistance(userLat, userLng, closestCity.lat, closestCity.lng);

        australianCities.forEach(city => {
          const distance = calculateDistance(userLat, userLng, city.lat, city.lng);
          if (distance < minDistance) {
            minDistance = distance;
            closestCity = city;
          }
        });

        return closestCity;
      };

      // Try geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const closestCity = findClosestCity(latitude, longitude);
              console.log(`🌍 User location: ${latitude}, ${longitude}`);
              console.log(`📍 Closest city: ${closestCity.name}`);

              const data = await weatherService.getCurrentWeather(closestCity.fullName);
              setWeatherData(data);
            } catch (err) {
              console.error('Error loading weather for detected location:', err);
              // Fallback to Sydney
              const data = await weatherService.getCurrentWeather('Sydney, Australia');
              setWeatherData(data);
            } finally {
              setLoading(false);
            }
          },
          async (error) => {
            console.log('❌ Geolocation denied or failed:', error.message);
            try {
              // Fallback to Sydney
              const data = await weatherService.getCurrentWeather('Sydney, Australia');
              setWeatherData(data);
            } catch (err) {
              console.error('Error loading fallback weather:', err);
              setError('Failed to load weather data');
            } finally {
              setLoading(false);
            }
          },
          { timeout: 10000, enableHighAccuracy: false }
        );
      } else {
        // No geolocation support, fallback to Sydney
        try {
          const data = await weatherService.getCurrentWeather('Sydney, Australia');
          setWeatherData(data);
        } catch (err) {
          console.error('Error loading fallback weather:', err);
          setError('Failed to load weather data');
        } finally {
          setLoading(false);
        }
      }
    };

    loadWeatherWithGeolocation();
  }, []);

  // URL-based admin panel access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isDev = process.env.NODE_ENV === 'development';
    const hasAdminParam = urlParams.get('admin') === 'true';
    const adminKey = urlParams.get('key');
    const envAdminKey = process.env.REACT_APP_ADMIN_KEY;

    // Allow admin access in development with ?admin=true
    // Or in any environment with correct admin key
    if ((isDev && hasAdminParam) || (adminKey && adminKey === envAdminKey)) {
      setIsAdminPanelOpen(true);

      // Clear URL parameters for security (optional)
      if (adminKey) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('key');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, []);

  const handleLocationChange = useCallback(async (location: string) => {
    console.log('🔥 Location search triggered:', location);
    setLoading(true);
    setError(null);

    try {
      // Handle special postcode case for Perth
      const searchLocation = location.includes('6000') ? 'Perth, Australia' : location;
      const data = await weatherService.getCurrentWeather(searchLocation);
      setWeatherData(data);
      console.log('🔥 Real weather data loaded:', data);
    } catch (err) {
      console.error('Error fetching weather data:', err);

      if (err instanceof Error && err.message === 'Location not found') {
        setError(`Location "${location}" not found. Please try a different search.`);
      } else {
        setError('Failed to fetch weather data. Please try again.');
      }

      // Don't update weather data if there's an error
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="loading-spinner"
        />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">WeatherPro</h1>
          <p className="app-subtitle">
            Your personalized weather companion for outdoor adventures
          </p>
        </header>

        <div className="main-grid">
          <div className="main-content">
            <LocationSearch onLocationSelect={handleLocationChange} />

            {error && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                color: '#ef4444',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {weatherData && (
              <div style={{ marginTop: '24px' }}>
                <WeatherCard data={weatherData} />
                <WindForecast forecast={weatherData.forecast} />

                {/* Activity Selector - Moved here for better UX */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '20px',
                    padding: '20px',
                    marginTop: '24px',
                    marginBottom: '8px',
                    position: 'sticky',
                    top: '20px',
                    zIndex: 100
                  }}
                >
                  <h3 style={{
                    color: 'white',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    margin: '0 0 16px 0',
                    textAlign: 'center'
                  }}>
                    🎯 Select Activity for Detailed Analysis
                  </h3>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    {['surf', 'fish', 'sail', 'hike'].map((activity, index) => (
                      <motion.button
                        key={activity}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedActivity(activity as any);
                          // Smooth scroll to WindTimeline after selection
                          setTimeout(() => {
                            const element = document.getElementById('wind-timeline');
                            if (element) {
                              element.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                                inline: 'nearest'
                              });
                            }
                          }, 100);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          background: selectedActivity === activity
                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.8))'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
                          border: selectedActivity === activity
                            ? '2px solid rgba(59, 130, 246, 0.9)'
                            : '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '12px',
                          padding: '12px 20px',
                          color: selectedActivity === activity ? '#ffffff' : '#1f2937',
                          fontSize: '14px',
                          fontWeight: selectedActivity === activity ? '700' : '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          minWidth: '100px',
                          backdropFilter: 'blur(10px)',
                          boxShadow: selectedActivity === activity
                            ? '0 4px 20px rgba(59, 130, 246, 0.3)'
                            : '0 2px 10px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {activity === 'surf' && <Waves size={18} />}
                        {activity === 'fish' && <Fish size={18} />}
                        {activity === 'sail' && <Sailboat size={18} />}
                        {activity === 'hike' && <Mountain size={18} />}
                        <span>{activity.charAt(0).toUpperCase() + activity.slice(1)}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <div id="wind-timeline">
                  <WindTimeline weeklyWindData={weatherData.weeklyWindData} selectedActivity={selectedActivity} />
                </div>
              </div>
            )}
          </div>

          <div className="sidebar">

            {weatherData && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="glass-morphism card"
              >
                <h3 className="section-title">Current Conditions</h3>
                <div className="conditions-list">
                  <div className="condition-item">
                    <div className="condition-info">
                      <Wind className="condition-icon" size={20} />
                      <span className="condition-label">Wind</span>
                    </div>
                    <span className="condition-value">{weatherData.windSpeed} km/h</span>
                  </div>

                  <div className="condition-item">
                    <div className="condition-info">
                      <Droplets className="condition-icon" size={20} />
                      <span className="condition-label">Humidity</span>
                    </div>
                    <span className="condition-value">{weatherData.humidity}%</span>
                  </div>

                  <div className="condition-item">
                    <div className="condition-info">
                      <Eye className="condition-icon" size={20} />
                      <span className="condition-label">Visibility</span>
                    </div>
                    <span className="condition-value">{weatherData.visibility} km</span>
                  </div>

                  <div className="condition-item">
                    <div className="condition-info">
                      <Navigation className="condition-icon" size={20} />
                      <span className="condition-label">Pressure</span>
                    </div>
                    <span className="condition-value">{weatherData.pressure} hPa</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

      </div>

      {/* Floating Feedback Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsFeedbackModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <MessageCircle size={24} color="white" />
      </motion.button>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

      {/* Admin Panel */}
      <FeedbackAdmin
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />
    </div>
  );
}

export default App;