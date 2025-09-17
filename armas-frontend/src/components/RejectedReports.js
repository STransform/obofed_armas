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
  InputAdornment,
  Typography,
  Paper,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getRejectedReports, downloadFile, submitFindings, getUsersByRole } from '../file/upload_download';
import { useAuth } from '../views/pages/AuthProvider';

// Styled components for enhanced UI
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  backgroundColor: theme.palette.background.paper,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '6px',
  textTransform: 'none',
  padding: '6px',
  minWidth: '36px',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: 'transparent',
    color: '#FF0000',
  },
  '& .MuiButton-startIcon': {
    margin: 0,
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

export default function RejectedReports() {
  const { roles } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [responseNeeded, setResponseNeeded] = useState('Pending');
  const [supportingDocument, setSupportingDocument] = useState(null);
  const [approvers, setApprovers] = useState([]);
  const [selectedApprover, setSelectedApprover] = useState('');

  // Role checking function
  const hasRole = (role) => {
    const result = Array.isArray(roles) && roles.some((r) => r.description === role);
    console.log(`RejectedReports: Checking role ${role}: ${result}`);
    return result;
  };

  const isSeniorAuditor = hasRole('SENIOR_AUDITOR');
  const isApprover = hasRole('APPROVER');

  useEffect(() => {
    console.log('RejectedReports: User roles:', roles);
    console.log('RejectedReports: isSeniorAuditor:', isSeniorAuditor, 'isApprover:', isApprover);
    fetchReports();
  }, [roles]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getRejectedReports();
      console.log('RejectedReports: Fetched reports:', data);
      setReports(Array.isArray(data) ? data : []);
      setLoading(false);
      if (data.length === 0) {
        setError('No rejected reports available.');
      }
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${
            error.response.data?.message || error.response.data || error.response.statusText
          }`
        : error.message;
      console.error('RejectedReports: Fetch error:', errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleDownload = async (id, docname, supportingDocname, type) => {
    try {
      const response = await downloadFile(id, type);
      const blob = new Blob([response.data]);
      if (blob.size === 0) {
        throw new Error('Empty file received');
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = type === 'original' ? (docname || 'file') : (supportingDocname || 'file');
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSnackbarMessage(`Successfully downloaded ${type} document`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      const msg = error.response?.data || `Error downloading ${type} file`;
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleResubmit = async (report) => {
    setSelectedReport(report);
    setRemarks('');
    setResponseNeeded('Pending');
    setSupportingDocument(null);
    setSelectedApprover('');
    try {
      const approversData = await getUsersByRole('APPROVER');
      console.log('RejectedReports: Fetched approvers:', approversData);
      setApprovers(Array.isArray(approversData) ? approversData : []);
      setShowResubmitModal(true);
    } catch (error) {
      const msg = error.response?.data || 'Error loading approvers';
      console.error('RejectedReports: Approvers fetch error:', msg);
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleEvaluate = async (report) => {
    setSelectedReport(report);
    setRemarks('');
    setResponseNeeded('Pending');
    setSupportingDocument(null);
    setSelectedApprover('');
    try {
      const approversData = await getUsersByRole('APPROVER');
      console.log('RejectedReports: Fetched approvers for evaluate:', approversData);
      setApprovers(Array.isArray(approversData) ? approversData : []);
      setShowEvaluateModal(true);
    } catch (error) {
      const msg = error.response?.data || 'Error loading approvers';
      console.error('RejectedReports: Approvers fetch error:', msg);
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleResubmitSubmit = async () => {
    if (!remarks || !selectedApprover || !responseNeeded) {
      setSnackbarMessage('Please enter findings, select an approver, and select response needed');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      const file = document.getElementById('resubmitSupportingDocument')?.files[0];
      await submitFindings(selectedReport.id, remarks, selectedApprover, responseNeeded, file);
      setSnackbarMessage('Report resubmitted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setShowResubmitModal(false);
      setRemarks('');
      setResponseNeeded('Pending');
      setSupportingDocument(null);
      setSelectedApprover('');
      await fetchReports();
    } catch (error) {
      const msg = error.response?.data || 'Error resubmitting report';
      console.error('RejectedReports: Resubmit error:', msg);
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleEvaluateSubmit = async () => {
    if (!remarks || !selectedApprover || !responseNeeded) {
      setSnackbarMessage('Please enter findings, select an approver, and select response needed');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      const file = document.getElementById('evaluateSupportingDocument')?.files[0];
      const response = await submitFindings(
        selectedReport.id,
        remarks,
        selectedApprover,
        responseNeeded,
        file
      );
      console.log('RejectedReports: Evaluate submit response:', response);
      setSnackbarMessage(
        response.reportstatus === 'Corrected'
          ? 'Report evaluated successfully and status changed to Corrected'
          : `Report evaluated, but status is ${response.reportstatus}`
      );
      setSnackbarSeverity(response.reportstatus === 'Corrected' ? 'success' : 'warning');
      setSnackbarOpen(true);
      setShowEvaluateModal(false);
      setRemarks('');
      setResponseNeeded('Pending');
      setSupportingDocument(null);
      setSelectedApprover('');
      await fetchReports();
    } catch (error) {
      const msg = error.response?.data?.error || 'Error evaluating report';
      console.error('RejectedReports: Evaluate submit error:', msg);
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleOpenDetails = (report) => {
    console.log('RejectedReports: Selected report for details:', report);
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
  };

  const handleCloseResubmitModal = () => {
    setShowResubmitModal(false);
    setRemarks('');
    setResponseNeeded('Pending');
    setSupportingDocument(null);
    setSelectedApprover('');
  };

  const handleCloseEvaluateModal = () => {
    setShowEvaluateModal(false);
    setRemarks('');
    setResponseNeeded('Pending');
    setSupportingDocument(null);
    setSelectedApprover('');
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

  const filteredReports = reports.filter(
    (report) =>
      (report.organization?.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.transactiondocument?.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.fiscalYear || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
      (report.submittedByAuditorUsername || report.assignedAuditorUsername || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.responseNeeded || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.reportstatus || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.remarks || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                Rejected Reports
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
                            <SearchIcon />
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
                          <StyledTableCell>Date</StyledTableCell>
                          <StyledTableCell>Organization</StyledTableCell>
                          <StyledTableCell>Budget Year</StyledTableCell>
                          <StyledTableCell>Report Type</StyledTableCell>
                          <StyledTableCell>Response</StyledTableCell>
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
                              <StyledTableCell>{report.organization?.orgname || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.fiscalYear || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.transactiondocument?.reportype || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.responseNeeded || 'N/A'}</StyledTableCell>
                              <StyledTableCell>
                                <Box
                                  sx={{
                                    display: 'inline-block',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: '12px',
                                    bgcolor: report.reportstatus === 'Rejected' ? '#fff3e0' : '#f5f5f5',
                                    color: report.reportstatus === 'Rejected' ? '#f57c00' : '#616161',
                                    fontSize: '0.85rem',
                                    fontWeight: 'medium',
                                  }}
                                >
                                  {report.reportstatus || 'N/A'}
                                </Box>
                              </StyledTableCell>
                              <StyledTableCell align="right">
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                                  <Tooltip title="View Details">
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                      <StyledButton
                                        variant="text"
                                        color="inherit"
                                        size="small"
                                        onClick={() => handleOpenDetails(report)}
                                        sx={{ mr: 1 }}
                                      >
                                        <VisibilityIcon />
                                      </StyledButton>
                                      <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.8rem' }}>
                                        Details
                                      </Typography>
                                    </Box>
                                  </Tooltip>
                                  {(report.supportingDocumentPath || report.docname) ? (
                                    <Tooltip title="Download Documents">
                                      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <IconButton
                                          color="primary"
                                          onClick={() => {
                                            if (report.supportingDocumentPath && report.supportingDocname) {
                                              handleDownload(report.id, report.docname, report.supportingDocname, 'supporting');
                                            } else if (report.docname) {
                                              handleDownload(report.id, report.docname, report.supportingDocname, 'original');
                                            }
                                          }}
                                          aria-label="Download document"
                                          size="small"
                                        >
                                          <DownloadIcon />
                                        </IconButton>
                                        <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.8rem' }}>
                                          Download
                                        </Typography>
                                      </Box>
                                    </Tooltip>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      Document unavailable
                                    </Typography>
                                  )}
                                  {isSeniorAuditor && report.reportstatus === 'Rejected' && (
                                    <>
                                     
                                      <Tooltip title="Evaluate Report">
                                        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                          <StyledButton
                                            variant="text"
                                            color="inherit"
                                            size="small"
                                            onClick={() => handleEvaluate(report)}
                                          >
                                            <AssignmentIcon />
                                          </StyledButton>
                                          <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.8rem' }}>
                                            Evaluate
                                          </Typography>
                                        </Box>
                                      </Tooltip>
                                    </>
                                  )}
                                </Box>
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

      {/* Resubmit Modal */}
      <StyledDialog
        maxWidth="md"
        fullWidth
        open={showResubmitModal}
        onClose={handleCloseResubmitModal}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
      >
        <DialogTitle>Resubmit Report</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol xs={12}>
              <CFormLabel htmlFor="remarks">Audit Findings</CFormLabel>
              <CFormInput
                component="textarea"
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter audit findings"
                rows={4}
              />
            </CCol>
            <CCol xs={12}>
              <CFormLabel htmlFor="responseNeeded">Response Needed</CFormLabel>
              <select
                className="form-control"
                id="responseNeeded"
                value={responseNeeded}
                onChange={(e) => setResponseNeeded(e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="Pending">Pending</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </CCol>
            <CCol xs={12}>
              <CFormLabel htmlFor="approver">Select Approver</CFormLabel>
              <select
                className="form-control"
                id="approver"
                value={selectedApprover}
                onChange={(e) => setSelectedApprover(e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="">Select Approver</option>
                {approvers.map((approver) => (
                  <option key={approver.id} value={approver.username}>
                    {approver.firstName} {approver.lastName} ({approver.username})
                  </option>
                ))}
              </select>
            </CCol>
            <CCol xs={12}>
              <CFormLabel htmlFor="resubmitSupportingDocument">Supporting Document (Optional)</CFormLabel>
              <input
                type="file"
                className="form-control"
                id="resubmitSupportingDocument"
                onChange={(e) => setSupportingDocument(e.target.files[0])}
                style={{ borderRadius: '8px' }}
              />
            </CCol>
          </CForm>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseResubmitModal} color="primary">
            Cancel
          </StyledButton>
          <StyledButton onClick={handleResubmitSubmit} color="primary" variant="contained">
            Submit
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      {/* Evaluate Modal */}
      <StyledDialog
        maxWidth="md"
        fullWidth
        open={showEvaluateModal}
        onClose={handleCloseEvaluateModal}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
      >
        <DialogTitle>Evaluate Report</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol xs={12}>
              <CFormLabel htmlFor="evaluateRemarks">Audit Findings</CFormLabel>
              <CFormInput
                component="textarea"
                id="evaluateRemarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter audit findings"
                rows={4}
              />
            </CCol>
            <CCol xs={12}>
              <CFormLabel htmlFor="evaluateResponseNeeded">Response Needed</CFormLabel>
              <select
                className="form-control"
                id="evaluateResponseNeeded"
                value={responseNeeded}
                onChange={(e) => setResponseNeeded(e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="Pending">Pending</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </CCol>
            <CCol xs={12}>
              <CFormLabel htmlFor="evaluateApprover">Select Approver</CFormLabel>
              <select
                className="form-control"
                id="evaluateApprover"
                value={selectedApprover}
                onChange={(e) => setSelectedApprover(e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="">Select Approver</option>
                {approvers.map((approver) => (
                  <option key={approver.id} value={approver.username}>
                    {approver.firstName} {approver.lastName} ({approver.username})
                  </option>
                ))}
              </select>
            </CCol>
            <CCol xs={12}>
              <CFormLabel htmlFor="evaluateSupportingDocument">Supporting Document (Optional)</CFormLabel>
              <input
                type="file"
                className="form-control"
                id="evaluateSupportingDocument"
                onChange={(e) => setSupportingDocument(e.target.files[0])}
                style={{ borderRadius: '8px' }}
              />
            </CCol>
          </CForm>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseEvaluateModal} color="primary">
            Cancel
          </StyledButton>
          <StyledButton onClick={handleEvaluateSubmit} color="primary" variant="contained">
            Submit
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      {/* Details Modal */}
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
              <CFormLabel>Date</CFormLabel>
              <CFormInput
                value={selectedReport?.createdDate ? new Date(selectedReport.createdDate).toLocaleDateString() : 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Organization</CFormLabel>
              <CFormInput
                value={selectedReport?.organization?.orgname || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Budget Year</CFormLabel>
              <CFormInput
                value={selectedReport?.fiscalYear || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Report Type</CFormLabel>
              <CFormInput
                value={selectedReport?.transactiondocument?.reportype || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Auditor</CFormLabel>
              <CFormInput
                value={selectedReport?.submittedByAuditorUsername || selectedReport?.assignedAuditorUsername || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Audit Findings</CFormLabel>
              <CFormInput
                value={selectedReport?.remarks || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Rejection Reason</CFormLabel>
              <CFormInput
                value={selectedReport?.reasonOfRejection || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Response Needed</CFormLabel>
              <CFormInput
                value={selectedReport?.responseNeeded || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Status</CFormLabel>
              <CFormInput
                value={selectedReport?.reportstatus || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol xs={12}>
              <CFormLabel>Documents</CFormLabel>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Download Report" placement="top">
                  <StyledButton
                    variant="text"
                    color="inherit"
                    size="small"
                    onClick={() => handleDownload(selectedReport.id, selectedReport.docname, selectedReport.supportingDocname, 'original')}
                  >
                    <DownloadIcon />
                  </StyledButton>
                </Tooltip>
                {selectedReport?.supportingDocname && (
                  <Tooltip title="Download Findings" placement="top">
                    <StyledButton
                      variant="text"
                      color="inherit"
                      size="small"
                      onClick={() => handleDownload(selectedReport.id, selectedReport.supportingDocname, selectedReport.supportingDocname, 'supporting')}
                    >
                      <DownloadIcon />
                    </StyledButton>
                  </Tooltip>
                )}
              </Box>
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