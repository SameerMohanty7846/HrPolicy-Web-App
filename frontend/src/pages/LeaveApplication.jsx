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
    setLoadingStates(prev => ({
      ...prev,
      [`${application_id}_${status}`]: true
    }));
    
    try {
      console.log('Updating status:', { application_id, status });
      
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

      console.log('Update response:', response.data);

      setApplications((prevApps) =>
        prevApps.map(app =>
          app.application_id === application_id ? { ...app, status } : app
        )
      );

      alert(`Leave application ${status.toLowerCase()} successfully!`);

    } catch (error) {
      console.error(`Failed to ${status.toLowerCase()} leave:`, error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        alert(`Failed to ${status.toLowerCase()} leave application: ${error.response.data.error || 'Server error'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        alert('Network error: Unable to connect to server');
      } else {
        console.error('Error message:', error.message);
        alert(`Failed to ${status.toLowerCase()} leave application: ${error.message}`);
      }
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [`${application_id}_${status}`]: false
      }));
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h2 className="h5 mb-0">Leave Applications Management</h2>
          <p className="mb-0 small">Review and manage employee leave requests</p>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-nowrap">App ID</th>
                  <th className="text-nowrap">Employee</th>
                  <th className="text-nowrap">Leave Type</th>
                  <th className="text-nowrap">From</th>
                  <th className="text-nowrap">To</th>
                  <th className="text-nowrap">Days</th>
                  <th className="text-nowrap">Reason</th>
                  <th className="text-nowrap">Applied</th>
                  <th className="text-nowrap">Status</th>
                  <th className="text-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-4 text-muted">
                      <i className="bi bi-inbox me-2"></i>
                      No leave applications found
                    </td>
                  </tr>
                ) : (
                  applications.map(app => (
                    <tr key={app.application_id} className="align-middle">
                      <td className="fw-semibold">#{app.application_id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-2">
                            <span className="avatar avatar-sm bg-secondary text-white rounded-circle">
                              {app.employee_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="fw-medium">{app.employee_name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info bg-opacity-10 text-info">
                          {app.leave_type}
                        </span>
                      </td>
                      <td className="text-nowrap">{formatDate(app.from_date)}</td>
                      <td className="text-nowrap">{formatDate(app.to_date)}</td>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary">
                          {app.no_of_days} day{app.no_of_days !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td style={{ maxWidth: '200px' }} className="text-truncate" title={app.reason}>
                        {app.reason}
                      </td>
                      <td className="text-nowrap text-muted small">{formatDate(app.applied_date)}</td>
                      <td>
                        <span
                          className={`badge rounded-pill ${
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
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-success flex-grow-1"
                              onClick={() => handleUpdateStatus(app.application_id, 'Approved')}
                              disabled={loadingStates[`${app.application_id}_Approved`]}
                            >
                              {loadingStates[`${app.application_id}_Approved`] ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check-circle me-1"></i>
                                  Approve
                                </>
                              )}
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger flex-grow-1"
                              onClick={() => handleUpdateStatus(app.application_id, 'Rejected')}
                              disabled={loadingStates[`${app.application_id}_Rejected`]}
                            >
                              {loadingStates[`${app.application_id}_Rejected`] ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-x-circle me-1"></i>
                                  Reject
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <div className="small text-muted">
              Showing <strong>{applications.length}</strong> applications
            </div>
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={fetchApplications}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplication;