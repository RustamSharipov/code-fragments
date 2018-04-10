import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import styles from './style.scss';


export const TableListItem = ({ children, extraClassName }) => {
  return (
    <div className={classNames(styles.tableListItem, extraClassName)}>
      {children}
    </div>
  );
};

export const TableListItemIcon = ({ children, extraClassName }) => {
  return (
    <div className={classNames(styles.icon, extraClassName)}>
      {children}
    </div>
  );
};

export const TableListItemTitle = ({ children, extraClassName }) => {
  return (
    <div className={classNames(styles.title, extraClassName)}>
      {children}
    </div>
  );
};

export const TableListItemContent = ({ children, extraClassName }) => {
  return (
    <div className={classNames(styles.content, extraClassName)}>
      {children}
    </div>
  );
};

export const TableListItemLink = ({ children, extraClassName, link }) => {
  return (
    <Link to={link} className={classNames(styles.link, 'link', extraClassName)}>
      {children}
    </Link>
  );
};

const propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
  extraClassName: PropTypes.string,
};

TableListItem.propTypes = propTypes;

TableListItemIcon.propTypes = propTypes;

TableListItemTitle.propTypes = propTypes;

TableListItemContent.propTypes = propTypes;

TableListItemLink.propTypes = {
  ...propTypes,
  url: PropTypes.string,
};
