import { MapLocation } from './types';

/**
 * Function to calculate distance between to geolocation points in kilometers
 * @param {MapLocation} fromLocation Point 1
 * @param {MapLocation} toLocation Point 2
 * @returns {number} Distance between 2 points in kilometers
 */
export function GetDistance(fromLocation: MapLocation, toLocation: MapLocation): number {
  const lat1 = fromLocation.lat;
  const lon1 = fromLocation.lng;
  const lat2 = toLocation.lat;
  const lon2 = toLocation.lng;
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return Number(d.toFixed(2));
}

/**
 * Function to convert degrees to radians
 * @param {number} degree Degree to convert
 * @returns {number} Degrees to radians
 */
function deg2rad(degree: number): number {
  return degree * (Math.PI / 180);
}
