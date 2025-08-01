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
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const leaveResponse = await axios.get(
          `http://localhost:2000/api/leave/applications/${applicationId}`
        );
        setLeaveData(leaveResponse.data);

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
      month: 'short',
      day: 'numeric'
    });
  };

  const updateLeaveStatus = async (status) => {
    setActionLoading(true);
    try {
      await axios.patch(
        `http://localhost:2000/api/leave/applications/${applicationId}/status`,
        { status }
      );
      
      // Update local state to reflect the change
      setLeaveData(prev => ({
        ...prev,
        status
      }));
      
      // Refresh employee summary if leave was approved
      if (status === 'Approved' && leaveData?.employee_id) {
        const employeeResponse = await axios.get(
          `http://localhost:2000/api/employee/leave-summary/${leaveData.employee_id}`
        );
        setEmployeeSummary(employeeResponse.data);
      }
      
      alert(`Leave application ${status.toLowerCase()} successfully`);
    } catch (err) {
      console.error(`Error ${status.toLowerCase()}ing leave:`, err);
      alert(err.response?.data?.error || `Failed to ${status.toLowerCase()} leave`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = () => {
    if (window.confirm('Are you sure you want to approve this leave application?')) {
      updateLeaveStatus('Approved');
    }
  };

  const handleReject = () => {
    if (window.confirm('Are you sure you want to reject this leave application?')) {
      updateLeaveStatus('Rejected');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100px' }}>
        <div className="spinner-border text-primary" style={{ width: '1.5rem', height: '1.5rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-3">
        <div className="alert alert-danger py-2">
          Error loading data: {error}
        </div>
      </div>
    );
  }

  if (!leaveData) {
    return (
      <div className="container mt-3">
        <div className="alert alert-warning py-2">
          No leave application data found
        </div>
      </div>
    );
  }

  return (
    <div className="container py-2" style={{ maxWidth: '1200px' }}>
      <button 
        onClick={() => navigate(-1)}
        className="btn btn-outline-secondary btn-sm mb-2"
      >
        <i className="bi bi-arrow-left me-1"></i>Back
      </button>

      <div className="card shadow-sm mb-3">
        <div className="card-header bg-primary text-white py-2">
          <h5 className="mb-0">Leave Application Details</h5>
          <small className="text-white-50">ID: {leaveData.application_id}</small>
        </div>
      </div>

      <div className="row">
        <div className="col-md-7 mb-3">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-light py-2">
              <h5 className="mb-0">Leave Request</h5>
            </div>
            <div className="card-body p-3">
              <div className="row mb-2">
                <div className="col-6">
                  <h6 className="small text-muted mb-1">Leave Type</h6>
                  <p className="mb-0">{leaveData.leave_type || 'N/A'}</p>
                </div>
                <div className="col-6">
                  <h6 className="small text-muted mb-1">Status</h6>
                  <span className={`badge ${leaveData.status === 'Approved' ? 'bg-success' : 
                                   leaveData.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'} 
                                  px-2 py-1`}>
                    {leaveData.status || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-6">
                  <h6 className="small text-muted mb-1">From Date</h6>
                  <p className="mb-0">{formatDate(leaveData.from_date)}</p>
                </div>
                <div className="col-6">
                  <h6 className="small text-muted mb-1">To Date</h6>
                  <p className="mb-0">{formatDate(leaveData.to_date)}</p>
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-6">
                  <h6 className="small text-muted mb-1">Total Days</h6>
                  <p className="mb-0">{leaveData.no_of_days || 0} day{leaveData.no_of_days !== 1 ? 's' : ''}</p>
                </div>
                <div className="col-6">
                  <h6 className="small text-muted mb-1">Applied On</h6>
                  <p className="mb-0">{formatDate(leaveData.applied_date)}</p>
                </div>
              </div>

              <div className="mb-2">
                <h6 className="small text-muted mb-1">Reason</h6>
                <div className="p-2 bg-light rounded">
                  <p className="mb-0 small">{leaveData.reason || 'No reason provided'}</p>
                </div>
              </div>

              {leaveData.status === 'Pending' && (
                <div className="d-flex gap-2 mt-3">
                  <button 
                    onClick={handleApprove}
                    className="btn btn-success btn-sm flex-grow-1 py-1"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="bi bi-check-circle me-1"></i>
                    )}
                    Approve
                  </button>
                  <button 
                    onClick={handleReject}
                    className="btn btn-danger btn-sm flex-grow-1 py-1"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="bi bi-x-circle me-1"></i>
                    )}
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-5">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-light py-2">
              <h5 className="mb-0">Employee Summary</h5>
            </div>
            <div className="card-body p-3">
              {employeeSummary ? (
                <>
                  <div className="text-center mb-3">
                    <div className="bg-secondary rounded-circle text-white d-inline-flex align-items-center justify-content-center" 
                         style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                      {leaveData.employee_name?.charAt(0) || '?'}
                    </div>
                    <h5 className="mt-2 mb-0" style={{ fontSize: '1rem' }}>{leaveData.employee_name || 'Unknown'}</h5>
                    <p className="text-muted small mb-2">ID: {leaveData.employee_id || 'N/A'}</p>
                  </div>

                  <div className="mb-3">
                    <h6 className="mb-2">Leave Balance</h6>
                    {employeeSummary.summary?.length > 0 ? (
                      <div className="row g-2">
                        {employeeSummary.summary.map((leaveType, index) => (
                          <div key={index} className="col-12">
                            <div className="card border-0 shadow-none bg-transparent">
                              <div className="card-body p-2">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <p className="mb-0 small">{leaveType.leave_type}</p>
                                    <small className={`badge ${
                                      leaveType.mode === 'Paid' ? 'bg-success' : 'bg-warning'
                                    }`}>
                                      {leaveType.mode}
                                    </small>
                                  </div>
                                  <div className="text-end">
                                    <div className="small fw-bold">
                                      {leaveType.total_leaves - leaveType.taken_days} <small className="text-muted">/ {leaveType.total_leaves}</small>
                                    </div>
                                  </div>
                                </div>
                                <div className="progress mt-1" style={{ height: '5px' }}>
                                  <div 
                                    className={`progress-bar ${
                                      leaveType.mode === 'Paid' ? 'bg-primary' : 'bg-secondary'
                                    }`} 
                                    role="progressbar" 
                                    style={{ 
                                      width: `${(leaveType.taken_days / leaveType.total_leaves) * 100}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="alert alert-info py-1 small">No leave balance data</div>
                    )}
                  </div>

                  <div className="text-center">
                    <button className="btn btn-outline-primary btn-sm py-0 px-2">
                      View History
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-2">
                  <div className="spinner-border text-primary" style={{ width: '1.5rem', height: '1.5rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-1 small">Loading employee data...</p>
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