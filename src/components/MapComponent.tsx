import { memo, useCallback, useEffect, useState } from 'react';

import Toast from './shared/Toast';
import ReactMapboxGl, { Layer, Feature } from 'react-mapbox-gl';

const MapBox = ReactMapboxGl({
  accessToken: 'pk.eyJ1IjoibXNldGhpIiwiYSI6ImNsZ253NzBxMDAwM3UzaG1ycGVmbGVnOHYifQ.aGtAgO9xvllyKc6toXjPVw'
});

export default memo(function MapComponent(): JSX.Element {
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState<boolean>(false);
  const [location, setLocation] = useState({
    lat: 0,
    lng: 0
  });

  /**
   * Function to set the current location of the user.
   */
  const SetUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      setGettingCurrentLocation(true);
      /**
       * Callback function to handle successful location fetch
       * @param {GeolocationPosition} position geo location position object
       */
      const onSuccess: PositionCallback = (position: GeolocationPosition) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGettingCurrentLocation(false);
      };

      /**
       * Callback function to handle error on location fetch
       * @param {GeolocationPositionError} error geo location position error object
       */
      const onError: PositionErrorCallback = (error: GeolocationPositionError) => {
        alert('Error getting current location: ' + error.message);
        console.error('Error getting current location:', error);
        setGettingCurrentLocation(false);
      };

      // position config options
      const positionOptions: PositionOptions = {
        enableHighAccuracy: true,
        maximumAge: 0
      };

      // get current location
      navigator.geolocation.getCurrentPosition(onSuccess, onError, positionOptions);
    } else {
      const error = new Error(`Geolocation not supported by browser, to get current location`);
      alert(error.message);
      console.error(error.message);
    }
  }, []);

  useEffect(SetUserLocation, []);

  return (
    <div id='map-wrapper'>
      {gettingCurrentLocation && <Toast id={'getting-location'} text={'Getting Location...'} />}
      <MapBox
        onClick={(_, evt: React.SyntheticEvent<any, Event>) => {}}
        center={[location.lng, location.lat]} // default center
        zoom={[15]} // default zoom
        style='mapbox://styles/mapbox/streets-v12' // latest version
        containerStyle={{
          height: '100%',
          width: '100%'
        }}
      >
        <Layer type='symbol' id='markers-layer' layout={{ 'icon-image': 'marker-15' }}>
          <Feature coordinates={[location.lng, location.lat]} />
        </Layer>
      </MapBox>
    </div>
  );
});
