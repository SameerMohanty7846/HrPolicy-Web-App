import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ProtectedRoute from './components/ProtectedRoute';

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
      </Routes>
    </BrowserRouter>
  );
};

export default App;
