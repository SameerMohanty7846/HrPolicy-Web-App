import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const LeaveApply = () => {
  const [leaveData, setLeaveData] = useState({
    employee_id: '',
    employee_name: '',
    leave_type: '',
    from_date: '',
    to_date: '',
    reason: '',
  });

  const [leaveStats, setLeaveStats] = useState({
    total_leaves_taken: 0,
    total_leaves_present: 0,
  });

  const [noOfDays, setNoOfDays] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setLeaveData(prev => ({
        ...prev,
        employee_id: storedUser.id,
        employee_name: storedUser.name,
      }));

      axios.get(`http://localhost:2000/api/summary/${storedUser.id}`)
        .then((res) => {
          const data = res.data;
          setLeaveStats({
            total_leaves_taken: data.total_leaves_taken,
            total_leaves_present: data.total_leaves_present,
          });
        })
        .catch((err) => {
          console.error("Failed to fetch leave summary:", err);
        });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeaveData({ ...leaveData, [name]: value });

    if (name === 'to_date' || name === 'from_date') {
      const from = name === 'from_date' ? new Date(value) : new Date(leaveData.from_date);
      const to = name === 'to_date' ? new Date(value) : new Date(leaveData.to_date);
      if (from && to && from <= to) {
        const diff = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
        setNoOfDays(diff);
      } else {
        setNoOfDays('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await axios.post('http://localhost:2000/api/leave/apply', leaveData);

      if (res.status === 201) {
        setMessage('✅ Leave submitted successfully!');
        setLeaveData({ ...leaveData, leave_type: '', from_date: '', to_date: '', reason: '' });
        setNoOfDays('');
      }
    } catch (error) {
      console.error('Leave submission error:', error);
      setMessage('❌ Failed to submit leave. Please try again.');
    }
  };

  return (
    <div className="leave-bg d-flex flex-column align-items-center justify-content-center px-3" style={{ minHeight: '100vh' }}>
      <div className="glass-card p-4 rounded-4 w-100 shadow-lg" style={{ maxWidth: '460px' }}>
        <h4 className="text-center text-white mb-4 fw-semibold">Apply for Leave</h4>
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="employee_name" value={leaveData.employee_name} />

          <div className="d-flex gap-2 mb-3">
            <div className="w-50">
              <label className="form-label text-white small">Employee ID</label>
              <input
                type="text"
                name="employee_id"
                value={leaveData.employee_id}
                readOnly
                className="form-control rounded-3 border-0 bg-light small"
              />
            </div>
            <div className="w-50">
              <label className="form-label text-white small">Leave Type</label>
              <select
                name="leave_type"
                value={leaveData.leave_type}
                onChange={handleChange}
                className="form-select rounded-3 border-0 small"
                required
              >
                <option value="">-- Select --</option>
                <option value="EL">Earned Leave</option>
                <option value="CL">Casual Leave</option>
                <option value="SL">Sick Leave</option>
                <option value="LWP">Leave Without Pay</option>
              </select>
            </div>
          </div>

          <div className="d-flex gap-2 mb-3">
            <div className="w-50">
              <label className="form-label text-white small">From</label>
              <input
                type="date"
                name="from_date"
                value={leaveData.from_date}
                onChange={handleChange}
                className="form-control rounded-3 border-0 small"
                required
              />
            </div>
            <div className="w-50">
              <label className="form-label text-white small">To</label>
              <input
                type="date"
                name="to_date"
                value={leaveData.to_date}
                onChange={handleChange}
                className="form-control rounded-3 border-0 small"
                required
              />
            </div>
          </div>

          {noOfDays && (
            <div className="text-success small mb-3 text-center">
              Days Applied: <strong>{noOfDays}</strong>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label text-white small">Reason</label>
            <textarea
              name="reason"
              value={leaveData.reason}
              onChange={handleChange}
              className="form-control rounded-3 border-0 small"
              rows="2"
              required
            />
          </div>

          <button type="submit" className="btn btn-outline-light fw-bold w-100 rounded-3 small">
            Submit Application
          </button>

          {message && (
            <div className={`text-center mt-3 small fw-semibold ${message.startsWith('✅') ? 'text-success' : 'text-danger'}`}>
              {message}
            </div>
          )}
        </form>
      </div>

      {/* Summary Cards */}
      <div className="text-white text-center mt-5 d-flex justify-content-center gap-4 flex-wrap">
        <div className="summary-card bg-gradient-green text-white rounded-4 py-3 px-4 shadow">
          <div className="small text-uppercase mb-1">Total Leaves Present</div>
          <h5 className="fw-bold mb-0">{leaveStats.total_leaves_present}</h5>
        </div>
        <div className="summary-card bg-gradient-yellow text-dark rounded-4 py-3 px-4 shadow">
          <div className="small text-uppercase mb-1">Total Leaves Taken</div>
          <h5 className="fw-bold mb-0">{leaveStats.total_leaves_taken}</h5>
        </div>
      </div>

      {/* Styling */}
      <style>{`
        .leave-bg {
          background: linear-gradient(to right, #141e30, #243b55);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .small {
          font-size: 0.84rem;
        }
        .summary-card {
          min-width: 180px;
          transition: transform 0.3s;
        }
        .summary-card:hover {
          transform: scale(1.05);
        }
        .bg-gradient-green {
          background: linear-gradient(to right, #56ab2f, #a8e063);
        }
        .bg-gradient-yellow {
          background: linear-gradient(to right, #f7971e, #ffd200);
        }
        .form-control:focus, .form-select:focus {
          box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
        }
        button:focus {
          box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </div>
  );
};

export default LeaveApply;
