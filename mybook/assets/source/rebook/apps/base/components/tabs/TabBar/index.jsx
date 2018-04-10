import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './style.scss';


const TabBar = ({ children, extraClassName }) => {
  return children && (
    <div className={classNames(styles.tabBar, extraClassName)}>
      <ul className={styles.items}>
        {children}
      </ul>
    </div>
  );
};

TabBar.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
  extraClassName: PropTypes.string,
};

export default TabBar;
