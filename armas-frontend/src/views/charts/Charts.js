import React, { useState, useEffect } from 'react';
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
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Button,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Bar, Pie, Line } from 'react-chartjs-2'; // Added Line import
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement, // Added LineElement
  PointElement, // Added PointElement for Line chart
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
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import './Chart.css';
import 'animate.css';

// Register Chart.js components (added LineElement and PointElement)
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip);

// Custom theme to match JSP aesthetic (unchanged)
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

// Configure Axios (unchanged)
axios.defaults.baseURL = 'http://localhost:8080';
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Gradient for charts (unchanged)
const getGradient = (ctx, chartArea, colorStart, colorEnd) => {
  if (!chartArea || !ctx) return colorStart;
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
};

const Charts = () => {
  const [budgetYears, setBudgetYears] = useState([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('');
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalReportTypes: 0,
    totalDirectorates: 0,
    totalDocuments: 0,
    totalUsers: 0,
    reportTypeStats: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch budget years (unchanged)
  useEffect(() => {
    setLoading(true);
    axios
      .get('/transactions/budget-years')
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setBudgetYears(data);
        if (data.length > 0) setSelectedFiscalYear(data[0].fiscalYear);
        setLoading(false);
      })
      .catch((error) => {
        setError(`Failed to load budget years: ${error.response?.data?.message || error.message}`);
        setBudgetYears([]);
        setLoading(false);
      });
  }, []);

  // Fetch dashboard stats (unchanged)
  useEffect(() => {
    if (selectedFiscalYear) {
      setLoading(true);
      axios
        .get(`/transactions/dashboard-stats?fiscalYear=${selectedFiscalYear}`)
        .then((response) => {
          setStats(response.data || stats);
          setLoading(false);
        })
        .catch((error) => {
          let errorMessage = 'Failed to load dashboard statistics.';
          if (error.response?.status === 404) {
            errorMessage = `No statistics available for fiscal year ${selectedFiscalYear}.`;
          } else if (error.response?.status === 403) {
            errorMessage = 'You do not have permission to view dashboard statistics.';
          } else {
            errorMessage = error.response?.data?.message || error.message;
          }
          setError(errorMessage);
          setLoading(false);
        });
    }
  }, [selectedFiscalYear]);

  const handleFiscalYearChange = (e) => {
    setSelectedFiscalYear(e.target.value);
    setError(null);
    setStats({
      totalOrganizations: 0,
      totalReportTypes: 0,
      totalDirectorates: 0,
      totalDocuments: 0,
      totalUsers: 0,
      reportTypeStats: {},
    });
  };

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

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
        {/* Sidebar (unchanged) */}
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
          <AppBar position="static" sx={{ bgcolor: 'primary.main', mb: 3 }}>
            {/* <Toolbar>
              <IconButton edge="start" color="inherit" onClick={toggleDrawer}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Dashboard
              </Typography>
            </Toolbar> */}
          </AppBar>

          <Box className="dashboard-container">
            <Grid container spacing={3}>
              {/* Fiscal Year Selection (unchanged) */}
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

              {/* Count Cards (unchanged) */}
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

              {/* Report Type Senders/Non-Senders Cards (unchanged) */}
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

              {/* Charts for Each Report Type */}
              {Object.entries(stats.reportTypeStats).map(([reportType, counts]) => (
                <Grid item xs={12} key={`${reportType}-chart`}>
                  <Card className="animate__animated animate__fadeInUp">
                    <CardContent sx={{ bgcolor: 'white', color: 'black', p: 2, borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PieChart sx={{ mr: 1 }} />
                        <Typography variant="h6">{reportType} Senders vs Non-Senders</Typography>
                      </Box>
                    </CardContent>
                    <CardContent sx={{ p: 2 }}>
                      <Grid container spacing={2}>
                        {/* Bar Chart */}
                        <Grid item xs={12} md={4}>
                          <Box className="chart-container">
                            <Bar
                              data={{
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
                              }}
                              options={{
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
                                animation: {
                                  duration: 1000,
                                  easing: 'easeOutQuart',
                                },
                              }}
                              height={300}
                            />
                          </Box>
                        </Grid>
                        {/* Pie Chart */}
                        <Grid item xs={12} md={4}>
                          <Box className="chart-container">
                            <Pie
                              data={{
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
                              }}
                              options={{
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
                                    labels: {
                                      font: { size: 12 },
                                    },
                                  },
                                },
                                animation: {
                                  duration: 1000,
                                  easing: 'easeOutQuart',
                                },
                              }}
                              height={300}
                            />
                          </Box>
                        </Grid>
                        {/* Line Chart */}
                        <Grid item xs={12} md={4}>
                          <Box className="chart-container">
                            <Line
                              data={{
                                labels: ['Senders', 'Non-Senders'],
                                datasets: [
                                  {
                                    label: 'Number of Organizations',
                                    backgroundColor: (context) => {
                                      const chart = context.chart;
                                      const { ctx, chartArea } = chart;
                                      if (!chartArea) return '#013A6B';
                                      return getGradient(ctx, chartArea, '#013A6B', '#00C4B4');
                                    },
                                    borderColor: (context) => {
                                      const chart = context.chart;
                                      const { ctx, chartArea } = chart;
                                      if (!chartArea) return '#013A6B';
                                      return getGradient(ctx, chartArea, '#013A6B', '#00C4B4');
                                    },
                                    data: [counts.senders, counts.nonSenders],
                                    fill: false,
                                    tension: 0.4, // Smooth line
                                    pointRadius: 5,
                                    pointHoverRadius: 8,
                                    pointBackgroundColor: '#fff',
                                    pointBorderColor: '#013A6B',
                                    pointBorderWidth: 2,
                                  },
                                ],
                              }}
                              options={{
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
                                    labels: {
                                      font: { size: 12 },
                                    },
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
                                animation: {
                                  duration: 1000,
                                  easing: 'easeOutQuart',
                                },
                              }}
                              height={300}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

// Error Boundary (unchanged)
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