import React, { useEffect, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormSelect,
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
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  getDocuments,
  getBudgetYears,
  getReportNonSenders,
  getReportsByOrgAndFilters,
  getAllOrganizationsWithReports,
  getFeedbackNonSenders,
  getFeedbackSenders,
} from '../file/upload_download';
import axiosInstance from '../axiosConfig';
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

const StyledFormSelect = styled(CFormSelect)(({ theme }) => ({
  borderRadius: '8px',
  backgroundColor: '#f9fafb',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#f1f5f9',
  },
  '&:focus': {
    backgroundColor: '#fff',
    boxShadow: '0 0 8px rgba(25, 118, 210, 0.25)',
  },
}));

export default function AdvancedFilters() {
  const [filterType, setFilterType] = useState('report-non-senders');
  const [reportype, setReportype] = useState('');
  const [fiscalYear, setFiscalYear] = useState('');
  const [orgId, setOrgId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [budgetYears, setBudgetYears] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterText, setFilterText] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null); // State for export menu

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [docs, years, orgs] = await Promise.all([
          getDocuments().catch((err) => {
            setError((prev) => prev ? `${prev}; Failed to fetch documents` : 'Failed to fetch documents');
            return [];
          }),
          getBudgetYears().catch((err) => {
            setError((prev) => prev ? `${prev}; Failed to fetch budget years` : 'Failed to fetch budget years');
            return [];
          }),
          axiosInstance.get('/organizations').then((res) => res.data).catch((err) => {
            setError((prev) => prev ? `${prev}; Failed to fetch organizations` : 'Failed to fetch organizations');
            return [];
          }),
        ]);

        setDocuments(Array.isArray(docs) ? docs : []);
        setBudgetYears(Array.isArray(years) ? years : []);
        setOrganizations(Array.isArray(orgs) ? orgs : []);

        if (docs.length > 0) {
          setReportype(docs[0].reportype || '');
        }
        if (years.length > 0) {
          setFiscalYear(years[0].fiscalYear || years[0].fiscal_year || '');
        }
      } catch (err) {
        const errorMessage = err.response
          ? `Error ${err.response.status}: ${err.response.data?.message || err.response.data || err.response.statusText}`
          : err.message;
        setError((prev) => prev ? `${prev}; ${errorMessage}` : errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilterSubmit = async () => {
    setError(null);
    setSnackbarOpen(false);
    try {
      const params = { filterType };
      if (filterType !== 'orgs-with-reports') {
        if (!reportype || !fiscalYear) {
          throw new Error('Please select report type and budget year');
        }
        params.reportype = reportype;
        params.fiscalYear = fiscalYear;
      }
      if (filterType === 'reports-by-org') {
        if (!orgId) {
          throw new Error('Please select organization');
        }
        params.orgId = orgId;
      }

      const response = await axiosInstance.get('/transactions/advanced-filters', { params });
      const data = response.data;

      setResults(Array.isArray(data) ? data : []);
      setPage(0);
      setSnackbarMessage(data.length > 0 ? `${filterType} fetched successfully` : `No data found for ${filterType}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.data?.error || error.response.data || error.response.statusText}`
        : error.message;
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleOpenDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedItem(null);
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
    doc.text('Results', 14, 20);
    doc.autoTable({
      head: [['Organization Name', ...(filterType === 'reports-by-org' || filterType === 'feedback-senders' ? ['ID', 'Budget Year', 'Report Type', 'Status', 'Created Date', 'Document Name', 'Created By'] : ['Organization ID', 'Organization Type'])]],
      body: filteredResults.map(item => 
        filterType === 'reports-by-org' || filterType === 'feedback-senders' ? [
          item.orgname || 'N/A',
          item.id || 'N/A',
          item.fiscalYear || item.fiscal_year || 'N/A',
          item.reportype || 'N/A',
          item.reportstatus || 'N/A',
          item.createdDate ? new Date(item.createdDate).toLocaleDateString() : 'N/A',
          item.docname || 'N/A',
          item.createdBy || 'N/A',
        ] : [
          item.orgname || 'N/A',
          item.id || 'N/A',
          item.orgtype || 'N/A',
        ]),
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [63, 81, 181] },
    });
    doc.save('advanced_filters_results.pdf');
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
            text: 'Results',
            heading: 'Heading1',
          }),
          new DocxTable({
            rows: [
              new DocxTableRow({
                children: [
                  new DocxTableCell({ children: [new Paragraph('Organization Name')] }),
                  ...(filterType === 'reports-by-org' || filterType === 'feedback-senders' ? [
                    new DocxTableCell({ children: [new Paragraph('ID')] }),
                    new DocxTableCell({ children: [new Paragraph('Budget Year')] }),
                    new DocxTableCell({ children: [new Paragraph('Report Type')] }),
                    new DocxTableCell({ children: [new Paragraph('Status')] }),
                    new DocxTableCell({ children: [new Paragraph('Created Date')] }),
                    new DocxTableCell({ children: [new Paragraph('Document Name')] }),
                    new DocxTableCell({ children: [new Paragraph('Created By')] }),
                  ] : [
                    new DocxTableCell({ children: [new Paragraph('Organization ID')] }),
                    new DocxTableCell({ children: [new Paragraph('Organization Type')] }),
                  ]),
                ],
              }),
              ...filteredResults.map(item => new DocxTableRow({
                children: [
                  new DocxTableCell({ children: [new Paragraph(item.orgname || 'N/A')] }),
                  ...(filterType === 'reports-by-org' || filterType === 'feedback-senders' ? [
                    new DocxTableCell({ children: [new Paragraph(item.id || 'N/A')] }),
                    new DocxTableCell({ children: [new Paragraph(item.fiscalYear || item.fiscal_year || 'N/A')] }),
                    new DocxTableCell({ children: [new Paragraph(item.reportype || 'N/A')] }),
                    new DocxTableCell({ children: [new Paragraph(item.reportstatus || 'N/A')] }),
                    new DocxTableCell({ children: [new Paragraph(item.createdDate ? new Date(item.createdDate).toLocaleDateString() : 'N/A')] }),
                    new DocxTableCell({ children: [new Paragraph(item.docname || 'N/A')] }),
                    new DocxTableCell({ children: [new Paragraph(item.createdBy || 'N/A')] }),
                  ] : [
                    new DocxTableCell({ children: [new Paragraph(item.id || 'N/A')] }),
                    new DocxTableCell({ children: [new Paragraph(item.orgtype || 'N/A')] }),
                  ]),
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
      link.setAttribute('download', 'advanced_filters_results.docx');
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
    const worksheet = XLSX.utils.json_to_sheet(filteredResults.map(item => 
      filterType === 'reports-by-org' || filterType === 'feedback-senders' ? ({
        'Organization Name': item.orgname || 'N/A',
        'ID': item.id || 'N/A',
        'Budget Year': item.fiscalYear || item.fiscal_year || 'N/A',
        'Report Type': item.reportype || 'N/A',
        'Status': item.reportstatus || 'N/A',
        'Created Date': item.createdDate ? new Date(item.createdDate).toLocaleDateString() : 'N/A',
        'Document Name': item.docname || 'N/A',
        'Created By': item.createdBy || 'N/A',
      }) : ({
        'Organization Name': item.orgname || 'N/A',
        'Organization ID': item.id || 'N/A',
        'Organization Type': item.orgtype || 'N/A',
      })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
    XLSX.writeFile(workbook, 'advanced_filters_results.xlsx');
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

  const filteredResults = results.filter((item) =>
    (item.orgname || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                Advanced Report Filters
              </Typography>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <Box display="flex" justifyContent="center" my={2}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <CForm className="row g-3" sx={{ mb: 4 }}>
                    <CCol md={4}>
                      <CFormLabel htmlFor="filterType">Filter Type</CFormLabel>
                      <StyledFormSelect
                        id="filterType"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        <option value="report-non-senders">Report Non-Senders</option>
                        <option value="reports-by-org">Reports by Organization</option>
                        <option value="orgs-with-reports">Organizations with Reports</option>
                        <option value="feedback-non-senders">Feedback Non-Senders</option>
                        <option value="feedback-senders">Feedback Senders</option>
                      </StyledFormSelect>
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel htmlFor="reportype">Report Type</CFormLabel>
                      <StyledFormSelect
                        id="reportype"
                        value={reportype}
                        onChange={(e) => setReportype(e.target.value)}
                      >
                        <option value="">Select Report Type</option>
                        {documents.map((doc) => (
                          <option key={doc.id} value={doc.reportype}>
                            {doc.reportype}
                          </option>
                        ))}
                      </StyledFormSelect>
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel htmlFor="fiscalYear">Budget Year</CFormLabel>
                      <StyledFormSelect
                        id="fiscalYear"
                        value={fiscalYear}
                        onChange={(e) => setFiscalYear(e.target.value)}
                      >
                        <option value="">Select Budget Year</option>
                        {budgetYears.map((year) => (
                          <option key={year.id} value={year.fiscalYear || year.fiscal_year}>
                            {year.fiscalYear || year.fiscal_year}
                          </option>
                        ))}
                      </StyledFormSelect>
                    </CCol>
                    {filterType === 'reports-by-org' && (
                      <CCol md={4}>
                        <CFormLabel htmlFor="orgId">Organization</CFormLabel>
                        <StyledFormSelect
                          id="orgId"
                          value={orgId}
                          onChange={(e) => setOrgId(e.target.value)}
                        >
                          <option value="">Select Organization</option>
                          {organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                              {org.orgname}
                            </option>
                          ))}
                        </StyledFormSelect>
                      </CCol>
                    )}
                    <CCol xs={12}>
                      <StyledButton
                        variant="contained"
                        color="primary"
                        onClick={handleFilterSubmit}
                      >
                        Apply Filter
                      </StyledButton>
                    </CCol>
                  </CForm>

                  {results.length > 0 && (
                    <StyledTableContainer component={Paper}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                        <TextField
                          label="Search Results"
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
                          <Tooltip title="Export or print results" placement="top">
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
                      {filteredResults.length > 0 ? (
                        <Table stickyHeader>
                          <TableHead>
                            <StyledTableRow>
                              <StyledTableCell>Organization Name</StyledTableCell>
                              {(filterType === 'reports-by-org' || filterType === 'feedback-senders') && (
                                <>
                                  <StyledTableCell>ID</StyledTableCell>
                                  <StyledTableCell>Budget Year</StyledTableCell>
                                  <StyledTableCell>Report Type</StyledTableCell>
                                  <StyledTableCell>Status</StyledTableCell>
                                  <StyledTableCell>Created Date</StyledTableCell>
                                  <StyledTableCell>Document Name</StyledTableCell>
                                  <StyledTableCell>Created By</StyledTableCell>
                                </>
                              )}
                              <StyledTableCell align="right">Actions</StyledTableCell>
                            </StyledTableRow>
                          </TableHead>
                          <TableBody>
                            {filteredResults
                              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                              .map((item) => (
                                <StyledTableRow key={item.id || Math.random()}>
                                  <StyledTableCell>{item.orgname || 'N/A'}</StyledTableCell>
                                  {(filterType === 'reports-by-org' || filterType === 'feedback-senders') && (
                                    <>
                                      <StyledTableCell>{item.id || 'N/A'}</StyledTableCell>
                                      <StyledTableCell>{item.fiscalYear || item.fiscal_year || 'N/A'}</StyledTableCell>
                                      <StyledTableCell>{item.reportype || 'N/A'}</StyledTableCell>
                                      <StyledTableCell>{item.reportstatus || 'N/A'}</StyledTableCell>
                                      <StyledTableCell>{item.createdDate ? new Date(item.createdDate).toLocaleDateString() : 'N/A'}</StyledTableCell>
                                      <StyledTableCell>{item.docname || 'N/A'}</StyledTableCell>
                                      <StyledTableCell>{item.createdBy || 'N/A'}</StyledTableCell>
                                    </>
                                  )}
                                  <StyledTableCell align="right">
                                    <IconButton
                                      color="success"
                                      onClick={() => handleOpenDetails(item)}
                                      size="small"
                                    >
                                      <VisibilityIcon />
                                    </IconButton>
                                  </StyledTableCell>
                                </StyledTableRow>
                              ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <Typography sx={{ p: 2 }}>No results found.</Typography>
                      )}
                      <TablePagination
                        component="div"
                        count={filteredResults.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                      />
                    </StyledTableContainer>
                  )}
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Details Modal */}
      <StyledDialog
        maxWidth="md"
        fullWidth
        open={showDetailsModal}
        onClose={handleCloseDetails}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 800 }}
      >
        <DialogTitle>Details</DialogTitle>
        <DialogContent>
          <CForm className="row g-3">
            {(filterType === 'reports-by-org' || filterType === 'feedback-senders') ? (
              <>
                <CCol md={6}>
                  <CFormLabel>ID</CFormLabel>
                  <CFormInput value={selectedItem?.id || 'N/A'} readOnly />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Organization</CFormLabel>
                  <CFormInput value={selectedItem?.orgname || 'N/A'} readOnly />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Budget Year</CFormLabel>
                  <CFormInput value={selectedItem?.fiscalYear || selectedItem?.fiscal_year || 'N/A'} readOnly />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Report Type</CFormLabel>
                  <CFormInput value={selectedItem?.reportype || 'N/A'} readOnly />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Status</CFormLabel>
                  <CFormInput value={selectedItem?.reportstatus || 'N/A'} readOnly />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Created Date</CFormLabel>
                  <CFormInput
                    value={selectedItem?.createdDate ? new Date(selectedItem.createdDate).toLocaleDateString() : 'N/A'}
                    readOnly
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Document Name</CFormLabel>
                  <CFormInput value={selectedItem?.docname || 'N/A'} readOnly />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Created By</CFormLabel>
                  <CFormInput value={selectedItem?.createdBy || 'N/A'} readOnly />
                </CCol>
              </>
            ) : (
              <>
                <CCol md={6}>
                  <CFormLabel>Organization ID</CFormLabel>
                  <CFormInput value={selectedItem?.id || 'N/A'} readOnly />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Organization Name</CFormLabel>
                  <CFormInput value={selectedItem?.orgname || 'N/A'} readOnly />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Organization Type</CFormLabel>
                  <CFormInput value={selectedItem?.orgtype || 'N/A'} readOnly />
                </CCol>
              </>
            )}
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