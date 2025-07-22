import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const user = JSON.parse(sessionStorage.getItem('user'));
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!user?.id) {
            setError('User not logged in or session expired.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:2000/api/hr/change-password', {
                userId: user.id,
                oldPassword,
                newPassword
            });

            if (response.data.success) {
                setSuccess(response.data.message);
                // Clear session and redirect after short delay
                setTimeout(() => {
                    sessionStorage.clear();
                    navigate('/');
                }, 1500);
            } else {
                setError(response.data.message || 'Password change failed.');
            }
        } catch (err) {
            console.error('Change password error:', err);
            setError(err.response?.data?.message || 'An error occurred while changing password.');
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: '100vh', background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)' }}
        >
            <div
                className="p-4 text-white"
                style={{
                    width: '350px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '10px',
                    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
                }}
            >
                <h2 className="text-center mb-4">Change Password</h2>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label>Old Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label>New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-light w-100 fw-bold">
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
