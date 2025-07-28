import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const LeaveApply = () => {
  const [leaveData, setLeaveData] = useState({
    employee_id: '',
    leave_type: '',
    from_date: '',
    to_date: '',
    reason: '',
  });

  const [leaveStats] = useState({
    EL: 6,
    CL: 4,
    SL: 3,
    total_taken: 13,
    total_present: 34,
  });

  const [noOfDays, setNoOfDays] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setLeaveData(prev => ({
        ...prev,
        employee_id: storedUser.id,
      }));
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
    <div className="leave-bg px-3 pt-3" style={{ height: '100vh' }}>
      {/* Circles */}
      <div className="text-white text-center mb-3">
        <h6 className="fw-bold mb-3">Leave Balance</h6>
        <div className="d-flex justify-content-center flex-wrap gap-4">
          {['EL', 'CL', 'SL'].map((type) => (
            <div key={type} style={circleStyle}>
              <div style={{ fontSize: '1rem', fontWeight: '600' }}>{type}</div>
              <div style={{ fontSize: '26px', fontWeight: 'bold' }}>{leaveStats[type]}</div>
              <div style={{ fontSize: '0.85rem' }}>Remaining</div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Form */}
      <div className="glass-card mx-auto p-3 rounded-4" style={{ maxWidth: '460px' }}>
        <h6 className="text-center text-white mb-3 fw-bold">Apply Leave</h6>
        <form onSubmit={handleSubmit}>
          <div className="d-flex gap-2 mb-2">
            <div className="w-50">
              <label className="form-label text-white small">Employee ID</label>
              <input
                type="text"
                name="employee_id"
                value={leaveData.employee_id}
                readOnly
                className="form-control rounded-3 border-0 small bg-light"
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
              </select>
            </div>
          </div>

          <div className="d-flex gap-2 mb-2">
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
            <div className="text-success small mb-2">
              Days: <strong>{noOfDays}</strong>
            </div>
          )}

          <div className="mb-2">
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

          <button type="submit" className="btn btn-light fw-bold w-100 rounded-3 small">
            Submit
          </button>

          {message && (
            <div className={`text-center mt-2 small fw-semibold ${message.startsWith('✅') ? 'text-success' : 'text-danger'}`}>
              {message}
            </div>
          )}
        </form>
      </div>

      {/* Summary */}
      <div className="text-white text-center mt-3 d-flex justify-content-center gap-3 flex-wrap">
        <div className="bg-light text-dark rounded-3 py-1 px-3 shadow-sm">
          <strong>Taken:</strong> {leaveStats.total_taken}
        </div>
        <div className="bg-light text-dark rounded-3 py-1 px-3 shadow-sm">
          <strong>Total:</strong> {leaveStats.total_present}
        </div>
      </div>

      {/* Internal CSS */}
      <style>{`
        .leave-bg {
          background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .small {
          font-size: 0.83rem;
        }
      `}</style>
    </div>
  );
};

const circleStyle = {
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  backgroundColor: 'rgba(255,255,255,0.15)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
  color: '#fff',
  fontSize: '15px',
};

export default LeaveApply;
