import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import Button from 'rebook/apps/base/components/Button';
import Form, { FormControl, FormRow } from 'rebook/apps/base/components/form/Form';
import FormTextInput from 'rebook/apps/base/components/form/FormTextInput';
import validateForm from 'rebook/apps/base/components/form/validateForm';
import * as PaymentsActions from 'rebook/apps/payments/actions/PaymentsActions';

import styles from './style.scss';


const PromoCodeRedeemRestrictions = ({ redeemCode }) => {
  const { campaign } = redeemCode;
  let discountAmountText, subscriptionTypeText,
      subscriptionAllPeriodsTypeText, subscriptionPeriodText, restrictionsText;

  if (campaign.discount_type === 'percent') {
    discountAmountText = `Скидка (${campaign.discount}%)`;
  }
  else {
    discountAmountText = `Скидка ${campaign.discount} ₽`;
  }

  // all subscription types are permitted
  if (campaign.subscription_types.length === 0
      || (campaign.subscription_types.includes('pro') && campaign.subscription_types.includes('standard'))) {
    subscriptionTypeText = 'подписки';
    subscriptionAllPeriodsTypeText = 'любую подписку';
  }
  else if (campaign.subscription_types.includes('pro')) {
    subscriptionTypeText = 'премиум-подписки';
    subscriptionAllPeriodsTypeText = 'премиум-подписку';
  }
  else if (campaign.subscription_types.includes('standard')) {
    subscriptionTypeText = 'стандартной подписки';
    subscriptionAllPeriodsTypeText = 'стандартную подписку';
  }

  // all periods are permitted
  if (campaign.subscription_periods.length == 0
      || (campaign.subscription_periods.includes('month')
          && campaign.subscription_periods.includes('months3')
          && campaign.subscription_periods.includes('year'))) {
    subscriptionPeriodText = subscriptionAllPeriodsTypeText;
  }
  else if (campaign.subscription_periods.includes('month')) {
    subscriptionPeriodText = `1 месяц ${subscriptionTypeText}`;
  }
  else if (campaign.subscription_periods.includes('months3')) {
    subscriptionPeriodText = `3 месяца ${subscriptionTypeText}`;
  }
  else if (campaign.subscription_periods.includes('year')) {
    subscriptionPeriodText = `1 год ${subscriptionTypeText}`;
  }

  restrictionsText = `${discountAmountText} на ${subscriptionPeriodText}`;

  // add text about min order amount restriction
  if (campaign.min_amount_order) {
    restrictionsText = `${restrictionsText} при заказе от ${campaign.min_amount_order} ₽`;
  }

  return (
    <div className={styles.discountInfo}>
      <div className={styles.discountImage} />
      <small className={styles.restrictionText}>{restrictionsText}</small>
    </div>
  );
};

class PaymentsPromoCodeDeactivateForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {},
      errorList: {},
      isInProgress: false,
    };
  }

  handleSubmit(submit) {
    this.setState({
      errorList: {},
      isInProgress: true,
    });

    const form = validateForm(this.state.form);
    submit(form);
  }

  handleSuccess() {
    const { PaymentsActions } = this.props;
    this.setState({
      errorList: {},
      isInProgress: false,
    }, () => {
      // remove the code on success as it had never existed
      PaymentsActions.updateRedeemCode(null, this.props.history);
    });
  }

  handleError(errorList) {
    this.setState({
      errorList,
      isInProgress: false,
    });
  }

  render() {
    const { errorList, isInProgress } = this.state;
    const { payments } = this.props;
    const { redeemCode } = payments;
    return (
      <div>
        <Form
          action={`/api/promocode/${redeemCode.code}/`}
          method="delete"
          extraClassName="jest-payments-promocode-deactivate-form"
          onSubmit={(callback) => this.handleSubmit(callback)}
          onSuccess={() => this.handleSuccess()}
          onError={(errorList) => this.handleError(errorList)}>
          <FormRow>
            <FormTextInput
              extraClassName="jest-payments-promocode-deactivate-form-code"
              validationMessageExtraClassName="jest-payments-promocode-deactivate-form-code-error"
              errorList={errorList.promocode || errorList.non_field_errors}
              isDisabled
              value={redeemCode.code}
              name="promocode" />
          </FormRow>
          <FormControl>
            <Button
              theme="secondary"
              size="small"
              extraClassName="jest-payments-promocode-delete-form-submit"
              isInProgress={isInProgress}>
              Удалить код
            </Button>
          </FormControl>
        </Form>
        <PromoCodeRedeemRestrictions redeemCode={redeemCode} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    payments: state.payments,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    PaymentsActions: bindActionCreators(PaymentsActions, dispatch),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PaymentsPromoCodeDeactivateForm));
