import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.5,
    color: '#333'
  },
  
  // Header Styles
  headerContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 15,
    marginBottom: 20
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2c3e50'
  },
  companyAddress: {
    fontSize: 10,
    marginBottom: 4,
    color: '#7f8c8d'
  },
  companyContact: {
    fontSize: 9,
    color: '#7f8c8d'
  },
  
  // Report Title
  reportTitleContainer: {
    marginBottom: 20,
    alignItems: 'center'
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
    textTransform: 'uppercase'
  },
  reportPeriod: {
    fontSize: 12,
    color: '#7f8c8d'
  },
  
  // Sections
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5
  },
  
  // Info Grid
  infoGrid: {
    flexDirection: 'column'
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5
  },
  infoLabel: {
    width: 120,
    fontWeight: 'bold'
  },
  infoValue: {
    flex: 1
  },
  
  // Table Styles
  table: {
    display: 'table',
    width: '100%',
    marginTop: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  tableRow: {
    flexDirection: 'row'
  },
  tableCol: {
    padding: 8,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  tableCell: {
    fontSize: 11
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold'
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    color: '#7f8c8d',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  footerText: {
    fontSize: 9
  },
  signatureContainer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  signatureLine: {
    width: 200,
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 40,
    paddingTop: 5,
    fontSize: 10,
    textAlign: 'center'
  }
});

// PDF Document Component
const EmployeePayrollPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with Logo */}
      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          {/* Replace with your actual logo - either base64 or URL */}
          <Image 
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAZCAMAAABn0dyjAAAAeFBMVEVHcEzQ2cWZnZaCg4R/f4F6e3xpaWthYmRoaWtub3G/0Ki6u7mMjI1bXF5gYGNdXWB/gX9gYWNlZmiLi4ynt5OmpqdsbW+1tbZ4eHqLjI1TVFaEhoWdvHaFq1WPs2CWs3F0dnR8pUp6pEeGq1iNqWtjY2Z4oUKBqU+LEb/aAAAAKHRSTlMABjV1r8vh/OzRDxqB/+D2iez4ZilWs0FVRP+WS3Z+bJ3R3auVy//AHsCXXAAAAV5JREFUeAF1kgWCxCAMRQPUIXjdR+9/w62v/5n6iwcuEcqCMIrjJA0YzeCnuIhilFJpbYzEOBL822ciLKaRA04BPIc8KtCKL17KFLEC8sUA6hij8vpuFat+RCWVM/FBlHHTwh8SDeawKEuUoJfhogwIr1nBvTB2TbVd7An3Xdf3wzCOo56KCLFBvvoIALzFCeh8m++PRzs9DaIyz0JXNQHQKqbAkMGCueIpEU06uYry7u5hk2sEhA3bMtFsHD3A/TWup+4EQohQHA14v3rI5m8AwwSsPAuYfwOQxpAgI/8CTiVLDvp/D2zJQSD7F9iqoFZN/wFbH7ZObsDtBMjjTWlFj04CTxTbZjFcHrybnrLibp8F5Hj48P4Avk9z2wdX7bVmayevfcivjYmujSJjd25UUsKlTMdYpA4yD8AzqNMC45Z/2zAuIsSnNEJI+URMWg8/lVERpMnyLQ1E/Wn9ARtjH0l/GfPXAAAAAElFTkSuQmCC" 
            style={{ width: 80, height: 80 }}
          />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.companyName}>ABC Corporation Pvt. Ltd.</Text>
          <Text style={styles.companyAddress}>123 Business Park, Mumbai - 400001</Text>
          <Text style={styles.companyContact}>Phone: +91 22 12345678 | Email: hr@abccorp.com</Text>
        </View>
      </View>

      {/* Report Title */}
      <View style={styles.reportTitleContainer}>
        <Text style={styles.reportTitle}>MONTHLY SALARY REPORT</Text>
        <Text style={styles.reportPeriod}>{data.period.formatted}</Text>
      </View>

      {/* Employee Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Employee Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Employee Name:</Text>
            <Text style={styles.infoValue}>{data.employee.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Employee ID:</Text>
            <Text style={styles.infoValue}>{data.employee.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Department:</Text>
            <Text style={styles.infoValue}>{data.employee.department}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{data.employee.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{data.employee.phone}</Text>
          </View>
        </View>
      </View>

      {/* Salary Breakdown Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Salary Breakdown</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCol, { width: '60%' }]}>
              <Text style={styles.tableHeaderCell}>Component</Text>
            </View>
            <View style={[styles.tableCol, { width: '40%' }]}>
              <Text style={styles.tableHeaderCell}>Amount (₹)</Text>
            </View>
          </View>

          {/* Earnings */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '60%' }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Basic Salary</Text>
            </View>
            <View style={[styles.tableCol, { width: '40%' }]}>
              <Text style={styles.tableCell}>{data.salary_components.basic.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '60%' }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Total Earnings</Text>
            </View>
            <View style={[styles.tableCol, { width: '40%' }]}>
              <Text style={styles.tableCell}>{data.salary_components.total_earnings.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* Deductions */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '60%' }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Total Deductions</Text>
            </View>
            <View style={[styles.tableCol, { width: '40%' }]}>
              <Text style={styles.tableCell}>{data.salary_components.total_deductions.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '60%' }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Gross Salary</Text>
            </View>
            <View style={[styles.tableCol, { width: '40%' }]}>
              <Text style={styles.tableCell}>{data.salary_components.gross.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '60%' }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Leave Deductions</Text>
            </View>
            <View style={[styles.tableCol, { width: '40%' }]}>
              <Text style={styles.tableCell}>{data.leave_details.amount_deducted.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* Net Salary */}
          <View style={[styles.tableRow, { backgroundColor: '#f8f9fa' }]}>
            <View style={[styles.tableCol, { width: '60%' }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Net Salary Payable</Text>
            </View>
            <View style={[styles.tableCol, { width: '40%' }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{data.salary_components.net.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Leave Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leave Details</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Leave Days Taken:</Text>
            <Text style={styles.infoValue}>{data.leave_details.days_taken} days</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Amount Deducted:</Text>
            <Text style={styles.infoValue}>₹{data.leave_details.amount_deducted.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </View>

      {/* Payment Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Mode:</Text>
            <Text style={styles.infoValue}>Bank Transfer</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Number:</Text>
            <Text style={styles.infoValue}>XXXXXX{data.employee.id.toString().slice(-4)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Date:</Text>
            <Text style={styles.infoValue}>5th of {data.period.month_name} {data.period.year}</Text>
          </View>
        </View>
      </View>

      {/* Signature Area */}
      <View style={styles.signatureContainer}>
        <View style={styles.signatureLine}>
          <Text>Employee Signature</Text>
        </View>
        <View style={styles.signatureLine}>
          <Text>Authorized Signatory</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer} fixed>
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>This is a computer generated document and does not require signature</Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Generated on: {new Date().toLocaleDateString('en-IN')}</Text>
          <Text style={styles.footerText}>Page <Text render={({ pageNumber, totalPages }) => `${pageNumber} of ${totalPages}`} /></Text>
        </View>
      </View>
    </Page>
  </Document>
);

const EmployeeMonthlySalaryReport = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('7');
  const [selectedYear, setSelectedYear] = useState('2025');

  // Month options with numeric values
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Year options (2020-2030)
  const years = Array.from({ length: 11 }, (_, i) => (2020 + i).toString());

  // Fetch payroll data when month/year changes
  const fetchPayrollData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:2000/api/payroll-list/${selectedMonth}/${selectedYear}`
      );
      setPayrollData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payroll data');
      setPayrollData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [selectedMonth, selectedYear]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount).replace('₹', '₹ ');
  };

  return (
    <div className="container py-4">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0 text-center">Monthly Payroll Report</h2>
        </div>
        
        <div className="card-body">
          {/* Filter Controls */}
          <div className="row mb-4 g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light">Month</span>
                <select
                  className="form-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  disabled={loading}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light">Year</span>
                <select
                  className="form-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={loading}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {loading && (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading payroll data...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger text-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          {/* Payroll Data Table */}
          {payrollData.length > 0 && !loading && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">
                  {months.find(m => m.value === selectedMonth)?.label} {selectedYear} Payroll
                </h4>
                <div className="text-muted small">
                  Showing {payrollData.length} records
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th className="text-end">Basic</th>
                      <th className="text-end">Earnings</th>
                      <th className="text-end">Deductions</th>
                      <th className="text-end">Gross</th>
                      <th className="text-end">Net</th>
                      <th>Leaves</th>
                      <th>Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollData.map((item) => (
                      <tr key={item.payroll_id}>
                        <td>
                          <div className="fw-bold">{item.employee.name}</div>
                          <small className="text-muted">ID: {item.employee.id}</small>
                        </td>
                        <td>{item.employee.department}</td>
                        <td className="text-end">{formatCurrency(item.salary_components.basic)}</td>
                        <td className="text-end text-success">{formatCurrency(item.salary_components.total_earnings)}</td>
                        <td className="text-end text-danger">{formatCurrency(item.salary_components.total_deductions)}</td>
                        <td className="text-end">{formatCurrency(item.salary_components.gross)}</td>
                        <td className="text-end fw-bold text-primary">{formatCurrency(item.salary_components.net)}</td>
                        <td>
                          <span className="badge bg-warning text-dark">
                            {item.leave_details.days_taken} days
                          </span>
                          <div className="text-danger small">
                            {formatCurrency(item.leave_details.amount_deducted)} deducted
                          </div>
                        </td>
                        <td>
                          <PDFDownloadLink
                            document={<EmployeePayrollPDF data={item} />}
                            fileName={`${item.employee.name}_${item.period.month_name}_${item.period.year}_Payroll.pdf`}
                            className="btn btn-sm btn-outline-danger"
                          >
                            {({ loading }) => (
                              loading ? 'Preparing...' : 'PDF'
                            )}
                          </PDFDownloadLink>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {payrollData.length === 0 && !loading && !error && (
            <div className="text-center py-5 bg-light rounded">
              <i className="bi bi-file-earmark-excel fs-1 text-muted mb-3"></i>
              <h5>No payroll records found</h5>
              <p className="text-muted">No data available for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeMonthlySalaryReport;