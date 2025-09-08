import React from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import NavLinks from './NavLinks';

/**
 * NavbarUpdater Component
 * This component injects our new nav links into the existing navbar
 * without modifying the original components
 * 
 * This is a minimal "glue" component that can be conditionally added
 * to the existing layout
 */
const NavbarUpdater = ({ existingNavItems = [], onNavItemsUpdated }) => {
  const location = useLocation();
  
  // Get our additional nav links
  const additionalNavItems = NavLinks;
  
  // Combine existing and new nav items, ensuring no duplicates
  React.useEffect(() => {
    const existingIds = existingNavItems.map(item => item.id);
    const filteredAdditionalItems = additionalNavItems.filter(
      item => !existingIds.includes(item.id)
    );
    
    if (filteredAdditionalItems.length > 0) {
      onNavItemsUpdated([...existingNavItems, ...filteredAdditionalItems]);
    }
  }, [existingNavItems, onNavItemsUpdated]);
  
  // This component doesn't render anything visible
  return null;
};

NavbarUpdater.propTypes = {
  existingNavItems: PropTypes.array,
  onNavItemsUpdated: PropTypes.func.isRequired
};

export default NavbarUpdater;
