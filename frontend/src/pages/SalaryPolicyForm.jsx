import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SalaryPolicyForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'earning',
    value_type: 'flat',
    based_on: ''
  });

  const [components, setComponents] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      type: formData.type,
      value_type: formData.value_type,
      based_on: formData.value_type === 'percentage' ? formData.based_on : null
    };

    try {
      await axios.post('http://localhost:2000/api/salary-components/create', payload);
      fetchComponents();
      setFormData({
        name: '',
        type: 'earning',
        value_type: 'flat',
        based_on: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const fetchComponents = async () => {
    try {
      const response = await axios.get('http://localhost:2000/api/salary-components/list')
      setComponents(response.data);
    } catch (error) {
      console.error('Error fetching components:', error);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">Salary Component Policy</h3>
        </div>
        
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h4 className="mb-0">Add New Component</h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Component Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Type</label>
                        <select
                          className="form-select"
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                        >
                          <option value="earning">Earning</option>
                          <option value="deduction">Deduction</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Value Type</label>
                        <select
                          className="form-select"
                          name="value_type"
                          value={formData.value_type}
                          onChange={handleChange}
                        >
                          <option value="flat">Flat</option>
                          <option value="percentage">Percentage</option>
                        </select>
                      </div>
                    </div>

                    {formData.value_type === 'percentage' && (
                      <div className="mb-3">
                        <label className="form-label fw-bold">Based On</label>
                        <input
                          type="text"
                          className="form-control"
                          name="based_on"
                          value={formData.based_on}
                          onChange={handleChange}
                          required
                          placeholder="Eg: Basic Salary"
                        />
                      </div>
                    )}

                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-plus-circle me-2"></i>Add Component
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-light">
                  <h4 className="mb-0">Existing Components</h4>
                </div>
                <div className="card-body">
                  {components.length === 0 ? (
                    <div className="alert alert-info mb-0">No salary components found. Please add some.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Value Type</th>
                            <th>Based On</th>
                          </tr>
                        </thead>
                        <tbody>
                          {components.map((comp) => (
                            <tr key={comp.id}>
                              <td>{comp.id}</td>
                              <td>{comp.name}</td>
                              <td>
                                <span className={`badge ${comp.type === 'earning' ? 'bg-success' : 'bg-danger'}`}>
                                  {comp.type}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-info text-dark">
                                  {comp.value_type}
                                </span>
                              </td>
                              <td>{comp.based_on || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryPolicyForm;