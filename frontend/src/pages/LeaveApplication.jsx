import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LeaveApplication = () => {
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();

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

  const handleViewDetails = (applicationId) => {
    // Navigate to detail view with just applicationId
    // The detail component can fetch all necessary data using this ID
    navigate(`/leave-application-detail/${applicationId}`)
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
                  <th className="text-nowrap">View</th>
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
                            <div className="small text-muted">ID: {app.employee_id}</div>
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
                          className={`badge rounded-pill ${app.status === 'Pending'
                              ? 'bg-warning text-dark'
                              : app.status === 'Approved'
                                ? 'bg-success'
                                : 'bg-danger'
                            }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary rounded-circle"
                          onClick={() => handleViewDetails(app.application_id)}
                          title="View details"
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
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