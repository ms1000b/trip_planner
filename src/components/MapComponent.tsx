// TODO
// memo: move gettingCurrentLocation & gettingRoutes up and pass setters as props

// cursor pointer
// recentering issue to currentLocation on adding marker

// rendering routes with distance label
// fallback for null route: Retry function

import { memo, useCallback, useEffect, useState } from 'react';

import { GetRoutesErrorResponse, GetRoutesSuccessResponse, MapLocation, MapRoute } from '../types';

import Toast from './shared/Toast';
import ReactMapboxGl, { Layer, Feature } from 'react-mapbox-gl';

const MapBox = ReactMapboxGl({
  accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || ``
});

export default memo(function MapComponent(): JSX.Element {
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
    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

    map.flyTo({
      center: [newMarker.lng, newMarker.lat],
      essential: true
    });
  }, []);

  /**
   * Function to update the routes
   */
  const UpdateRoutes = useCallback(() => {
    if (markers.length > 1) {
      const start = markers[markers.length - 2];
      const end = markers[markers.length - 1];

      let routesOfLastTwoPoints: MapRoute | null = null;
      // find routes

      const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng}%2C${start.lat}%3B${end.lng}%2C${end.lat}`);

      url.searchParams.set(`alternatives`, `false`);
      url.searchParams.set(`annotations`, `distance`);
      url.searchParams.set(`geometries`, `geojson`);
      url.searchParams.set(`language`, `en`);
      url.searchParams.set(`access_token`, process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || ``);

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
          // Fetch error
          const message = `Error fetching directions: ${err.message}`;
          alert(message);
          console.error(message);
        })
        .finally(() => {
          const newRoutes = new Map(routes);
          newRoutes.set(markers.length - 2, routesOfLastTwoPoints); // markers.length - 2 indicates the start of the route
          setRoutes(newRoutes);

          setGettingRoutes(false);
        });

      // ...
    }
  }, [markers, routes]);

  // update routes when markers are added/updated
  useEffect(UpdateRoutes, [markers]);

  // PS: markers = [currentLocation || {}, {}, {}, {}, {}, {}, {}, {}, ...]
  // PS: routes = Map -> { 0: [{}, {}, {}], 1: [{}, {}, {}, ...], 2: [{}, {}, ...]} // routes from 0 to 1, 1 to 2 and 2 to 3

  return (
    <div id='map-wrapper'>
      {gettingRoutes && <Toast id={'getting-route'} text={'Getting Route...'} />}
      <MapBox
        onClick={AddMarkerToMapBox}
        center={[77.216721, 28.6448]} // default center
        // fitBounds={[]} // need to add this to stop map to move to center on every marker addition
        zoom={[15]} // default zoom
        style='mapbox://styles/mapbox/streets-v12' // latest version
        containerStyle={{
          height: '100%',
          width: '100%'
        }}
      >
        <Layer type='circle' id='markers' paint={{ 'circle-color': 'red', 'circle-radius': 10 }}>
          {markers.map((marker: MapLocation) => (
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
          {[...routes.values()].map((mapRoute: MapRoute | null, index: number) => {
            if (mapRoute) return <Feature key={`line-${mapRoute.distance}`} coordinates={mapRoute.geometry.coordinates} />;
          })}
        </Layer>
      </MapBox>
    </div>
  );
});
