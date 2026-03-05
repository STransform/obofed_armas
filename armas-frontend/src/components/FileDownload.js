import React, { useEffect, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormInput,
} from '@coreui/react';
import {
  TextField,
  Dialog,
  Snackbar,
  Alert,
  Fade,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  TableContainer,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  IconButton,
  InputAdornment,
  Typography,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getSentReports, downloadFile, getUsersByRole, assignAuditor } from '../file/upload_download';

// New API function to assign Approver
export const assignApprover = async (transactionId, approverUsername) => {
    try {
        console.log('Calling assignApprover API: transactionId=', transactionId, ', approverUsername=', approverUsername);
        const response = await axiosInstance.post(`/transactions/assign-approver/${transactionId}`, null, {
            params: { approverUsername }
        });
        console.log('AssignApprover response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error assigning approver:', error.message, error.response?.status, error.response?.data);
        throw error;
    }
};

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  backgroundColor: theme.palette.background.paper,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '6px',
  textTransform: 'none',
  padding: '8px 16px',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    padding: theme.spacing(2),
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: '0.9rem',
  padding: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
    padding: theme.spacing(1),
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transition: 'background-color 0.3s ease',
  },
}));

export default function FileDownload() {
  const [submittedReports, setSubmittedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [assignType, setAssignType] = useState(''); // 'auditor' or 'approver'

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getSentReports();
      const submitted = data.filter((report) => report.reportstatus === 'Submitted' || report.reportstatus === 'Under Review');
      setSubmittedReports(Array.isArray(submitted) ? submitted : []);
      setLoading(false);
      if (submitted.length === 0) {
        setError('No submitted reports available.');
      } else {
        setError(null);
      }
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${
            error.response.data?.message || error.response.data || error.response.statusText
          }`
        : error.message;
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownload = async (id, docname, type = 'original') => {
    try {
      const response = await downloadFile(id, type);
      const blob = new Blob([response.data]);
      if (blob.size === 0) {
        throw new Error('Empty file received');
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', docname || 'file');
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      setSnackbarMessage(`Successfully downloaded ${type} document`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      const msg = error.response?.data || 'Error downloading file';
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleAssign = async (report, type) => {
    setSelectedReport(report);
    setAssignType(type);
    try {
      const role = type === 'auditor' ? 'SENIOR_AUDITOR' : 'APPROVER';
      const assigneesData = await getUsersByRole(role);
      setAssignees(Array.isArray(assigneesData) ? assigneesData : []);
      setShowAssignModal(true);
    } catch (error) {
      const msg = error.response?.data || `Error loading ${type}s`;
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedAssignee) {
      setSnackbarMessage(`Please select an ${assignType}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      if (assignType === 'auditor') {
        await assignAuditor(selectedReport.id, selectedAssignee);
        setSnackbarMessage('Auditor assigned successfully');
      } else {
        await assignApprover(selectedReport.id, selectedAssignee);
        setSnackbarMessage('Approver assigned successfully');
      }
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setShowAssignModal(false);
      setSelectedAssignee('');
      fetchReports();
    } catch (error) {
      const msg = error.response?.data || `Error assigning ${assignType}`;
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleOpenDetails = (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedAssignee('');
    setAssignType('');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
    setPage(0);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const filteredReports = submittedReports.filter(
    (report) =>
      (report.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.fiscal_year || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
      (report.user || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.reportstatus || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                Archiver View
              </Typography>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <Typography>Loading...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <StyledTableContainer component={Paper}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <TextField
                      label="Search Reports"
                      variant="outlined"
                      value={filterText}
                      onChange={handleFilterChange}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Tooltip title="Search reports by organization, report type, year, submitter, or status" placement="top">
                              <SearchIcon />
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ width: { xs: '100%', sm: '40%' } }}
                    />
                  </Box>
                  {filteredReports.length > 0 ? (
                    <Table stickyHeader>
                      <TableHead>
                        <StyledTableRow>
                          <StyledTableCell>Submitted Date</StyledTableCell>
                          <StyledTableCell>Organization Name</StyledTableCell>
                          <StyledTableCell>Budget Year</StyledTableCell>
                          <StyledTableCell>Report Type</StyledTableCell>
                          {/* <StyledTableCell>Category</StyledTableCell> */}
                          <StyledTableCell>Submitted By</StyledTableCell>
                          <StyledTableCell>Status</StyledTableCell>
                          <StyledTableCell align="right">Actions</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {filteredReports
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((report) => (
                            <StyledTableRow key={report.id}>
                              <StyledTableCell>
                                {report.createdDate
                                  ? new Date(report.createdDate).toLocaleDateString()
                                  : 'N/A'}
                              </StyledTableCell>
                              <StyledTableCell>{report.orgname || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.fiscal_year || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.reportype || 'N/A'}</StyledTableCell>
                              {/* <StyledTableCell>{report.reportcategory || 'N/A'}</StyledTableCell> */}
                              <StyledTableCell>{report.user || 'N/A'}</StyledTableCell>
                              <StyledTableCell>
                                <Box
                                  sx={{
                                    display: 'inline-block',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: '12px',
                                    bgcolor:
                                      report.reportstatus === 'Submitted'
                                        ? '#e8f5e9'
                                        : report.reportstatus === 'Under Review'
                                        ? '#fff3e0'
                                        : '#fff3e0',
                                    color:
                                      report.reportstatus === 'Submitted'
                                        ? '#2e7d32'
                                        : report.reportstatus === 'Under Review'
                                        ? '#f57c00'
                                        : '#f57c00',
                                    fontSize: '0.85rem',
                                    fontWeight: 'medium',
                                  }}
                                >
                                  {report.reportstatus || 'N/A'}
                                </Box>
                              </StyledTableCell>
                              <StyledTableCell align="right">
                                <Tooltip title="View report details" placement="top">
                                  <IconButton
                                    color="success"
                                    onClick={() => handleOpenDetails(report)}
                                    size="small"
                                    sx={{ mr: 1 }}
                                  >
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                                {report.reportcategory === 'Others' ? (
                                  <Tooltip title="Assign approver" placement="top">
                                    <IconButton
                                      color="primary"
                                      onClick={() => handleAssign(report, 'approver')}
                                      size="small"
                                      sx={{ mr: 1 }}
                                    >
                                      <PersonAddIcon />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="Assign auditor" placement="top">
                                    <IconButton
                                      color="primary"
                                      onClick={() => handleAssign(report, 'auditor')}
                                      size="small"
                                      sx={{ mr: 1 }}
                                    >
                                      <PersonAddIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Download report" placement="top">
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleDownload(report.id, report.docname)}
                                    size="small"
                                  >
                                    <DownloadIcon />
                                  </IconButton>
                                </Tooltip>
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography sx={{ p: 2 }}>No reports found.</Typography>
                  )}
                  <TablePagination
                    component="div"
                    count={filteredReports.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </StyledTableContainer>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Assign Modal */}
      <StyledDialog
        maxWidth="sm"
        fullWidth
        open={showAssignModal}
        onClose={handleCloseAssignModal}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
      >
        <DialogTitle>Assign {assignType === 'auditor' ? 'Auditor' : 'Approver'}</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol xs={12}>
              <CFormLabel htmlFor="assignee">Select {assignType === 'auditor' ? 'Auditor' : 'Approver'}</CFormLabel>
              <select
                className="form-control"
                id="assignee"
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="">Select {assignType === 'auditor' ? 'Auditor' : 'Approver'}</option>
                {assignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.username}>
                    {assignee.username} ({assignee.firstName} {assignee.lastName})
                  </option>
                ))}
              </select>
            </CCol>
          </CForm>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseAssignModal} color="primary">
            Cancel
          </StyledButton>
          <StyledButton onClick={handleAssignSubmit} color="primary" variant="contained">
            Assign
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      {/* Report Details Modal */}
      <StyledDialog
        maxWidth="md"
        fullWidth
        open={showDetailsModal}
        onClose={handleCloseDetails}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
      >
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol md={6}>
              <CFormLabel>Submitted Date</CFormLabel>
              <CFormInput
                value={
                  selectedReport?.createdDate
                    ? new Date(selectedReport.createdDate).toLocaleDateString()
                    : 'N/A'
                }
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Organization Name</CFormLabel>
              <CFormInput value={selectedReport?.orgname || 'N/A'} readOnly />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Budget Year</CFormLabel>
              <CFormInput value={selectedReport?.fiscal_year || 'N/A'} readOnly />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Report Type</CFormLabel>
              <CFormInput value={selectedReport?.reportype || 'N/A'} readOnly />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Category</CFormLabel>
              <CFormInput value={selectedReport?.reportcategory || 'N/A'} readOnly />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Submitted By</CFormLabel>
              <CFormInput value={selectedReport?.user || 'N/A'} readOnly />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Status</CFormLabel>
              <CFormInput value={selectedReport?.reportstatus || 'N/A'} readOnly />
            </CCol>
            <CCol xs={12}>
              <CFormLabel>Document</CFormLabel>
              <div>
                {selectedReport?.docname && (
                  <Tooltip title="Download report" placement="top">
                    <StyledButton
                      variant="contained"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(selectedReport.id, selectedReport.docname)}
                    >
                      Download Document
                    </StyledButton>
                  </Tooltip>
                )}
              </div>
            </CCol>
          </CForm>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseDetails} color="primary">
            Close
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ minWidth: '250px', boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}