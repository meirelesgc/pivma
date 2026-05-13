import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import useMockStore from '../store/useMockStore';

const PrivateLayout = () => {
  const user = useMockStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-main">
      <Sidebar />
      <div className="app-content-area">
        <Outlet />
      </div>
    </div>
  );
};

export default PrivateLayout;
