import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

// Component imports
import HrHome from './HrHome';
import AddEmployee from './AddEmployee';
import ViewEmployees from './ViewEmployees';
import HrPolicy from './HrPolicy';
import AssignTask from './AssignTask';
import TaskManagement from './TaskManagement';
import ChangePassword from './ChangePassword';
import EmployeeGrantedPermission from './EmployeeGrantedPermission';
import HrLeavePolicy from './HrLeavePolicy'; // ✅ New Import

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const HrDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeComponent, setActiveComponent] = useState('home');

  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      fetchRatingStats(storedUser.id);
    }
  }, []);

  const fetchRatingStats = async (employeeId) => {
    try {
      setLoading(true);
      const [dailyRes, monthlyRes] = await Promise.all([
        axios.get(`http://localhost:2000/api/ratings/daily/${employeeId}`),
        axios.get(`http://localhost:2000/api/ratings/monthly/${employeeId}`),
      ]);

      const dailyMap = {};
      dailyRes.data.forEach(item => {
        const date = new Date(item.label);
        const jsDay = date.getDay();
        const weekDayIndex = jsDay === 0 ? 6 : jsDay - 1;
        dailyMap[weekDayIndex] = item.avg_rating;
      });

      const formattedDaily = days.map((day, index) => ({
        day,
        avg_rating: dailyMap[index] || 0,
        max_rating: 5,
        dayIndex: index + 1
      }));
      setDailyData(formattedDaily);

      const currentMonthIndex = new Date().getMonth();
      const monthlyMap = {};
      monthlyRes.data.forEach(item => {
        const [year, monthStr] = item.label.split('-');
        const index = parseInt(monthStr, 10) - 1;
        if (index >= 0 && index < 12) {
          monthlyMap[months[index]] = item.avg_rating;
        }
      });

      const formattedMonthly = months.map((month, index) => ({
        month,
        avg_rating: index > currentMonthIndex ? null : (monthlyMap[month] || 0),
        max_rating: index > currentMonthIndex ? null : 5
      }));
      setMonthlyData(formattedMonthly);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch rating stats:', error);
      setLoading(false);
    }
  };

  const getInitial = (name) => name?.charAt(0).toUpperCase() || '';
  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const RatingChart = ({ data, xKey, title }) => {
    const isWeekly = xKey === 'day';

    return (
      <div className="chart-card p-4 shadow rounded mb-4">
        <h5 className="chart-title mb-3">{title}</h5>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid stroke="#444" strokeDasharray="4 4" />
            <XAxis
              dataKey={isWeekly ? 'dayIndex' : xKey}
              stroke="#ccc"
              tickFormatter={(value) => isWeekly ? days[value - 1] || '' : value}
            />
            <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} stroke="#ccc" />
            <Tooltip />
            <Legend />
            <Bar dataKey="max_rating" fill="#444" barSize={20} radius={[4, 4, 0, 0]} name="Max Rating (5★)" />
            <Bar dataKey="avg_rating" fill="#00e6e6" barSize={20} radius={[4, 4, 0, 0]} name="Your Rating" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderContent = () => {
    if (!user) return null;

    switch (activeComponent) {
      case 'addEmployee':
        return <AddEmployee />;
      case 'viewEmployees':
        return <ViewEmployees />;
      case 'hrPolicy':
        return <HrPolicy />;
      case 'leavePolicy':
        return <HrLeavePolicy />; // ✅ Leave Policy component
      case 'assignTask':
        return <AssignTask />;
      case 'taskManagement':
        return <TaskManagement employeeId={user.id} />;
      case 'changePassword':
        return <ChangePassword />;
      case 'grantedPermissions':
        return <EmployeeGrantedPermission employeeId={user.id} />;
      default:
        return (
          <div className="px-3">
            <div className="welcome-card mb-4 p-4 rounded shadow text-white">
              <h2 className="fw-bold mb-2">👋 Welcome back, {user.name}</h2>
              <p className="mb-0">Logged in as <strong>{user.role}</strong></p>
            </div>
            {loading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-info" role="status"></div>
                <p className="mt-3 text-light">Loading performance data...</p>
              </div>
            ) : (
              <div className="charts-container">
                <RatingChart data={dailyData} xKey="day" title="📊 Weekly Rating: Achieved vs Max (Mon–Sat)" />
                <RatingChart data={monthlyData} xKey="month" title="📅 Monthly Rating: Achieved vs Max (This Year)" />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="layout-bg d-flex" style={{ height: '100vh' }}>
      <div className="glass-sidebar d-flex flex-column text-white p-3" style={{ width: '220px', position: 'fixed', height: '100vh', overflowY: 'auto' }}>
        {user && (
          <div className="text-center mb-4">
            <div className="rounded-circle bg-white bg-opacity-10 d-inline-flex align-items-center justify-content-center border border-light" style={{ width: '70px', height: '70px', fontSize: '1.5rem' }}>
              {getInitial(user.name)}
            </div>
            <div className="mt-2 fw-bold">{user.name}</div>
            <div style={{ fontSize: '0.85rem' }}>{user.email}</div>
            <div className="text-capitalize">{user.role}</div>
          </div>
        )}

        <button className="sidebar-btn" onClick={() => setActiveComponent('addEmployee')}>➕ Add Employee</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('viewEmployees')}>👥 View Employees</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('hrPolicy')}>📜 HR Policy</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('leavePolicy')}>📘 Leave Policy</button> {/* ✅ New Sidebar Option */}
        <button className="sidebar-btn" onClick={() => setActiveComponent('assignTask')}>📝 Assign Task</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('taskManagement')}>📋 Manage My Tasks</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('grantedPermissions')}>✅ Granted Permissions</button>
        <button className="sidebar-btn" onClick={() => setActiveComponent('changePassword')}>🔐 Change Password</button>
        <button className="btn btn-danger mt-4 fw-bold rounded-3 shadow logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </div>

      <div className="flex-grow-1 p-4 text-white" style={{ marginLeft: '220px', width: 'calc(100% - 220px)', overflowY: 'auto' }}>
        {renderContent()}
      </div>

      <style>{`
        .layout-bg {
          background: linear-gradient(135deg, #1e1e2f, #1a1a27);
        }
        .glass-sidebar {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(12px);
          border-right: 1px solid rgba(255,255,255,0.1);
        }
        .sidebar-btn {
          background: linear-gradient(to right, #4b6cb7, #182848);
          color: white;
          border: none;
          padding: 10px 14px;
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
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
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

export default HrDashboard;
