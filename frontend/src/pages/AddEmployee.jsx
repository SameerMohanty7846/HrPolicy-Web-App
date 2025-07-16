import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    salary: '',
    dateOfJoining: '',
    employeeType: 'Fresher',
    experience: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'employeeType') {
      const experienceValue = value === 'Fresher' ? 0 : formData.experience;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
        experience: experienceValue
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:2000/api/hr/insertemployee', formData);

      if (response.status === 200) {
        alert('Employee added successfully!');
        setFormData({
          name: '',
          email: '',
          phone: '',
          salary: '',
          dateOfJoining: '',
          employeeType: 'Fresher',
          experience: 0
        });
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee');
    }
  };

  return (
    <div className="add-employee-bg py-4 px-3" style={{ minHeight: '100vh', overflowY: 'auto' }}>
      <div className="glass-card mx-auto p-3 rounded-4" style={{ maxWidth: '380px' }}>
        <h5 className="text-center mb-3 text-white fw-bold" style={{ fontSize: '1.2rem' }}>Add Employee</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label text-white small">Name</label>
            <input
              type="text"
              className="form-control rounded-3 border-0 small"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label text-white small">Email</label>
            <input
              type="email"
              className="form-control rounded-3 border-0 small"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label text-white small">Phone</label>
            <input
              type="tel"
              className="form-control rounded-3 border-0 small"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label text-white small">Salary</label>
            <input
              type="number"
              className="form-control rounded-3 border-0 small"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label text-white small">Date of Joining</label>
            <input
              type="date"
              className="form-control rounded-3 border-0 small"
              name="dateOfJoining"
              value={formData.dateOfJoining}
              onChange={handleChange}
              required
            />
          </div>

          {/* Employee Type Dropdown */}
          <div className="mb-2">
            <label className="form-label text-white small">Employee Type</label>
            <select
              className="form-select rounded-3 border-0 small"
              name="employeeType"
              value={formData.employeeType}
              onChange={handleChange}
              required
            >
              <option value="Fresher">Fresher</option>
              <option value="Experienced">Experienced</option>
            </select>
          </div>

          {/* Years of Experience (only if Experienced) */}
          {formData.employeeType === 'Experienced' && (
            <div className="mb-2">
              <label className="form-label text-white small">Years of Experience</label>
              <input
                type="number"
                className="form-control rounded-3 border-0 small"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-light fw-bold w-100 rounded-3 mt-2 small">
            Submit
          </button>
        </form>
      </div>

      {/* ✅ Styles */}
      <style>
        {`
          .add-employee-bg {
            background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
          }
          .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .small {
            font-size: 0.85rem;
          }
        `}
      </style>
    </div>
  );
};

export default AddEmployee;
