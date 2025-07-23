import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger animation after component mounts
    setIsMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:2000/api/login', formData);
      const { token, user, message } = response.data;

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));

      alert(message);

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'employee') {
        navigate('/employee/dashboard');
      } else if (user.role === 'hr') {
        navigate('/hr/dashboard');
      } else {
        alert('Unknown role. Cannot redirect.');
      }
    } catch (error) {
      alert('Invalid credentials or error during login.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-bg d-flex align-items-center justify-content-center vh-100">
      <div className={`glass-card p-5 rounded-4 ${isMounted ? 'fade-in' : ''}`}>
        <h2 className="text-center mb-4 text-white fw-bold">Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="form-label text-white">Email Address</label>
            <input
              type="email"
              className="form-control rounded-3 border-0"
              id="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label text-white">Password</label>
            <input
              type="password"
              className="form-control rounded-3 border-0"
              id="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-light fw-bold w-100 rounded-3">
            Login
          </button>

          <div className="text-center mt-3">
            <Link to="/forgot-password" className="text-white text-decoration-underline">
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>

      <style>
        {`
          body {
            overflow: hidden;
            margin: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }

          .login-bg {
            background: linear-gradient(135deg, #0f2027, #203a43, #2c5364, #1f4037);
            background-size: 300% 300%;
            animation: bgSlide 18s ease infinite;
          }

          @keyframes bgSlide {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .glass-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(16px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.15);
            width: 100%;
            max-width: 420px;
            opacity: 0;
            transform: translateY(40px);
            transition: all 0.6s ease-out;
          }

          .glass-card.fade-in {
            opacity: 1;
            transform: translateY(0);
          }

          .form-control {
            background-color: rgba(255, 255, 255, 0.08);
            color: white;
          }

          .form-control::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }

          .form-control:focus {
            background-color: rgba(255, 255, 255, 0.1);
            box-shadow: none;
            color: white;
          }

          .btn-light {
            background: #fff;
            color: #000;
            font-weight: bold;
            transition: background-color 0.3s ease;
          }

          .btn-light:hover {
            background-color: #eaeaea;
          }

          .text-decoration-underline:hover {
            opacity: 0.8;
          }
        `}
      </style>
    </div>
  );
};

export default Login;
