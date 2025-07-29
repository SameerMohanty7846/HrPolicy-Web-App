import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeaveApplication = () => {
  const [applications, setApplications] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get("http://localhost:2000/api/leave/applications");
      setApplications(res.data);
    } catch (error) {
      console.error("Error fetching leave applications:", error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const handleUpdateStatus = async (application_id, status) => {
    // Set loading state for specific button
    setLoadingStates(prev => ({
      ...prev,
      [`${application_id}_${status}`]: true
    }));
    
    try {
      console.log('Updating status:', { application_id, status }); // Debug log
      
      const response = await axios.patch(
        `http://localhost:2000/api/leave/applications/${application_id}/status`, 
        {
          status: status
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Update response:', response.data); // Debug log

      // Update UI locally only after successful backend update
      setApplications((prevApps) =>
        prevApps.map(app =>
          app.application_id === application_id ? { ...app, status } : app
        )
      );

      // Show success message
      alert(`Leave application ${status.toLowerCase()} successfully!`);

    } catch (error) {
      console.error(`Failed to ${status.toLowerCase()} leave:`, error);
      
      // More detailed error handling
      if (error.response) {
        // Server responded with error status
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        alert(`Failed to ${status.toLowerCase()} leave application: ${error.response.data.error || 'Server error'}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        alert('Network error: Unable to connect to server');
      } else {
        // Something else happened
        console.error('Error message:', error.message);
        alert(`Failed to ${status.toLowerCase()} leave application: ${error.message}`);
      }
    } finally {
      // Clear loading state for specific button
      setLoadingStates(prev => ({
        ...prev,
        [`${application_id}_${status}`]: false
      }));
    }
  };

  return (
    <div className="container mt-3">
      <h2 className="mb-3">All Leave Applications</h2>
      <table className="table table-bordered table-hover table-sm align-middle" style={{ fontSize: '0.85rem' }}>
        <thead className="table-dark" style={{ fontSize: '0.8rem' }}>
          <tr>
            <th>App ID</th>
            <th>Employee</th>
            <th>Leave Type</th>
            <th>From</th>
            <th>To</th>
            <th>Days</th>
            <th>Reason</th>
            <th>Applied</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center">No leave applications found.</td>
            </tr>
          ) : (
            applications.map(app => (
              <tr key={app.application_id}>
                <td>{app.application_id}</td>
                <td>{app.employee_name}</td>
                <td>{app.leave_type}</td>
                <td>{formatDate(app.from_date)}</td>
                <td>{formatDate(app.to_date)}</td>
                <td>{app.no_of_days}</td>
                <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={app.reason}>
                  {app.reason}
                </td>
                <td>{formatDate(app.applied_date)}</td>
                <td>
                  <span
                    className={`badge ${
                      app.status === 'Pending'
                        ? 'bg-warning text-dark'
                        : app.status === 'Approved'
                        ? 'bg-success'
                        : 'bg-danger'
                    }`}
                  >
                    {app.status}
                  </span>
                </td>
                <td>
                  {app.status === 'Pending' ? (
                    <>
                      <button
                        className="btn btn-sm btn-success me-1"
                        onClick={() => handleUpdateStatus(app.application_id, 'Approved')}
                        disabled={loadingStates[`${app.application_id}_Approved`]}
                      >
                        {loadingStates[`${app.application_id}_Approved`] ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleUpdateStatus(app.application_id, 'Rejected')}
                        disabled={loadingStates[`${app.application_id}_Rejected`]}
                      >
                        {loadingStates[`${app.application_id}_Rejected`] ? 'Processing...' : 'Reject'}
                      </button>
                    </>
                  ) : (
                    <em>-</em>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveApplication;