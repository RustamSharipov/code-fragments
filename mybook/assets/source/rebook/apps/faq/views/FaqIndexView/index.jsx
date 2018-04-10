import React from 'react';
import classNames from 'classnames';

import fetchQuery from 'rebook/apps/utils/fetchQuery';
import mainStyles from 'rebook/apps/base/style/main.scss';

import FaqIndexSection from './FaqIndexSection';


const FaqIndexSectionList = ({ sectionList }) => {
  return (
    sectionList.length > 0
      ? (
        <ul className="jest-help-questions">
          {sectionList.map(
            (section) => (
              <FaqIndexSection
                key={section.id}
                name={section.name}
                slug={section.slug}
                questionList={section.questions}
                maxInitialQuestionCount={3} />
            )
          )}
        </ul>
      )
      : <div>Нет ни одной секции</div>
  );
};

class FaqIndexView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      faqList: null,
    };
  }

  componentDidMount() {
    fetchQuery('/api/faq/')
      .then(
        ({ data }) => {
          this.setState({
            faqList: data.objects,
          });
        }
      )
      .catch(
        ({ data, resp }) => {
          Raven.captureMessage('failed to load faq list due to server error', {
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
    const { faqList } = this.state;
    return (
      <div className={classNames(mainStyles.backgroundContainer, 'themeGrey')}>
        <div className="gridColumn cols-6">
          <div className={mainStyles.sectionHeader}>
            <div className="title-1">Справочный центр</div>
          </div>
          <div>
            <p>Ответы на вопросы, которые волнуют читателей</p>
            {faqList
              ? (
                <FaqIndexSectionList sectionList={faqList} />
              )
              : (
                <div className={mainStyles.billetContainer}>
                  <div className="title-2 elementDummy" />
                  <div className="paragraph elementDummy" />
                  <div className="paragraph elementDummy" />
                  <div className="paragraph elementDummy" />
                </div>
              )
            }
            <div className={mainStyles.tableSummary}>
              <small>
                Не нашли ответ? Пожалуйста, напишите в службу поддержки
                по адресу <a href={`mailto:${SUPPORT_EMAIL}`} className="link">{SUPPORT_EMAIL}</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FaqIndexView;
