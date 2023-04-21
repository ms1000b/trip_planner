export interface MapLocation {
  lat: number;
  lng: number;
}

export interface GetRoutesErrorResponse {
  message: string;
}

export interface GetRoutesSuccessResponse {
  routes: MapRoute[];
  waypoints: Waypoint[];
  code: string;
  uuid: string;
}

export interface Waypoint {
  distance: number;
  name: string;
  location: number[];
}

export interface MapRoute {
  weight_name: string;
  weight: number;
  duration: number;
  distance: number;
  legs: Leg[];
  geometry: Geometry;
}

export interface Leg {
  via_waypoints: any[];
  annotation: Annotation;
  admins: Admin[];
  weight: number;
  duration: number;
  steps: any[];
  distance: number;
  summary: string;
}

export interface Annotation {
  distance: number[];
}

export interface Admin {
  iso_3166_1_alpha3: string;
  iso_3166_1: string;
}

export interface Geometry {
  coordinates: number[][];
  type: string;
}
