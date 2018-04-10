import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';

import CheckPaymentStatus from 'rebook/apps/payments/components/CheckPaymentStatus';
import Form, { FormControl, FormRow } from 'rebook/apps/base/components/form/Form';
import FormTextInput from 'rebook/apps/base/components/form/FormTextInput';
import validateForm from 'rebook/apps/base/components/form/validateForm';
import AuthForm from 'rebook/mybook/App/AuthForm';
import SpinnerLoader from 'rebook/apps/base/components/SpinnerLoader';

import PaymentsCheckoutBaseForm from '../PaymentsCheckoutBaseForm';
import PaymentsCheckoutSubmitButton from '../PaymentsCheckoutSubmitButton';
import styles from './style.scss';


const PendingSmsPaymentStatus = ({ onPaymentAccepted, onPaymentFailed, payment }) => {
  return (
    <div>
      <CheckPaymentStatus
        paymentUuid={payment.uuid}
        onSuccess={onPaymentAccepted}
        onFail={onPaymentFailed} />
      <SpinnerLoader />
      <div className={styles.pending}>
        Мы отправили сообщение с просьбой подтвердить оплату на номер {payment.phone}.
        Следуйте инструкциям в СМС.
      </div>
    </div>
  );
};

class PaymentsCheckoutSmsForm extends PaymentsCheckoutBaseForm {
  constructor(props) {
    super(props);
    this.state = {
      form: {},
      errorList: {},
      pendingPayment: null, // successfully submitted payment
      isPending: false,  // a sms has been sent, please wait until we get a success code from api
      isSuccess: false,  // sms payment has been accepted, show success message
    };
  }

  updateFormField(input) {
    this.setState((prevState, props) => ({
      errorList: {},
      form: {
        ...prevState.form,
        ...input,
      },
    }));
  }

  handleSubmit(submit) {
    this.setState({
      errorList: {},
      isPending: true,
    });
    const form = validateForm(this.state.form);
    submit(form);
  }

  handleSubmitSuccess(data) {
    // handle a successfully submitted payment
    this.setState({
      pendingPayment: data,
    });
  }

  handleSubmitError(errorList) {
    this.setState({
      errorList,
      isPending: false,
      pendingPayment: null,
    });
    Raven.captureMessage('failed to submit sms payment due to client error', {
      level: 'warning',
      extra: {
        errorList,
      },
    });
  }

  handleAcceptedPayment(payment) {
    const { history } = this.props;
    const successPageUrl = `/payments/status/${payment.uuid}/`;
    // redirect the user to the success page
    history.push(successPageUrl);
  }

  handleFailedPayment(payment) {
    const errorList = {
      non_field_errors: payment.failure_messages
        ? payment.failure_messages
        : ['Оплата временно недоступна. Попробуйте еще раз'],
    };
    // unlock the submit form, show unknown error
    this.setState({
      errorList,
      isPending: false,
      pendingPayment: null,
    });
  }

  render() {
    const { isPending, pendingPayment, errorList } = this.state;
    const { priceForUser, user } = this.props;
    const shouldDisplayPendingStatus = isPending && pendingPayment !== null;
    const phoneValue = user ? user.payment_phone || user.phone : '';

    return (
      <div>
        <div className={styles.phone}>
          {shouldDisplayPendingStatus && (
            <PendingSmsPaymentStatus
              onPaymentAccepted={(payment) => this.handleAcceptedPayment(payment)}
              onPaymentFailed={(payment) => this.handleFailedPayment(payment)}
              payment={pendingPayment} />
          )}
          {user
            ? (
              <div className={classNames(styles.phoneForm, { isHidden: shouldDisplayPendingStatus })}>
                <p className={styles.inputLabel}>Введите телефон, с которого вы хотите оплатить подписку</p>
                <p className={styles.note}>Только для России</p>
                <Form
                  action="/api/payments/"
                  method="post"
                  extraClassName="jest-payments-sms-form"
                  onSubmit={(callback) => this.handleSubmit(callback)}
                  onSuccess={(data) => this.handleSubmitSuccess(data)}
                  onError={(errorList) => this.handleSubmitError(errorList)}
                  preparePayload={(payload) => this.preparePostData(payload)}>
                  <FormRow>
                    <FormTextInput
                      extraClassName={classNames(styles.input, 'jest-payments-sms-form-phone')}
                      errorList={errorList.sms_phone || errorList.non_field_errors}
                      isDisabled={isPending}
                      isRequired
                      isRequiredError="Укажите номер телефона"
                      value={phoneValue}
                      onInit={(input) => this.updateFormField(input)}
                      onChange={(input) => this.updateFormField(input)}
                      name="sms_phone"
                      validationMessageExtraClassName="jest-form-sms_phone-error" />
                  </FormRow>
                  <p className={styles.note}>
                    На этот номер придёт SMS.
                    Для подтверждения покупки отправьте бесплатное SMS в ответ,
                    и с вашего счета спишется стоимость подписки.
                  </p>
                  <FormControl>
                    <PaymentsCheckoutSubmitButton
                      extraClassName="jest-payments-sms-form-submit"
                      isInProgress={isPending}
                      price={priceForUser} />
                  </FormControl>
                </Form>
              </div>
            )
            : (
              <div className={styles.authForm}>
                <AuthForm
                  type="registration"
                  submitButtonText="Оформить подписку"
                  noScrollToTop
                  hideTitle />
              </div>
            )}
        </div>
        <div className={styles.warning}>
          <h3>Внимание!</h3>
          <p className={styles.warningText}>
            Платеж не действует для корпоративных тарифов.
          </p>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    payments: state.payments,
  };
}

export default connect(mapStateToProps)(withRouter(PaymentsCheckoutSmsForm));
