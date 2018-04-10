import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import NavigationButton from './NavigationButton';
import PageButton from './PageButton';
import styles from './style.scss';


const Ellipsis = () => (
  <button>...</button>
);

const ClosestPageRange = ({ currentPage, lastPage, onPageChange }) => {
  let startPager = 1,
      showedButtons = 3;

  if (lastPage <= showedButtons) {
    showedButtons = lastPage;
  }
  else if (currentPage > (lastPage - showedButtons + 1)) {
    startPager = lastPage - showedButtons + 1;
  }
  else if (currentPage > showedButtons - 1) {
    startPager = currentPage - Math.ceil(showedButtons / 2) + 1;
  }

  let closestPages = new Array(showedButtons).fill().map((e, i) => {
    return startPager + i;
  });

  return closestPages.map((pageNumber, i) => (
    <PageButton
      key={i}
      onPageChange={onPageChange}
      number={pageNumber}
      disabled={pageNumber === currentPage} />
  ));
};

const ContextPagination = (props) => {
  const { currentPage, lastPage, onPageChange, extraClassName } = props;

  if (lastPage <= 1) {
    return null;
  }

  const borderPage = 3;

  return (
    <div className={classNames(styles.contextPagination, extraClassName)}>
      <NavigationButton
        type="previous"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1} />
      <div className={styles.pagesButtons}>
        {currentPage >= borderPage && borderPage !== lastPage && (
          <div className={styles.firstPage}>
            <PageButton
              onPageChange={onPageChange}
              number={1} />
            {currentPage >= (borderPage + 1) && (borderPage + 1) !== lastPage && <Ellipsis />}
          </div>
        )}
        <div className={styles.pages}>
          <ClosestPageRange onPageChange={onPageChange} {...props} />
        </div>
        {lastPage > borderPage && currentPage < lastPage - 1 && (
          <div className={styles.lastPage}>
            {currentPage < (lastPage - borderPage + 1) && (lastPage - borderPage) !== 1 && <Ellipsis />}
            <PageButton
              onPageChange={onPageChange}
              number={lastPage} />
          </div>
        )}
      </div>
      <NavigationButton
        type="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage} />
    </div>
  );
};

ContextPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  lastPage: PropTypes.number.isRequired,
  extraClassName: PropTypes.string,
};

export default ContextPagination;
