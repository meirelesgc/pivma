import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';

const MainLayout = ({ isLight, onThemeToggle }) => {
  return (
    <div className="main-layout">
      <Header isLight={isLight} onThemeToggle={onThemeToggle} />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
