import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import AddEmployee from './AddEmployee';
import AddHr from './AddHr';
import ViewEmployees from './ViewEmployees';
import EmployeePermissionList from './EmployeePermissionList';
import ChangePassword from './ChangePassword';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeComponent, setActiveComponent] = useState('');

  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      fetchPerformanceData();
    }
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const [dailyRes, monthlyRes] = await Promise.all([
        axios.get(`http://localhost:2000/api/ratings/daily`),
        axios.get(`http://localhost:2000/api/ratings/monthly`)
      ]);

      const dailyMap = {};
      dailyRes.data.forEach(item => {
        const date = new Date(item.label);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        dailyMap[day] = item.avg_rating;
      });

      const formattedDaily = days.map(day => ({
        day,
        avg_rating: dailyMap[day] || 0
      }));
      setDailyData(formattedDaily);

      const monthlyMap = {};
      monthlyRes.data.forEach(item => {
        const [year, monthIndex] = item.label.split('-');
        const month = new Date(year, monthIndex - 1).toLocaleDateString('en-US', { month: 'short' });
        monthlyMap[month] = item.avg_rating;
      });

      const formattedMonthly = months.map(month => ({
        month,
        avg_rating: monthlyMap[month] || 0
      }));
      setMonthlyData(formattedMonthly);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    }
  };

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '');

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const RatingChart = ({ data, xKey, title }) => (
    <div className="chart-card p-4 shadow rounded mb-4">
      <h5 className="chart-title mb-3">{title}</h5>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid stroke="#444" strokeDasharray="4 4" />
          <XAxis dataKey={xKey} stroke="#ccc" />
          <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} stroke="#ccc" />
          <Tooltip />
          <Line type="monotone" dataKey="avg_rating" stroke="#00e6e6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderContent = () => {
    switch (activeComponent) {
      case 'addEmployee':
        return <AddEmployee />;
      case 'addHr':
        return <AddHr />;
      case 'viewEmployees':
        return <ViewEmployees />;
      case 'permissions':
        return <EmployeePermissionList />;
      case 'changePassword':
        return <ChangePassword />;
      default:
        return (
          <div className="px-3">
            <div className="welcome-card mb-4 p-4 rounded shadow text-white">
              <h2 className="fw-bold mb-2">👋 Welcome back, {user?.name}</h2>
              <p className="mb-0">Logged in as <strong>{user?.role}</strong></p>
            </div>

            <div className="charts-container">
              <RatingChart data={dailyData} xKey="day" title="📊 Weekly Avg Performance (Mon–Sat)" />
              <RatingChart data={monthlyData} xKey="month" title="📅 Monthly Avg Performance (Jan–Dec)" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="layout-bg d-flex" style={{ height: '100vh' }}>
      <div
        className="glass-sidebar d-flex flex-column text-white p-3"
        style={{ width: '220px', position: 'fixed', height: '100vh', overflowY: 'auto' }}
      >
        {user && (
          <div className="text-center mb-4">
            <div
              className="rounded-circle bg-dark bg-opacity-50 d-inline-flex align-items-center justify-content-center border border-white"
              style={{ width: '70px', height: '70px', fontSize: '1.5rem' }}
            >
              {getInitial(user.name)}
            </div>
            <div className="mt-2 fw-bold">{user.name}</div>
            <div style={{ fontSize: '0.85rem' }}>{user.email}</div>
            <div className="text-capitalize">{user.role}</div>
          </div>
        )}

        <button className="sidebar-btn" onClick={() => setActiveComponent('addEmployee')}>Add Employee</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('addHr')}>Add HR</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('viewEmployees')}>View Employees</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('permissions')}>Permissions</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('changePassword')}>Change Password</button>

        <button
          className="btn btn-danger mt-4 fw-bold rounded-3 shadow logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div
        className="flex-grow-1 p-4 text-white"
        style={{ marginLeft: '220px', width: 'calc(100% - 220px)', overflowY: 'auto' }}
      >
        {renderContent()}
      </div>

      <style>{`
        .layout-bg {
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364, #1f4037);
          width: 100%;
        }

        .glass-sidebar {
          background: linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
          backdrop-filter: blur(14px);
          box-shadow: 0 0 25px rgba(255, 255, 255, 0.05);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-btn {
          background: linear-gradient(to right, #4b6cb7, #182848);
          color: white;
          border: none;
          padding: 10px 16px;
          margin-top: 10px;
          border-radius: 12px;
          font-weight: 600;
          text-align: left;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .sidebar-btn:hover {
          background: linear-gradient(to right, #43cea2, #185a9d);
          transform: translateX(4px);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
        }

        .logout-btn {
          transition: transform 0.2s ease;
        }

        .logout-btn:hover {
          transform: scale(1.05);
        }

        .welcome-card {
          background: linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3));
          border-left: 4px solid #00e6e6;
        }

        .charts-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 768px) {
          .charts-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .chart-card {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          backdrop-filter: blur(8px);
          transition: transform 0.3s ease;
        }

        .chart-card:hover {
          transform: translateY(-5px);
        }

        .chart-title {
          color: #00e6e6;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
