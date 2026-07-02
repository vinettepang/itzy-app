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
import GamePage from '@/pages/GamePage';
import Home from '@/pages/Home';
import XkmPage from '@/pages/XkmPage';
import SongsPage from '@/pages/SongsPage';
import UnseenPage from '@/pages/UnseenPage';
import BallsPage from '@/pages/BallsPage';

export default function App() {
  return (
    <Routes>
      
      <Route path="/home" element={<Home />} />
      <Route path="/xkm" element={<XkmPage />} />
      <Route path="/songs" element={<SongsPage />} />
      <Route path="/unseen" element={<UnseenPage />} />
      <Route path="/balls" element={<BallsPage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<GalleryHome />} />
        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/gallery/:id" element={<GalleryDetail />} />
        <Route path="/lab-style" element={<LabStylePage />} />
        <Route path="/poster" element={<PosterPage />} />
        <Route path="/poster/preview" element={<PosterPreviewPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/virgil" element={<VirgilPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
