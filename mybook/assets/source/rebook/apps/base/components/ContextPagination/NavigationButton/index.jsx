import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './style.scss';


// type should be only 'previous' or 'next'
const NavigationButton = ({ type, ...props }) => {
  const buttonTypes = ['previous', 'next'];

  if (!buttonTypes.includes(type)) {
    return null;
  }

  return (
    <button
      className={classNames(styles[type], 'jest-context-pagination')}
      {...props} />
  );
};

NavigationButton.propTypes = {
  type: PropTypes.string.isRequired,
};

export default NavigationButton;
