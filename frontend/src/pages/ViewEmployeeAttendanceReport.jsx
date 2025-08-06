import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewEmployeeAttendanceReport = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const monthYear = searchParams.get('monthYear');

  const [attendance, setAttendance] = useState([]);
  const [empName, setEmpName] = useState('');
  const [totalWorkDays, setTotalWorkDays] = useState(0);
  const [totalLeaves, setTotalLeaves] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!monthYear || !id) return;

    axios
      .get(`http://localhost:2000/api/attendance/${id}?monthYear=${monthYear}`)
      .then((res) => {
        setAttendance(res.data.attendance_data);
        setTotalWorkDays(res.data.total_work_days || 0);
        const leavesCount = res.data.attendance_data.filter(entry => entry.work_day === 0).length;
        setTotalLeaves(leavesCount);
        if (res.data.attendance_data.length > 0) {
          setEmpName(res.data.attendance_data[0].emp_name);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching attendance data:', err);
        setLoading(false);
      });
  }, [id, monthYear]);

  const formatMonthYear = (monthYear) => {
    if (!monthYear) return '';
    const [month, year] = monthYear.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <div>
            <button 
              onClick={handleGoBack}
              className="btn btn-light btn-sm me-3"
            >
              <span className="me-1">←</span> Back
            </button>
            <h2 className="mb-0 d-inline-block">Employee Attendance Report</h2>
          </div>
          <span className="badge bg-light text-primary fs-6">
            {formatMonthYear(monthYear)}
          </span>
        </div>
        
        <div className="card-body">
          <div className="mb-4">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-2">
                  <span className="fw-bold me-2">Employee ID:</span>
                  <span className="badge bg-secondary">{id}</span>
                </div>
                {empName && (
                  <div className="d-flex align-items-center">
                    <span className="fw-bold me-2">Employee Name:</span>
                    <span className="text-primary fw-semibold">{empName}</span>
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-center">
                  <span className="fw-bold me-2">Period:</span>
                  <span className="text-primary">{formatMonthYear(monthYear)}</span>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 fs-5">Loading attendance data...</p>
            </div>
          ) : attendance.length === 0 ? (
            <div className="alert alert-warning text-center py-4">
              <h5 className="mb-0">
                <span className="me-2">⚠️</span>
                No attendance data found for this period
              </h5>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th className="text-center">Date</th>
                      <th className="text-center">Check In</th>
                      <th className="text-center">Check Out</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((entry) => (
                      <tr key={entry.id} className={entry.work_day ? '' : 'table-warning'}>
                        <td className="text-center">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="text-center">{entry.check_in || <span className="text-muted">—</span>}</td>
                        <td className="text-center">{entry.check_out || <span className="text-muted">—</span>}</td>
                        <td className="text-center">
                          <span className={`badge rounded-pill ${entry.work_day ? 'bg-success' : 'bg-danger'}`}>
                            {entry.work_day ? 'Present' : 'Leave'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="row mt-4 g-3">
                <div className="col-md-6">
                  <div className="card bg-light border-0 h-100">
                    <div className="card-body text-center">
                      <h5 className="card-title text-muted">Work Days</h5>
                      <div className="display-4 text-success fw-bold">{totalWorkDays}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-light border-0 h-100">
                    <div className="card-body text-center">
                      <h5 className="card-title text-muted">Leaves Taken</h5>
                      <div className="display-4 text-danger fw-bold">{totalLeaves}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeAttendanceReport;