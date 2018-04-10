import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import mainStyles from 'rebook/apps/base/style/main.scss';

import PaymentsPromoCodeRedeemForm from './PaymentsPromoCodeRedeemForm';
import PaymentsPromoCodeDeactivateForm from './PaymentsPromoCodeDeactivateForm';
import styles from './style.scss';


class PaymentsPromoCode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: !!this.props.payments.redeemCode.code,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { payments: newPayments } = nextProps;
    const { payments } = this.props;
    // automatically expand promocode form
    if (newPayments.redeemCode.code && !payments.redeemCode.code) {
      this.toggleExpanded(true);
    }
  }

  toggleExpanded(value) {
    this.setState((prevState) => {
      const newValue = value === undefined ? !prevState.isExpanded : value;
      return { isExpanded: newValue };
    });
  }

  render() {
    const { isExpanded } = this.state;
    const { campaign } = this.props.payments.redeemCode;

    return (
      <div className={mainStyles.billetContainer}>
        <div className={classNames(styles.redeemCodeTitle, 'jest-payments-promocode-title')}
          onClick={() => this.toggleExpanded()}>
          <div className="title-3">У меня есть код на скидку</div>
          <div className={classNames(styles.redeemCodeArrow, { isExpanded })} />
        </div>
        {isExpanded && (
          <div>
            {campaign
              ? (
                <PaymentsPromoCodeDeactivateForm />
              )
              : (
                <PaymentsPromoCodeRedeemForm />
              )}
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    payments: state.payments,
  };
}

export default connect(mapStateToProps)(PaymentsPromoCode);
