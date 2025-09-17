interface OpenWeatherResponse {
  name: string;
  sys: {
    country: string;
  };
  coord: {
    lat: number;
    lon: number;
  };
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
}

interface OpenWeatherForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp_max: number;
      temp_min: number;
    };
    weather: Array<{
      main: string;
      description: string;
    }>;
    wind: {
      speed: number;
      deg: number;
    };
  }>;
}

interface HourlyWindData {
  time: string;
  hour: number;
  windSpeed: number;
  windDirection: number;
  windGust: number;
  temperature: number;
  humidity: number;
  barometricPressure: number;
  uvIndex: number;
  visibility: number;
  isOffshore: boolean;
  offshoreStrength: 'perfect' | 'good' | 'marginal' | 'poor';
  waveHeight: number;
  wavePeriod: number;
  surfConditions: 'excellent' | 'good' | 'fair' | 'poor';
  tideHeight: number;
  tideDirection: 'rising' | 'falling' | 'turning';
  tidePhase: 'low' | 'rising' | 'high' | 'falling';
  waterTemperature: number;
}

interface DailyWindData {
  date: string;
  day: string;
  hourlyData: HourlyWindData[];
}

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
  weeklyWindData: DailyWindData[];
}

class WeatherService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY || 'demo_key';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getCurrentWeather(location: string): Promise<WeatherData> {
    try {
      // Get current weather
      const currentResponse = await fetch(
        `${this.baseUrl}/weather?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric`
      );

      if (!currentResponse.ok) {
        if (currentResponse.status === 404) {
          throw new Error('Location not found');
        }
        throw new Error(`Weather API error: ${currentResponse.status}`);
      }

      const currentData: OpenWeatherResponse = await currentResponse.json();

      // Get forecast data
      const forecastResponse = await fetch(
        `${this.baseUrl}/forecast?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric`
      );

      let forecastData: OpenWeatherForecastResponse | null = null;
      if (forecastResponse.ok) {
        forecastData = await forecastResponse.json();
      }

      return this.transformOpenWeatherData(currentData, forecastData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      if (error instanceof Error && error.message === 'Location not found') {
        throw error; // Re-throw to handle in UI
      }
      return this.getMockWeatherData(location);
    }
  }

  async searchLocations(query: string): Promise<Array<{ name: string; country: string; lat: number; lon: number }>> {
    try {
      // OpenWeatherMap doesn't have a dedicated search endpoint, but we can use geocoding
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Location search error: ${response.status}`);
      }

      const data = await response.json();
      return data.map((location: any) => ({
        name: `${location.name}${location.state ? ', ' + location.state : ''}`,
        country: location.country,
        lat: location.lat,
        lon: location.lon,
      }));
    } catch (error) {
      console.error('Error searching locations:', error);
      return this.getMockLocations();
    }
  }

  private transformOpenWeatherData(current: OpenWeatherResponse, forecast: OpenWeatherForecastResponse | null): WeatherData {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Process forecast data
    let forecastArray: Array<{ day: string; high: number; low: number; condition: string; windSpeed: number; windDirection: number; }> = [];

    if (forecast) {
      // Group forecast data by day
      const dailyData: { [key: string]: { highs: number[], lows: number[], conditions: string[], windSpeeds: number[], windDirections: number[] } } = {};

      forecast.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();

        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { highs: [], lows: [], conditions: [], windSpeeds: [], windDirections: [] };
        }

        dailyData[dateKey].highs.push(item.main.temp_max);
        dailyData[dateKey].lows.push(item.main.temp_min);
        dailyData[dateKey].conditions.push(item.weather[0].description);
        dailyData[dateKey].windSpeeds.push(item.wind?.speed || 0);
        dailyData[dateKey].windDirections.push(item.wind?.deg || 0);
      });

      // Convert to forecast format
      forecastArray = Object.entries(dailyData).slice(0, 5).map(([dateStr, data], index) => {
        const date = new Date(dateStr);
        const dayName = index === 0 ? 'Today' :
                       index === 1 ? 'Tomorrow' :
                       daysOfWeek[date.getDay()];

        // Calculate average wind speed and direction for the day
        const avgWindSpeed = data.windSpeeds.length > 0 ?
          Math.round((data.windSpeeds.reduce((a, b) => a + b, 0) / data.windSpeeds.length) * 3.6) : 0;
        const avgWindDirection = data.windDirections.length > 0 ?
          Math.round(data.windDirections.reduce((a, b) => a + b, 0) / data.windDirections.length) : 0;

        return {
          day: dayName,
          high: Math.round(Math.max(...data.highs)),
          low: Math.round(Math.min(...data.lows)),
          condition: this.capitalizeWords(data.conditions[0]),
          windSpeed: avgWindSpeed,
          windDirection: avgWindDirection,
        };
      });
    } else {
      // Fallback forecast if API call failed
      forecastArray = [
        { day: 'Today', high: Math.round(current.main.temp), low: Math.round(current.main.temp - 5), condition: this.capitalizeWords(current.weather[0].description), windSpeed: Math.round(current.wind.speed * 3.6), windDirection: current.wind.deg || 0 },
        { day: 'Tomorrow', high: Math.round(current.main.temp + 2), low: Math.round(current.main.temp - 3), condition: 'Partly Cloudy', windSpeed: 18, windDirection: 240 },
        { day: 'Wednesday', high: Math.round(current.main.temp + 1), low: Math.round(current.main.temp - 4), condition: 'Sunny', windSpeed: 12, windDirection: 200 },
        { day: 'Thursday', high: Math.round(current.main.temp - 1), low: Math.round(current.main.temp - 6), condition: 'Cloudy', windSpeed: 22, windDirection: 270 },
        { day: 'Friday', high: Math.round(current.main.temp + 3), low: Math.round(current.main.temp - 2), condition: 'Sunny', windSpeed: 15, windDirection: 225 },
      ];
    }

    return {
      location: `${current.name}, ${current.sys.country}`,
      temperature: Math.round(current.main.temp),
      condition: this.capitalizeWords(current.weather[0].description),
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind.speed * 3.6), // Convert m/s to km/h
      windDirection: current.wind.deg || 0,
      visibility: current.visibility ? Math.round(current.visibility / 1000) : 10, // Convert m to km
      pressure: Math.round(current.main.pressure),
      forecast: forecastArray,
      weeklyWindData: this.generateHourlyWindData(),
    };
  }

  private capitalizeWords(str: string): string {
    return str.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  getWindDirectionText(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  // Determine if wind direction is offshore for coastal locations
  isOffshoreWind(windDirection: number, location: string = ''): boolean {
    // For most Australian east coast locations (Bondi, Gold Coast, etc.)
    // Offshore winds are typically from the west (225° to 315°)
    // This can be customized based on specific beach orientation

    if (location.toLowerCase().includes('perth') || location.toLowerCase().includes('western australia')) {
      // Perth faces west, so offshore is from the east (45° to 135°)
      return windDirection >= 45 && windDirection <= 135;
    }

    // Default to east coast (offshore from west)
    return windDirection >= 225 && windDirection <= 315;
  }

  getOffshoreStrength(windDirection: number, windSpeed: number, location: string = ''): 'perfect' | 'good' | 'marginal' | 'poor' {
    if (!this.isOffshoreWind(windDirection, location)) {
      return 'poor';
    }

    // Perfect offshore conditions
    if (windSpeed >= 8 && windSpeed <= 15) {
      return 'perfect';
    }
    // Good offshore conditions
    else if (windSpeed >= 5 && windSpeed <= 20) {
      return 'good';
    }
    // Marginal (too light or too strong)
    else if (windSpeed >= 3 && windSpeed <= 25) {
      return 'marginal';
    }
    // Poor conditions
    else {
      return 'poor';
    }
  }

  getWaveQuality(waveHeight: number, wavePeriod: number): 'excellent' | 'good' | 'fair' | 'poor' {
    // Wave quality based on height and period
    if (waveHeight >= 1.5 && waveHeight <= 3 && wavePeriod >= 10) {
      return 'excellent';
    } else if (waveHeight >= 1 && waveHeight <= 4 && wavePeriod >= 8) {
      return 'good';
    } else if (waveHeight >= 0.5 && waveHeight <= 2.5 && wavePeriod >= 6) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  getSurfConditions(
    waveHeight: number,
    wavePeriod: number,
    windDirection: number,
    windSpeed: number,
    location: string = ''
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    const waveQuality = this.getWaveQuality(waveHeight, wavePeriod);
    const windQuality = this.getOffshoreStrength(windDirection, windSpeed, location);

    // Combined scoring
    if (waveQuality === 'excellent' && (windQuality === 'perfect' || windQuality === 'good')) {
      return 'excellent';
    } else if (waveQuality === 'good' && windQuality !== 'poor') {
      return 'good';
    } else if (waveQuality === 'fair' || (waveQuality === 'good' && windQuality === 'poor')) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  getTidePhase(tideHeight: number, maxTideHeight: number, minTideHeight: number): 'low' | 'rising' | 'high' | 'falling' {
    const range = maxTideHeight - minTideHeight;
    const relative = (tideHeight - minTideHeight) / range;

    if (relative < 0.2) return 'low';
    else if (relative < 0.5) return 'rising';
    else if (relative < 0.8) return 'high';
    else return 'falling';
  }

  getTideDirection(currentHeight: number, previousHeight: number): 'rising' | 'falling' | 'turning' {
    const difference = currentHeight - previousHeight;
    if (Math.abs(difference) < 0.05) return 'turning'; // Slack water
    return difference > 0 ? 'rising' : 'falling';
  }

  // Activity-specific condition algorithms
  getFishingConditions(
    barometricPressure: number,
    tideDirection: 'rising' | 'falling' | 'turning',
    windSpeed: number,
    waterTemperature: number
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    let score = 0;

    // Barometric pressure is crucial for fishing
    if (barometricPressure >= 1010 && barometricPressure <= 1020) score += 3; // Stable pressure
    else if (barometricPressure >= 1005 && barometricPressure <= 1025) score += 2;
    else if (barometricPressure >= 1000 && barometricPressure <= 1030) score += 1;

    // Tide movement is important for fish activity
    if (tideDirection === 'rising' || tideDirection === 'falling') score += 2; // Moving tides
    else score += 1; // Slack tide

    // Wind affects boat handling and casting
    if (windSpeed <= 15) score += 2; // Calm conditions
    else if (windSpeed <= 25) score += 1;

    // Water temperature affects fish activity
    if (waterTemperature >= 16 && waterTemperature <= 22) score += 2; // Optimal temp range
    else if (waterTemperature >= 14 && waterTemperature <= 24) score += 1;

    if (score >= 7) return 'excellent';
    if (score >= 5) return 'good';
    if (score >= 3) return 'fair';
    return 'poor';
  }

  getSailingConditions(
    windSpeed: number,
    windGust: number,
    visibility: number
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    let score = 0;

    // Wind speed is the most important factor for sailing
    if (windSpeed >= 10 && windSpeed <= 20) score += 3; // Perfect sailing winds
    else if (windSpeed >= 8 && windSpeed <= 25) score += 2; // Good sailing winds
    else if (windSpeed >= 5 && windSpeed <= 30) score += 1; // Manageable winds

    // Wind gust differential (lower is better for stability)
    const gustDiff = windGust - windSpeed;
    if (gustDiff <= 5) score += 2; // Steady winds
    else if (gustDiff <= 10) score += 1; // Moderate gusts

    // Visibility is important for navigation
    if (visibility >= 15) score += 2; // Excellent visibility
    else if (visibility >= 10) score += 1; // Good visibility

    if (score >= 6) return 'excellent';
    if (score >= 4) return 'good';
    if (score >= 2) return 'fair';
    return 'poor';
  }

  getHikingConditions(
    temperature: number,
    humidity: number,
    uvIndex: number,
    windSpeed: number
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    let score = 0;

    // Temperature comfort range
    if (temperature >= 15 && temperature <= 25) score += 3; // Perfect hiking temp
    else if (temperature >= 10 && temperature <= 30) score += 2; // Good hiking temp
    else if (temperature >= 5 && temperature <= 35) score += 1; // Manageable temp

    // Humidity affects comfort
    if (humidity <= 60) score += 2; // Low humidity
    else if (humidity <= 75) score += 1; // Moderate humidity

    // UV Index (lower is better for hiking)
    if (uvIndex <= 3) score += 2; // Low UV
    else if (uvIndex <= 6) score += 1; // Moderate UV

    // Wind (light wind is preferred)
    if (windSpeed <= 10) score += 1; // Light wind

    if (score >= 7) return 'excellent';
    if (score >= 5) return 'good';
    if (score >= 3) return 'fair';
    return 'poor';
  }

  getActivityConditions(activity: 'surf' | 'fish' | 'sail' | 'hike', hourData: HourlyWindData): 'excellent' | 'good' | 'fair' | 'poor' {
    switch (activity) {
      case 'surf':
        return this.getSurfConditions(
          hourData.waveHeight,
          hourData.wavePeriod,
          hourData.windDirection,
          hourData.windSpeed,
          'Bondi Beach, Sydney'
        );

      case 'fish':
        return this.getFishingConditions(
          hourData.barometricPressure,
          hourData.tideDirection,
          hourData.windSpeed,
          hourData.waterTemperature
        );

      case 'sail':
        return this.getSailingConditions(
          hourData.windSpeed,
          hourData.windGust,
          hourData.visibility
        );

      case 'hike':
        return this.getHikingConditions(
          hourData.temperature,
          hourData.humidity,
          hourData.uvIndex,
          hourData.windSpeed
        );

      default:
        return 'fair';
    }
  }

  private generateHourlyWindData(): DailyWindData[] {
    const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const baseDirections = [225, 240, 270, 200, 180, 195, 210]; // SW, SW, W, SSW, S, SSW, SW
    const baseSpeeds = [15, 18, 25, 12, 20, 16, 14];
    const baseWaveHeights = [1.2, 2.1, 1.8, 0.9, 2.5, 1.5, 1.3]; // Base wave heights for each day
    const basePeriods = [8, 10, 9, 6, 12, 8, 7]; // Base wave periods
    const baseTideOffsets = [0, 0.8, 1.6, 2.4, 3.2, 4.0, 4.8]; // Different tide timing for each day (in hours)

    return days.map((day, dayIndex) => {
      const date = new Date();
      date.setDate(date.getDate() + dayIndex);

      const hourlyData: HourlyWindData[] = [];
      const baseDirection = baseDirections[dayIndex];
      const baseSpeed = baseSpeeds[dayIndex];
      const baseWaveHeight = baseWaveHeights[dayIndex];
      const basePeriod = basePeriods[dayIndex];
      const tideOffset = baseTideOffsets[dayIndex];

      // Tide parameters
      const maxTideHeight = 1.8; // Maximum tide height in meters
      const minTideHeight = 0.2; // Minimum tide height in meters
      const tideRange = maxTideHeight - minTideHeight;

      // Generate 24 hours of data
      for (let hour = 0; hour < 24; hour++) {
        // Simulate realistic wind direction and speed variations
        // Morning offshore pattern for surfing (common in many coastal areas)
        const morningOffshoreBonus = hour >= 5 && hour <= 9 ? -20 : 0; // More offshore in morning
        const directionVariation = Math.sin((hour / 24) * Math.PI * 2) * 30 + Math.sin((hour / 12) * Math.PI * 4) * 15 + morningOffshoreBonus;
        const speedVariation = Math.sin((hour / 24) * Math.PI * 2 + Math.PI) * 8 + Math.random() * 6 - 3;

        // Simulate wave height and period variations (waves change more slowly than wind)
        const waveVariation = Math.sin((hour / 24) * Math.PI * 2 + Math.PI / 4) * 0.4 + Math.sin((hour / 8) * Math.PI * 2) * 0.2;
        const periodVariation = Math.sin((hour / 24) * Math.PI * 2) * 2 + Math.random() * 1 - 0.5;

        // Generate realistic tide data (semi-diurnal tides - 2 highs and 2 lows per day)
        // Primary tidal component (12.4 hour cycle)
        const primaryTide = Math.sin(((hour + tideOffset) / 12.42) * Math.PI * 2);
        // Secondary tidal component (lunar day variation)
        const secondaryTide = Math.sin(((hour + tideOffset) / 24.84) * Math.PI * 2) * 0.3;
        // Minor harmonic variations
        const harmonicVariation = Math.sin(((hour + tideOffset) / 6.21) * Math.PI * 2) * 0.1;

        const tideHeight = minTideHeight + (tideRange / 2) * (1 + primaryTide + secondaryTide + harmonicVariation);

        // Calculate previous hour's tide height for direction
        const prevHour = hour === 0 ? 23 : hour - 1;
        const prevPrimaryTide = Math.sin(((prevHour + tideOffset) / 12.42) * Math.PI * 2);
        const prevSecondaryTide = Math.sin(((prevHour + tideOffset) / 24.84) * Math.PI * 2) * 0.3;
        const prevHarmonicVariation = Math.sin(((prevHour + tideOffset) / 6.21) * Math.PI * 2) * 0.1;
        const prevTideHeight = minTideHeight + (tideRange / 2) * (1 + prevPrimaryTide + prevSecondaryTide + prevHarmonicVariation);

        const windDirection = (baseDirection + directionVariation + 360) % 360;
        const windSpeed = Math.max(5, baseSpeed + speedVariation);
        const temperature = 20 + Math.sin((hour - 6) / 24 * Math.PI * 2) * 8 + Math.random() * 3;
        const waveHeight = Math.max(0.3, baseWaveHeight + waveVariation);
        const wavePeriod = Math.max(4, basePeriod + periodVariation);

        const roundedWindDirection = Math.round(windDirection);
        const roundedWindSpeed = Math.round(windSpeed);
        const roundedWaveHeight = Math.round(waveHeight * 10) / 10; // Round to 1 decimal place
        const roundedWavePeriod = Math.round(wavePeriod);
        const roundedTideHeight = Math.round(tideHeight * 10) / 10; // Round to 1 decimal place
        const roundedPrevTideHeight = Math.round(prevTideHeight * 10) / 10;

        const surfConditions = this.getSurfConditions(
          roundedWaveHeight,
          roundedWavePeriod,
          roundedWindDirection,
          roundedWindSpeed,
          'Bondi Beach, Sydney'
        );

        // Generate realistic water temperature (changes slowly, seasonal variations)
        const baseWaterTemp = 18; // Base water temperature for Sydney area
        const seasonalVariation = Math.sin((dayIndex / 7) * Math.PI * 2) * 2; // Seasonal variation
        const dailyVariation = Math.sin((hour / 24) * Math.PI * 2) * 1; // Small daily variation
        const waterTemp = baseWaterTemp + seasonalVariation + dailyVariation + (Math.random() * 0.5 - 0.25);

        // Generate realistic wind gusts (typically 20-40% higher than base wind speed)
        const gustFactor = 1.2 + (Math.random() * 0.2); // 20-40% increase
        const windGust = windSpeed * gustFactor;

        // Generate humidity (inversely related to temperature, with daily variation)
        const baseHumidity = 70 - (temperature - 20) * 2; // Lower humidity with higher temps
        const humidityVariation = Math.sin((hour / 24) * Math.PI * 2) * 10;
        const humidity = Math.max(30, Math.min(90, baseHumidity + humidityVariation + (Math.random() * 10 - 5)));

        // Generate barometric pressure (crucial for fishing)
        const basePressure = 1013; // Standard atmospheric pressure
        // More stable pressure patterns with gradual changes (better for fishing predictions)
        const pressureVariation = Math.sin((dayIndex / 7) * Math.PI * 2) * 15 + Math.sin((hour / 24) * Math.PI * 2) * 3;
        const pressureTrend = Math.sin((dayIndex / 3) * Math.PI) * 8; // Longer pressure trends
        const barometricPressure = basePressure + pressureVariation + pressureTrend + (Math.random() * 6 - 3);

        // Generate UV Index (peaks at midday, varies by season)
        const maxUV = 8 + seasonalVariation; // Higher in summer
        const hourlyUVFactor = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI)); // Peak at noon
        // Cloud cover affects UV (lower UV when cloudy)
        const cloudCover = Math.sin((hour / 8) * Math.PI) * 0.3 + 0.2; // Simulated cloud cover
        const uvReduction = cloudCover * 0.4; // Clouds reduce UV by up to 40%
        const uvIndex = Math.max(0, maxUV * hourlyUVFactor * (1 - uvReduction));

        // Generate visibility (affected by humidity and weather conditions)
        const baseVisibility = 22; // km (slightly higher base for sailing)
        const visibilityReduction = (humidity - 50) / 50 * 6; // Reduced visibility with high humidity
        const weatherReduction = Math.sin((hour / 6) * Math.PI) * 2; // Weather pattern effects
        const visibilityVar = baseVisibility - visibilityReduction - weatherReduction + (Math.random() * 4 - 2);
        const visibility = Math.max(6, Math.min(30, visibilityVar));

        hourlyData.push({
          time: `${hour.toString().padStart(2, '0')}:00`,
          hour,
          windSpeed: roundedWindSpeed,
          windDirection: roundedWindDirection,
          windGust: Math.round(windGust),
          temperature: Math.round(temperature),
          humidity: Math.round(humidity),
          barometricPressure: Math.round(barometricPressure),
          uvIndex: Math.round(uvIndex * 10) / 10,
          visibility: Math.round(visibility),
          isOffshore: this.isOffshoreWind(roundedWindDirection, 'Bondi Beach, Sydney'),
          offshoreStrength: this.getOffshoreStrength(roundedWindDirection, roundedWindSpeed, 'Bondi Beach, Sydney'),
          waveHeight: roundedWaveHeight,
          wavePeriod: roundedWavePeriod,
          surfConditions,
          tideHeight: roundedTideHeight,
          tideDirection: this.getTideDirection(roundedTideHeight, roundedPrevTideHeight),
          tidePhase: this.getTidePhase(roundedTideHeight, maxTideHeight, minTideHeight),
          waterTemperature: Math.round(waterTemp * 10) / 10
        });
      }

      return {
        date: date.toDateString(),
        day,
        hourlyData
      };
    });
  }

  getMockWeatherData(location: string): WeatherData {
    return {
      location: location || 'Bondi Beach, Sydney',
      temperature: 24,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 15,
      windDirection: 225,
      visibility: 10,
      pressure: 1013,
      forecast: [
        { day: 'Today', high: 24, low: 18, condition: 'Partly Cloudy', windSpeed: 15, windDirection: 225 },
        { day: 'Tomorrow', high: 26, low: 19, condition: 'Sunny', windSpeed: 18, windDirection: 240 },
        { day: 'Wednesday', high: 22, low: 16, condition: 'Rainy', windSpeed: 25, windDirection: 270 },
        { day: 'Thursday', high: 25, low: 18, condition: 'Sunny', windSpeed: 12, windDirection: 200 },
        { day: 'Friday', high: 23, low: 17, condition: 'Cloudy', windSpeed: 20, windDirection: 180 },
      ],
      weeklyWindData: this.generateHourlyWindData(),
    };
  }

  private getMockLocations() {
    return [
      { name: 'Bondi Beach, Sydney', country: 'Australia', lat: -33.8915, lon: 151.2767 },
      { name: 'Gold Coast', country: 'Australia', lat: -28.0167, lon: 153.4000 },
      { name: 'Byron Bay', country: 'Australia', lat: -28.6474, lon: 153.6020 },
      { name: 'Margaret River', country: 'Australia', lat: -33.9547, lon: 115.0728 },
    ];
  }

  async getHyperLocalForecast(lat: number, lon: number): Promise<any> {
    try {
      const responses = await Promise.all([
        this.getCurrentWeather(`${lat},${lon}`),
        this.getTideData(lat, lon),
        this.getUVIndex(lat, lon),
      ]);

      return {
        weather: responses[0],
        tides: responses[1],
        uvIndex: responses[2],
      };
    } catch (error) {
      console.error('Error fetching hyper-local data:', error);
      return null;
    }
  }

  private async getTideData(lat: number, lon: number): Promise<any> {
    return {
      nextHigh: { time: '14:30', height: '1.8m' },
      nextLow: { time: '20:45', height: '0.3m' },
    };
  }

  private async getUVIndex(lat: number, lon: number): Promise<any> {
    return {
      current: 6,
      peak: 9,
      peakTime: '12:30',
    };
  }
}

export const weatherService = new WeatherService();
export type { WeatherData, HourlyWindData, DailyWindData };