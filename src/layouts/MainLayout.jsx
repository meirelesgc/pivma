import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';

const MainLayout = ({ isDark, onThemeToggle }) => {
  return (
    <div className="app-shell">
      <Header isDark={isDark} onThemeToggle={onThemeToggle} />
      <div className="app-viewport">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
