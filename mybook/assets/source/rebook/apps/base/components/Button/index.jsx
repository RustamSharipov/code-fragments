import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import SpinnerLoader from 'rebook/apps/base/components/SpinnerLoader';

import styles from './style.scss';


const Button = (props) => {
  const {
    children, elementType, extraClassName, handleClick,
    isDisabled, isInProgress, theme, type, size, url, link,
  } = props;
  const buttonProps = {
    children,
    className: classNames(
      styles.button,
      theme ? styles[`${theme}Button`] : styles.primaryButton,
      size && `${size}Size`,
      (isDisabled || isInProgress) && 'isDisabled',
      extraClassName,
    ),
    onClick: handleClick,
  };

  const content = isInProgress
    ? (
      <span className={styles.spinner}>
        <SpinnerLoader theme="passive" size={size} />
      </span>
    )
    : <span>{children}</span>;

  if (elementType === 'span') {
    return <span {...buttonProps}>{content}</span>;
  }

  else if (link) {
    return <Link to={link} {...buttonProps}>{content}</Link>;
  }

  else if (url) {
    return <a href={url} {...buttonProps}>{content}</a>;
  }

  return <button type={type} disabled={isDisabled || isInProgress} {...buttonProps}>{content}</button>;
};

Button.propTypes = {
  type: PropTypes.string,
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
  extraClassName: PropTypes.string,
  isInProgress: PropTypes.bool,
  size: PropTypes.string,
  url: PropTypes.string,
  theme: PropTypes.string,
};

export default Button;
