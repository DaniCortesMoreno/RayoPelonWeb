import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { PlantillaPage } from './pages/PlantillaPage';
import { MultimediaPage } from './pages/MultimediaPage';
import { NoticiasPage } from './pages/NoticiasPage';
import { ContactoPage } from './pages/ContactoPage';

const AdminPreviewPage = lazy(() =>
  import('./pages/AdminPreviewPage').then((m) => ({ default: m.AdminPreviewPage }))
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#07070F] text-rayo-bone flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-2 border-rayo-gold border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-mono uppercase tracking-widest text-rayo-gold animate-pulse">
                Cargando...
              </p>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/plantilla" element={<PlantillaPage />} />
            <Route path="/multimedia" element={<MultimediaPage />} />
            <Route path="/noticias" element={<NoticiasPage />} />
            <Route path="/contacto" element={<ContactoPage />} />
            <Route path="/admin/*" element={<AdminPreviewPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
