import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './style.scss';


const PaymentMethodIcon = ({ slug }) => {
  let iconClassName;
  if (slug === 'inplat' || slug === 'inplatmk') {
    iconClassName = 'smsMethodIcon';
  }
  else {
    iconClassName = `${slug}MethodIcon`;
  }

  if (iconClassName) {
    return (
      <span className={classNames(styles.paymentMethodIcon, styles[iconClassName])} />
    );
  }
  return null;
};

PaymentMethodIcon.propTypes = {
  slug: PropTypes.string.isRequired,
};

export default PaymentMethodIcon;
