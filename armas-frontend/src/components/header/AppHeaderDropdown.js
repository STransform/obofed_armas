import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../views/pages/AuthProvider';
import PasswordChangeDialog from '../PasswordChangeDialog';
import CIcon from '@coreui/icons-react';
import { cilOptions } from '@coreui/icons';
import './AppHeaderDropdown.css';

const AppHeaderDropdown = () => {
  const navigate = useNavigate();
  const { logOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const logoutUser = () => {
    logOut();
    navigate('/login');
  };

  const handleOpenPasswordDialog = () => {
    setOpenPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
  };

  return (
    <>
      <div className="menu-btn" onClick={toggleSidebar}>
        <CIcon icon={cilOptions} size="lg" className="text-white" />
      </div>
      <nav id="sideNav" className={sidebarOpen ? 'active' : ''}>
        <ul>
          <li>
            <NavLink to="/profile" className="sidebar-link">
              Profile
            </NavLink>
          </li>
          <li>
            <a href="#" onClick={handleOpenPasswordDialog} className="sidebar-link">
              Change Password
            </a>
          </li>
          <li>
            <NavLink to="#" onClick={logoutUser} className="sidebar-link">
              LogOut
            </NavLink>
          </li>
        </ul>
      </nav>
      <PasswordChangeDialog open={openPasswordDialog} onClose={handleClosePasswordDialog} />
    </>
  );
};

export default AppHeaderDropdown;