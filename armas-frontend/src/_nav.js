import React from 'react';
import CIcon from '@coreui/icons-react';
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilCloudUpload,
  cilCloudDownload,
  cilTask,
  cilUser,
  cilLockLocked,
  cilFile,
  cilGroup,
  cilBuilding,
  cilTransfer,
  cilFilter,
} from '@coreui/icons';
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react';
import { useAuth } from './views/pages/AuthProvider';

const Nav = () => {
  const { roles = [] } = useAuth(); // Default to empty array if roles is undefined

  // Debug roles
  console.log('Nav: Roles:', roles);

  // Safe role checking function
  const hasRole = (role) => {
    const result = Array.isArray(roles) && roles.some((r) => r.description === role);
    console.log(`Nav: Checking role ${role}: ${result}`);
    return result;
  };

  const isAdmin = hasRole('ADMIN');
  const isUser = hasRole('USER');
  const isSeniorAuditor = hasRole('SENIOR_AUDITOR');
  const isArchiver = hasRole('ARCHIVER');
  const isApprover = hasRole('APPROVER');
  const isManager = hasRole('MANAGER');

  console.log('Nav: Role checks:', { isAdmin, isUser, isSeniorAuditor, isArchiver, isApprover, isManager });

  const commonItems = []; // Removed the IRMS item to avoid redundancy

  const userItems = [
    {
      component: CNavItem,
      name: 'Outgoing reports',
      to: '/buttons/file-upload',
      icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Incoming Letters',
      to: '/buttons/letter-download',
      icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'File History',
      to: '/file-history',
      icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
    },
  ];

  const managerItems = [
    { component: CNavTitle, name: 'Manager Actions' },
    {
      component: CNavItem,
      name: 'View Letters',
      to: '/transactions/letters',
      icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
    },
  ];

  const adminItems = [
    {
      component: CNavGroup,
      name: 'Manage',
      to: '/buttons',
      icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Organizations',
          to: '/buttons/organizations',
          icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Directorates',
          to: '/buttons/directorates',
          icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Report type',
          to: '/buttons/documents',
          icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Budget Year',
          to: '/buttons/budgetyear',
          icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
        },
      ],
    },
    {
      component: CNavGroup,
      name: 'Manage User',
      to: '/buttons',
      icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Users',
          to: '/buttons/users',
          icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Role',
          to: '/buttons/roles',
          icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'AssignRole',
          to: '/buttons/assign',
          icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Assign Privileges to Role',
          to: '/buttons/assign-privileges',
          icon: <CIcon icon={cilLockLocked} customClassName="nav-icon" />,
        },
      ],
    },
  ];

  const UploadToOrganizationsItem = isApprover
    ? [
        {
          component: CNavItem,
          name: 'Upload',
          to: '/transactions/upload-to-organizations',
          icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
        },
      ]
    : [];

  const transactionItems = [
    {
      component: CNavGroup,
      name: 'Reports',
      icon: <CIcon icon={cilTransfer} customClassName="nav-icon" />,
      items: [
        ...(isArchiver
          ? [
              {
                component: CNavItem,
                name: 'Incoming Reports',
                to: '/buttons/file-download',
                icon: <CIcon icon={cilCloudDownload} customClassName="nav-icon" />,
              },
              {
                component: CNavItem,
                name: 'Approved Reports',
                to: '/transactions/approved-reports',
                icon: <CIcon icon={cilCloudDownload} customClassName="nav-icon" />,
              },
              {
                component: CNavItem,
                name: 'Pending Reports',
                to: '/transactions/pending-reports',
                icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
              },
            ]
          : []),
        ...(isSeniorAuditor || isApprover
          ? [
              {
                component: CNavItem,
                name: 'Assigned tasks',
                to: '/transactions/auditor-tasks',
                icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
              },
              {
                component: CNavItem,
                name: 'Rejected Reports',
                to: '/transactions/rejected-reports',
                icon: <CIcon icon={cilCloudDownload} customClassName="nav-icon" />,
              },
              {
                component: CNavItem,
                name: 'Approved Reports',
                to: '/transactions/approved-reports',
                icon: <CIcon icon={cilCloudDownload} customClassName="nav-icon" />,
              },
              {
                component: CNavItem,
                name: 'Under Review',
                to: '/transactions/under-review-reports',
                icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
              },
              {
                component: CNavItem,
                name: 'Corrected Reports',
                to: '/transactions/corrected-reports',
                icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
              },
            ]
          : []),
      ],
    },
  ];

  const advancedFiltersItem = isAdmin || isApprover || isArchiver || isSeniorAuditor
    ? [
        {
          component: CNavItem,
          name: 'Advanced Filters',
          to: '/transactions/advanced-filters',
          icon: <CIcon icon={cilFilter} customClassName="nav-icon" />,
        },
      ]
    : [];

  const navItems = [
    ...commonItems,
    ...(isUser ? userItems : []),
    ...(isManager ? managerItems : []),
    ...(isAdmin ? adminItems : []),
    ...(isArchiver || isSeniorAuditor || isApprover ? transactionItems : []),
    ...advancedFiltersItem,
    ...UploadToOrganizationsItem,
  ];

  console.log('Nav: Navigation items:', navItems);

  return navItems;
};

export default Nav;