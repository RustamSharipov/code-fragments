/* eslint-disable import/prefer-default-export */
import React from 'react';

import { IOSAppIcon, AndroidAppIcon } from './appIcons';


export const APPS = {
  ios: {
    metricUrl: 'https://redirect.appmetrica.yandex.com/serve/674048688460421021/',
    slug: 'IOS',
    name: 'iOS',
    icon: <IOSAppIcon />,
  },
  android: {
    metricUrl: 'https://redirect.appmetrica.yandex.com/serve/97588024321320240/',
    slug: 'Android',
    name: 'Android',
    icon: <AndroidAppIcon />,
  },
};
