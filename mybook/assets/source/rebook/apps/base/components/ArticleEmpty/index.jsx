import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';


const ArticleEmpty = ({ extraClassName }) => {
  const paragraphCount = Math.floor(Math.random() * (16 - 8) + 8);
  return (
    <div>
      <div className={classNames('title-1', 'elementDummy')} />
      {Array(paragraphCount).fill(1).map(
        (item, i) => {
          const lineWidth = Math.random() * (100 - 60) + 60;
          return (
            <div className={classNames('paragraph', 'elementDummy')} key={i} style={{ width: `${lineWidth}%` }} />
          );
        }
      )}
    </div>
  );
};

ArticleEmpty.propTypes = {
  extraClassName: PropTypes.string,
};

export default ArticleEmpty;
