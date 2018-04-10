import React from 'react';
import PropTypes from 'prop-types';

import TabBar from 'rebook/apps/base/components/tabs/TabBar';
import TabItem from 'rebook/apps/base/components/tabs/TabItem';
import mainStyles from 'rebook/apps/base/style/main.scss';


const UserSettingsHeader = ({ page }) => {
  const userSettingsPages = [
    {
      id: 1,
      name: 'userProfile',
      title: 'Профиль',
      url: '/account/edit/',
    },
    {
      id: 2,
      name: 'userSubscriptionList',
      title: 'Подписка',
      url: '/account/subscriptions/',
    },
    {
      id: 3,
      name: 'userPaymentList',
      title: 'Ваши платежи',
      url: '/account/payments/',
    },
  ];
  return (
    <header className={mainStyles.sectionHeader}>
      <div className="title-1">Настройки</div>
      <TabBar>
        {userSettingsPages.map((item) => (
          <TabItem
            key={item.id}
            extraClassName={`jest-usersettings-${item.name}-url`}
            name={item.title}
            isActivatedItem={page === item.name}
            url={item.url} />
        ))}
      </TabBar>
    </header>
  );
};

UserSettingsHeader.propTypes = {
  page: PropTypes.string.isRequired,
};

export default UserSettingsHeader;
