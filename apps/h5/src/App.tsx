import { Navigate, Route, Routes } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';
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
import TourSetlistPage from '@/pages/TourSetlistPage';
import CheerGuidePage from '@/pages/CheerGuidePage';
import UnseenPage from '@/pages/UnseenPage';
import DollsPage from '@/pages/DollsPage';
import BallsPage from '@/pages/BallsPage';
import HaoqiPage from '@/pages/haoqi/HaoqiPage';
import HaoqiProjectPage from '@/pages/haoqi/HaoqiProjectPage';
import VirgilPage from '@/pages/virgil/VirgilPage';
import VirgilLegalPage from '@/pages/virgil/VirgilLegalPage';
import WebglRefractionPage from '@/pages/webgl-refraction/WebglRefractionPage';
import FacilLayout from '@/pages/facil/FacilLayout';
import FacilHomePage from '@/pages/facil/pages/FacilHomePage';
import FacilWorksPage from '@/pages/facil/pages/FacilWorksPage';
import FacilFilosofiaPage from '@/pages/facil/pages/FacilFilosofiaPage';
import FacilPeoplePage from '@/pages/facil/pages/FacilPeoplePage';
import FacilContactPage from '@/pages/facil/pages/FacilContactPage';
import FacilProjectPage from '@/pages/facil/pages/FacilProjectPage';
import FacilLegalPage from '@/pages/facil/pages/FacilLegalPage';
import NewHomePage from '@/pages/new-home/NewHomePage';
import NewNewPage from '@/pages/newnew/NewNewPage';
import UiPage from '@/pages/ui/UiPage';
import NewNewLayout from '@/pages/newnew/NewNewLayout';
import MenuPage from '@/pages/MenuPage';
import WakaLayout from '@/pages/wakawaka/WakaLayout';
import WakaHomePage from '@/pages/wakawaka/pages/HomePage';
import WakaStudioPage from '@/pages/wakawaka/pages/StudioPage';
import WakaCataloguePage from '@/pages/wakawaka/pages/CataloguePage';
import WakaFurniturePage from '@/pages/wakawaka/pages/FurniturePage';
import WakaProductPage from '@/pages/wakawaka/pages/ProductPage';
import UnseenStudioLayout from '@/pages/unseen-studio/UnseenStudioLayout';
import UnseenStudioHomePage from '@/pages/unseen-studio/pages/HomePage';
import UnseenStudioProjectsPage from '@/pages/unseen-studio/pages/ProjectsPage';
import UnseenStudioContactPage from '@/pages/unseen-studio/pages/ContactPage';
import UnseenStudioWorldPage from '@/pages/unseen-studio/pages/WorldPage';
import StagecrewLayout from '@/pages/stagecrew/StagecrewLayout';
import StagecrewWorkPage from '@/pages/stagecrew/pages/WorkPage';
import StagecrewInfoPage from '@/pages/stagecrew/pages/InfoPage';
import StagecrewBackstagePage from '@/pages/stagecrew/pages/BackstagePage';
import StagecrewProjectPage from '@/pages/stagecrew/pages/ProjectPage';
import YcPage from '@/pages/yc/YcPage';
import YcDetailPage from '@/pages/yc/YcDetailPage';

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
    <>
      <ScrollToTop />
      <Routes>
      
      <Route path="/" element={<NewNewPage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/xkm" element={<XkmPage />} />
      <Route path="/old-home" element={<XkmPage />} />
      <Route path="/new_home" element={<NewHomePage />} />
      <Route path="/newnew" element={<Navigate to="/" replace />} />
      <Route path="/ui" element={<UiPage />} />
      <Route path="/dolls" element={<DollsPage />} />
      <Route element={<NewNewLayout />}>
        <Route path="/poster" element={<PosterPage />} />
        <Route path="/poster/preview" element={<PosterPreviewPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/setlist" element={<TourSetlistPage />} />
        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/cheer/:slug" element={<CheerGuidePage />} />
        <Route path="/unseen" element={<UnseenPage />} />
      </Route>
      <Route path="/wakawaka" element={<WakaLayout />}>
        <Route index element={<WakaHomePage />} />
        <Route path="studio" element={<WakaStudioPage />} />
        <Route path="catalogue" element={<WakaCataloguePage />} />
        <Route path="furniture" element={<WakaFurniturePage />} />
        <Route path="furniture/:category" element={<WakaFurniturePage />} />
        <Route path=":slug" element={<WakaProductPage />} />
      </Route>
      <Route path="/songs" element={<SongsPage />} />
      <Route path="/balls" element={<BallsPage />} />
      <Route path="/haoqi" element={<HaoqiPage />} />
      <Route path="/haoqi/:slug" element={<HaoqiProjectPage />} />
      <Route path="/virgil" element={<VirgilPage />} />
      <Route path="/virgil/privacy-policy" element={<VirgilLegalPage kind="privacy" />} />
      <Route path="/virgil/terms" element={<VirgilLegalPage kind="terms" />} />
      <Route path="/labs/webgl-refraction" element={<WebglRefractionPage />} />
      <Route path="/unseen-studio" element={<UnseenStudioLayout />}>
        <Route index element={<UnseenStudioHomePage />} />
        <Route path="projects" element={<UnseenStudioProjectsPage />} />
        <Route path="contact" element={<UnseenStudioContactPage />} />
        <Route path="world" element={<UnseenStudioWorldPage />} />
      </Route>
      <Route path="/stagecrew" element={<StagecrewLayout />}>
        <Route index element={<StagecrewWorkPage />} />
        <Route path="info" element={<StagecrewInfoPage />} />
        <Route path="backstage" element={<StagecrewBackstagePage />} />
        <Route path="work/:slug" element={<StagecrewProjectPage />} />
      </Route>
      <Route path="/yc" element={<YcPage />} />
      <Route path="/yc/detail" element={<YcDetailPage />} />

      <Route path="/facil" element={<FacilLayout />}>
        <Route index element={<FacilHomePage />} />
        <Route path="trabajos" element={<FacilWorksPage />} />
        <Route path="filosofia" element={<FacilFilosofiaPage />} />
        <Route path="people" element={<FacilPeoplePage />} />
        <Route path="contact" element={<FacilContactPage />} />
        <Route path="projects/:slug" element={<FacilProjectPage />} />
        <Route path="politica-de-privacidad" element={<FacilLegalPage kind="privacy" />} />
        <Route path="aviso-legal" element={<FacilLegalPage kind="legal" />} />
        <Route path="politica-de-cookies" element={<FacilLegalPage kind="cookies" />} />
        <Route path="declaracion-de-accesibilidad" element={<FacilLegalPage kind="accessibility" />} />
        <Route path="en">
          <Route index element={<FacilHomePage />} />
          <Route path="works" element={<FacilWorksPage />} />
          <Route path="philosophy" element={<FacilFilosofiaPage />} />
          <Route path="people" element={<FacilPeoplePage />} />
          <Route path="contact" element={<FacilContactPage />} />
          <Route path="projects/:slug" element={<FacilProjectPage />} />
          <Route path="privacy-policy" element={<FacilLegalPage kind="privacy" />} />
          <Route path="legal-notice" element={<FacilLegalPage kind="legal" />} />
          <Route path="cookie-policy" element={<FacilLegalPage kind="cookies" />} />
          <Route path="accessibility-statement" element={<FacilLegalPage kind="accessibility" />} />
        </Route>
      </Route>
      {HAOQI_PROJECT_SLUGS.map((slug) => (
        <Route key={slug} path={`/${slug}`} element={<HaoqiProjectPage />} />
      ))}
      <Route element={<AppLayout />}>
        <Route path="/gallery" element={<GalleryHome />} />
        <Route path="/gallery/:id" element={<GalleryDetail />} />
        <Route path="/lab-style" element={<LabStylePage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
