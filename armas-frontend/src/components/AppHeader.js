import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilMenu, cilBell, cilApplicationsSettings } from '@coreui/icons';
import { AppSidebarNav } from './AppSidebarNav';
import { AppHeaderDropdown } from './header/index';
import NotificationDropdown from './NotificationDropdown';
import Nav from '../_nav';
import { useAuth } from '../views/pages/AuthProvider';
import './AppHeader.css';
import logo from '../assets/images/mofed.png';

const AppHeader = () => {
  const headerRef = useRef();
  const dispatch = useDispatch();
  const sidebarShow = useSelector((state) => state.sidebarShow);
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Debugging: Log user object details
  useEffect(() => {
    console.log('User from useAuth:', user);
    if (user) {
      console.log('User details:', {
        username: user.username,
        orgname: user.orgname,
        organization: user.organization,
      });
    } else {
      console.log('No user logged in');
    }
  }, [user]);

  // Determine organization name to display
  const orgName = user?.orgname || user?.organization?.orgname || 'No Organization';

  // Handle scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0);
      }
    };
    document.addEventListener('scroll', handleScroll);
    return () => document.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    dispatch({ type: 'set', sidebarShow: !sidebarShow });
  };

  return (
    <CHeader position="sticky" className="p-0 custom-header" ref={headerRef}>
      <CContainer className="border-bottom px-3" fluid>
        <CHeaderToggler
          className="d-md-none"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation"
          aria-expanded={isMobileMenuOpen}
        >
          <CIcon icon={cilMenu} size="lg" className="text-white" />
        </CHeaderToggler>
        <CHeaderNav className="d-flex align-items-center">
          <CNavItem className="d-flex align-items-center">
            <img
              src={logo}
              alt="IRMS Logo"
              className="header-logo me-2"
            />
            <CNavLink to="/" as={NavLink} className="navbar-brand">
              IRMS {user ? `- ${orgName}` : ''}
            </CNavLink>
          </CNavItem>
          <AppSidebarNav items={Nav()} isHorizontal className={isMobileMenuOpen ? 'show' : ''} />
        </CHeaderNav>
        <CHeaderNav className="ms-auto d-flex align-items-center">
          <CNavItem className="notification-container">
            <NotificationDropdown icon={cilBell} />
          </CNavItem>
          <CNavItem className="d-none d-md-block">
            <div className="vr h-100 mx-2 text-white opacity-75"></div>
          </CNavItem>
          <CNavItem className="menu-container">
            <AppHeaderDropdown icon={cilApplicationsSettings} />
          </CNavItem>
        </CHeaderNav>
      </CContainer>
    </CHeader>
  );
};

export default AppHeader;