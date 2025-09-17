# WindMate - Australian Wind & Weather Companion

🌊 Your trusted wind companion for Australian outdoor adventures

## Overview

WindMate is a React-based weather application specifically designed for Australian outdoor enthusiasts. Whether you're surfing, fishing, sailing, or hiking, WindMate provides detailed wind analysis and forecasting to help you plan your adventures.

## Features

### 🎯 Activity-Specific Analysis
- **Surf Forecasting** - Optimal wind conditions for surfing
- **Fishing Conditions** - Wind patterns for better fishing spots
- **Sailing Weather** - Comprehensive wind data for sailors
- **Hiking Conditions** - Weather safety for outdoor hiking

### 🌍 Smart Location Detection
- Automatic geolocation to find your nearest Australian city
- Manual location search across Australia
- Supports major cities and regional areas

### 📊 Comprehensive Weather Data
- Real-time wind speed and direction
- 7-day wind forecast with detailed timeline
- Activity-specific recommendations
- Visual wind strength indicators

### 💬 User Feedback System
- Built-in feedback collection
- Admin panel for feedback management
- Export functionality for data analysis

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Styling**: CSS with Glassmorphism design
- **Weather API**: OpenWeatherMap
- **Deployment**: AWS Amplify ready

## Getting Started

### Prerequisites
- Node.js 16+
- OpenWeatherMap API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/windmate.git
cd windmate
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Add your OpenWeatherMap API key to `.env`:
```bash
REACT_APP_OPENWEATHER_API_KEY=your_api_key_here
```

5. Start development server:
```bash
npm start
```

Visit `http://localhost:3000` to see the application.

## Environment Variables

### Development (.env)
```bash
REACT_APP_OPENWEATHER_API_KEY=your_development_api_key
REACT_APP_ADMIN_KEY=dev_admin_123
```

### Production
```bash
REACT_APP_OPENWEATHER_API_KEY=your_production_api_key
REACT_APP_ADMIN_KEY=secure_production_key_here
```

## Admin Panel

Access the admin panel to manage user feedback:

- **Development**: `http://localhost:3000?admin=true`
- **Production**: `https://yourapp.com?key=your_admin_key`

## Deployment

WindMate is configured for AWS Amplify deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy to AWS Amplify

1. Push code to GitHub
2. Connect repository to AWS Amplify
3. Set environment variables
4. Deploy!

## Project Structure

```
src/
├── components/
│   ├── WeatherCard.tsx      # Main weather display
│   ├── LocationSearch.tsx   # Location search component
│   ├── WindForecast.tsx     # Wind forecast grid
│   ├── WindTimeline.tsx     # Activity-specific timeline
│   ├── FeedbackModal.tsx    # User feedback form
│   └── FeedbackAdmin.tsx    # Admin feedback panel
├── services/
│   └── weatherService.ts    # Weather API integration
├── App.tsx                  # Main application component
└── App.css                  # Styling and animations
```

## Features in Detail

### Activity-Specific Analysis
WindMate provides tailored wind analysis for different outdoor activities:

- **Surf**: Offshore/onshore wind analysis with wave-friendly conditions
- **Fish**: Calm conditions and wind patterns for better fishing
- **Sail**: Optimal wind speeds and direction for sailing
- **Hike**: Safety-focused weather conditions for hiking

### Smart Geolocation
The app automatically detects your location and finds the closest Australian city from a curated list of major locations, ensuring accurate local weather data.

### Visual Design
Built with a modern glassmorphism design featuring:
- Backdrop blur effects
- Gradient overlays
- Smooth animations
- Responsive layout

## API Reference

WindMate uses OpenWeatherMap API for weather data. Get your free API key at [openweathermap.org](https://openweathermap.org/api).

## Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the deployment documentation
- Review the admin setup guide

## Roadmap

- [ ] Mobile app version
- [ ] Advanced weather alerts
- [ ] Social sharing features
- [ ] Multiple location bookmarks
- [ ] Weather history tracking

---

Built with ❤️ for Australian outdoor enthusiasts