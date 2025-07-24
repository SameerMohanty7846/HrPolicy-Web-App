import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const inputsRef = useRef([]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setServerMessage('');
    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:2000/api/auth/request-otp', { email });
      setServerMessage(response.data.message);
      setStep(2);
    } catch (err) {
      if (err.response?.status === 404) {
        setErrorMessage('User does not exist.');
      } else {
        setErrorMessage('Failed to send OTP. Please try again.');
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setServerMessage('');
    setErrorMessage('');

    const otpValue = otp.join('');

    try {
      const response = await axios.post('http://localhost:2000/api/auth/verify-otp', {
        email,
        otp: otpValue,
      });
      setServerMessage(response.data.message);
      setStep(3);
    } catch (err) {
      if (err.response?.status === 400) {
        setErrorMessage('Invalid or expired OTP.');
      } else {
        setErrorMessage('OTP verification failed.');
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setServerMessage('');
    setErrorMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      await axios.post('http://localhost:2000/api/auth/change-password-with-otp', {
        email,
        newPassword,
      });

      setServerMessage('Password reset successful!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error(err);
      setErrorMessage('Password reset failed. Please try again.');
    }
  };

  const handleOtpChange = (element, index) => {
    const value = element.value.replace(/\D/, '');
    if (!value) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (index < inputsRef.current.length - 1 && value) {
      inputsRef.current[index + 1].focus();
    }
  };

  return (
    <div className="login-bg d-flex align-items-center justify-content-center vh-100">
      <div className="glass-card p-4 rounded-4 w-100" style={{ maxWidth: '400px' }}>
        <h2 className="text-center text-white mb-4">Forgot Password</h2>

        {serverMessage && (
          <div className="alert alert-success fade-in text-center py-2">{serverMessage}</div>
        )}
        {errorMessage && (
          <div className="alert alert-danger fade-in text-center py-2">{errorMessage}</div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="mb-3">
              <label className="form-label text-white">Registered Email</label>
              <input
                type="email"
                className="form-control rounded-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="themed-btn w-100">Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-3 text-center">
              <label className="form-label text-white">Enter OTP</label>
              <div className="d-flex justify-content-center gap-2 otp-boxes">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength="1"
                    className="otp-input"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target, idx)}
                    ref={(el) => (inputsRef.current[idx] = el)}
                  />
                ))}
              </div>
            </div>
            <button type="submit" className="themed-btn w-100 mt-3">Verify OTP</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label className="form-label text-white">Email</label>
              <input
                type="email"
                className="form-control rounded-3"
                value={email}
                readOnly
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white">New Password</label>
              <input
                type="password"
                className="form-control rounded-3"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Confirm Password</label>
              <input
                type="password"
                className="form-control rounded-3"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="themed-btn w-100">Reset Password</button>
          </form>
        )}
      </div>

      <style>{`
        .login-bg {
          background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(18px);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .themed-btn {
          background: linear-gradient(to right, #4b6cb7, #182848);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .themed-btn:hover {
          background: linear-gradient(to right, #43cea2, #185a9d);
          transform: scale(1.02);
          box-shadow: 0 0 14px rgba(255, 255, 255, 0.25);
        }

        .otp-boxes .otp-input {
          width: 45px;
          height: 50px;
          font-size: 1.5rem;
          text-align: center;
          border-radius: 10px;
          border: none;
          background-color: rgba(255,255,255,0.2);
          color: white;
          font-weight: bold;
          outline: none;
          box-shadow: 0 0 5px rgba(255,255,255,0.3);
          transition: 0.2s ease-in-out;
        }

        .otp-boxes .otp-input:focus {
          background-color: rgba(255,255,255,0.3);
          box-shadow: 0 0 10px rgba(255,255,255,0.5);
        }

        .fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
