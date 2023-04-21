import { memo } from 'react';
import './App.css';

import MapComponent from './components/MapComponent';

function App() {
  return (
    <div id='app'>
      <MapComponent />
    </div>
  );
}

export default memo(App);
