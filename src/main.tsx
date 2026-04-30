import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Guide } from './components/Guide.tsx'
import { VersionHistory } from './components/VersionHistory.tsx'

function Root() {
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  if (route.endsWith('/guide')) return <Guide />;
  if (route.endsWith('/version')) return <VersionHistory />;
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
