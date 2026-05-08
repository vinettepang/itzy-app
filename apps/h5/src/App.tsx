import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import GalleryHome from '@/pages/GalleryHome';
import GalleryDetail from '@/pages/GalleryDetail';
import SchedulesPage from '@/pages/SchedulesPage';
import LabStylePage from '@/pages/LabStylePage';
import PosterPage from '@/pages/PosterPage';
import PosterPreviewPage from '@/pages/PosterPreviewPage';
import VirgilPage from '@/pages/VirgilPage';
import PortfolioPage from '@/pages/PortfolioPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<GalleryHome />} />
        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/gallery/:id" element={<GalleryDetail />} />
        <Route path="/lab-style" element={<LabStylePage />} />
        <Route path="/poster" element={<PosterPage />} />
        <Route path="/poster/preview" element={<PosterPreviewPage />} />
        <Route path="/virgil" element={<VirgilPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
