import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import styles from './style.scss';


const TabItem = ({ extraClassName, isActivatedItem, name, onClick, url }) => {
  const tabItemClassName = classNames(
    isActivatedItem && 'isActive',
    styles.itemContent,
    extraClassName,
  );

  return (
    <li className={styles.item}>
      {url
        ? <Link to={url} className={tabItemClassName}>{name}</Link>
        : (
          <div
            className={tabItemClassName}
            onClick={(event) => {
              event.preventDefault();
              !isActivatedItem && onClick(event);
            }}>
            {name}
          </div>
        )
      }
    </li>
  );
};

TabItem.propTypes = {
  isActivatedItem: PropTypes.bool,
  name: PropTypes.string.isRequired,
  extraClassName: PropTypes.string,
  onClick: PropTypes.func,
  url: PropTypes.string,
};

TabItem.defaultProps = {
  isActivatedItem: false,
};

export default TabItem;
