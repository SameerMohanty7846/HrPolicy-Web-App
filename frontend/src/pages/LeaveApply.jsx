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

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState([]);
  const [noOfDays, setNoOfDays] = useState('');
  const [message, setMessage] = useState('');
  const [maxLimitExceeded, setMaxLimitExceeded] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [remainingBalance, setRemainingBalance] = useState(null);
  const [leaveMode, setLeaveMode] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setLeaveData(prev => ({
        ...prev,
        employee_id: storedUser.id,
        employee_name: storedUser.name,
      }));

      axios.get(`http://localhost:2000/api/employee/leave-summary/${storedUser.id}`)
        .then(res => setLeaveSummary(res.data.summary || []))
        .catch(err => console.error('Error fetching leave summary:', err));
    }

    axios.get('http://localhost:2000/api/leave/type-names')
      .then(res => setLeaveTypes(res.data))
      .catch(err => console.error('Error fetching leave types:', err));
  }, []);

  const calculateDays = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...leaveData, [name]: value };
    setLeaveData(updatedData);

    if (['leave_type', 'from_date', 'to_date'].includes(name)) {
      const { leave_type, from_date, to_date } = {
        ...updatedData,
        [name]: value
      };

      const selectedLeavePolicy = leaveTypes.find(lt => lt.leave_type === leave_type);
      const summaryEntry = leaveSummary.find(s => s.leave_type === leave_type);

      let remaining = null;
      let mode = null;

      if (summaryEntry) {
        remaining = summaryEntry.total_leaves - summaryEntry.taken_days;
        mode = summaryEntry.mode;
        setRemainingBalance({
          total: summaryEntry.total_leaves,
          taken: summaryEntry.taken_days,
          remaining
        });
      } else {
        setRemainingBalance(null);
      }

      setLeaveMode(mode);

      if (from_date && to_date && new Date(from_date) <= new Date(to_date)) {
        const days = calculateDays(from_date, to_date);
        setNoOfDays(days);

        if (selectedLeavePolicy && days > selectedLeavePolicy.max_per_request) {
          setMaxLimitExceeded(true);
        } else {
          setMaxLimitExceeded(false);
        }

        if (mode !== 'Free' && summaryEntry && days > remaining) {
          setInsufficientBalance(true);
        } else {
          setInsufficientBalance(false);
        }
      } else {
        setNoOfDays('');
        setMaxLimitExceeded(false);
        setInsufficientBalance(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const payload = { ...leaveData, no_of_days: noOfDays };
      const res = await axios.post('http://localhost:2000/api/leave/apply', payload);

      if (res.status === 201) {
        setMessage('✅ Your leave application has been successfully submitted!');
        setLeaveData({
          ...leaveData,
          leave_type: '',
          from_date: '',
          to_date: '',
          reason: ''
        });
        setNoOfDays('');
        setMaxLimitExceeded(false);
        setInsufficientBalance(false);
        setRemainingBalance(null);
      }
    } catch (error) {
      console.error('Leave submission error:', error);
      setMessage('❌ Failed to submit leave. Please try again.');
    }
  };

  const shouldShowSubmitButton = !maxLimitExceeded && (!insufficientBalance || leaveMode === 'Free');

  return (
    <div className="leave-bg py-5 px-3" style={{ minHeight: '100vh' }}>
      <div className="container">
        <div className="row g-4 justify-content-center align-items-start">
          {/* Left Column – Form */}
          <div className="col-md-6">
            <div className="glass-card p-4 rounded-4 shadow-lg">
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
                      {leaveTypes.map((leave, index) => (
                        <option key={index} value={leave.leave_type}>
                          {leave.leave_type}
                        </option>
                      ))}
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
                  <div className="text-center mb-2">
                    <div
                      className={`alert py-2 px-3 small mb-0 ${maxLimitExceeded ? 'alert-danger' : 'alert-info'}`}
                    >
                      📆 <strong>{noOfDays}</strong> day(s) applied
                      {maxLimitExceeded && (
                        <> – exceeds the allowed limit (
                          {
                            leaveTypes.find((lt) => lt.leave_type === leaveData.leave_type)?.max_per_request || 0
                          } day(s)).
                        </>
                      )}
                    </div>
                  </div>
                )}

                {remainingBalance && (
                  <div className="text-center mb-3">
                    <div className={`alert py-2 px-3 small mb-0 ${insufficientBalance && leaveMode !== 'Free' ? 'alert-danger' : 'alert-warning'}`}>
                      🟢 You have <strong>{remainingBalance.remaining}</strong> out of <strong>{remainingBalance.total}</strong> leave(s) remaining.
                    </div>
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

                {shouldShowSubmitButton && (
                  <button
                    type="submit"
                    className="btn btn-outline-light fw-bold w-100 rounded-3 small"
                  >
                    Submit Application
                  </button>
                )}

                {!shouldShowSubmitButton && (
                  <div className="text-center mt-3">
                    <div className="alert alert-danger small py-2 px-3 mb-0">
                      ❌ You cannot apply for this leave. Either it exceeds the allowed per-request limit or your remaining balance is insufficient.
                    </div>
                  </div>
                )}

                {message && (
                  <div className="text-center mt-3">
                    <div className={`alert small py-2 px-3 mb-0 ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'}`}>
                      {message}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Column – Static Info */}
          <div className="col-md-6">
            <div className="glass-card text-white p-4 rounded-4 shadow-lg">
              <h5 className="fw-semibold mb-3">📋 Leave Types & Limits</h5>
              {leaveTypes.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {leaveTypes.map((lt, idx) => (
                    <li key={idx} className="list-group-item bg-transparent text-white d-flex justify-content-between small">
                      <span>{lt.leave_type}</span>
                      <span>{lt.max_per_request} day(s)</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="small">Loading leave types...</p>
              )}
            </div>
          </div>
        </div>
      </div>

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
        .form-control:focus, .form-select:focus {
          box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </div>
  );
};

export default LeaveApply;
