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
  const [totalLeaves, setTotalLeaves] = useState(0); // New state for leaves count
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!monthYear || !id) return;

    axios
      .get(`http://localhost:2000/api/attendance/${id}?monthYear=${monthYear}`)
      .then((res) => {
        setAttendance(res.data.attendance_data);
        setTotalWorkDays(res.data.total_work_days || 0);
        
        // Calculate total leaves by counting work_day = 0
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

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">Employee Attendance Report</h2>
        </div>
        <div className="card-body">
          <div className="mb-4">
            <div className="row">
              <div className="col-md-6">
                <p><strong>Employee ID:</strong> {id}</p>
                {empName && <p><strong>Employee Name:</strong> {empName}</p>}
              </div>
              <div className="col-md-6">
                <p><strong>Month:</strong> {formatMonthYear(monthYear)}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading attendance data...</p>
            </div>
          ) : attendance.length === 0 ? (
            <div className="alert alert-warning">
              <strong>No attendance data found for this period</strong>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead className="thead-dark">
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Work Day</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((entry) => (
                      <tr key={entry.id}>
                        <td>{new Date(entry.date).toLocaleDateString()}</td>
                        <td>{entry.check_in || '—'}</td>
                        <td>{entry.check_out || '—'}</td>
                        <td>
                          <span className={`badge ${entry.work_day ? 'bg-success' : 'bg-secondary'}`}>
                            {entry.work_day ? 'Yes' : 'No'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 p-3 bg-light rounded">
                <div className="row">
                  <div className="col-md-6">
                    <h5 className="mb-0">
                      <strong>Total Work Days:</strong> <span className="badge bg-success ms-2">{totalWorkDays}</span>
                    </h5>
                  </div>
                  <div className="col-md-6">
                    <h5 className="mb-0">
                      <strong>Total Leaves:</strong> <span className="badge bg-danger ms-2">{totalLeaves}</span>
                    </h5>
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