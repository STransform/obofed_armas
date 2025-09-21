import React, { useEffect, useState, useCallback } from 'react';
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
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getUnderReviewReports, downloadFile, approveReport, rejectReport } from '../file/upload_download';
import { useAuth } from '../views/pages/AuthProvider';

// Styled components
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

export default function UnderReviewReports() {
  const { roles } = useAuth();
  // Updated role check to match Nav.js logic
  const isApprover = Array.isArray(roles) && roles.some((r) => r.description === 'APPROVER');
  const isSeniorAuditor = Array.isArray(roles) && roles.some((r) => r.description === 'SENIOR_AUDITOR');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionDocument, setRejectionDocument] = useState(null);
  const [approvalDocument, setApprovalDocument] = useState(null);

  // Debug role status
  useEffect(() => {
    console.log('UnderReviewReports: Roles:', roles);
    console.log('UnderReviewReports: isApprover:', isApprover, 'isSeniorAuditor:', isSeniorAuditor);
  }, [roles]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getUnderReviewReports();
      const validReports = Array.isArray(data) ? data.filter(report => report && report.id) : [];
      setReports(validReports);
      setLoading(false);
      if (validReports.length === 0) {
        setError('No reports under review.');
      }
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${
            error.response.data?.message || error.response.data || error.response.statusText
          }`
        : error.message;
      console.error('UnderReviewReports: Fetch error:', errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('UnderReviewReports: Component mounted');
    fetchReports();
  }, []);

  const handleDownload = useCallback(async (id, filename, type) => {
    try {
      console.log(`UnderReviewReports: Downloading file: id=${id}, type=${type}, filename=${filename}`);
      const response = await downloadFile(id, type);
      const blob = new Blob([response.data]);
      if (blob.size === 0) {
        throw new Error('Empty file received');
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'file');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSnackbarMessage(`Successfully downloaded ${type === 'original' ? 'report' : 'findings'}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      const errorMessage =
        error.response?.status === 404
          ? `${type === 'original' ? 'Report' : 'Findings'} not found`
          : `Failed to download: ${error.message || 'Unknown error'}`;
      console.error('UnderReviewReports: Download error:', error);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, []);

  const handleApprove = (report) => {
    console.log('UnderReviewReports: handleApprove called with report:', report);
    setSelectedReport(report);
    setApprovalDocument(null);
    setShowApprovalModal(true);
  };

  const handleReject = (report) => {
    console.log('UnderReviewReports: handleReject called with report:', report);
    setSelectedReport(report);
    setRejectionReason('');
    setRejectionDocument(null);
    setShowRejectModal(true);
  };

  const handleApproveSubmit = async () => {
    try {
      const file = document.getElementById('approvalDocument')?.files[0];
      await approveReport(selectedReport.id, file);
      setSnackbarMessage('Report approved successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setShowApprovalModal(false);
      setApprovalDocument(null);
      await fetchReports();
    } catch (error) {
      const msg = error.response?.data || 'Error approving report';
      console.error('UnderReviewReports: Approve error:', error);
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason) {
      setSnackbarMessage('Please provide a reason for rejection');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      const file = document.getElementById('rejectionDocument')?.files[0];
      await rejectReport(selectedReport.id, rejectionReason, file);
      setSnackbarMessage('Report rejected successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setShowRejectModal(false);
      setRejectionReason('');
      setRejectionDocument(null);
      await fetchReports();
    } catch (error) {
      const msg = error.response?.data || 'Error rejecting report';
      console.error('UnderReviewReports: Reject error:', error);
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
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

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason('');
    setRejectionDocument(null);
  };

  const handleCloseApprovalModal = () => {
    setShowApprovalModal(false);
    setApprovalDocument(null);
  };

  const filteredReports = reports.filter(
    (report) =>
      report &&
      ((report.id || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
      (report.organization?.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.transactiondocument?.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (report.fiscalYear || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
      (report.remarks || '').toLowerCase().includes(filterText.toLowerCase()))
  );

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                Under Review Reports
              </Typography>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <Box display="flex" justifyContent="center" my={2}>
                  <CircularProgress />
                </Box>
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
                          <StyledTableCell>Report Type</StyledTableCell>
                          <StyledTableCell>Audit Findings</StyledTableCell>
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
                              <StyledTableCell>{report.transactiondocument?.reportype || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.remarks || 'N/A'}</StyledTableCell>
                              <StyledTableCell align="right">
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                  {report.docname && (
                                    <Tooltip title="Download Original Report">
                                      <StyledButton
                                        variant="outlined"
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        onClick={() => handleDownload(report.id, report.docname, 'original')}
                                        aria-label="Download original report"
                                      >
                                        Report
                                      </StyledButton>
                                    </Tooltip>
                                  )}
                                  {report.supportingDocname && (
                                    <Tooltip title="Download Findings">
                                      <StyledButton
                                        variant="outlined"
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        onClick={() => handleDownload(report.id, report.supportingDocname, 'supporting')}
                                        aria-label="Download findings"
                                        sx={{ color: '#0000FF', borderColor: '#0000FF' }}
                                      >
                                        Findings
                                      </StyledButton>
                                    </Tooltip>
                                  )}
                                  {isApprover && (
                                    <>
                                      <Tooltip title="Approve report">
                                        <Box sx={{ display: 'inline-flex', alignItems: 'center', mr: 1 }}>
                                          <IconButton
                                            color="success"
                                            onClick={() => handleApprove(report)}
                                            size="small"
                                            aria-label="Approve report"
                                          >
                                            <CheckCircleIcon />
                                          </IconButton>
                                          <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.8rem' }}>
                                            Approve
                                          </Typography>
                                        </Box>
                                      </Tooltip>
                                      <Tooltip title="Reject report">
                                        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                          <IconButton
                                            color="error"
                                            onClick={() => handleReject(report)}
                                            size="small"
                                            aria-label="Reject report"
                                          >
                                            <CancelIcon />
                                          </IconButton>
                                          <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.8rem' }}>
                                            Reject
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
                    <Typography sx={{ p: 2, textAlign: 'center' }}>
                      No reports found.
                    </Typography>
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

      {/* Approval Modal */}
      <StyledDialog
        maxWidth="md"
        fullWidth
        open={showApprovalModal}
        onClose={handleCloseApprovalModal}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
      >
        <DialogTitle>Approve Report</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol xs={12}>
              <CFormLabel htmlFor="approvalDocument">Attach Document</CFormLabel>
              <input
                type="file"
                className="form-control"
                id="approvalDocument"
                onChange={(e) => setApprovalDocument(e.target.files[0])}
                style={{ borderRadius: '8px' }}
              />
            </CCol>
          </CForm>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseApprovalModal} color="primary">
            Cancel
          </StyledButton>
          <StyledButton onClick={handleApproveSubmit} color="primary" variant="contained">
            Submit
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      {/* Reject Modal */}
      <StyledDialog
        maxWidth="md"
        fullWidth
        open={showRejectModal}
        onClose={handleCloseRejectModal}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
      >
        <DialogTitle>Reject Report</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol xs={12}>
              <CFormLabel htmlFor="rejectionReason">Reason for Rejection</CFormLabel>
              <CFormInput
                component="textarea"
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection"
                rows={4}
              />
            </CCol>
            <CCol xs={12}>
              <CFormLabel htmlFor="rejectionDocument">Attach Rejection Document</CFormLabel>
              <input
                type="file"
                className="form-control"
                id="rejectionDocument"
                onChange={(e) => setRejectionDocument(e.target.files[0])}
                style={{ borderRadius: '8px' }}
              />
            </CCol>
          </CForm>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseRejectModal} color="primary">
            Cancel
          </StyledButton>
          <StyledButton onClick={handleRejectSubmit} color="primary" variant="contained">
            Reject
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