import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TaskManagement = ({ employeeId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employeeId) {
      fetchTasks();
    }
  }, [employeeId]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:2000/api/tasks/${employeeId}`);
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
    setLoading(false);
  };

  const handleAction = async (taskId, action) => {
    try {
      await axios.post(`http://localhost:2000/api/tasks/${action}`, { taskId });
      fetchTasks();
    } catch (err) {
      console.error(`Failed to ${action} task`, err);
    }
  };

  const isActionDisabled = (task, action) => {
    const status = task.task_status;
    if (status === 'Completed') return true;
    switch (action) {
      case 'start': return status !== 'Pending' && status !== 'Not Completed';
      case 'pause': return status !== 'In Progress';
      case 'resume': return status !== 'Paused';
      case 'finish': return status !== 'In Progress' && status !== 'Paused';
      default: return true;
    }
  };

  const renderRatingStars = (rating) => {
    return rating ? '⭐'.repeat(rating) : '-';
  };

  const renderActionButtons = (task) => {
    if (task.task_status === 'Completed') {
      return <span className="text-success fw-bold">Task Completed</span>;
    }

    return (
      <>
        <button
          className="btn btn-primary btn-sm me-1"
          onClick={() => handleAction(task.id, 'start')}
          disabled={isActionDisabled(task, 'start')}
        >
          Start
        </button>
        <button
          className="btn btn-warning btn-sm me-1"
          onClick={() => handleAction(task.id, 'pause')}
          disabled={isActionDisabled(task, 'pause')}
        >
          Pause
        </button>
        <button
          className="btn btn-success btn-sm me-1"
          onClick={() => handleAction(task.id, 'resume')}
          disabled={isActionDisabled(task, 'resume')}
        >
          Resume
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleAction(task.id, 'finish')}
          disabled={isActionDisabled(task, 'finish')}
        >
          Finish
        </button>
      </>
    );
  };

  return (
    <div className="container mt-4 text-white">
      <h2>Task Management</h2>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <table className="table table-dark mt-3">
          <thead>
            <tr>
              <th>#</th>
              <th>Task</th>
              <th>Status</th>
              <th>Actions</th>
              <th>Time Required</th>
              <th>Time Taken</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr key={task.id}>
                <td>{index + 1}</td>
                <td>{task.task_name}</td>
                <td>
                  <span className={`badge ${
                    task.task_status === 'Completed' ? 'bg-success' :
                    task.task_status === 'In Progress' ? 'bg-primary' :
                    task.task_status === 'Paused' ? 'bg-warning text-dark' :
                    'bg-secondary'
                  }`}>
                    {task.task_status}
                  </span>
                </td>
                <td>{renderActionButtons(task)}</td>
                <td>{task.time_required} hrs</td>
                <td>{task.time_taken || '-'}</td>
                <td>{renderRatingStars(task.rating)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TaskManagement;
