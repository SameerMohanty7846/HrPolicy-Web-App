import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const HrPolicy = () => {
  const [increments, setIncrements] = useState([]);
  const [salaryReport, setSalaryReport] = useState([]);

  useEffect(() => {
    fetchEmployeeIncrements();
    fetchSalaryReport();
  }, []);

  const fetchEmployeeIncrements = async () => {
    try {
      const response = await axios.get('http://localhost:2000/api/hr/employee-increments');
      setIncrements(response.data);
    } catch (error) {
      console.error('Error fetching employee increments:', error);
    }
  };

  const fetchSalaryReport = async () => {
    try {
      const response = await axios.get('http://localhost:2000/api/hr/salary-report');
      setSalaryReport(response.data);
    } catch (error) {
      console.error('Error fetching salary report:', error);
    }
  };

  return (
    <div className="hr-policy-bg d-flex flex-column align-items-center justify-content-start min-vh-100 p-4">
      <div className="glass-card p-4 rounded-4 w-100 mb-5" style={{ maxWidth: '1100px' }}>
        <h3 className="text-center mb-4 text-white fw-bold">HR Policy - Employee Increments</h3>
        <div className="table-responsive">
          <table className="table table-hover table-bordered compact-table">
            <thead className="table-light text-center">
              <tr>
                <th>#</th>
                <th>Emp ID</th>
                <th>Name</th>
                <th>Init Exp</th>
                <th>Exp in Company</th>
                <th>Tot Exp</th>
                <th>Avg Rating</th>
                <th>Performance</th>
                <th>Increment %</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {increments.map((inc, index) => (
                <tr key={inc.id}>
                  <td>{index + 1}</td>
                  <td>{inc.emp_id}</td>
                  <td>{inc.emp_name}</td>
                  <td>{inc.experience_before_joining}</td>
                  <td>{inc.experience_in_company}</td>
                  <td>{inc.total_experience}</td>
                  <td>{inc.avg_rating ? inc.avg_rating.toFixed(2) : 0}</td>
                  <td>{inc.performance}</td>
                  <td>{inc.increment_percent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card p-4 rounded-4 w-100" style={{ maxWidth: '900px' }}>
        <h4 className="mb-4 text-center text-white fw-bold">View Salary Report</h4>
        <div className="table-responsive">
          <table className="table table-hover table-bordered compact-table">
            <thead className="table-light text-center">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Initial Salary</th>
                <th>Increment %</th>
                <th>New Salary</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {salaryReport.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-white">No Salary Data Found</td>
                </tr>
              ) : (
                salaryReport.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.initialSalary}</td>
                    <td>{item.incrementPercentage}</td>
                    <td>{item.newSalary}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔧 Styles: Compact Layout + Glass Effect */}
      <style>
        {`
          .hr-policy-bg {
            background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
          }
          .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .compact-table th,
          .compact-table td {
            padding: 4px 6px !important;
            font-size: 0.75rem !important;
            vertical-align: middle;
          }
          .table-hover tbody tr:hover {
            background-color: rgba(255, 255, 255, 0.05);
          }
          .table-bordered th, .table-bordered td {
            border-color: rgba(255, 255, 255, 0.2);
          }
        `}
      </style>
    </div>
  );
};

export default HrPolicy;
