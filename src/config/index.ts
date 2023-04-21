export const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || ``; // presence check in prebuild/prestart script

export const MAPBOX_DIRECTIONS_API_URL = `https://api.mapbox.com/directions/v5/mapbox/driving/START_LNG,START_LAT;END_LNG,END_LAT`;

export const MAPBOX_STYLE = `mapbox://styles/mapbox/streets-v12`;
