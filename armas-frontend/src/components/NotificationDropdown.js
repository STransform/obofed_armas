import React, { useState, useEffect, useCallback } from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilBell } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../views/pages/AuthProvider';
import { getUnreadNotifications, markNotificationAsRead } from '../file/upload_download';
import { formatDistanceToNow } from 'date-fns';
import {
  Box,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  styled,
} from '@mui/material';

// Styled components for notification menu (unchanged)
const NotificationMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: '100%',
    maxWidth: '360px',
    maxHeight: '400px',
    overflowY: 'auto',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    background: '#008080', // Match JSP navbar
    color: '#ffffff', // White text
    [theme.breakpoints.down('sm')]: {
      width: '90vw',
      maxWidth: 'none',
    },
  },
}));

const NotificationItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: 'background-color 0.2s ease',
  backgroundColor: 'transparent', // Match JSP dropdown
  color: '#ffffff', // White text
  '&:hover': {
    backgroundColor: '#2f5264ff', // Red hover to match JSP
  },
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const NotificationTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.95rem',
  color: '#ffffff', // White text
}));

const NotificationMessage = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  color: '#ffffff', // White text
  margin: theme.spacing(0.5, 0),
  wordBreak: 'break-word',
}));

const NotificationTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: '#cccccc', // Lighter gray for time
}));

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { roles = [] } = useAuth();

  const hasRole = (role) => Array.isArray(roles) && roles.includes(role);
  const isArchiver = hasRole('ARCHIVER');
  const isSeniorAuditor = hasRole('SENIOR_AUDITOR');
  const isApprover = hasRole('APPROVER');
  const isUser = hasRole('USER');
  const isManager = hasRole('MANAGER');

  const fetchNotifications = useCallback(async () => {
    try {
      console.log('Fetching notifications at:', new Date().toLocaleTimeString());
      const data = await getUnreadNotifications();
      console.log('Raw notifications response:', JSON.stringify(data, null, 2));
      const notificationArray = Array.isArray(data) ? data.filter(n => !n.isRead) : [];
      notificationArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      console.log('Sorted unread notifications:', notificationArray);
      setNotifications(notificationArray);
      setUnreadCount(notificationArray.length);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notifications:', err.message, err.response?.data);
      setError('Failed to load notifications');
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      console.log('Marking notification as read: ID=', notification.id);
      await markNotificationAsRead(notification.id);
      console.log('Processing notification:', JSON.stringify(notification, null, 2));

      if (!notification.entityType || !notification.entityId || !notification.context) {
        console.warn('Missing entityType, entityId, or context:', notification);
        navigate('/dashboard');
        return;
      }

      const taskId = notification.entityId;
      if (notification.entityType === 'MasterTransaction') {
        if (isArchiver) {
          if (notification.context === 'report_uploaded') {
            const route = `/buttons/file-download?taskId=${taskId}`;
            console.log('Redirecting ARCHIVER to:', route);
            navigate(route);
          } else if (notification.context === 'task_approved') {
            const route = `/transactions/approved-reports?taskId=${taskId}`;
            console.log('Redirecting ARCHIVER to:', route);
            navigate(route);
          } else if (notification.context === 'letter_uploaded') {
            const route = `/letters?taskId=${taskId}`;
            console.log('Redirecting ARCHIVER to:', route);
            navigate(route);
          } else {
            console.warn('Unknown context for ARCHIVER:', notification.context);
            navigate('/dashboard');
          }
        } else if (isSeniorAuditor && notification.context === 'task_assigned') {
          const route = `/transactions/auditor-tasks?taskId=${taskId}`;
          console.log('Redirecting SENIOR_AUDITOR to:', route);
          navigate(route);
        } else if (isApprover && notification.context === 'task_evaluated') {
          const route = `/transactions/auditor-tasks?taskId=${taskId}`;
          console.log('Redirecting APPROVER to:', route);
          navigate(route);
        } else if ((isUser || isManager) && notification.context === 'letter_uploaded') {
          const route = `/letters?taskId=${taskId}`;
          console.log('Redirecting USER/MANAGER to:', route);
          navigate(route);
        } else {
          console.warn('No matching role or context:', { roles, context: notification.context });
          navigate('/dashboard');
        }
      } else {
        console.warn('Unknown entityType:', notification.entityType);
        navigate('/dashboard');
      }

      fetchNotifications();
      handleMenuClose();
    } catch (err) {
      console.error('Failed to mark notification as read:', err.message);
      navigate('/dashboard');
      handleMenuClose();
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Badge
        badgeContent={unreadCount > 99 ? '99+' : unreadCount}
        classes={{ badge: 'notification-badge' }}
      >
        <IconButton
          onClick={handleMenuOpen}
          className="notification-icon-button"
        >
          <CIcon icon={cilBell} className="notification-icon" />
        </IconButton>
      </Badge>
      <NotificationMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {error ? (
          <NotificationItem disabled>
            <NotificationMessage>{error}</NotificationMessage>
          </NotificationItem>
        ) : notifications.length === 0 ? (
          <NotificationItem disabled>
            <NotificationMessage>No new notifications</NotificationMessage>
          </NotificationItem>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
            >
              <NotificationTitle>{notification.title || 'Untitled'}</NotificationTitle>
              <NotificationMessage>{notification.message || 'No message'}</NotificationMessage>
              <NotificationTime>
                {notification.createdAt
                  ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                  : 'Unknown time'}
              </NotificationTime>
            </NotificationItem>
          ))
        )}
      </NotificationMenu>
    </Box>
  );
};

export default NotificationDropdown;