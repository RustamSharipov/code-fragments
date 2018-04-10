import React from 'react';

import styles from './style.css';


const Button = ({ children, isDisabled, type }) => {
  return (
    <button
      className={styles.button}
      disabled={isDisabled}
      type={type}>
      {children}
    </button>
  );
}

export default Button;
