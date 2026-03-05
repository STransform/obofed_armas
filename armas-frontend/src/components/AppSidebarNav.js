import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { CBadge, CNavLink, CNavItem, CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from '@coreui/react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

export const AppSidebarNav = ({ items = [], isHorizontal = false }) => {
  const safeItems = Array.isArray(items) ? items : [];

  const navLink = (name, badge, indent = false) => (
    <>
      {indent && <span className="nav-icon nav-icon-bullet me-2"></span>}
      {name && <span>{name}</span>}
      {badge && (
        <CBadge color={badge.color} className="ms-auto">
          {badge.text}
        </CBadge>
      )}
    </>
  );

  const navItem = (item, index, indent = false) => {
    const { component = 'div', name, badge, ...rest } = item;
    if (isHorizontal) {
      return (
        <CNavItem key={index} className="d-md-flex">
          <CNavLink
            as={rest.to ? NavLink : undefined}
            {...rest}
            className="nav-link"
          >
            {navLink(name, badge, indent)}
          </CNavLink>
        </CNavItem>
      );
    }
    const Component = component;
    return (
      <Component as="div" key={index}>
        {rest.to || rest.href ? (
          <CNavLink {...(rest.to && { as: NavLink })} {...rest}>
            {navLink(name, badge, indent)}
          </CNavLink>
        ) : (
          navLink(name, badge, indent)
        )}
      </Component>
    );
  };

  const navGroup = (item, index) => {
    const { component = 'div', name, items = [], to, ...rest } = item;
    if (isHorizontal) {
      return (
        <CDropdown variant="nav-item" key={index} className="d-md-flex">
          <CDropdownToggle className="nav-link" caret>
            {navLink(name)}
          </CDropdownToggle>
          <CDropdownMenu>
            {items.map((subItem, subIndex) =>
              subItem.items ? (
                <CDropdown key={subIndex} variant="menu-item">
                  <CDropdownToggle className="dropdown-item">
                    {navLink(subItem.name)}
                  </CDropdownToggle>
                  <CDropdownMenu>
                    {subItem.items.map((nestedItem, nestedIndex) => (
                      <CDropdownItem
                        key={nestedIndex}
                        as={nestedItem.to ? NavLink : 'div'}
                        {...(nestedItem.to && { to: nestedItem.to })}
                      >
                        {navLink(nestedItem.name, nestedItem.badge, true)}
                      </CDropdownItem>
                    ))}
                  </CDropdownMenu>
                </CDropdown>
              ) : (
                <CDropdownItem
                  key={subIndex}
                  as={subItem.to ? NavLink : 'div'}
                  {...(subItem.to && { to: subItem.to })}
                >
                  {navLink(subItem.name, subItem.badge, true)}
                </CDropdownItem>
              )
            )}
          </CDropdownMenu>
        </CDropdown>
      );
    }
    const Component = component;
    return (
      <Component compact as="div" key={index} toggler={navLink(name)} {...rest}>
        {items.map((subItem, subIndex) =>
          subItem.items ? navGroup(subItem, subIndex) : navItem(subItem, subIndex, true)
        )}
      </Component>
    );
  };

  return (
    <div className={isHorizontal ? 'd-flex align-items-center flex-wrap' : ''}>
      {isHorizontal ? (
        safeItems.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))
      ) : (
        <SimpleBar>
          {safeItems.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))}
        </SimpleBar>
      )}
    </div>
  );
};

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any),
  isHorizontal: PropTypes.bool,
};

AppSidebarNav.defaultProps = {
  items: [],
  isHorizontal: false,
};

export default AppSidebarNav;