import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const EmployeeLeaveDashboard = () => {
  const [summary, setSummary] = useState([]);
  const [employeeName, setEmployeeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const navigate = useNavigate();

  const [paidStats, setPaidStats] = useState({ taken: 0, present: 0 });
  const [freeStats, setFreeStats] = useState({ taken: 0, present: 0 });

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));

    if (!storedUser) {
      alert('Session expired. Please login again.');
      navigate('/login');
      return;
    }

    setEmployeeName(storedUser.name);

    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:2000/api/employee/leave-summary/${storedUser.id}`
        );
        const leaveSummary = response.data.summary || [];

        // Calculate totals
        let paidTaken = 0,
          paidTotal = 0,
          freeTaken = 0,
          freeTotal = 0;

        leaveSummary.forEach((item) => {
          if (item.mode === 'Paid') {
            paidTaken += item.taken_days;
            paidTotal += item.total_leaves;
          } else if (item.mode === 'Free') {
            freeTaken += item.taken_days;
            freeTotal += item.total_leaves;
          }
        });

        setPaidStats({ taken: paidTaken, present: paidTotal });
        setFreeStats({ taken: freeTaken, present: freeTotal });
        setSummary(leaveSummary);
      } catch (error) {
        console.error('Error fetching leave summary:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLeaveApplications = async () => {
      try {
        setLoadingApplications(true);
        const response = await axios.get(
          `http://localhost:2000/api/employee/leave-applications/${storedUser.id}`
        );
        setLeaveApplications(response.data || []);
      } catch (error) {
        console.error('Error fetching leave applications:', error);
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchSummary();
    fetchLeaveApplications();
  }, [navigate]);

  // Calculate remaining leaves for progress bars
  const paidRemaining = paidStats.present - paidStats.taken;
  const freeRemaining = freeStats.present - freeStats.taken;

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get badge color based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body p-4">
          <h2 className="mb-0 text-primary fw-bold">
            <i className="bi bi-calendar-check me-2"></i>
            Leave Summary for {employeeName}
          </h2>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4 g-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100 border-start border-4 border-success">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title text-success mb-0">
                  <i className="bi bi-currency-dollar me-2"></i>Paid Leave Summary
                </h5>
                <span className="badge bg-success bg-opacity-10 text-success fs-6">
                  {paidStats.taken}/{paidStats.present} days
                </span>
              </div>
              
              <div className="progress mb-3" style={{ height: '10px' }}>
                <div 
                  className="progress-bar bg-success" 
                  role="progressbar" 
                  style={{ width: `${(paidStats.taken/paidStats.present)*100}%` }}
                  aria-valuenow={paidStats.taken} 
                  aria-valuemin="0" 
                  aria-valuemax={paidStats.present}
                ></div>
              </div>
              
              <div className="row">
                <div className="col-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-success bg-opacity-10 p-2 rounded me-3">
                      <i className="bi bi-check-circle-fill text-success"></i>
                    </div>
                    <div>
                      <p className="mb-0 text-muted small">Taken</p>
                      <h5 className="mb-0">{paidStats.taken}</h5>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                      <i className="bi bi-calendar-plus-fill text-primary"></i>
                    </div>
                    <div>
                      <p className="mb-0 text-muted small">Remaining</p>
                      <h5 className="mb-0">{paidRemaining}</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100 border-start border-4 border-warning">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title text-warning mb-0">
                  <i className="bi bi-gift me-2"></i>Free Leave Summary
                </h5>
                <span className="badge bg-warning bg-opacity-10 text-warning fs-6">
                  {freeStats.taken}/{freeStats.present} days
                </span>
              </div>
              
              <div className="progress mb-3" style={{ height: '10px' }}>
                <div 
                  className="progress-bar bg-warning" 
                  role="progressbar" 
                  style={{ width: `${(freeStats.taken/freeStats.present)*100}%` }}
                  aria-valuenow={freeStats.taken} 
                  aria-valuemin="0" 
                  aria-valuemax={freeStats.present}
                ></div>
              </div>
              
              <div className="row">
                <div className="col-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-warning bg-opacity-10 p-2 rounded me-3">
                      <i className="bi bi-check-circle-fill text-warning"></i>
                    </div>
                    <div>
                      <p className="mb-0 text-muted small">Taken</p>
                      <h5 className="mb-0">{freeStats.taken}</h5>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center">
                    <div className="bg-info bg-opacity-10 p-2 rounded me-3">
                      <i className="bi bi-calendar-plus-fill text-info"></i>
                    </div>
                    <div>
                      <p className="mb-0 text-muted small">Remaining</p>
                      <h5 className="mb-0">{freeRemaining}</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Leave Type Cards */}
      <div className="row g-4 mb-5">
        {summary.map((item, index) => {
          const remaining = item.total_leaves - item.taken_days;
          const percentageUsed = (item.taken_days / item.total_leaves) * 100;
          
          return (
            <div className="col-md-6 col-lg-4" key={index}>
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0 text-primary">
                      {item.leave_type}
                    </h5>
                    <span className={`badge bg-${item.mode === 'Paid' ? 'success' : 'warning'}-subtle text-${item.mode === 'Paid' ? 'success' : 'warning'}`}>
                      {item.mode}
                    </span>
                  </div>
                  
                  <div className="progress mb-3" style={{ height: '6px' }}>
                    <div 
                      className={`progress-bar bg-${item.mode === 'Paid' ? 'success' : 'warning'}`} 
                      role="progressbar" 
                      style={{ width: `${percentageUsed}%` }}
                    ></div>
                  </div>
                  
                  <div className="row">
                    <div className="col-6 mb-3">
                      <div className="p-3 bg-light rounded">
                        <p className="mb-1 small text-muted">Total</p>
                        <h5 className="mb-0">{item.total_leaves}</h5>
                      </div>
                    </div>
                    <div className="col-6 mb-3">
                      <div className="p-3 bg-light rounded">
                        <p className="mb-1 small text-muted">Taken</p>
                        <h5 className="mb-0">{item.taken_days}</h5>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="p-3 bg-primary bg-opacity-10 rounded">
                        <p className="mb-1 small text-muted">Remaining</p>
                        <h4 className="mb-0 text-primary">{remaining}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {summary.length === 0 && !loading && (
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3 text-muted">No leave summary found</h5>
              </div>
            </div>
          </div>
        )}
        
        {loading && (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading your leave summary...</p>
          </div>
        )}
      </div>

      {/* Leave Applications Table */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-0 pt-4 pb-3">
          <h4 className="mb-0 text-primary">
            <i className="bi bi-list-check me-2"></i>
            My Leave Applications
          </h4>
        </div>
        <div className="card-body px-0 pb-4">
          {loadingApplications ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading your leave applications...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="bg-light">
                  <tr>
                    <th scope="col" className="ps-4">Application ID</th>
                    <th scope="col">Leave Type</th>
                    <th scope="col">Dates</th>
                    <th scope="col">Days</th>
                    <th scope="col">Reason</th>
                    <th scope="col">Applied On</th>
                    <th scope="col" className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveApplications.length > 0 ? (
                    leaveApplications.map((application) => (
                      <tr key={application.application_id}>
                        <td className="ps-4 fw-medium">{application.application_id}</td>
                        <td>{application.leave_type}</td>
                        <td>
                          {formatDate(application.from_date)} - {formatDate(application.to_date)}
                        </td>
                        <td>{application.no_of_days}</td>
                        <td className="text-truncate" style={{ maxWidth: '200px' }} title={application.reason}>
                          {application.reason}
                        </td>
                        <td>{formatDate(application.applied_date)}</td>
                        <td className="text-center">
                          <span className={`badge bg-${getStatusBadge(application.status)} rounded-pill px-3 py-2`}>
                            {application.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <i className="bi bi-inbox" style={{ fontSize: '2rem' }}></i>
                        <p className="mt-3">No leave applications found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeaveDashboard;