// AuditorTasks.jsx
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
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getMyTasks, downloadFile, submitFindings, approveReport, rejectReport, getUsersByRole } from '../file/upload_download';
import { useAuth } from '../views/pages/AuthProvider';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell, WidthType } from 'docx';
import * as XLSX from 'xlsx';

// Styled components (unchanged)
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

export default function AuditorTasks() {
  const { roles } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [showFindingsModal, setShowFindingsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [reasonOfRejection, setReasonOfRejection] = useState('');
  const [responseNeeded, setResponseNeeded] = useState('Pending');
  const [approvalDocument, setApprovalDocument] = useState(null);
  const [approvers, setApprovers] = useState([]);
  const [selectedApprover, setSelectedApprover] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  // Role checking function to match Nav
  const hasRole = (role) => {
    const result = Array.isArray(roles) && roles.some((r) => r.description === role);
    console.log(`AuditorTasks: Checking role ${role}: ${result}`);
    return result;
  };

  const isSeniorAuditor = hasRole('SENIOR_AUDITOR');
  const isApprover = hasRole('APPROVER');

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const data = await getMyTasks();
      console.log('AuditorTasks: Tasks fetched:', data);
      let filteredTasks;
      if (isSeniorAuditor) {
        filteredTasks = data.filter(task =>
          ['Assigned', 'Rejected'].includes(task.reportstatus)
        );
      } else if (isApprover) {
        filteredTasks = data.filter(task =>
          ['Under Review', 'Corrected'].includes(task.reportstatus)
        );
      } else {
        filteredTasks = [];
      }
      setTasks(Array.isArray(filteredTasks) ? filteredTasks : []);
      setLoading(false);
      if (filteredTasks.length === 0) {
        setError('No tasks available for your role.');
      } else {
        setError(null);
      }
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${
            error.response.data?.message || error.response.data || error.response.statusText
          }`
        : error.message;
      console.error('AuditorTasks: Error fetching tasks:', errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AuditorTasks: User roles:', roles);
    fetchMyTasks();
  }, [roles]);

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
      const filename = type === 'original' ? (docname || 'file') : 
                      type === 'supporting' ? (supportingDocname || 'file') : 
                      (supportingDocname || 'file');
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSnackbarMessage(`Successfully downloaded ${type} document`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      let msg = 'Error downloading file';
      if (error.response) {
        if (error.response.status === 404) {
          const text = await error.response.data.text();
          msg = text || `File not found for ${type} document`;
        } else if (error.response.data) {
          msg = typeof error.response.data === 'string' ? error.response.data : 
                error.response.data.error || `Error downloading ${type} file`;
        }
      } else {
        msg = error.message || `Error downloading ${type} file`;
      }
      console.error('Download error:', msg, error.response?.status, error.response?.data);
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSubmitFindings = async (task) => {
    setSelectedTask(task);
    setRemarks('');
    setResponseNeeded('Pending');
    setSelectedApprover('');
    try {
      const approversData = await getUsersByRole('APPROVER');
      setApprovers(Array.isArray(approversData) ? approversData : []);
      setShowFindingsModal(true);
    } catch (error) {
      const msg = error.response?.data || 'Error loading approvers';
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleFindingsSubmit = async () => {
    if (!remarks || !selectedApprover || !responseNeeded) {
      setSnackbarMessage('Please enter findings, select an approver, and select response needed');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      const supportingDocument = document.getElementById('supportingDocument')?.files[0];
      await submitFindings(selectedTask.id, remarks, selectedApprover, responseNeeded, supportingDocument);
      setSnackbarMessage('Findings submitted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setShowFindingsModal(false);
      setRemarks('');
      setResponseNeeded('Pending');
      setSelectedApprover('');
      await fetchMyTasks();
    } catch (error) {
      const msg = error.response?.data || 'Error submitting findings';
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleApprove = (task) => {
    setSelectedTask(task);
    setApprovalDocument(null);
    setShowApprovalModal(true);
  };

  const handleApproveSubmit = async () => {
    try {
      const approvalFile = document.getElementById('approvalDocument')?.files[0];
      await approveReport(selectedTask.id, approvalFile);
      setSnackbarMessage('Report approved successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setShowApprovalModal(false);
      setApprovalDocument(null);
      await fetchMyTasks();
    } catch (error) {
      const msg = error.response?.data || 'Error approving report';
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleReject = (task) => {
    setSelectedTask(task);
    setReasonOfRejection('');
    setShowFindingsModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!reasonOfRejection) {
      setSnackbarMessage('Please provide a reason for rejection');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      const rejectionDocument = document.getElementById('rejectionDocument')?.files[0];
      await rejectReport(selectedTask.id, reasonOfRejection, rejectionDocument);
      setSnackbarMessage('Report rejected successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setShowFindingsModal(false);
      setReasonOfRejection('');
      await fetchMyTasks();
    } catch (error) {
      const msg = error.response?.data || 'Error rejecting report';
      setSnackbarMessage(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleOpenDetails = (task) => {
    setSelectedTask(task);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
  };

  const handleCloseFindingsModal = () => {
    setShowFindingsModal(false);
    setRemarks('');
    setReasonOfRejection('');
    setResponseNeeded('Pending');
    setSelectedApprover('');
  };

  const handleCloseApprovalModal = () => {
    setShowApprovalModal(false);
    setApprovalDocument(null);
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

  const handleExportMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setAnchorEl(null);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(isSeniorAuditor ? 'Senior Auditor Tasks' : 'Approver Tasks', 14, 20);
    doc.autoTable({
      head: isApprover
        ? [['Date', 'Organization', 'Report Type', 'Auditor']]
        : [['Date', 'Status', 'Organization', 'Budget Year', 'Report Type', 'Auditor']],
      body: filteredTasks.map(task => isApprover
        ? [
            task.createdDate ? new Date(task.createdDate).toLocaleDateString() : 'N/A',
            task.orgname || 'N/A',
            task.reportype || 'N/A',
            task.submittedByAuditorUsername || task.assignedAuditorUsername || 'N/A',
          ]
        : [
            task.createdDate ? new Date(task.createdDate).toLocaleDateString() : 'N/A',
            task.reportstatus || 'N/A',
            task.orgname || 'N/A',
            task.fiscalYear || 'N/A',
            task.reportype || 'N/A',
            task.reportstatus === 'Assigned' ? (task.assignedAuditorUsername || 'N/A') : (task.submittedByAuditorUsername || 'N/A'),
          ]),
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [63, 81, 181] },
    });
    doc.save('tasks.pdf');
    setSnackbarMessage('Exported to PDF successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    handleExportMenuClose();
  };

  const exportToWord = () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: isSeniorAuditor ? 'Senior Auditor Tasks' : 'Approver Tasks',
            heading: 'Heading1',
          }),
          new DocxTable({
            rows: [
              new DocxTableRow({
                children: isApprover
                  ? [
                      new DocxTableCell({ children: [new Paragraph('Date')] }),
                      new DocxTableCell({ children: [new Paragraph('Organization')] }),
                      new DocxTableCell({ children: [new Paragraph('Report Type')] }),
                      new DocxTableCell({ children: [new Paragraph('Auditor')] }),
                    ]
                  : [
                      new DocxTableCell({ children: [new Paragraph('Date')] }),
                      new DocxTableCell({ children: [new Paragraph('Status')] }),
                      new DocxTableCell({ children: [new Paragraph('Organization')] }),
                      new DocxTableCell({ children: [new Paragraph('Budget Year')] }),
                      new DocxTableCell({ children: [new Paragraph('Report Type')] }),
                      new DocxTableCell({ children: [new Paragraph('Auditor')] }),
                    ],
              }),
              ...filteredTasks.map(task => new DocxTableRow({
                children: isApprover
                  ? [
                      new DocxTableCell({ children: [new Paragraph(task.createdDate ? new Date(task.createdDate).toLocaleDateString() : 'N/A')] }),
                      new DocxTableCell({ children: [new Paragraph(task.orgname || 'N/A')] }),
                      new DocxTableCell({ children: [new Paragraph(task.reportype || 'N/A')] }),
                      new DocxTableCell({ children: [new Paragraph(task.submittedByAuditorUsername || task.assignedAuditorUsername || 'N/A')] }),
                    ]
                  : [
                      new DocxTableCell({ children: [new Paragraph(task.createdDate ? new Date(task.createdDate).toLocaleDateString() : 'N/A')] }),
                      new DocxTableCell({ children: [new Paragraph(task.reportstatus || 'N/A')] }),
                      new DocxTableCell({ children: [new Paragraph(task.orgname || 'N/A')] }),
                      new DocxTableCell({ children: [new Paragraph(task.fiscalYear || 'N/A')] }),
                      new DocxTableCell({ children: [new Paragraph(task.reportype || 'N/A')] }),
                      new DocxTableCell({ children: [new Paragraph(task.reportstatus === 'Assigned' ? (task.assignedAuditorUsername || 'N/A') : (task.submittedByAuditorUsername || 'N/A'))] }),
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
      link.setAttribute('download', 'tasks.docx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSnackbarMessage('Exported to Word successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    });
    handleExportMenuClose();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTasks.map(task => isApprover
      ? ({
          Date: task.createdDate ? new Date(task.createdDate).toLocaleDateString() : 'N/A',
          Organization: task.orgname || 'N/A',
          'Report Type': task.reportype || 'N/A',
          Auditor: task.submittedByAuditorUsername || task.assignedAuditorUsername || 'N/A',
        })
      : ({
          Date: task.createdDate ? new Date(task.createdDate).toLocaleDateString() : 'N/A',
          Status: task.reportstatus || 'N/A',
          Organization: task.orgname || 'N/A',
          'Budget Year': task.fiscalYear || 'N/A',
          'Report Type': task.reportype || 'N/A',
          Auditor: task.reportstatus === 'Assigned' ? (task.assignedAuditorUsername || 'N/A') : (task.submittedByAuditorUsername || 'N/A'),
        })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
    XLSX.writeFile(workbook, 'tasks.xlsx');
    setSnackbarMessage('Exported to Excel successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    handleExportMenuClose();
  };

  const handlePrint = () => {
    window.print();
    setSnackbarMessage('Print dialog opened');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    handleExportMenuClose();
  };

  const filteredTasks = tasks.filter(
    (task) =>
      (task.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (task.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (task.fiscalYear || '').toString().toLowerCase().includes(filterText.toLowerCase()) ||
      (task.submittedByAuditorUsername || task.assignedAuditorUsername || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (task.reportstatus || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (task.responseNeeded || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                {isSeniorAuditor ? 'Senior Auditor Tasks' : 'Approver Tasks'}
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
                      label="Search Tasks"
                      variant="outlined"
                      value={filterText}
                      onChange={handleFilterChange}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Tooltip title="Search tasks by organization, report type, year, auditor, status, or response needed" placement="top">
                              <SearchIcon />
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ width: { xs: '100%', sm: '40%' } }}
                    />
                    <Box>
                      <Tooltip title="Export or print tasks" placement="top">
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
                  {filteredTasks.length > 0 ? (
                    <Table stickyHeader>
                      <TableHead>
                        <StyledTableRow>
                          <StyledTableCell>Date</StyledTableCell>
                          {!isApprover && <StyledTableCell>Status</StyledTableCell>}
                          <StyledTableCell>Organization</StyledTableCell>
                          {!isApprover && <StyledTableCell>Budget Year</StyledTableCell>}
                          <StyledTableCell>Report Type</StyledTableCell>
                          <StyledTableCell>Auditor</StyledTableCell>
                          <StyledTableCell align="right">Actions</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {filteredTasks
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((task) => (
                            <StyledTableRow key={task.id}>
                              <StyledTableCell>
                                {task.createdDate
                                  ? new Date(task.createdDate).toLocaleDateString()
                                  : 'N/A'}
                              </StyledTableCell>
                              {!isApprover && (
                                <StyledTableCell>
                                  <Box
                                    sx={{
                                      display: 'inline-block',
                                      px: 1,
                                      py: 0.5,
                                      borderRadius: '12px',
                                      bgcolor:
                                        task.reportstatus === 'Assigned' || task.reportstatus === 'Under Review'
                                          ? '#e8f5e9'
                                          : task.reportstatus === 'Rejected' || task.reportstatus === 'Corrected'
                                          ? '#fff3e0'
                                          : '#f5f5f5',
                                      color:
                                        task.reportstatus === 'Assigned' || task.reportstatus === 'Under Review'
                                          ? '#2e7d32'
                                          : task.reportstatus === 'Rejected' || task.reportstatus === 'Corrected'
                                          ? '#f57c00'
                                          : '#616161',
                                      fontSize: '0.85rem',
                                      fontWeight: 'medium',
                                    }}
                                  >
                                    {task.reportstatus || 'N/A'}
                                  </Box>
                                </StyledTableCell>
                              )}
                              <StyledTableCell>{task.orgname || 'N/A'}</StyledTableCell>
                              {!isApprover && (
                                <StyledTableCell>{task.fiscalYear || 'N/A'}</StyledTableCell>
                              )}
                              <StyledTableCell>{task.reportype || 'N/A'}</StyledTableCell>
                              <StyledTableCell>
                                {task.reportstatus === 'Assigned'
                                  ? task.assignedAuditorUsername || 'N/A'
                                  : task.submittedByAuditorUsername || 'N/A'}
                              </StyledTableCell>
                              <StyledTableCell align="right">
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                                  <Tooltip title="View task details" placement="top">
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', mr: 1 }}>
                                      <IconButton
                                        color="success"
                                        onClick={() => handleOpenDetails(task)}
                                        size="small"
                                        aria-label="View task details"
                                      >
                                        <VisibilityIcon />
                                      </IconButton>
                                      <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.8rem' }}>
                                        Details
                                      </Typography>
                                    </Box>
                                  </Tooltip>
                                  {task.docname && (
                                    <Tooltip title="Download report" placement="top">
                                      <Box sx={{ display: 'inline-flex', alignItems: 'center', mr: 1 }}>
                                        <IconButton
                                          color="primary"
                                          onClick={() =>
                                            handleDownload(
                                              task.id,
                                              task.docname,
                                              task.supportingDocname,
                                              'original'
                                            )
                                          }
                                          size="small"
                                          aria-label="Download report"
                                        >
                                          <DownloadIcon />
                                        </IconButton>
                                        <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.8rem' }}>
                                          Report
                                        </Typography>
                                      </Box>
                                    </Tooltip>
                                  )}
                                  {task.supportingDocname && (
                                    <Tooltip title="Download findings document" placement="top">
                                      <Box sx={{ display: 'inline-flex', alignItems: 'center', mr: 1 }}>
                                        <IconButton
                                          color="secondary"
                                          onClick={() =>
                                            handleDownload(
                                              task.id,
                                              task.supportingDocname,
                                              task.supportingDocname,
                                              'supporting'
                                            )
                                          }
                                          size="small"
                                          aria-label="Download findings document"
                                        >
                                          <DownloadIcon />
                                        </IconButton>
                                        <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.8rem' }}>
                                          Findings
                                        </Typography>
                                      </Box>
                                    </Tooltip>
                                  )}
                                  {isSeniorAuditor && (task.reportstatus === 'Assigned' || task.reportstatus === 'Rejected') && (
                                    <Tooltip title="Submit findings" placement="top">
                                      <Box sx={{ display: 'inline-flex', alignItems: 'center', mr: 1 }}>
                                        <IconButton
                                          color="primary"
                                          onClick={() => handleSubmitFindings(task)}
                                          size="small"
                                          aria-label="Submit findings for task"
                                        >
                                          <AssignmentIcon />
                                        </IconButton>
                                        <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.8rem' }}>
                                          Evaluate
                                        </Typography>
                                      </Box>
                                    </Tooltip>
                                  )}
                                  {isApprover && (task.reportstatus === 'Under Review' || task.reportstatus === 'Corrected') && (
                                    <>
                                      <Tooltip title="Approve report" placement="top">
                                        <Box sx={{ display: 'inline-flex', alignItems: 'center', mr: 1 }}>
                                          <IconButton
                                            color="success"
                                            onClick={() => handleApprove(task)}
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
                                      <Tooltip title="Reject report" placement="top">
                                        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                          <IconButton
                                            color="error"
                                            onClick={() => handleReject(task)}
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
                    <Typography sx={{ p: 2 }}>No tasks found.</Typography>
                  )}
                  <TablePagination
                    component="div"
                    count={filteredTasks.length}
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

      {/* Findings/Rejection Modal */}
      <StyledDialog
        maxWidth="md"
        fullWidth
        open={showFindingsModal}
        onClose={handleCloseFindingsModal}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
      >
        <DialogTitle>{isSeniorAuditor ? 'Submit Findings' : 'Reject Report'}</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            {isSeniorAuditor ? (
              <>
                <CCol xs={12}>
                  <CFormLabel htmlFor="remarks">Findings</CFormLabel>
                  <CFormInput
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter findings"
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
                  <CFormLabel htmlFor="supportingDocument">Attach File</CFormLabel>
                  <input
                    type="file"
                    className="form-control"
                    id="supportingDocument"
                    style={{ borderRadius: '8px' }}
                  />
                </CCol>
              </>
            ) : (
              <>
                <CCol xs={12}>
                  <CFormLabel htmlFor="reasonOfRejection">Reason for Rejection</CFormLabel>
                  <CFormInput
                    id="reasonOfRejection"
                    value={reasonOfRejection}
                    onChange={(e) => setReasonOfRejection(e.target.value)}
                    placeholder="Enter reason for rejection"
                  />
                </CCol>
                <CCol xs={12}>
                  <CFormLabel htmlFor="rejectionDocument">Attach File</CFormLabel>
                  <input
                    type="file"
                    className="form-control"
                    id="rejectionDocument"
                    style={{ borderRadius: '8px' }}
                  />
                </CCol>
              </>
            )}
          </CForm>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCloseFindingsModal} color="primary">
            Cancel
          </StyledButton>
          <StyledButton
            onClick={isSeniorAuditor ? handleFindingsSubmit : handleRejectSubmit}
            color="primary"
            variant="contained"
          >
            {isSeniorAuditor ? 'Submit' : 'Reject'}
          </StyledButton>
        </DialogActions>
      </StyledDialog>

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

      {/* Details Modal */}
      <StyledDialog
        maxWidth="md"
        fullWidth
        open={showDetailsModal}
        onClose={handleCloseDetails}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
      >
        <DialogTitle>Task Details</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            <CCol md={6}>
              <CFormLabel>Date</CFormLabel>
              <CFormInput
                value={selectedTask?.createdDate ? new Date(selectedTask.createdDate).toLocaleDateString() : 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Status</CFormLabel>
              <CFormInput
                value={selectedTask?.reportstatus || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Organization</CFormLabel>
              <CFormInput
                value={selectedTask?.orgname || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Budget Year</CFormLabel>
              <CFormInput
                value={selectedTask?.fiscalYear || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Created By</CFormLabel>
              <CFormInput
                value={selectedTask?.createdBy || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Report Type</CFormLabel>
              <CFormInput
                value={selectedTask?.reportype || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Auditor</CFormLabel>
              <CFormInput
                value={selectedTask?.submittedByAuditorUsername || selectedTask?.assignedAuditorUsername || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Response Needed</CFormLabel>
              <CFormInput
                value={selectedTask?.responseNeeded || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Archiver</CFormLabel>
              <CFormInput
                value={selectedTask?.assignedByUsername || 'N/A'}
                readOnly
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Findings</CFormLabel>
              <CFormInput
                value={selectedTask?.remarks || 'N/A'}
                readOnly
              />
            </CCol>
            {selectedTask?.reasonOfRejection && (
              <CCol md={12}>
                <CFormLabel>Reason for Rejection</CFormLabel>
                <CFormInput
                  value={selectedTask.reasonOfRejection || 'N/A'}
                  readOnly
                />
              </CCol>
            )}
            <CCol xs={12}>
              <CFormLabel>Documents</CFormLabel>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {selectedTask?.docname && (
                  <Tooltip title="Download report" placement="top">
                    <StyledButton
                      variant="contained"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      onClick={() =>
                        handleDownload(
                          selectedTask.id,
                          selectedTask.docname,
                          selectedTask.supportingDocname,
                          'original'
                        )
                      }
                    >
                      Report
                    </StyledButton>
                  </Tooltip>
                )}
                {selectedTask?.supportingDocname && (
                  <Tooltip title="Download findings document" placement="top">
                    <StyledButton
                      variant="contained"
                      color="secondary"
                      startIcon={<DownloadIcon />}
                      onClick={() =>
                        handleDownload(
                          selectedTask.id,
                          selectedTask.supportingDocname,
                          selectedTask.supportingDocname,
                          'supporting'
                        )
                      }
                    >
                      Finding
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