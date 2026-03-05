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
  Alert,
  TextField,
  TablePagination,
  TableContainer,
  Box,
  Paper,
  Typography,
  Tooltip,
  CircularProgress,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axiosInstance from '../../axiosConfig';
import { useAuth } from '../views/pages/AuthProvider'; // Import useAuth to get user roles

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  backgroundColor: theme.palette.background.paper,
}));

const StyledButton = styled(IconButton)(({ theme }) => ({
  borderRadius: '6px',
  padding: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
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

const GetDocument = () => {
  const { roles = [], user } = useAuth(); // Get roles and user from AuthProvider
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [filterText, setFilterText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Check if user has required role
  const hasAccess = roles.includes('USER') || roles.includes('MANAGER');

  useEffect(() => {
    if (!hasAccess) {
      setError('Access denied: You must have USER or MANAGER role to view this page.');
      setLoading(false);
      return;
    }

    const fetchDocuments = async () => {
      try {
        const response = await axiosInstance.get('/transactions/letters?type=dispatched');
        const validDocuments = Array.isArray(response.data)
          ? response.data.filter(
              (doc) =>
                doc &&
                doc.id &&
                doc.lastModifiedBy &&
                (doc.letterDocname || doc.docname) &&
                doc.reportcategory === 'Letter'
            )
          : [];
        setDocuments(validDocuments);
        if (validDocuments.length === 0) {
          setError('No dispatched documents found for your organization.');
        }
      } catch (err) {
        const errorMessage =
          err.response?.status === 403
            ? err.response?.data?.error || 'Access denied: Ensure your account is assigned to an organization.'
            : `Failed to load documents: ${err.message}`;
        setError(errorMessage);
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        console.error('Error details:', err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [hasAccess]);

  const handleDownload = useCallback(async (id, fileName) => {
    try {
      const response = await axiosInstance.get(`/transactions/download/${id}/letter`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data]);
      if (blob.size === 0) {
        throw new Error('Empty file received');
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `document-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSnackbarMessage(`Successfully downloaded ${fileName || `document-${id}.pdf`}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      const errorMessage =
        err.response?.status === 404
          ? 'Document not found'
          : `Failed to download document: ${err.response?.data?.message || err.message}`;
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, []);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setError(null);
  };

  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      (doc.lastModifiedBy || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (doc.letterDocname || doc.docname || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (doc.lastModifiedDate ? new Date(doc.lastModifiedDate).toLocaleString() : '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <CCardHeader>
              <Typography variant="h6" fontWeight="bold">
                Dispatched Documents
              </Typography>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <Box display="flex" justifyContent="center" my={2}>
                  <CircularProgress />
                </Box>
              ) : error && !filteredDocuments.length ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <StyledTableContainer component={Paper}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 2 }}>
                    <TextField
                      label="Search Documents"
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
                  {filteredDocuments.length > 0 ? (
                    <Table stickyHeader>
                      <TableHead>
                        <StyledTableRow>
                          <StyledTableCell>Date</StyledTableCell>
                          <StyledTableCell>Sender</StyledTableCell>
                          <StyledTableCell>Document Name</StyledTableCell>
                          <StyledTableCell align="right">Action</StyledTableCell>
                        </StyledTableRow>
                      </TableHead>
                      <TableBody>
                        {filteredDocuments
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((doc) => (
                            <StyledTableRow key={doc.id}>
                              <StyledTableCell>
                                {doc.lastModifiedDate ? new Date(doc.lastModifiedDate).toLocaleString() : 'N/A'}
                              </StyledTableCell>
                              <StyledTableCell>{doc.lastModifiedBy || 'N/A'}</StyledTableCell>
                              <StyledTableCell>{doc.letterDocname || doc.docname || 'N/A'}</StyledTableCell>
                              <StyledTableCell align="right">
                                <Tooltip title="Download Document">
                                  <StyledButton
                                    color="primary"
                                    onClick={() => handleDownload(doc.id, doc.letterDocname || doc.docname)}
                                    aria-label="Download document"
                                  >
                                    <DownloadIcon />
                                  </StyledButton>
                                </Tooltip>
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography sx={{ p: 2, textAlign: 'center' }}>
                      No documents found.
                    </Typography>
                  )}
                  <TablePagination
                    component="div"
                    count={filteredDocuments.length}
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
};

export default GetDocument;