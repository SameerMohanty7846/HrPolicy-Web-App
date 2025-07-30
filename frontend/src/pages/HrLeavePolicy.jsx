import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const HrLeavePolicy = () => {
  const [leaveType, setLeaveType] = useState('');
  const [mode, setMode] = useState('');
  const [frequency, setFrequency] = useState('');
  const [totalLeaves, setTotalLeaves] = useState('');
  const [maxPerRequest, setMaxPerRequest] = useState('');
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const BASE_URL = 'http://localhost:2000/api';

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/hr-leave-policy`);
      setPolicies(res.data);
    } catch (error) {
      console.error('Error fetching policies:', error);
      alert('❌ Failed to fetch leave policies.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!leaveType || !mode || !frequency || !totalLeaves || !maxPerRequest) {
      return alert('⚠️ Please fill in all fields.');
    }

    const numericFields = [totalLeaves, maxPerRequest];
    if (numericFields.some(num => parseInt(num) <= 0)) {
      return alert('⚠️ Numeric fields must be greater than 0.');
    }

    try {
      setSubmitting(true);
      await axios.post(`${BASE_URL}/hr-leave-policy`, {
        leave_type: leaveType,
        mode,
        frequency,
        total_leaves: parseInt(totalLeaves),
        max_per_request: parseInt(maxPerRequest),
      });

      // Reset form
      setLeaveType('');
      setMode('');
      setFrequency('');
      setTotalLeaves('');
      setMaxPerRequest('');
      fetchPolicies();
    } catch (error) {
      console.error('Error submitting policy:', error);
      alert(error?.response?.data?.error || '❌ Failed to submit leave policy.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;

    try {
      await axios.delete(`${BASE_URL}/hr-leave-policy/${id}`);
      fetchPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
      alert('❌ Failed to delete leave policy.');
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white text-center">
          <h4>📋 HR Leave Policy Management</h4>
        </div>
        <div className="card-body">
          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Leave Type</label>
                <input
                  type="text"
                  className="form-control"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  placeholder="e.g., Sick Leave"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Mode</label>
                <select
                  className="form-select"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                >
                  <option value="">-- Select Mode --</option>
                  <option value="Paid">Paid</option>
                  <option value="Free">Free</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Frequency</label>
                <select
                  className="form-select"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="">-- Select Frequency --</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Total Leaves</label>
                <input
                  type="number"
                  className="form-control"
                  value={totalLeaves}
                  onChange={(e) => setTotalLeaves(e.target.value)}
                  placeholder="e.g., 30"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Max Leaves per Request</label>
                <input
                  type="number"
                  className="form-control"
                  value={maxPerRequest}
                  onChange={(e) => setMaxPerRequest(e.target.value)}
                  placeholder="e.g., 5"
                />
              </div>
            </div>
            <div className="text-end mt-3">
              <button
                type="submit"
                className="btn btn-success px-4"
                disabled={submitting}
              >
                ➕ {submitting ? 'Adding...' : 'Add Policy'}
              </button>
            </div>
          </form>

          {/* Table */}
          <h5 className="mt-4 mb-3">📑 Existing Leave Policies</h5>
          {loading ? (
            <div className="text-center my-3">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Leave Type</th>
                    <th>Mode</th>
                    <th>Frequency</th>
                    <th>Total Leaves</th>
                    <th>Max/Request</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.length > 0 ? (
                    policies.map((policy, index) => (
                      <tr key={policy.id}>
                        <td>{index + 1}</td>
                        <td>{policy.leave_type}</td>
                        <td>{policy.mode}</td>
                        <td>{policy.frequency}</td>
                        <td>{policy.total_leaves}</td>
                        <td>{policy.max_per_request}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(policy.id)}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">
                        No leave policies found.
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

export default HrLeavePolicy;
