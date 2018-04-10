import React from 'react';

import styles from './style.css';


const TextInput = ({ autoFocus, isDisabled, name, placeholder, value, onChange, onKeyUp }) => {
  return (
    <span className={styles.formTextInput}>
      <input
        className={styles.input}
        autoFocus={autoFocus}
        disabled={isDisabled}
        name={name}
        onChange={(event) => onChange(event)}
        placeholder={placeholder}
        type="text"
        value={value} />
    </span>
  );
}

export default TextInput;
