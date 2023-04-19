import { Suspense, lazy } from 'react';
import './App.css';

import Loading from './shared/Loading';
const MapComponent = lazy(() => import(`./components/MapComponent`));

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
