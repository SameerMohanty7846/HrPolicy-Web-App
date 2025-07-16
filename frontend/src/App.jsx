import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import HrDashboard from './pages/HrDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AddEmployee from './pages/AddEmployee'
import ViewEmployees from './pages/ViewEmployees';
import HrPolicy from './pages/HrPolicy';
import AssignTask from './pages/AssignTask';
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin" Component={AdminDashboard} />
          }
        />

        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute allowedRole="employee" Component={EmployeeDashboard} />
          }
        />

        <Route
          path="/hr/dashboard"
          element={
            <ProtectedRoute allowedRole="hr" Component={HrDashboard} />
          }
        />
    

      </Routes>
    </BrowserRouter>
  );
};

export default App;
