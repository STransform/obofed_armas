import React, { useState, useEffect, useCallback } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Alert,
  TextField,
  TablePagination,
  TableContainer,
  Box,
  Paper,
  Typography,
  Button,
  Tooltip,
  CircularProgress,
  InputAdornment,
  Snackbar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getApprovedReports, downloadFile, uploadLetter } from '../file/upload_download';
import { useAuth } from '../views/pages/AuthProvider';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell, WidthType } from 'docx';
import * as XLSX from 'xlsx';

// Styled components for enhanced UI
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

const ApprovedReports = () => {
  const { roles } = useAuth();
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLetterUploadModal, setShowLetterUploadModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [letterFile, setLetterFile] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalError, setModalError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  // Role checking function
  const hasRole = (role) => {
    const result = Array.isArray(roles) && roles.some((r) => r.description === role);
    console.log(`ApprovedReports: Checking role ${role}: ${result}`);
    return result;
  };

  const isArchiver = hasRole('ARCHIVER');

  useEffect(() => {
    console.log('ApprovedReports: User roles:', roles);
    console.log('ApprovedReports: isArchiver:', isArchiver);
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await getApprovedReports();
        console.log('ApprovedReports: Fetched approved reports:', data);
        const validReports = Array.isArray(data)
          ? data.filter(report => report && report.id)
          : [];
        setReports(validReports);
        if (validReports.length === 0) {
          setError('No approved reports available.');
        }
      } catch (err) {
        const errorMessage = `Failed to load approved reports: ${err.message || 'Unknown error'}`;
        console.error('ApprovedReports: Fetch error:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [roles]);

  const handleDownload = useCallback(async (id, filename, type = 'supporting') => {
    try {
      console.log(`ApprovedReports: Downloading file: id=${id}, type=${type}, filename=${filename}`);
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
      setSuccess(`Successfully downloaded ${type === 'letter' ? 'letter' : type === 'original' ? 'report' : 'findings'}`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      const errorMessage =
        err.response?.status === 404
          ? `${type === 'letter' ? 'Letter' : type === 'original' ? 'Report' : 'Findings'} not found`
          : `Failed to download: ${err.message || 'Unknown error'}`;
      console.error('ApprovedReports: Download error:', err);
      setError(errorMessage);
      setTimeout(() => setError(''), 4000);
    }
  }, []);

  const handleDetails = useCallback((report) => {
    console.log('ApprovedReports: handleDetails called with report:', report);
    setSelectedReport(report);
    setShowDetailsModal(true);
    console.log('ApprovedReports: showDetailsModal set to true');
  }, []);

  const handleLetterUpload = useCallback((report) => {
    console.log('ApprovedReports: handleLetterUpload called with report:', report);
    setSelectedReport(report);
    setLetterFile(null);
    setModalError('');
    setShowLetterUploadModal(true);
    console.log('ApprovedReports: showLetterUploadModal set to true');
  }, []);

  const handleLetterSubmit = async () => {
    if (!letterFile) {
      setModalError('Please select a file');
      setTimeout(() => setModalError(''), 4000);
      return;
    }
    try {
      console.log('ApprovedReports: Uploading letter for report:', selectedReport.id);
      await uploadLetter(selectedReport.id, letterFile);
      setSuccess('Letter uploaded successfully');
      setShowLetterUploadModal(false);
      setLetterFile(null);
      const data = await getApprovedReports();
      const validReports = Array.isArray(data)
        ? data.filter(report => report && report.id)
        : [];
      setReports(validReports);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      const errorMessage = `Failed to upload letter: ${err.message || 'Unknown error'}`;
      console.error('ApprovedReports: Upload error:', errorMessage);
      setModalError(errorMessage);
      setTimeout(() => setModalError(''), 4000);
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

  const handleExportMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setAnchorEl(null);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Approved Reports', 14, 20);
    doc.autoTable({
      head: [['Date', 'Organization', 'Budget Year', 'Report Type', 'Auditor', 'Response', 'Status']],
      body: filteredReports.map(report => [
        report.createdDate ? new Date(report.createdDate).toLocaleDateString() : 'N/A',
        report.orgname || 'N/A',
        report.fiscalYear || 'N/A',
        report.reportype || 'N/A',
        report.submittedByAuditorUsername || 'N/A',
        report.responseNeeded || 'N/A',
        report.reportstatus || 'N/A',
      ]),
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [63, 81, 181] },
    });
    doc.save('approved_reports.pdf');
    setSuccess('Exported to PDF successfully');
    setTimeout(() => setSuccess(''), 4000);
    handleExportMenuClose();
  };

  const exportToWord = () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: 'Approved Reports',
            heading: 'Heading1',
          }),
          new DocxTable({
            rows: [
              new DocxTableRow({
                children: [
                  new DocxTableCell({ children: [new Paragraph('Date')] }),
                  new DocxTableCell({ children: [new Paragraph('Organization')] }),
                  new DocxTableCell({ children: [new Paragraph('Budget Year')] }),
                  new DocxTableCell({ children: [new Paragraph('Report Type')] }),
                  new DocxTableCell({ children: [new Paragraph('Auditor')] }),
                  new DocxTableCell({ children: [new Paragraph('Response')] }),
                  new DocxTableCell({ children: [new Paragraph('Status')] }),
                ],
              }),
              ...filteredReports.map(report => new DocxTableRow({
                children: [
                  new DocxTableCell({ children: [new Paragraph(report.createdDate ? new Date(report.createdDate).toLocaleDateString() : 'N/A')] }),
                  new DocxTableCell({ children: [new Paragraph(report.orgname || 'N/A')] }),
                  new DocxTableCell({ children: [new Paragraph(report.fiscalYear || 'N/A')] }),
                  new DocxTableCell({ children: [new Paragraph(report.reportype || 'N/A')] }),
                  new DocxTableCell({ children: [new Paragraph(report.submittedByAuditorUsername || 'N/A')] }),
                  new DocxTableCell({ children: [new Paragraph(report.responseNeeded || 'N/A')] }),
                  new DocxTableCell({ children: [new Paragraph(report.reportstatus || 'N/A')] }),
                ],
              })),
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      }],
    });
    Packer.toBlob(doc).then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'approved_reports.docx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccess('Exported to Word successfully');
      setTimeout(() => setSuccess(''), 4000);
    });
    handleExportMenuClose();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredReports.map(report => ({
      Date: report.createdDate ? new Date(report.createdDate).toLocaleDateString() : 'N/A',
      Organization: report.orgname || 'N/A',
      'Budget Year': report.fiscalYear || 'N/A',
      'Report Type': report.reportype || 'N/A',
      Auditor: report.submittedByAuditorUsername || 'N/A',
      Response: report.responseNeeded || 'N/A',
      Status: report.reportstatus || 'N/A',
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Approved Reports');
    XLSX.writeFile(workbook, 'approved_reports.xlsx');
    setSuccess('Exported to Excel successfully');
    setTimeout(() => setSuccess(''), 4000);
    handleExportMenuClose();
  };

  const handlePrint = () => {
    window.print();
    setSuccess('Print dialog opened');
    setTimeout(() => setSuccess(''), 4000);
    handleExportMenuClose();
  };

  const filteredReports = reports.filter((report) =>
    report
      ? (report.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (report.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (report.fiscalYear || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
        (report.submittedByAuditorUsername || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (report.responseNeeded || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (report.reportstatus || '').toLowerCase().includes(filterText.toLowerCase())
      : false
  );

  console.log('ApprovedReports: Rendering with showDetailsModal:', showDetailsModal, 'showLetterUploadModal:', showLetterUploadModal);

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                Approved Reports
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
                    <Box>
                      <Tooltip title="Export or print reports" placement="top">
                        <StyledButton
                          variant="contained"
                          color="primary"
                          startIcon={<FileDownloadIcon />}
                          onClick={handleExportMenuOpen}
                        >
                          Export
                        </StyledButton>
                      </Tooltip>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleExportMenuClose}
                        PaperProps={{
                          style: {
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            borderRadius: '8px',
                          },
                        }}
                      >
                        <MenuItem onClick={exportToPDF}>Export to PDF</MenuItem>
                        <MenuItem onClick={exportToWord}>Export to Word</MenuItem>
                        <MenuItem onClick={exportToExcel}>Export to Excel</MenuItem>
                        <MenuItem onClick={handlePrint}>Print</MenuItem>
                      </Menu>
                    </Box>
                  </Box>
                  {filteredReports.length > 0 ? (
                    <Table stickyHeader>
                      <TableHead>
                        <StyledTableRow>
                          <StyledTableCell>Date</StyledTableCell>
                          <StyledTableCell>Organization</StyledTableCell>
                          <StyledTableCell>Budget Year</StyledTableCell>
                          <StyledTableCell>Report Type</StyledTableCell>
                          <StyledTableCell>Status</StyledTableCell>
                          <StyledTableCell align="right">Action</StyledTableCell>
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
                              <StyledTableCell>{report.fiscalYear || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{report.reportype || 'N/A'}</StyledTableCell>
                              <StyledTableCell>
                                <Box
                                  sx={{
                                    display: 'inline-block',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: '12px',
                                    bgcolor: report.reportstatus === 'Approved' ? '#e8f5e9' : '#fff3e0',
                                    color: report.reportstatus === 'Approved' ? '#2e7d32' : '#f57c00',
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
                                      <IconButton
                                        color="success"
                                        onClick={() => handleDetails(report)}
                                        aria-label="View report details"
                                        size="small"
                                      >
                                        <VisibilityIcon />
                                      </IconButton>
                                      <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.8rem' }}>
                                        Details
                                      </Typography>
                                    </Box>
                                  </Tooltip>
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
                                  {isArchiver && report.reportstatus === 'Approved' && report.letterDocname && (
                                    <Tooltip title="Download Letter">
                                      <StyledButton
                                        variant="outlined"
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        onClick={() => handleDownload(report.id, report.letterDocname, 'letter')}
                                        aria-label="Download letter"
                                        sx={{ color: '#008000', borderColor: '#008000' }}
                                      >
                                        Letter
                                      </StyledButton>
                                    </Tooltip>
                                  )}
                                  {isArchiver && report.reportstatus === 'Approved' && !report.letterDocname && (
                                    <Tooltip title="Send Letter">
                                      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <IconButton
                                          color="secondary"
                                          onClick={() => handleLetterUpload(report)}
                                          aria-label="Send letter"
                                          size="small"
                                        >
                                          <UploadIcon />
                                        </IconButton>
                                        <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.8rem' }}>
                                          Send
                                        </Typography>
                                      </Box>
                                    </Tooltip>
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

      {/* Details Dialog */}
      <StyledDialog
        maxWidth="md"
        fullWidth
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
        aria-labelledby="report-details-dialog"
      >
        <DialogTitle id="report-details-dialog">Report Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
            <Box>
              <Typography variant="subtitle2">Date</Typography>
              <TextField
                fullWidth
                value={selectedReport?.createdDate ? new Date(selectedReport.createdDate).toLocaleDateString() : 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Status</Typography>
              <TextField
                fullWidth
                value={selectedReport?.reportstatus || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Organization</Typography>
              <TextField
                fullWidth
                value={selectedReport?.orgname || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Budget Year</Typography>
              <TextField
                fullWidth
                value={selectedReport?.fiscalYear || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Report Type</Typography>
              <TextField
                fullWidth
                value={selectedReport?.reportype || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Auditor</Typography>
              <TextField
                fullWidth
                value={selectedReport?.submittedByAuditorUsername || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Response Needed</Typography>
              <TextField
                fullWidth
                value={selectedReport?.responseNeeded || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Approver</Typography>
              <TextField
                fullWidth
                value={selectedReport?.lastModifiedBy || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Created By</Typography>
              <TextField
                fullWidth
                value={selectedReport?.createdBy || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Archiver</Typography>
              <TextField
                fullWidth
                value={selectedReport?.assignedByUsername || 'N/A'}
                InputProps={{ readOnly: true }}
                variant="outlined"
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2">Original Report</Typography>
              {selectedReport?.docname ? (
                <StyledButton
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(selectedReport.id, selectedReport.docname, 'original')}
                >
                  Download Report
                </StyledButton>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No report available
                </Typography>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2">Findings</Typography>
              {selectedReport?.supportingDocname ? (
                <StyledButton
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(selectedReport.id, selectedReport.supportingDocname, 'supporting')}
                  sx={{ color: '#0000FF', borderColor: '#0000FF' }}
                >
                  Download Findings
                </StyledButton>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No findings available
                </Typography>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2">Letter</Typography>
              {selectedReport?.letterDocname ? (
                <StyledButton
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(selectedReport.id, selectedReport.letterDocname, 'letter')}
                  sx={{ color: '#008000', borderColor: '#008000' }}
                >
                  Download Letter
                </StyledButton>
              ) : isArchiver && selectedReport?.reportstatus === 'Approved' ? (
                <StyledButton
                  variant="outlined"
                  size="small"
                  startIcon={<UploadIcon />}
                  onClick={() => handleLetterUpload(selectedReport)}
                >
                  Send Letter
                </StyledButton>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No letter uploaded
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={() => setShowDetailsModal(false)} color="primary">
            Close
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      {/* Letter Upload Dialog */}
      <StyledDialog
        maxWidth="sm"
        fullWidth
        open={showLetterUploadModal}
        onClose={() => setShowLetterUploadModal(false)}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
        aria-labelledby="letter-upload-dialog"
      >
        <DialogTitle id="letter-upload-dialog">Upload Letter</DialogTitle>
        <DialogContent>
          {modalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {modalError}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type="file"
              label="Choose Letter File"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setLetterFile(e.target.files[0])}
              variant="outlined"
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={() => setShowLetterUploadModal(false)} color="primary">
            Cancel
          </StyledButton>
          <StyledButton
            onClick={handleLetterSubmit}
            color="primary"
            variant="contained"
            disabled={!letterFile}
          >
            Submit
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      <Snackbar
        open={success || error}
        autoHideDuration={4000}
        onClose={() => {
          setSuccess('');
          setError('');
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => {
            setSuccess('');
            setError('');
          }}
          severity={success ? 'success' : 'error'}
          sx={{ minWidth: '250px', boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApprovedReports;