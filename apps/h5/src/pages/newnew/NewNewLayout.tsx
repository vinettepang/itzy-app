import { Outlet } from 'react-router-dom';
import NewNewCoverNav from './NewNewCoverNav';
import '../XkmPage.css';
import '../XkmPage.pc.css';
import './newnew.css';

/** 仅用于二级页：fixed 顶栏 + 页面内容。newnew 首页不走此 layout。 */
export default function NewNewLayout() {
  return (
    <div className="newnew-shell">
      <NewNewCoverNav />
      <div className="newnew-shell__main">
        <Outlet />
      </div>
    </div>
  );
}
