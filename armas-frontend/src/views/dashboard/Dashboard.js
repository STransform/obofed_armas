import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Business,
  Description,
  CheckCircle,
  Cancel,
  PieChart,
  Group,
  Timeline,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import './dashboard.css';
import 'animate.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip);

// Custom theme (kept unchanged)
const theme = createTheme({
  palette: {
    primary: { main: '#013A6B' },
    secondary: { main: '#00C4B4' },
    warning: { main: '#ff9800' },
    danger: { main: '#dc3545' },
    success: { main: '#28a745' },
    background: { default: '#fff', paper: '#fff' },
    text: { primary: '#1a2035', secondary: '#6c757d' },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    subtitle1: { fontWeight: 500, fontSize: '0.875rem' },
    subtitle2: { fontWeight: 400, fontSize: '0.6875rem' },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
          '&:hover': { backgroundColor: '#FF0000', color: '#fff' },
        },
      },
    },
  },
});

// Axios config (kept unchanged)
axios.defaults.baseURL = 'http://localhost:8080';
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Gradient helper (kept)
const getGradient = (ctx, chartArea, colorStart, colorEnd) => {
  if (!chartArea || !ctx) return colorStart; // Fallback to solid color
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
};

// default stats shape (kept same as original)
const EMPTY_STATS = {
  totalOrganizations: 0,
  totalReportTypes: 0,
  totalDirectorates: 0,
  totalDocuments: 0,
  totalUsers: 0,
  reportTypeStats: {},
};

// Memoized child for each report type (reduces rerenders & expensive chart prop recreation)
const ReportTypeCard = React.memo(function ReportTypeCard({ reportType, counts }) {
  // memoize chart datasets/options per counts so Chart.js props are stable
  const barData = useMemo(() => ({
    labels: ['Senders', 'Non-Senders'],
    datasets: [
      {
        label: 'Number of Organizations',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return ['#013A6B', '#dc3545'];
          return [
            getGradient(ctx, chartArea, '#013A6B', '#00C4B4'),
            getGradient(ctx, chartArea, '#dc3545', '#ff8a65'),
          ];
        },
        data: [counts.senders, counts.nonSenders],
        borderRadius: 8,
      },
    ],
  }), [counts.senders, counts.nonSenders]);

  const barOptions = useMemo(() => ({
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Number of Organizations', font: { size: 14 } },
        grid: { color: '#e0e0e0' },
      },
      x: { grid: { display: false } },
    },
    animation: { duration: 1000, easing: 'easeOutQuart' }, // preserved animation
  }), []);

  const pieData = useMemo(() => ({
    labels: ['Senders', 'Non-Senders'],
    datasets: [
      {
        label: 'Number of Organizations',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return ['#013A6B', '#dc3545'];
          return [
            getGradient(ctx, chartArea, '#013A6B', '#00C4B4'),
            getGradient(ctx, chartArea, '#dc3545', '#ff8a65'),
          ];
        },
        data: [counts.senders, counts.nonSenders],
        borderWidth: 1,
        borderColor: '#fff',
      },
    ],
  }), [counts.senders, counts.nonSenders]);

  const pieOptions = useMemo(() => ({
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
      legend: {
        display: true,
        position: 'top',
        labels: { font: { size: 12 } },
      },
    },
    animation: { duration: 1000, easing: 'easeOutQuart' }, // preserved animation
  }), []);

  return (
    <Grid item xs={12} md={12}>
      <Card className="animate__animated animate__fadeInUp">
        <CardContent sx={{ bgcolor: 'white', color: 'black', p: 2, borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PieChart sx={{ mr: 1 }} />
            <Typography variant="h6">{reportType} Senders vs Non-Senders</Typography>
          </Box>
        </CardContent>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box className="chart-container">
                <Bar data={barData} options={barOptions} height={300} />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box className="chart-container">
                <Pie data={pieData} options={pieOptions} height={300} />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
});

const Charts = () => {
  const [budgetYears, setBudgetYears] = useState([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('');
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true); // kept single loading flag to preserve behavior
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  // cache & cancellation refs (no UI changes, internal only)
  const statsCacheRef = useRef({});
  const cancelTokenRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // cancel any in-flight request on unmount
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  // Fetch budget years (unchanged logic & error messages)
  useEffect(() => {
    setLoading(true);
    axios
      .get('/transactions/budget-years')
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        if (!isMountedRef.current) return;
        setBudgetYears(data);
        if (data.length > 0) setSelectedFiscalYear(data[0].fiscalYear);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        setError(`Failed to load budget years: ${err.response?.data?.message || err.message}`);
        setBudgetYears([]);
        setLoading(false);
      });
  }, []);

  // Fetch dashboard stats whenever selectedFiscalYear changes
  useEffect(() => {
    if (!selectedFiscalYear) return;

    // Cancel previous stats request if any
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('New fiscal year selected');
      cancelTokenRef.current = null;
    }

    // Keep existing loading semantics (set true then false)
    setLoading(true);

    // If cached, use it (fast path)
    const cached = statsCacheRef.current[selectedFiscalYear];
    if (cached) {
      setStats(cached);
      setLoading(false);
      return;
    }

    // otherwise fetch and cache
    const source = axios.CancelToken.source();
    cancelTokenRef.current = source;

    axios
      .get(`/transactions/dashboard-stats?fiscalYear=${selectedFiscalYear}`, {
        cancelToken: source.token,
      })
      .then((response) => {
        if (!isMountedRef.current) return;
        const payload = response.data || EMPTY_STATS;
        statsCacheRef.current[selectedFiscalYear] = payload; // cache result
        setStats(payload);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        if (axios.isCancel(err)) {
          // request was cancelled - do not treat as error
          return;
        }
        let errorMessage = 'Failed to load dashboard statistics.';
        if (err.response?.status === 404) {
          errorMessage = `No statistics available for fiscal year ${selectedFiscalYear}.`;
        } else if (err.response?.status === 403) {
          errorMessage = 'You do not have permission to view dashboard statistics.';
        } else {
          errorMessage = err.response?.data?.message || err.message;
        }
        setError(errorMessage);
        setLoading(false);
      });

    // cleanup for this effect: cancel if fiscalYear changes before request completes
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Fiscal year changed / effect cleanup');
        cancelTokenRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFiscalYear]);

  const handleFiscalYearChange = useCallback((e) => {
    setSelectedFiscalYear(e.target.value);
    setError(null);
    // keep original behavior of resetting stats while loading (preserve functionality)
    setStats(EMPTY_STATS);
  }, []);

  const toggleDrawer = useCallback(() => setDrawerOpen((s) => !s), []);

  // preserve original error-only-without-years UI
  if (error && budgetYears.length === 0) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Alert severity="error" icon={<Cancel />}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // preserve original single-loading spinner UI
  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <CircularProgress color="primary" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading dashboard...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={toggleDrawer}
          sx={{ '& .MuiDrawer-paper': { width: 250, bgcolor: 'primary.main', color: 'white' } }}
        >
          <List>
            <ListItem button onClick={() => navigate('/')}>
              <ListItemIcon sx={{ color: 'white' }}><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => navigate('/organizations')}>
              <ListItemIcon sx={{ color: 'white' }}><Business /></ListItemIcon>
              <ListItemText primary="Organization" />
            </ListItem>
            <ListItem button onClick={() => navigate('/directorates')}>
              <ListItemIcon sx={{ color: 'white' }}><Group /></ListItemIcon>
              <ListItemText primary="Directorate" />
            </ListItem>
            <ListItem button onClick={() => navigate('/documents')}>
              <ListItemIcon sx={{ color: 'white' }}><Description /></ListItemIcon>
              <ListItemText primary="Document" />
            </ListItem>
            <ListItem button onClick={() => navigate('/mastertransactionlists')}>
              <ListItemIcon sx={{ color: 'white' }}><PieChart /></ListItemIcon>
              <ListItemText primary="Reports" />
            </ListItem>
          </List>
        </Drawer>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Box className="dashboard-container">
            <Grid container spacing={3}>
              {/* Fiscal Year Selection */}
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Card className="stat-card hrm-main-card primary">
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}><Timeline sx={{ fontSize: 18 }} /></Avatar>
                      <Typography variant="h6" color="primary">Fiscal Year</Typography>
                    </Box>
                    <FormControl fullWidth variant="outlined">
                      <Select
                        value={selectedFiscalYear}
                        onChange={handleFiscalYearChange}
                        sx={{ borderRadius: 2, mt: 2 }}
                      >
                        <MenuItem value="">Choose a fiscal year</MenuItem>
                        {budgetYears.map((year) => (
                          <MenuItem key={year.id} value={year.fiscalYear}>
                            {year.fiscalYear}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>

              {/* Count Cards */}
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Card className="stat-card hrm-main-card primary">
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}><Business sx={{ fontSize: 18 }} /></Avatar>
                      <Box>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                          Organizations
                        </Typography>
                        <Typography variant="h5" color="primary">{stats.totalOrganizations}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Card className="stat-card hrm-main-card success">
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}><Description sx={{ fontSize: 18 }} /></Avatar>
                      <Box>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                          Report types
                        </Typography>
                        <Typography variant="h5" sx={{ color: 'success.main' }}>{stats.totalDocuments}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Card className="stat-card hrm-main-card warning">
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}><Group sx={{ fontSize: 18 }} /></Avatar>
                      <Box>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                          Users
                        </Typography>
                        <Typography variant="h5" sx={{ color: 'warning.main' }}>{stats.totalUsers}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Report Type Senders/Non-Senders Cards */}
              {Object.entries(stats.reportTypeStats).map(([reportType, counts]) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={reportType}>
                  <Card className="stat-card hrm-main-card primary">
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="h6" color="primary">{reportType}</Typography>
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircle sx={{ fontSize: 18, color: 'success.main', mr: 1 }} />
                          <Typography variant="subtitle1">
                            Senders: {counts.senders}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Cancel sx={{ fontSize: 18, color: 'danger.main', mr: 1 }} />
                          <Typography variant="subtitle1">
                            Non-Senders: {counts.nonSenders}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              {/* Charts for Each Report Type (memoized child used) */}
              {Object.entries(stats.reportTypeStats).map(([reportType, counts]) => (
                <ReportTypeCard key={`${reportType}-chart`} reportType={reportType} counts={counts} />
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

// Error Boundary (kept unchanged)
class ChartsErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Alert severity="error" icon={<Cancel />}>
              An error occurred while rendering the dashboard. Please try again later.
            </Alert>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}

export default () => (
  <ChartsErrorBoundary>
    <Charts />
  </ChartsErrorBoundary>
);
