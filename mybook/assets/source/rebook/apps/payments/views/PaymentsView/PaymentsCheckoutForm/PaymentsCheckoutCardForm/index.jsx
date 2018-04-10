import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

import Form, { FormControl } from 'rebook/apps/base/components/form/Form';
import validateForm from 'rebook/apps/base/components/form/validateForm';
import AuthForm from 'rebook/mybook/App/AuthForm';

import PaymentsCheckoutBaseForm from '../PaymentsCheckoutBaseForm';
import PaymentsCheckoutSubmitButton from '../PaymentsCheckoutSubmitButton';
import styles from './style.scss';


class PaymentsCheckoutCardForm extends PaymentsCheckoutBaseForm {
  constructor(props) {
    super(props);
    this.state = {
      form: {},
      errorList: {},
      isInProgress: false,
      shouldCheckoutFormSubmit: false,
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
      isInProgress: true,
      shouldCheckoutFormSubmit: false,
    });
    const form = validateForm(this.state.form);
    submit(form);
  }

  handleSubmitSuccess(data) {
    this.setState({
      errorList: {},
      isInProgress: false,
    });
    // redirect the user to payonline card payment url
    // the user will be returned to the status url once the payment is complete
    window.location.assign(data.redirect_url);
  }

  handleSubmitError(errorList) {
    this.setState({
      errorList,
      isInProgress: false,
    });
    Raven.captureMessage('failed to submit sms payment due to client error', {
      level: 'warning',
      extra: {
        errorList,
      },
    });
  }

  handleSuccessAuth() {
    this.setState({ shouldCheckoutFormSubmit: true });
  }

  render() {
    const { isInProgress, shouldCheckoutFormSubmit } = this.state;
    const { priceForUser, user } = this.props;
    return (
      <div>
        {user
          ? (
            <Form
              action="/api/payments/"
              method="post"
              extraClassName="jest-payments-card-form"
              submitOnInit={shouldCheckoutFormSubmit}
              onSubmit={(callback) => this.handleSubmit(callback)}
              onSuccess={(data) => this.handleSubmitSuccess(data)}
              onError={(errorList) => this.handleSubmitError(errorList)}
              preparePayload={(payload) => this.preparePostData(payload)}>
              <FormControl>
                <PaymentsCheckoutSubmitButton
                  extraClassName={classNames(styles.button, 'jest-payments-card-form-submit')}
                  isInProgress={isInProgress}
                  price={priceForUser} />
              </FormControl>
            </Form>
          )
          : (
            <div className={styles.authForm}>
              <AuthForm
                type="registration"
                submitButtonText="Оформить подписку"
                onSuccessAuth={() => this.handleSuccessAuth()}
                noScrollToTop
                noSuccessNotification
                hideTitle />
            </div>
          )}
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

export default connect(mapStateToProps)(PaymentsCheckoutCardForm);
