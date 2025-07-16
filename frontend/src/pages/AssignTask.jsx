import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const AssignTask = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employee_id: '',
    employee_name: '',
    task_name: '',
    assignment_date: '',
    time_required: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));

    if (!storedUser) {
      alert('Session expired. Please login again.');
      navigate('/login');
      return;
    }

    setFormData(prev => ({
      ...prev,
      employee_id: storedUser.id,
      employee_name: storedUser.name
    }));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:2000/api/hr/assigntasks', formData);
      if (response.status === 200) {
        alert('Task Assigned Successfully!');
        setFormData(prev => ({
          ...prev,
          task_name: '',
          assignment_date: '',
          time_required: ''
        }));
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Failed to assign task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="assign-task-bg py-4 px-3" style={{ minHeight: '100vh' }}>
      <div className="glass-card mx-auto p-3 rounded-4" style={{ maxWidth: '380px' }}>
        <h5 className="text-center mb-3 text-white fw-bold" style={{ fontSize: '1.2rem' }}>
          Assign Task to Yourself
        </h5>
        <form onSubmit={handleSubmit}>

          <div className="mb-2">
            <label className="form-label text-white small">Employee ID</label>
            <input
              type="text"
              className="form-control rounded-3 border-0 small"
              value={formData.employee_id}
              name="employee_id"
              readOnly
            />
          </div>

          <div className="mb-2">
            <label className="form-label text-white small">Employee Name</label>
            <input
              type="text"
              className="form-control rounded-3 border-0 small"
              value={formData.employee_name}
              name="employee_name"
              readOnly
            />
          </div>

          <div className="mb-2">
            <label className="form-label text-white small">Task Name</label>
            <input
              type="text"
              className="form-control rounded-3 border-0 small"
              name="task_name"
              value={formData.task_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label text-white small">Assignment Date</label>
            <input
              type="date"
              className="form-control rounded-3 border-0 small"
              name="assignment_date"
              value={formData.assignment_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label text-white small">Time Required (in hrs)</label>
            <input
              type="number"
              step="0.1"
              className="form-control rounded-3 border-0 small"
              name="time_required"
              value={formData.time_required}
              onChange={handleChange}
              min="0.1"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-light fw-bold w-100 rounded-3 mt-2 small"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Assigning...' : 'Assign Task'}
          </button>
        </form>
      </div>

      <style>
        {`
          .assign-task-bg {
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

export default AssignTask;
