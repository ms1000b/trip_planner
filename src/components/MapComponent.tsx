// TODO
// memo: move gettingCurrentLocation & gettingRoutes up and pass setters as props: saves 1 re-render

// cursor pointer on map
// recentering issue to center on adding marker: best solution: fitBounds or last marker

// rendering routes with distance label: Added layer, but not working
// fallback for null route: Retry button & function

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMapboxGl, { Layer, Feature } from 'react-mapbox-gl';

import Toast from './shared/Toast';

import { MAPBOX_ACCESS_TOKEN, MAPBOX_DIRECTIONS_API_URL, MAPBOX_STYLE } from '../config';
import { GetRoutesErrorResponse, GetRoutesSuccessResponse, MapLocation, MapRoute } from '../types';

const MapBox = ReactMapboxGl({
  accessToken: MAPBOX_ACCESS_TOKEN
});

export default memo(function MapComponent(): JSX.Element {
  const mapRef = useRef(null);

  const [gettingRoutes, setGettingRoutes] = useState<boolean>(false);

  // markers on the map
  const [markers, setMarkers] = useState<Array<MapLocation>>([]);

  // routes between markers where key is the starting index of the route
  const [routes, setRoutes] = useState<Map<number, MapRoute | null>>(new Map());

  /**
   * Function to add a marker position to markers array
   */
  const AddMarkerToMapBox = useCallback((map: any, event: any) => {
    // Get the clicked location's longitude and latitude
    const { lngLat } = event;
    // Create a new marker object with the clicked position
    const newMarker = { lat: lngLat.lat, lng: lngLat.lng };
    // Update the state with the new marker
    setMarkers((prevMarkers) => [...prevMarkers, newMarker]); // TODO: optimise
  }, []);

  /**
   * Function to update the routes
   */
  const UpdateRoutes = useCallback(() => {
    if (markers.length > 1 && markers.length !== mapRoutes.length + 1) {
      const start = markers[markers.length - 2];
      const end = markers[markers.length - 1];

      let routesOfLastTwoPoints: MapRoute | null = null;

      // find routes
      const url = new URL(MAPBOX_DIRECTIONS_API_URL.replace(`START_LNG`, start.lng.toString()).replace(`START_LAT`, start.lat.toString()).replace(`END_LNG`, end.lng.toString()).replace(`END_LAT`, end.lat.toString()));

      url.searchParams.set(`alternatives`, `false`);
      url.searchParams.set(`annotations`, `distance`);
      url.searchParams.set(`geometries`, `geojson`);
      url.searchParams.set(`language`, `en`);
      url.searchParams.set(`access_token`, MAPBOX_ACCESS_TOKEN);

      setGettingRoutes(true);
      fetch(url.toString())
        .then(async (response) => {
          if (response.ok) return response.json();
          /* API error */ else throw new Error(((await response.json()) as GetRoutesErrorResponse).message);
        })
        .then((data: GetRoutesSuccessResponse) => {
          if (data) {
            if (data.routes) {
              if (data.routes.length) {
                routesOfLastTwoPoints = data.routes[0];
              } else {
                throw new Error('Data received from API does not contain any routes');
              }
            } else {
              throw new Error('Data received from API does not contain routes key');
            }
          } else {
            throw new Error('No data received from API');
          }
        })
        .catch((err: Error) => {
          // default Fetch error | thrown: API Error | thrown: key not found Error
          const message = `Error fetching directions: ${err.message}`;
          alert(message);
          console.error(message, err);
        })
        .finally(() => {
          const newRoutes = new Map(routes); // TODO: optimise
          newRoutes.set(markers.length - 2, routesOfLastTwoPoints); // markers.length - 2 indicates the start of the route
          setRoutes(newRoutes);

          setGettingRoutes(false);
        });

      // ...
    }
  }, [markers, routes]);

  /**
   * Function that zooms as per markers on the map
   */
  const FitBounds = () => {
    if (markers.length > 0 && mapRef.current) {
      // TODO
      // Extract coordinates from markers
      // const coordinates = markers.map((marker: MapLocation) => [marker.lng, marker.lat]);
      // // Calculate map bounds
      // const bounds = coordinates.reduce((bounds, coord) => bounds.extend(coord), new mapboxgl.LngLatBounds());
      // // Fit map to bounds with padding
      // mapRef.current.fitBounds(bounds, {
      //   padding: 40,
      //   duration: 0
      // });
    }
  };

  // update routes when markers are added/updated
  useEffect(UpdateRoutes, [markers]);
  useEffect(FitBounds, [markers]);

  const mapRoutes = useMemo(() => [...routes.values()], [routes]);

  // PS: markers = [ { lat: number; lng: number }, {}, {}, {}, {}, {}, {}, {}, ...]
  // PS: routes = Map -> { 0: [{}, {}, {}], 1: [{}, {}, {}, ...], 2: [{}, {}, ...]} // routes from 0 to 1, 1 to 2 and 2 to 3

  return (
    <div id='map-wrapper'>
      {gettingRoutes && <Toast id={'getting-route'} text={'Getting Route...'} />}
      <MapBox
        onClick={AddMarkerToMapBox}
        center={[77.216721, 28.6448]} // default center
        zoom={[15]} // default zoom
        style={MAPBOX_STYLE}
        containerStyle={{
          height: '100%',
          width: '100%'
        }}
        ref={mapRef}
      >
        <Layer type='circle' id='markers' paint={{ 'circle-color': 'red', 'circle-radius': 10 }}>
          {markers.map((marker: MapLocation, index: number) => (
            <Feature key={`marker-${marker.lng}-${marker.lat}`} coordinates={[marker.lng, marker.lat]} />
          ))}
        </Layer>

        <Layer
          type='line'
          id='routes'
          paint={{
            'line-color': 'blue',
            'line-width': 2
          }}
        >
          {mapRoutes.map((mapRoute: MapRoute | null, index: number) => {
            if (mapRoute) return <Feature key={`line-${index}-${mapRoute.distance}`} coordinates={mapRoute.geometry.coordinates} />;
          })}
        </Layer>

        {/* <Layer
          type='symbol'
          id='distances'
          layout={{
            'text-field': `Hiiii`,
            'text-size': 12,
            'symbol-placement': 'line',
            'symbol-geometry': 'line',
            'text-offset': [0, -10]
          }}
        >
          {mapRoutes.map((mapRoute: MapRoute | null, index: number) => {
            if (mapRoute) return <Feature key={`line-${index}-${mapRoute.distance}`} coordinates={mapRoute.geometry.coordinates} />;
          })}
        </Layer> */}
      </MapBox>
    </div>
  );
});
