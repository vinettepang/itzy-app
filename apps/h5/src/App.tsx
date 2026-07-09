import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import GalleryHome from '@/pages/GalleryHome';
import GalleryDetail from '@/pages/GalleryDetail';
import SchedulesPage from '@/pages/SchedulesPage';
import LabStylePage from '@/pages/LabStylePage';
import PosterPage from '@/pages/PosterPage';
import PosterPreviewPage from '@/pages/PosterPreviewPage';
import PortfolioPage from '@/pages/PortfolioPage';
import GamePage from '@/pages/GamePage';
import Home from '@/pages/Home';
import XkmPage from '@/pages/XkmPage';
import SongsPage from '@/pages/SongsPage';
import UnseenPage from '@/pages/UnseenPage';
import BallsPage from '@/pages/BallsPage';
import HaoqiPage from '@/pages/haoqi/HaoqiPage';
import HaoqiProjectPage from '@/pages/haoqi/HaoqiProjectPage';
import VirgilPage from '@/pages/virgil/VirgilPage';
import VirgilLegalPage from '@/pages/virgil/VirgilLegalPage';
import WebglRefractionPage from '@/pages/webgl-refraction/WebglRefractionPage';

const HAOQI_PROJECT_SLUGS = [
  'reunimos',
  'inspire_mono',
  'wasm_design_utils',
  'adrive',
  'shore_icon',
  'teambition',
] as const;

export default function App() {
  return (
    <Routes>
      
      <Route path="/" element={<XkmPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/xkm" element={<XkmPage />} />
      <Route path="/songs" element={<SongsPage />} />
      <Route path="/unseen" element={<UnseenPage />} />
      <Route path="/balls" element={<BallsPage />} />
      <Route path="/haoqi" element={<HaoqiPage />} />
      <Route path="/haoqi/:slug" element={<HaoqiProjectPage />} />
      <Route path="/virgil" element={<VirgilPage />} />
      <Route path="/virgil/privacy-policy" element={<VirgilLegalPage kind="privacy" />} />
      <Route path="/virgil/terms" element={<VirgilLegalPage kind="terms" />} />
      <Route path="/labs/webgl-refraction" element={<WebglRefractionPage />} />
      {HAOQI_PROJECT_SLUGS.map((slug) => (
        <Route key={slug} path={`/${slug}`} element={<HaoqiProjectPage />} />
      ))}
      <Route element={<AppLayout />}>
        <Route path="/gallery" element={<GalleryHome />} />
        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/gallery/:id" element={<GalleryDetail />} />
        <Route path="/lab-style" element={<LabStylePage />} />
        <Route path="/poster" element={<PosterPage />} />
        <Route path="/poster/preview" element={<PosterPreviewPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
