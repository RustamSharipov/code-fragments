import React from 'react';
import classNames from 'classnames';

import ContextPagination from 'rebook/apps/base/components/ContextPagination';
import UserSettingsHeader from 'rebook/apps/users/components/UserSettingsHeader';
import fetchQuery from 'rebook/apps/utils/fetchQuery';
import mainStyles from 'rebook/apps/base/style/main.scss';

import PaymentListPaymentData from './PaymentListPaymentData';
import styles from './style.scss';


class PaymentListView extends React.Component {
  constructor(props) {
    super(props);
    this.paginateBy = 10;

    this.state = {
      payments: null,
      pageNumber: 1,
      lastPageNumber: 1,
    };
  }

  componentDidMount() {
    this.changePage(1);
  }

  changePage(pageNumber=1) {
    const offset = pageNumber > 1 ? (pageNumber - 1) * this.paginateBy : 0;
    fetchQuery(`/api/payments/?limit=${this.paginateBy}&offset=${offset}`)
      .then(
        ({ data }) => {
          window.scrollTo(0, 0);
          const lastPageNumber = Math.ceil(data.meta.total_count / this.paginateBy);
          this.setState({
            payments: data.objects,
            pageNumber: pageNumber,
            lastPageNumber: lastPageNumber,
          });
        }
      );
  }

  render() {
    const { payments } = this.state;
    return (
      <div className={classNames(
        mainStyles.backgroundContainer,
        'themeGrey',
        payments && payments.length === 0 && styles.emptyPaymentList,
      )}>
        <div className="gridColumn cols-6">
          <UserSettingsHeader page="userPaymentList" />
          {payments
            ? (
              <div className="jest-payment-list">
                {payments.length > 0
                  ? (
                    payments.map((item, i) => (
                      <PaymentListPaymentData {...item} key={item.uuid} />
                    ))
                  )
                  : (
                    <div>
                      <div className="title-2">Здесь будут ваши платежи</div>
                    </div>
                  )
                }
                <ContextPagination
                  extraClassName="jest-payment-list-pagination"
                  onPageChange={(newPageNumber) => this.changePage(newPageNumber)}
                  currentPage={this.state.pageNumber}
                  lastPage={this.state.lastPageNumber} />
              </div>
            )
            : (
              [...Array(3)].map((item, i) => (
                <div className={classNames(mainStyles.billetContainer)} key={i + 1}>
                  <div className="title-1 elementDummy" />
                  <div className="title-2 elementDummy" />
                  <div className="title-2 elementDummy" />
                  <div className="title-2 elementDummy" />
                  <div className="title-2 elementDummy" />
                </div>
              ))
            )
          }
        </div>
      </div>
    );
  }
}

export default PaymentListView;
