import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as UserActions from 'rebook/apps/users/actions/UserActions';
import Form, { FormControl, FormRow } from 'rebook/apps/base/components/form/Form';
import Button from 'rebook/apps/base/components/Button';
import validateForm from 'rebook/apps/base/components/form/validateForm';
import FormTextInput from 'rebook/apps/base/components/form/FormTextInput';


class PasswordResetFormPhone extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorList: {},
      successData: {},
      form: {},
      isDisabled: false,
    };
  }

  updateFormField(input) {
    this.setState((prevState) => {
      return {
        errorList: {},
        form: {
          ...prevState.form,
          ...input,
        },
      };
    });
  };

  handleFormSubmit(submit) {
    this.setState({
      errorList: {},
      isDisabled: true,
    });
    const form = validateForm(this.state.form);
    submit(form);
  }

  handleError(errorList) {
    this.setState({
      errorList,
      isDisabled: false,
    });
  }

  handleSuccess(successData) {
    window.scrollTo(0, 0);
    this.props.UserActions.fetchCurrentUser();
    this.setState({
      successData,
      errorList: {},
      isDisabled: false,
    });
    this.props.history.push('/account/set-password/');
  }

  setResetToken(payload) {
    return {
      ...payload,
      reset_token: this.props.resetToken,
    };
  }

  render() {
    const { errorList, isDisabled } = this.state;

    return (
      <Form
        extraClassName="jest-reset-password-form-phone"
        action="/api/account/confirm-code/"
        method="post"
        onSubmit={(callback) => this.handleFormSubmit(callback)}
        onSuccess={(successList) => this.handleSuccess(successList)}
        onError={(errorList) => this.handleError(errorList)}
        preparePayload={(payload) => this.setResetToken(payload)}>
        <div>
          <FormRow extraClassName="jest-reset-password-code">
            <FormTextInput
              name="code"
              errorList={errorList.code}
              onUpdate={(input) => this.updateFormField(input)}
              isDisabled={isDisabled}
              isRequired
              isRequiredError="Введите код из SMS"
              label="Введите код из SMS" />
          </FormRow>
          <FormControl extraClassName="jest-reset-password-submit-phone">
            <Button isInProgress={isDisabled}>
              Войти в MyBook
            </Button>
          </FormControl>
        </div>
      </Form>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    UserActions: bindActionCreators(UserActions, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(PasswordResetFormPhone);
