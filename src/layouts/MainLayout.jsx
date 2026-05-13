import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';

const MainLayout = ({ isLight, onThemeToggle }) => {
  return (
    <div className="app-shell">
      <Header isLight={isLight} onThemeToggle={onThemeToggle} />
      <div className="app-viewport">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
