import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import Button from 'rebook/apps/base/components/Button';
import Form, { FormControl, FormRow } from 'rebook/apps/base/components/form/Form';
import FormTextInput from 'rebook/apps/base/components/form/FormTextInput';
import validateForm from 'rebook/apps/base/components/form/validateForm';
import * as PaymentsActions from 'rebook/apps/payments/actions/PaymentsActions';


class PaymentsPromoCodeRedeemForm extends React.Component {
  constructor(props) {
    super(props);
    this.form = null;
    this.state = {
      form: {},
      errorList: {},
      isInProgress: false,
    };
  }

  updateFormState(form, shouldSubmitOnUpdate = false) {
    this.setState(
      (prevState) => {
        return {
          errorList: {},
          form: {
            ...prevState.form,
            ...form,
          },
        };
      },
      () => {
        // automatically redeem code form when it's auto filled on mount
        if (shouldSubmitOnUpdate && form.promocode.value) {
          this.form.wrappedInstance.handleSubmit();
        }
      }
    );
  }

  handleSubmit(submit) {
    this.setState({
      errorList: {},
      isInProgress: true,
    });
    const form = validateForm(this.state.form);
    submit(form);
  }

  handleSuccess(data) {
    const { PaymentsActions } = this.props;
    this.setState({
      errorList: {},
      isInProgress: false,
    }, () => {
      PaymentsActions.updateRedeemCode(data, this.props.history);
    });
  }

  handleError(errorList) {
    this.setState({
      errorList,
      isInProgress: false,
    });
  }

  handleCodeInputBlur(event) {
    // automatically submit the entered promo code on focus loss
    if (event.target.value) {
      this.form.wrappedInstance.handleSubmit();
    }
  }

  render() {
    const { redeemCode } = this.props.payments;
    const { errorList, isInProgress } = this.state;

    return (
      <Form
        ref={(node) => { this.form = node; }}
        action="/api/promocode/redeem/"
        method="post"
        extraClassName="jest-payments-promocode-redeem-form"
        onSubmit={(callback) => this.handleSubmit(callback)}
        onSuccess={(data) => this.handleSuccess(data)}
        onError={(errorList) => this.handleError(errorList)}>
        <FormRow>
          <FormTextInput
            extraClassName="jest-payments-promocode-redeem-form-code"
            validationMessageExtraClassName="jest-payments-promocode-redeem-form-code-error"
            errorList={errorList.promocode || errorList.non_field_errors}
            isDisabled={isInProgress}
            isRequired
            isRequiredError="Введите код на скидку"
            onInit={(input) => this.updateFormState(input, true)}
            onChange={(input) => this.updateFormState(input)}
            onBlur={(event) => this.handleCodeInputBlur(event)}
            value={redeemCode.code || ''}
            name="promocode" />
        </FormRow>
        <FormControl>
          <Button
            theme="secondary"
            size="small"
            extraClassName="jest-payments-promocode-redeem-form-submit"
            isInProgress={isInProgress}>
            Активировать
          </Button>
        </FormControl>
      </Form>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PaymentsPromoCodeRedeemForm));
