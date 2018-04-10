import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Article from 'rebook/apps/base/components/Article';
import ArticleEmpty from 'rebook/apps/base/components/ArticleEmpty';
import mainStyles from 'rebook/apps/base/style/main.scss';
import * as StaticPageActions from 'rebook/apps/pages/actions/staticPageActions';

import styles from './style.scss';


class StaticPageView extends React.Component {
  componentDidMount() {
    this.props.StaticPageActions.fetchInitialData(this.props.match);
  }

  componentWillUnmount() {
    this.props.StaticPageActions.resetData();
  }

  componentWillReceiveProps(nextProps) {
    // refetch page data for the component on url update
    const newPageName = nextProps.match.params.page;
    if (newPageName && newPageName !== this.props.match.params.page) {
      this.props.StaticPageActions.fetchPage(nextProps.match);
    }
  }

  static fetchInitialDataForServer(match, store) {
    return store.dispatch(StaticPageActions.fetchInitialData(match));
  }

  render() {
    const { content } = this.props.staticPage;
    return (
      <div className={classNames(mainStyles.section, styles.staticPageView)}>
        {content
          ? <Article htmlContent={content} />
          : <ArticleEmpty />
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    staticPage: state.staticPage,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    StaticPageActions: bindActionCreators(StaticPageActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StaticPageView);
