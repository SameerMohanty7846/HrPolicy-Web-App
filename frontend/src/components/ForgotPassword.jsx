import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [serverMessage, setServerMessage] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    setServerMessage('Dummy OTP 123456 sent to your email');
    setStep(2);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp === '123456') {
      setServerMessage('OTP verified successfully');
      setStep(3);
    } else {
      alert('Invalid OTP. Please enter 123456.');
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }
    alert(`Password for ${email} has been reset successfully.`);
    setServerMessage('Password reset successful');

    // Redirect to home '/'
    navigate('/');
  };

  return (
    <div className="login-bg d-flex align-items-center justify-content-center vh-100">
      <div className="glass-card p-4 rounded-4 w-100" style={{ maxWidth: '400px' }}>
        <h2 className="text-center text-white mb-4">Forgot Password</h2>
        {serverMessage && <p className="text-success text-center">{serverMessage}</p>}

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
            <button type="submit" className="btn btn-light fw-bold w-100">Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-3">
              <label className="form-label text-white">Enter OTP</label>
              <input
                type="text"
                className="form-control rounded-3"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-light fw-bold w-100">Verify OTP</button>
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

            <button type="submit" className="btn btn-light fw-bold w-100">Reset Password</button>
          </form>
        )}
      </div>

      <style>
        {`
          .login-bg {
            background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
          }
          .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.18);
          }
        `}
      </style>
    </div>
  );
};

export default ForgotPassword;
