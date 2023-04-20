import { Suspense, lazy } from 'react';
import './App.css';

import Loading from './shared/Loading';
import MapComponent from './components/MapComponent';

function App() {
  return (
    <Suspense fallback={<Loading id='app-loader' />}>
      <div id='app'>
        <MapComponent />
      </div>
    </Suspense>
  );
}

export default App;
