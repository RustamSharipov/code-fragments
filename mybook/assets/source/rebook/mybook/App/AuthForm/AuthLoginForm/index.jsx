import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Form, { FormControl, FormRow, FormExtra } from 'rebook/apps/base/components/form/Form';
import Button from 'rebook/apps/base/components/Button';
import FormTextInput from 'rebook/apps/base/components/form/FormTextInput';
import * as AuthFormActions from 'rebook/apps/users/actions/AuthFormActions';
import AuthFormSocialAuth from 'rebook/mybook/App/AuthForm/AuthFormSocialAuth';


const AuthLoginForm = (props) => {
  const {
    onInit, onChange, onSubmit, onError, submitButtonText,
    onSuccess, form, isInProgress, errorList, handleChangeFormType, displaySocialAuth,
    AuthFormActions,
  } = props;

  return (
    <div className="jest-auth-form">
      <Form
        action="/api/auth/"
        method="post"
        onSubmit={onSubmit}
        onSuccess={onSuccess}
        onError={onError}>
        <FormRow extraClassName="jest-auth-email">
          <FormTextInput
            name="email"
            isDisabled={isInProgress}
            isRequired
            isRequiredError="Введите почту или телефон"
            onInit={onInit}
            onChange={onChange}
            errorList={errorList.email}
            value={form.email && form.email.value}
            label="Почта или телефон" />
        </FormRow>
        <FormRow extraClassName="jest-auth-password">
          <FormTextInput
            name="password"
            type="password"
            isDisabled={isInProgress}
            isRequired
            isRequiredError="Введите пароль"
            onInit={onInit}
            onChange={onChange}
            errorList={errorList.password}
            label="Пароль" />
        </FormRow>
        <FormControl>
          <Button isInProgress={isInProgress}>
            {submitButtonText}
          </Button>
        </FormControl>
        {displaySocialAuth &&
          <AuthFormSocialAuth />
        }
        <FormExtra>
          <Button
            theme="secondary"
            size="small"
            url="/account/reset-password/"
            handleClick={() => AuthFormActions.hideForm()}>
            Забыл пароль
          </Button>
        </FormExtra>
        <FormExtra>
          <Button
            extraClassName="jest-registration-button"
            size="small"
            theme="secondary"
            handleClick={handleChangeFormType}>
            Зарегистрироваться
          </Button>
        </FormExtra>
      </Form>
    </div>
  );
};

AuthLoginForm.propTypes = {
  submitButtonText: PropTypes.string,
};

AuthLoginForm.defaultProps = {
  submitButtonText: 'Войти',
};

function mapDispatchToProps(dispatch) {
  return {
    AuthFormActions: bindActionCreators(AuthFormActions, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(AuthLoginForm);
