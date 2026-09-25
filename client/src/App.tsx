import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { PlantillaPage } from './pages/PlantillaPage';
import { MultimediaPage } from './pages/MultimediaPage';
import { NoticiasPage } from './pages/NoticiasPage';
import { ContactoPage } from './pages/ContactoPage';
import { AdminPreviewPage } from './pages/AdminPreviewPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/plantilla" element={<PlantillaPage />} />
          <Route path="/multimedia" element={<MultimediaPage />} />
          <Route path="/noticias" element={<NoticiasPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
          <Route path="/admin/*" element={<AdminPreviewPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
