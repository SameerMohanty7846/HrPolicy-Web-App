import React from 'react';

const HrHome = ({ user }) => {
  return (
    <div className="text-center mt-5">
      <h1>Welcome, {user?.name}!</h1>
      <p>You are logged in as <strong>{user?.role}</strong>.</p>
    </div>
  );
};

export default HrHome;
