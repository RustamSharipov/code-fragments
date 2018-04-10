import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Article from 'rebook/apps/base/components/Article';
import ArticleEmpty from 'rebook/apps/base/components/ArticleEmpty';
import fetchQuery from 'rebook/apps/utils/fetchQuery';
import mainStyles from 'rebook/apps/base/style/main.scss';


class FaqQuestionView extends React.Component {
  constructor(props) {
    super(props);
    const { questionSlug, sectionSlug } = this.props.match.params;
    this.questionSlug = questionSlug;
    this.sectionSlug = sectionSlug;
    const initialState = this.props.location && this.props.location.state
      ? this.props.location.state
      : {};

    this.defaultState = {
      content: null,
      title: null,
    };

    this.state = { ...this.defaultState, ...initialState };
  }

  componentDidMount() {
    this.fetchPage();
  }

  fetchPage() {
    const url = `/api/faq/${this.questionSlug}/question/`;
    fetchQuery(url)
      .then(
        ({ data }) => {
          this.setState({
            content: data.answer,
            title: data.question,
          });
        }
      )
      .catch(
        ({ data, resp }) => {
          Raven.captureMessage('failed to load static page due to server error', {
            level: 'error',
            extra: {
              status: resp.status,
              response: data,
            },
          });
        }
      );
  }

  render() {
    const { content, title } = this.state;
    return (
      <div className={classNames(mainStyles.backgroundContainer, 'themeGrey')}>
        <div className="gridColumn cols-6">
          <div className={mainStyles.sectionHeader}>
            {title
              ? <div className="title-1 jest-help-question-title">{title}</div>
              : <div className="title-1 elementDummy" />
            }
          </div>
          <div className={mainStyles.billetContainer}>
            {content
              ? (
                <Article
                  htmlContent={content}
                  extraClassName="jest-help-question-content" />
              )
              : <ArticleEmpty />
            }
          </div>
        </div>
      </div>
    );
  }
}

FaqQuestionView.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      questionSlug: PropTypes.string.isRequired,
    }),
  }),
};

export default FaqQuestionView;
