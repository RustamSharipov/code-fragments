import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './style.scss';


const Article = ({ children, extraClassName, htmlContent }) => {
  // Render article content as html from string (has higher priority)
  if (htmlContent) {
    return (
      <article
        className={classNames(styles.article, extraClassName)}
        dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );
  }

  // Render article content as child nodes
  else if (children) {
    return (
      <article className={classNames(styles.article, extraClassName)}>
        {children}
      </article>
    );
  }

  return null;
};

Article.propTypes = {
  children: PropTypes.element,
  extraClassName: PropTypes.string,
  htmlContent: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
};

export default Article;
