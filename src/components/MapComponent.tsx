/* eslint-disable react-hooks/exhaustive-deps */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl, { GeoJSONSource } from 'mapbox-gl';

import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE } from '../config';
import { MapLocation } from '../types';
import { GetDistance } from '../utils';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

export default memo(function MapComponent(): JSX.Element {
  // Map container & Map
  const map = useRef<mapboxgl.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  // Map data
  const [lng, setLng] = useState(77.315292);
  const [lat, setLat] = useState(28.395403);
  const [zoom, setZoom] = useState(15);

  // markers on the map
  const geojson = useRef({
    type: 'FeatureCollection',
    features: []
  });
  const [markers, setMarkers] = useState<Array<MapLocation>>([]);

  /**
   * Function to initialize the map
   * @returns {void}
   */
  const InitMap = useCallback((): void => {
    // map, mapContainer, geojson,
    if (map.current) return; // map already initialized

    // init map
    map.current = new mapboxgl.Map({
      container: mapContainer.current as HTMLElement,
      style: MAPBOX_STYLE,
      center: [lng, lat],
      zoom: zoom
    });

    // add geojson data sources & layers (markers and routes)
    // 1. markers-source , markers-layer
    // 2. routes-source , routes-layer
    // 3. distances-layer (used routes-source)
    map.current.on('load', function () {
      if (map.current) {
        // Add the default empty GeoJSON source to the map as markers-source
        map.current.addSource('markers-source', {
          type: 'geojson',
          data: geojson.current as any
        });

        // Add a layer for the markers as markers-layer
        map.current.addLayer({
          id: 'markers-layer',
          type: 'circle',
          source: 'markers-source',
          paint: {
            'circle-color': 'red',
            'circle-radius': 10
          }
        });

        // Add the default empty GeoJSON source to the map as routes-source
        map.current.addSource('routes-source', {
          type: 'geojson',
          data: geojson.current as any
        });

        // Add a layer for the routes as routes-layer
        map.current.addLayer({
          id: 'routes-layer',
          type: 'line',
          source: 'routes-source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#888',
            'line-width': 5
          }
        });

        // Add a layer for the distances as distances-layer
        map.current.addLayer({
          id: 'distances-layer',
          type: 'symbol',
          source: 'routes-source',
          paint: {
            'text-color': '#000'
          },
          layout: {
            'symbol-placement': 'line-center',
            'text-field': ['get', 'description'] // calculated distance
          }
        });
      }
    });

    // add click listener on the map
    map.current.on('click', AddMarkerToMapBox);
  }, [map, mapContainer, geojson]);

  /**
   * Function to add a marker position to markers array
   */
  const AddMarkerToMapBox = useCallback(
    (event: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      try {
        if (map.current) {
          if (event) {
            // If the user clicked on one of the markers, get its information.
            const features = map.current.queryRenderedFeatures(event.point, {
              layers: ['markers-layer']
            });
            if (!features.length) {
              // any existing marker is not clicked
              // Get the clicked location's longitude and latitude
              const { lngLat } = event;
              if (lngLat) {
                if (lngLat.lat && lngLat.lng) {
                  // Create a new marker object with the clicked position
                  const newMarker = { lat: lngLat.lat, lng: lngLat.lng };
                  // Update the state with the new marker
                  setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
                } else {
                  throw new Error('Longitude or Latitude not present in the lngLat object');
                }
              } else {
                throw new Error('Location lngLat object is undefined from event object');
              }
            }
          } else {
            throw new Error('Event object MapMouseEvent not found');
          }
        }
      } catch (error: Error | any) {
        alert(`Error while adding marker: ${error.message}`);
        console.error(error);
      }
    },
    [map]
  );

  /**
   * Function to show markers on the map
   */
  const ShowMarkersOnMap = useCallback(() => {
    // markers.length === 0 || markers.length++
    if (markers.length) {
      const addedMarker = markers[markers.length - 1];
      // Create a new marker feature
      const marker = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [addedMarker.lng, addedMarker.lat]
        }
      };

      geojson.current.features.push(marker as never);
    } else {
      // markers cleared
      geojson.current.features = [];
    }

    if (map.current) {
      if (map.current.getSource(`markers-source`))
        // update data of map source `markers-source` as geojson.current
        (map.current.getSource(`markers-source`) as GeoJSONSource).setData(geojson.current as any);
      // sample geojson data for markers
      // {
      //   type: 'FeatureCollection',
      //   features: [{
      //       type: 'Feature',
      //       geometry: {
      //       type: 'Point',
      //       coordinates: [addedMarker.lng, addedMarker.lat]
      //     }
      //   }, {}, {}]
      // }

      if (markers.length > 1) {
        if (map.current.getSource(`routes-source`))
          // update data of map source `routes-source` as geojson.current (after mapping)
          (map.current.getSource(`routes-source`) as GeoJSONSource).setData({
            ...geojson.current,
            features: geojson.current.features
              .map((feature: any, index: number) => {
                if (index < markers.length - 1)
                  return {
                    ...feature,
                    properties: {
                      description: `${GetDistance(markers[index], markers[index + 1])} km`
                    },
                    geometry: {
                      ...feature.geometry,
                      type: 'LineString',
                      coordinates: [
                        [markers[index].lng, markers[index].lat], // from marker
                        [markers[index + 1].lng, markers[index + 1].lat] // to marker
                      ]
                    }
                  };
                return undefined;
              })
              .filter((feature: any) => feature)
          } as any);

        // sample geojson data for routes
        // {
        //   type: 'FeatureCollection',
        //   features: [{
        //       type: 'Feature',
        //       geometry: {
        //       type: 'LineString',
        //       coordinates: [[fromMarker.lng, fromMarker.lat], [toMarker.lng, toMarker.lat]]
        //     }
        //   }, {}, {}]
        // }
      }
    }
  }, [markers, map, geojson]);

  // init map
  useEffect(InitMap, []);

  // show added markers on the map whenever markers state is updated
  useEffect(ShowMarkersOnMap, [markers]);

  // PS: markers = Array<MapLocation>

  return <div ref={mapContainer} id='map-wrapper'></div>;
});
