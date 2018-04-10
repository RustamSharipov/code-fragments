import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import Button from 'rebook/apps/base/components/Button';
import uaDetector from 'rebook/apps/utils/uaDetector';
import { APPS } from 'rebook/apps/base/components/apps/constants';

import styles from './style.scss';


const AppButton = ({ extraClassName, target }) => {
  let platform, url, icon;
  const userAgent = navigator && navigator.userAgent ? navigator.userAgent : null;
  const qs = queryString.stringify({
    pagetype: target,
  });

  // probably server side
  if (!userAgent) {
    return null;
  }

  if (uaDetector.isIos(userAgent)) {
    platform = APPS.ios.name;
    icon = APPS.ios.icon;
    url = `${APPS.ios.metricUrl}?${qs}`;
  }
  else if (uaDetector.isAndroid(userAgent)) {
    platform = APPS.android.name;
    icon = APPS.android.icon;
    url = `${APPS.android.metricUrl}?${qs}`;
  }

  if (!platform) {
    return null;
  }

  return (
    <div className={extraClassName}>
      <Button url={url} theme="secondary">
        <span className={styles.icon}>
          {icon}
        </span>
        <span>Читать в приложении</span>
      </Button>
    </div>
  );
};

AppButton.propTypes = {
  extraClassName: PropTypes.string,
  target: PropTypes.string.isRequired,
};

AppButton.defaultProps = {
  extraClassName: '',
};

export default AppButton;
