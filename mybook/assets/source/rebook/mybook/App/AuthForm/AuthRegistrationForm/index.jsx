import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as AuthFormActions from 'rebook/apps/users/actions/AuthFormActions';
import Form, { FormControl, FormRow, FormExtra } from 'rebook/apps/base/components/form/Form';
import Button from 'rebook/apps/base/components/Button';
import FormTextInput from 'rebook/apps/base/components/form/FormTextInput';
import { menuItems } from 'rebook/mybook/App/Footer/constants';
import AuthFormSocialAuth from 'rebook/mybook/App/AuthForm/AuthFormSocialAuth';


const AuthRegistrationForm = (props) => {
  const {
    onInit, onChange, onSubmit, onError, submitButtonText, AuthFormActions,
    onSuccess, form, isInProgress, errorList, handleChangeFormType, displaySocialAuth,
  } = props;
  return (
    <div className="jest-registration-form">
      <Form
        action="/api/registration/"
        method="post"
        onSubmit={onSubmit}
        onSuccess={onSuccess}
        onError={onError}>
        <FormRow extraClassName="jest-registration-email">
          <FormTextInput
            name="email"
            isDisabled={isInProgress}
            isRequired
            isRequiredError="Введите почту"
            onInit={onInit}
            onChange={onChange}
            errorList={errorList.email}
            value={form.email && form.email.value}
            label="Ваша электронная почта" />
        </FormRow>
        <FormRow extraClassName="jest-registration-password">
          <FormTextInput
            name="password"
            type="password"
            isDisabled={isInProgress}
            isRequired
            isRequiredError="Введите пароль"
            onInit={onInit}
            onChange={onChange}
            errorList={errorList.password}
            label="Придумайте пароль, пожалуйста" />
        </FormRow>
        <FormExtra>Не менее 8 символов, цифры и буквы.</FormExtra>
        <FormControl >
          <Button isInProgress={isInProgress}>
            {submitButtonText}
          </Button>
        </FormControl>
        {displaySocialAuth &&
          <AuthFormSocialAuth />
        }
        <FormExtra>
          <Button
            extraClassName="jest-login-button"
            theme="secondary"
            size="small"
            handleClick={() => handleChangeFormType()}>
            Войти
          </Button>
        </FormExtra>
        <FormExtra>
          Регистрируясь, вы принимаете
          <Link
            className="link"
            to={menuItems[10].url}
            onClick={() => AuthFormActions.hideForm()}> публичную оферту
          </Link> и
          <Link
            className="link"
            to={menuItems[7].url}
            onClick={() => AuthFormActions.hideForm()}> условия использования
          </Link> MyBook
        </FormExtra>
      </Form>
    </div>
  );
};

AuthRegistrationForm.propTypes = {
  submitButtonText: PropTypes.string,
};

AuthRegistrationForm.defaultProps = {
  submitButtonText: 'Зарегистрироваться',
};

function mapDispatchToProps(dispatch) {
  return {
    AuthFormActions: bindActionCreators(AuthFormActions, dispatch),
  };
}
export default connect(null, mapDispatchToProps)(AuthRegistrationForm);
