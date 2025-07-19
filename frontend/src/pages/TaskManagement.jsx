import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TaskManagement = ({ employeeId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState(''); // To show success or error

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
    } catch (error) {
      setActionStatus('Failed to fetch tasks');
    }
    setLoading(false);
  };

  const handleAction = async (taskId, action) => {
    setLoading(true);
    try {
      await axios.post(`http://localhost:2000/api/tasks/${action}`, { taskId });
      setActionStatus(`Task ${action}ed successfully`);
      fetchTasks();
    } catch (error) {
      setActionStatus(`Failed to ${action} task`);
    }
    setLoading(false);
  };

  const renderActionButtons = (task) => {
    if (task.task_status === 'Pending') {
      return (
        <button className="btn btn-primary btn-sm" onClick={() => handleAction(task.id, 'start')} disabled={loading}>
          Start
        </button>
      );
    }
    if (task.task_status === 'In Progress') {
      return (
        <>
          <button className="btn btn-warning btn-sm me-2" onClick={() => handleAction(task.id, 'pause')} disabled={loading}>
            Pause
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => handleAction(task.id, 'finish')} disabled={loading}>
            Finish
          </button>
        </>
      );
    }
    if (task.task_status === 'Paused') {
      return (
        <>
          <button className="btn btn-success btn-sm me-2" onClick={() => handleAction(task.id, 'resume')} disabled={loading}>
            Resume
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => handleAction(task.id, 'finish')} disabled={loading}>
            Finish
          </button>
        </>
      );
    }
    if (task.task_status === 'Completed') {
      return <button className="btn btn-secondary btn-sm" disabled>Completed</button>;
    }
    return null;
  };

  return (
    <div className="text-white">
      <h2>Task Management</h2>

      {actionStatus && <p>{actionStatus}</p>}
      {loading && <p>Loading...</p>}

      {tasks.length === 0 && !loading ? (
        <p>No tasks assigned.</p>
      ) : (
        <table className="table table-dark mt-3">
          <thead>
            <tr>
              <th>Task</th>
              <th>Status</th>
              <th>Actions</th>
              <th>Time Required</th>
              <th>Time Taken</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.task_name}</td>
                <td>{task.task_status}</td>
                <td>{renderActionButtons(task)}</td>
                <td>{task.time_required}h</td>
                <td>{task.time_taken || '-'}</td>
                <td>{task.rating || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TaskManagement;
