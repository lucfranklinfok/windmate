import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface LocationSearchProps {
  onLocationSelect: (location: string) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const majorAustralianCities = [
    { name: 'Sydney', state: 'NSW', population: '5.3M', emoji: '🏙️', fullName: 'Sydney, Australia' },
    { name: 'Melbourne', state: 'VIC', population: '5.2M', emoji: '☕', fullName: 'Melbourne, Australia' },
    { name: 'Brisbane', state: 'QLD', population: '2.6M', emoji: '🌞', fullName: 'Brisbane, Australia' },
    { name: 'Perth', state: 'WA', population: '2.1M', emoji: '🏖️', fullName: 'Perth, Australia' },
  ];


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔥 LocationSearch form submitted with:', searchQuery);
    if (searchQuery.trim()) {
      console.log('🔥 Calling onLocationSelect with:', searchQuery.trim());
      onLocationSelect(searchQuery.trim());
      setIsExpanded(false);
    }
  };

  const handleLocationSelect = (location: string) => {
    setSearchQuery(location);
    onLocationSelect(location);
    setIsExpanded(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-morphism card search-container"
    >
      <form onSubmit={handleSearch} className="relative" style={{ width: '100%' }}>
          <div className="search-input-wrapper" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Search className="search-icon" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              onBlur={() => setTimeout(() => setIsExpanded(false), 200)}
              placeholder="Search for any location worldwide..."
              className="search-input"
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Search
            </button>
          </div>

          <motion.div
            initial={false}
            animate={{
              opacity: isExpanded ? 1 : 0,
              height: isExpanded ? 'auto' : 0,
              paddingTop: isExpanded ? 16 : 0,
            }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <h4 style={{
                color: '#333',
                fontSize: '14px',
                fontWeight: '600',
                margin: '0 0 12px 0'
              }}>
                💡 Quick suggestions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {majorAustralianCities.map((city, index) => (
                  <motion.button
                    key={city.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleLocationSelect(city.fullName)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{city.emoji}</span>
                    <div>
                      <p style={{
                        color: '#333',
                        fontSize: '14px',
                        fontWeight: '500',
                        margin: '0 0 2px 0'
                      }}>
                        {city.name}
                      </p>
                      <p style={{
                        color: '#666',
                        fontSize: '12px',
                        margin: '0'
                      }}>
                        {city.state}, Australia
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </form>
    </motion.div>
  );
};

export default LocationSearch;