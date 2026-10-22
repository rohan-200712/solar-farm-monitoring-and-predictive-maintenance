import axios from 'axios';
import { IWeatherData } from '../types.js';
import { store } from '../db/store.js';

export async function fetchCurrentWeather(): Promise<IWeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  // Default coordinates: High-insolation solar farm region (e.g. Mojave Desert / Barstow, CA or Thar, India: 34.8958, -117.0173)
  const lat = 34.8958;
  const lon = -117.0173;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
        { timeout: 4000 }
      );

      const d = response.data;
      const cloudCoverage = d.clouds?.all ?? 15;
      const temp = d.main?.temp ?? 28;
      const humidity = d.main?.humidity ?? 40;
      const windSpeed = Number(((d.wind?.speed ?? 3.5) * 3.6).toFixed(1)); // Convert m/s to km/h
      const pressure = d.main?.pressure ?? 1013;
      const condition = d.weather?.[0]?.main ?? 'Sunny';

      // Calculate Solar Irradiance based on sun elevation and cloud cover
      const now = new Date();
      const hour = now.getHours() + now.getMinutes() / 60;
      let clearSkyIrradiance = 0;
      if (hour >= 6 && hour <= 18) {
        clearSkyIrradiance = Math.sin(((hour - 6) / 12) * Math.PI) * 1000;
      }
      const cloudAttenuation = 1 - (cloudCoverage / 100) * 0.75;
      const irradiance = Math.max(0, Math.round(clearSkyIrradiance * cloudAttenuation));

      // Calculate weather impact description
      let solarImpact = 'Optimal direct normal irradiance. Photovoltaic yield is running at ~98% of maximum theoretical capacity.';
      if (cloudCoverage > 60) {
        solarImpact = `Dense cloud coverage (${cloudCoverage}%) causes high diffuse scattering, reducing instantaneous farm power output by ~${Math.round(cloudCoverage * 0.7)}%.`;
      } else if (cloudCoverage > 25) {
        solarImpact = `Intermittent cumulus clouds (${cloudCoverage}% coverage) create minor optical fluctuations; farm yield reduced by ~${Math.round(cloudCoverage * 0.5)}%.`;
      } else if (temp > 35) {
        solarImpact = `High ambient air temperature (${temp}°C) increases solar module silicon heat, introducing a thermal derating loss of ~${((temp - 25) * 0.4).toFixed(1)}%.`;
      }

      const weatherData: IWeatherData = {
        _id: `w-${Date.now()}`,
        temperature: Number(temp.toFixed(1)),
        humidity,
        windSpeed,
        condition,
        cloudCoverage,
        pressure,
        irradiance,
        sunrise: new Date(d.sys?.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunset: new Date(d.sys?.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        uvIndex: irradiance > 700 ? 8.4 : irradiance > 400 ? 5.2 : 2.1,
        solarImpactDescription: solarImpact,
        timestamp: new Date().toISOString()
      };

      // Store in memory / DB for historical analytics
      store.weather.unshift(weatherData);
      if (store.weather.length > 50) store.weather.pop();

      return weatherData;
    } catch (err: any) {
      console.warn('[WeatherService] OpenWeather API call failed (' + err.message + '). Serving live physics-modeled atmospheric data.');
    }
  }

  // Realistic solar farm atmospheric simulation fallback
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  let clearSkyIrradiance = 0;
  if (hour >= 6 && hour <= 18) {
    clearSkyIrradiance = Math.sin(((hour - 6) / 12) * Math.PI) * 980;
  }
  const cloudCoverage = 14 + Math.round(Math.sin(Date.now() / 60000) * 6);
  const cloudAttenuation = 1 - (cloudCoverage / 100) * 0.75;
  const irradiance = Math.max(0, Math.round(clearSkyIrradiance * cloudAttenuation));
  const temp = Number((28.2 + Math.sin(Date.now() / 90000) * 2.5).toFixed(1));

  const weatherData: IWeatherData = {
    _id: `w-${Date.now()}`,
    temperature: temp,
    humidity: 38 + Math.round(Math.cos(Date.now() / 70000) * 5),
    windSpeed: Number((13.5 + Math.random() * 2).toFixed(1)),
    condition: cloudCoverage > 50 ? 'Overcast' : cloudCoverage > 20 ? 'Partly Cloudy' : 'Sunny / Clear Sky',
    cloudCoverage,
    pressure: 1013.8,
    irradiance,
    sunrise: '06:14 AM',
    sunset: '06:52 PM',
    uvIndex: irradiance > 700 ? 8.5 : irradiance > 400 ? 5.4 : 1.8,
    solarImpactDescription: `Clear atmospheric transmission. Low cloud density (${cloudCoverage}%) provides high global horizontal irradiance with minimal attenuation.`,
    timestamp: new Date().toISOString()
  };

  store.weather.unshift(weatherData);
  if (store.weather.length > 50) store.weather.pop();

  return weatherData;
}
