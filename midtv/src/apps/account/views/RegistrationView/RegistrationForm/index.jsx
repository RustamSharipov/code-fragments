import React from 'react';
import { debounce } from 'throttle-debounce';
import 'whatwg-fetch';

import TextInput from 'components/TextInput';
import Button from 'components/Button';
import ValidationMessage from 'components/ValidationMessage';

import { ERROR_MESSAGES, FIELD_VALIDATION_DEBOUNCE_DELAY, ENDPOINTS } from './constants';
import styles from './style.css';


class RegistrationForm extends React.Component {
  constructor(props) {
    super(props);
    this.isLocked = false;
    this.state = {
      username: null,
      errorMessage: null,
      successMessage: null,
      usernameIsValid: false,
      isInProgress: false,
    };
    this.handleFieldValidation = debounce(FIELD_VALIDATION_DEBOUNCE_DELAY, this.handleFieldValidation);
  }

  handleInputChange(event) {
    this.setState({
      errorMessage: null,
      successMessage: null,
      usernameIsValid: false,
      isInProgress: true,
    });
    this.handleFieldValidation(event.target.name, event.target.value);
  }

  handleFieldValidation(name, value) {
    if (value) {
      const url = `${ENDPOINTS.USERNAME_VALIDATION}?${name}=${value}`;
      fetch(url)
        .then(
          (response) => {
            response.json().then((data) => {
              this.setState({ isInProgress: false });

              // Handle success
              if (response.status === 200 && data.result) {
                this.handleSuccess('Никнейм доступен');
              }

              // Handle error
              else {
                this.handleError(data.message);
                return;
              }
            });
          }
        )
        .catch((error) => {
          this.setState({ isInProgress: false });
          this.handleError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
        });
    }
    else {
      this.setState({isInProgress: false });
    }
  }

  handleFormSubmit(event) {
    if (event) {
      event.preventDefault();
    }
    this.setState({ errorMessage: null });
    alert(`${this.state.username} is created!`);
  }

  handleError(errorMessage) {
    this.setState({ errorMessage });
  }

  handleSuccess(successMessage) {
    this.setState({
      usernameIsValid: true,
      successMessage,
    });
  }

  render() {
    const { username, isInProgress, errorMessage, successMessage, usernameIsValid } = this.state;
    return (
      <form onSubmit={(event) => this.handleFormSubmit(event)}>
        <div>
          <TextInput
            name="username"
            placeholder="Введите никнейм"
            errorMessage={errorMessage}
            successMessage={successMessage}
            onChange={(event) => this.handleInputChange(event)}
            autoFocus />
          <div className={styles.formValidationMessage}>
            {isInProgress && <ValidationMessage>Ожидание</ValidationMessage>}
            {errorMessage && <ValidationMessage type="error">{errorMessage}</ValidationMessage>}
            {successMessage && <ValidationMessage type="success">{successMessage}</ValidationMessage>}
          </div>
        </div>
        <div className={styles.formControl}>
          <Button type="submit" isDisabled={!usernameIsValid}>Хорошо</Button>
        </div>
      </form>
    );
  }
};

export default RegistrationForm;