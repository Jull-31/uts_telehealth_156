import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Beranda from './pages/Beranda';
import Petunjuk from './pages/Petunjuk';
import Pengisian from './pages/Pengisian';
import Periksa from './pages/Periksa';
import Konfirmasi from './pages/Konfirmasi';
import Riwayat from './pages/Riwayat';
import Hasil from './pages/Hasil';
import Status from './pages/Status';
import StatusUts from './pages/StatusUts';
import Identitas from './pages/Identitas';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/petunjuk/:formId" element={<Petunjuk />} />
        <Route path="/isi/:id" element={<Pengisian />} />
        <Route path="/periksa/:id" element={<Periksa />} />
        <Route path="/konfirmasi/:id" element={<Konfirmasi />} />
        <Route path="/riwayat" element={<Riwayat />} />
        <Route path="/hasil/:id" element={<Hasil />} />
        <Route path="/status/:id" element={<Status />} />
        <Route path="/status-uts" element={<StatusUts />} />
        <Route path="/identitas" element={<Identitas />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
