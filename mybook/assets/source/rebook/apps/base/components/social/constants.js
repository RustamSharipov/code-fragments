/* eslint-disable import/prefer-default-export */
import React from 'react';

import { FacebookSocialNetworkIcon, VKSocialNetworkIcon, OdnoklassnikiSocialNetworkIcon, TwitterSocialNetworkIcon,
         InstagramSocialNetworkIcon } from './socialNetworkIcons';


export const SOCIAL_NETWORKS = {
  FACEBOOK: {
    name: 'Facebook',
    icon: <FacebookSocialNetworkIcon />,
  },
  VK: {
    name: 'ВКонтакте',
    icon: <VKSocialNetworkIcon />,
  },
  TWITTER: {
    name: 'Twitter',
    icon: <TwitterSocialNetworkIcon />,
  },
  ODNOKLASSNIKI: {
    name: 'Одноклассники',
    icon: <OdnoklassnikiSocialNetworkIcon />,
  },
  INSTAGRAM: {
    name: 'Instagram',
    icon: <InstagramSocialNetworkIcon />,
  },
};
