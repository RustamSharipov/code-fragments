import React from 'react';
import PropTypes from 'prop-types';

import { formatDateTime } from 'rebook/apps/utils/datetime';

import styles from './style.scss';


const FormattedDateTime = ({ timestamp, format, noWrap }) => {
  const formattedDateTime = formatDateTime(timestamp, format);

  if (noWrap) {
    return <span className={styles.noWrappedDateTime}>{formattedDateTime}</span>;
  }

  return formattedDateTime;
};

FormattedDateTime.propTypes = {
  timestamp: PropTypes.string.isRequired,
  format: PropTypes.string,
  noWrap: PropTypes.bool,
};

export default FormattedDateTime;
