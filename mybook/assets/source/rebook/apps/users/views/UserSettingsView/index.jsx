import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import UserSettingsHeader from 'rebook/apps/users/components/UserSettingsHeader';
import mainStyles from 'rebook/apps/base/style/main.scss';

import UserSettingsAvatar from './UserSettingsAvatar';
import UserSettingsPersonalData from './UserSettingsPersonalData';
import UserSettingsPassword from './UserSettingsPassword';


class UserSettingsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.user || {},
    };
  }

  componentWillReceiveProps(nextProps) {
    const { user } = nextProps;
    if (user) {
      this.setState({ user });
    }
  }

  render() {
    const { user } = this.state;

    return (
      <div className={classNames(mainStyles.backgroundContainer, 'themeGrey')}>
        <div className="gridColumn cols-6">
          <UserSettingsHeader page="userProfile" />
          {user.id
            ? (
              <div>
                <UserSettingsAvatar user={user} />
                <UserSettingsPersonalData user={user} />
                <UserSettingsPassword user={user} />
              </div>
            )
            : (
              <div>
                <div className={mainStyles.billetContainer}>
                  <div className="title-1 elementDummy" />
                  <div className="paragraph elementDummy" />
                  <div className="paragraph elementDummy" />
                </div>
                <div className={mainStyles.billetContainer}>
                  <div className="title-2 elementDummy" />
                  <div className="paragraph elementDummy" />
                  <div className="paragraph elementDummy" />
                </div>
                <div className={mainStyles.billetContainer}>
                  <div className="title-2 elementDummy" />
                  <div className="paragraph elementDummy" />
                  <div className="paragraph elementDummy" />
                </div>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

export default connect(mapStateToProps)(UserSettingsView);
