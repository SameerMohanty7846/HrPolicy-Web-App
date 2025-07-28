import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const HrLeavePolicy = () => {
  const [leaveType, setLeaveType] = useState('');
  const [allowedDays, setAllowedDays] = useState('');
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const BASE_URL = 'http://localhost:2000/api'; // Adjust port if needed

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
    if (!leaveType || !allowedDays) {
      return alert('⚠️ Please fill in both fields.');
    }
    if (parseInt(allowedDays) <= 0) {
      return alert('⚠️ Allowed days must be greater than 0.');
    }

    try {
      setSubmitting(true);
      await axios.post(`${BASE_URL}/hr-leave-policy`, {
        leave_type: leaveType,
        allowed_days: parseInt(allowedDays),
      });
      setLeaveType('');
      setAllowedDays('');
      fetchPolicies();
    } catch (error) {
      console.error('Error submitting policy:', error);
      alert('❌ Failed to submit leave policy.');
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
              <div className="col-md-6">
                <label className="form-label">Leave Type</label>
                <input
                  type="text"
                  className="form-control"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  placeholder="e.g., Sick Leave (SL)"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Allowed Days</label>
                <input
                  type="number"
                  className="form-control"
                  value={allowedDays}
                  onChange={(e) => setAllowedDays(e.target.value)}
                  placeholder="e.g., 12"
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
                    <th>Allowed Days</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.length > 0 ? (
                    policies.map((policy, index) => (
                      <tr key={policy.id}>
                        <td>{index + 1}</td>
                        <td>{policy.leave_type}</td>
                        <td>{policy.allowed_days}</td>
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
                      <td colSpan="4" className="text-center text-muted">
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
