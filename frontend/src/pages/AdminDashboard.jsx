import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import Components
import AddEmployee from './AddEmployee';
import AddHr from './AddHr';                       // ✅ Import AddHr
import ViewEmployees from './ViewEmployees';
import EmployeePermissionList from './EmployeePermissionList';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeComponent, setActiveComponent] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeComponent) {
      case 'addEmployee':
        return <AddEmployee />;
      case 'addHr':
        return <AddHr />;                       // ✅ Add HR component rendering
      case 'viewEmployees':
        return <ViewEmployees />;
      case 'permissions':
        return <EmployeePermissionList />;
      default:
        return (
          <div className="text-center mt-5">
            <h1>Welcome, {user?.name}!</h1>
            <p className="lead">Select an option from the sidebar to proceed.</p>
          </div>
        );
    }
  };

  return (
    <div className="layout-bg d-flex" style={{ height: '100vh' }}>
      <div
        className="glass-sidebar d-flex flex-column text-white p-3"
        style={{ width: '220px', overflowY: 'auto', position: 'fixed', height: '100vh' }}
      >
        {user && (
          <div className="text-center mb-4">
            <div
              className="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center border border-white"
              style={{ width: '70px', height: '70px', fontSize: '1.5rem' }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="mt-2 fw-bold">{user.name}</div>
            <div style={{ fontSize: '0.85rem' }}>{user.email}</div>
            <div className="text-capitalize">{user.role}</div>
          </div>
        )}

        <button className="btn btn-light mt-2" onClick={() => setActiveComponent('addEmployee')}>
          Add Employee
        </button>

        <button className="btn btn-light mt-2" onClick={() => setActiveComponent('addHr')}>
          Add HR
        </button>

        <button className="btn btn-light mt-2" onClick={() => setActiveComponent('viewEmployees')}>
          View Employees
        </button>

        <button className="btn btn-light mt-2" onClick={() => setActiveComponent('permissions')}>
          Permissions
        </button>

        <button className="btn btn-danger mt-3" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div
        className="flex-grow-1 p-4 text-white"
        style={{ marginLeft: '220px', width: 'calc(100% - 220px)', overflowY: 'auto' }}
      >
        {renderContent()}
      </div>

      <style>
        {`
          .layout-bg {
            background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
            width: 100%;
          }
          .glass-sidebar {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(12px);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            border-right: 1px solid rgba(255, 255, 255, 0.2);
          }
        `}
      </style>
    </div>
  );
};

export default AdminDashboard;
