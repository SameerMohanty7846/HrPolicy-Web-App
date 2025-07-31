import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LeaveApplicationDetail = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [leaveData, setLeaveData] = useState(null);
  const [employeeSummary, setEmployeeSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First fetch leave application details
        const leaveResponse = await axios.get(
          `http://localhost:2000/api/leave/applications/8` // Using fixed endpoint as requested
        );
        setLeaveData(leaveResponse.data);

        // Then fetch employee summary using the employee_id from leave data
        if (leaveResponse.data?.employee_id) {
          const employeeResponse = await axios.get(
            `http://localhost:2000/api/employee/leave-summary/${leaveResponse.data.employee_id}`
          );
          setEmployeeSummary(employeeResponse.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [applicationId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleApprove = () => {
    // TODO: Implement approve logic
    console.log('Approving application:', applicationId);
  };

  const handleReject = () => {
    // TODO: Implement reject logic
    console.log('Rejecting application:', applicationId);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Error loading data: {error}
        </div>
      </div>
    );
  }

  if (!leaveData) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          No leave application data found
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <button 
        onClick={() => navigate(-1)}
        className="btn btn-outline-secondary mb-3"
      >
        <i className="bi bi-arrow-left me-2"></i>Back to Applications
      </button>

      <div className="card shadow mb-4">
        <div className="card-header bg-primary text-white">
          <h2 className="h4 mb-0">Leave Application Details</h2>
          <small className="text-white-50">Application ID: {leaveData.application_id}</small>
        </div>
      </div>

      <div className="row">
        {/* Left Column - Leave Application Details */}
        <div className="col-lg-8 mb-4 mb-lg-0">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-light">
              <h4 className="mb-0">Leave Request Details</h4>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <h6>Leave Type</h6>
                  <p className="fs-5">{leaveData.leave_type || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <h6>Status</h6>
                  <span className={`badge ${leaveData.status === 'Approved' ? 'bg-success' : 
                                   leaveData.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'} 
                                  px-3 py-2`}>
                    {leaveData.status || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <h6>From Date</h6>
                  <p className="fs-5">{formatDate(leaveData.from_date)}</p>
                </div>
                <div className="col-md-6">
                  <h6>To Date</h6>
                  <p className="fs-5">{formatDate(leaveData.to_date)}</p>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <h6>Total Days</h6>
                  <p className="fs-5">{leaveData.no_of_days || 0} day{leaveData.no_of_days !== 1 ? 's' : ''}</p>
                </div>
                <div className="col-md-6">
                  <h6>Applied On</h6>
                  <p className="fs-5">{formatDate(leaveData.applied_date)}</p>
                </div>
              </div>

              <div className="mb-3">
                <h6>Reason</h6>
                <div className="p-3 bg-light rounded">
                  <p className="mb-0">{leaveData.reason || 'No reason provided'}</p>
                </div>
              </div>

              {leaveData.status === 'Pending' && (
                <div className="d-flex gap-3 mt-4">
                  <button 
                    onClick={handleApprove}
                    className="btn btn-success flex-grow-1"
                  >
                    <i className="bi bi-check-circle me-2"></i>Approve
                  </button>
                  <button 
                    onClick={handleReject}
                    className="btn btn-danger flex-grow-1"
                  >
                    <i className="bi bi-x-circle me-2"></i>Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Employee Summary */}
        <div className="col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-light">
              <h4 className="mb-0">Employee Leave Summary</h4>
            </div>
            <div className="card-body">
              {employeeSummary ? (
                <>
                  <div className="text-center mb-4">
                    <div className="bg-secondary rounded-circle text-white d-inline-flex align-items-center justify-content-center" 
                         style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                      {leaveData.employee_name?.charAt(0) || '?'}
                    </div>
                    <h4 className="mt-3 mb-1">{leaveData.employee_name || 'Unknown Employee'}</h4>
                    <p className="text-muted">ID: {leaveData.employee_id || 'N/A'}</p>
                  </div>

                  <div className="mb-4">
                    <h5 className="mb-3">Leave Balance</h5>
                    {employeeSummary.summary?.length > 0 ? (
                      <div className="row g-3">
                        {employeeSummary.summary.map((leaveType, index) => (
                          <div key={index} className="col-12">
                            <div className="card border-0 shadow-sm">
                              <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <h6 className="mb-1">{leaveType.leave_type}</h6>
                                    <small className={`badge ${
                                      leaveType.mode === 'Paid' ? 'bg-success' : 'bg-warning'
                                    }`}>
                                      {leaveType.mode}
                                    </small>
                                  </div>
                                  <div className="text-end">
                                    <div className="fw-bold">
                                      {leaveType.total_leaves - leaveType.taken_days} <small className="text-muted">/ {leaveType.total_leaves}</small>
                                    </div>
                                    <small className="text-muted">Available</small>
                                  </div>
                                </div>
                                <div className="progress mt-2" style={{ height: '8px' }}>
                                  <div 
                                    className={`progress-bar ${
                                      leaveType.mode === 'Paid' ? 'bg-primary' : 'bg-secondary'
                                    }`} 
                                    role="progressbar" 
                                    style={{ 
                                      width: `${(leaveType.taken_days / leaveType.total_leaves) * 100}%` 
                                    }}
                                    aria-valuenow={leaveType.taken_days}
                                    aria-valuemin="0"
                                    aria-valuemax={leaveType.total_leaves}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="alert alert-info">No leave balance data available</div>
                    )}
                  </div>

                  <div className="text-center">
                    <button className="btn btn-outline-primary btn-sm">
                      View Full Leave History
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading employee data...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplicationDetail;