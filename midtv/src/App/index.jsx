import React from 'react';

import Dialog from 'components/Dialog';
import RegistrationForm from 'apps/account/views/RegistrationView/RegistrationForm';

import styles from './style.css';


class App extends React.Component {
  render() {
    return (
      <div className={styles.app}>
        <Dialog>
          <RegistrationForm />
        </Dialog>
      </div>
    );
  }
}

export default App;
