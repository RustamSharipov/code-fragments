import React from 'react';
import classNames from 'classnames';

import { TableListItem, TableListItemLink } from 'rebook/apps/base/components/TableListItem';
import mainStyles from 'rebook/apps/base/style/main.scss';
import { FaqQuestion } from 'rebook/apps/faq/models';

import styles from './style.scss';


class FaqIndexSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false,
    };
  }

  toggleExpanded() {
    this.setState((prevState) => {
      return { isExpanded: !prevState.isExpanded };
    });
  }

  render() {
    const { maxInitialQuestionCount, name, questionList, slug } = this.props;
    const { isExpanded } = this.state;
    return (
      <li className="jest-help-question-section">
        <div className={mainStyles.billetContainerContent}>
          <div className="title-2">{name}</div>
          {questionList.length > 0 && (
            questionList.map(
              (item, i) => {
                const question = new FaqQuestion({ ...item, sectionSlug: slug });
                if (isExpanded || (!isExpanded && i < maxInitialQuestionCount)) {
                  return (
                    <TableListItem key={item.id} extraClassName="jest-help-question">
                      <TableListItemLink link={question.getLink()}>
                        {item.question}
                      </TableListItemLink>
                    </TableListItem>
                  );
                }
              }
            )
          )}
        </div>
        {questionList.length > maxInitialQuestionCount && (
          <div
            className={classNames(
              mainStyles.billetContainerFooter,
              mainStyles.tableSummary,
              styles.questionListExpander,
              'jest-help-question-section-expander',
            )}
            onClick={() => this.toggleExpanded()}>
            <span className={classNames(mainStyles.tableSummaryLink, 'link')}>
              {isExpanded ? 'Скрыть' : 'Посмотреть все'}
            </span>
          </div>
        )}
      </li>
    );
  }
}

export default FaqIndexSection;
