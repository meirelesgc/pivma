import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import useMockStore from '../store/useMockStore';

const PrivateLayout = () => {
  const user = useMockStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="private-layout" style={{ display: 'flex' }}>
      <Sidebar />
      <div className="workspace-container" style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default PrivateLayout;
