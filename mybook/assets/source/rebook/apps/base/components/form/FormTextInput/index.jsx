import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './style.scss';


const PasswordVisibilitySwitcher = ({ onClick, showPassword }) => {
  return (
    <button
      type="button"
      className={classNames(
        styles.passwordVisibilitySwitcher,
        showPassword && 'showPassword',
      )}
      onClick={() => onClick()}>
      <svg
        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        className={styles.passwordVisibilitySwitcherIcon}>
        <path d="M11.5,4A12.325,12.325,0,0,0,0,12a12.266,12.266,0,0,0,23,0A12.324,12.324,0,0,0,11.5,4Zm0,13.333A5.23,
          5.23,0,0,1,6.273,12a5.229,5.229,0,1,1,10.455,0A5.23,5.23,0,0,1,11.5,17.333Zm0-8.533A3.112,3.112,0,0,0,8.364,
          12a3.137,3.137,0,1,0,6.272,0A3.112,3.112,0,0,0,11.5,8.8Z" />
      </svg>
    </button>
  );
};

class FormTextInput extends React.Component {
  constructor(props) {
    super(props);
    const { errorList, value } = props;

    this.state = {
      errorList,
      passwordIsVisible: false,
      value: value || '',
    };
  }

  // Return text input data on its init
  componentWillMount() {
    const {
      isRequired, isRequiredError, isEmail, isEmailError, minLength, minLengthError, name,
      onInit, onUpdate,
    } = this.props;
    const { value } = this.state;
    const updateParams = {
      [name]: {
        isRequired,
        isRequiredError,
        isEmail,
        isEmailError,
        minLength,
        minLengthError,
        value,
      },
    };

    if (onInit) {
      onInit(updateParams);
    }

    if (onUpdate) {
      onUpdate(updateParams);
    }
  }

  // Make field as invalid
  componentWillReceiveProps(nextProps, nextState) {
    this.setState({
      errorList: nextProps.errorList,
    });
  }

  togglePasswordVisibility() {
    this.focus();
    this.setState(({ passwordIsVisible }) => {
      return { passwordIsVisible: !passwordIsVisible };
    });
  }

  focus() {
    this.textInput.focus();
  }

  handleChange(event) {
    const {
      isRequired, isRequiredError, isEmail, isEmailError, minLength, minLengthError, name,
      onChange, onUpdate,
    } = this.props;
    const { value } = event.target;
    const updateParams = {
      [name]: {
        isRequired,
        isRequiredError,
        isEmail,
        isEmailError,
        minLength,
        minLengthError,
        value,
      },
    };

    if (onChange) {
      onChange(updateParams);
    }

    if (onUpdate) {
      onUpdate(updateParams);
    }

    this.setState({
      errorList: [],
      value,
    });
  }

  handleBlur(event) {
    const { onBlur } = this.props;
    if (onBlur) {
      onBlur(event);
    }
  }

  render() {
    const {
      autoFocus, extraClassName, isDisabled, label, name, placeholder, type,
      validationMessageExtraClassName,
    } = this.props;
    const { errorList, passwordIsVisible } = this.state;

    let inputType = type;
    if (type === 'password' && passwordIsVisible) {
      inputType = 'text';
    }

    return (
      <span className={classNames(
        styles.formTextInput,
        type === 'password' && styles.passwordInput,
      )}>
        {label &&
          <label className={styles.label} htmlFor={`id_${name}`} dangerouslySetInnerHTML={{ __html: label }} />
        }
        <span className={styles.control}>
          <input
            className={classNames(
              styles.input,
              extraClassName,
              errorList && errorList.length > 0 ? styles.isInvalid : null,
            )}
            autoFocus={autoFocus}
            disabled={isDisabled}
            id={`id_${name}`}
            name={name}
            onChange={(event) => this.handleChange(event)}
            onBlur={(event) => this.handleBlur(event)}
            placeholder={placeholder}
            ref={(input) => { this.textInput = input; }}
            type={inputType}
            value={this.state.value} />
          {type === 'password' &&
            <PasswordVisibilitySwitcher
              showPassword={passwordIsVisible}
              onClick={() => this.togglePasswordVisibility()} />
          }
        </span>
        {errorList && errorList.length > 0 && (
          <span
            className={classNames(styles.errorValidationMessage, validationMessageExtraClassName)}
            dangerouslySetInnerHTML={{ __html: errorList.join('<br />') }} />
        )}
      </span>
    );
  }
}

FormTextInput.defaultProps = {
  errorList: [],
  extraClassName: null,
  isDisabled: false,
  isEmail: false,
  isEmailError: '',
  isRequired: false,
  isRequiredError: '',
  minLength: 0,
  minLengthError: '',
  label: null,
  onInit: null,
  onChange: null,
  placeholder: null,
  type: 'text',
  value: '',
  validationMessageExtraClassName: '',
};

FormTextInput.propTypes = {
  errorList: PropTypes.array,
  extraClassName: PropTypes.string,
  isDisabled: PropTypes.bool,
  isEmail: PropTypes.bool,
  isEmailError: PropTypes.string,
  isRequired: PropTypes.bool,
  isRequiredError: PropTypes.string,
  minLength: PropTypes.number,
  minLengthError: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  onInit: PropTypes.func,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string,
  validationMessageExtraClassName: PropTypes.string,
};

export default FormTextInput;
