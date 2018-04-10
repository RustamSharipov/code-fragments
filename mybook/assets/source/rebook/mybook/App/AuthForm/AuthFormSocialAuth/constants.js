/* eslint-disable import/prefer-default-export */
import { SOCIAL_NETWORKS } from 'rebook/apps/base/components/social/constants';


export const SOCIAL_LOGINS = [
  {
    id: 1,
    name: SOCIAL_NETWORKS.FACEBOOK.name,
    icon: SOCIAL_NETWORKS.FACEBOOK.icon,
    slug: 'Facebook',
    url: '/api/cb/social/login/facebook/',
  },
  {
    id: 2,
    name: SOCIAL_NETWORKS.VK.name,
    icon: SOCIAL_NETWORKS.VK.icon,
    slug: 'VK',
    url: '/api/cb/social/login/vkontakte-oauth2/',
  },
];
