import React from 'react';
import PropTypes from 'prop-types';

import styles from './style.scss';


const PageButton = ({ number, onPageChange, pageName = number, ...props }) => {
  if (!pageName) {
    pageName = number;
  }

  return (
    <button
      className={styles.pageButton}
      onClick={() => onPageChange(number)}
      {...props}>
      <div className={styles.button}>{pageName}</div>
    </button>);
};

PageButton.propTypes = {
  number: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  pageName: PropTypes.string,
};

PageButton.defaultProps = {
  pageName: '',
};

export default PageButton;
