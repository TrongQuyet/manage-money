
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import CreateOrg from './components/CreateOrg';
import OrgSelector from './components/OrgSelector';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/create-org" element={<CreateOrg />} />
        <Route path="/:orgSlug/*" element={<App />} />
        <Route path="/" element={<OrgSelector />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
