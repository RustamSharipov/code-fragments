import { BASE_ERROR404_SHOW, BASE_ERROR404_HIDE } from 'rebook/apps/base/constants';


export function show() {
  return {
    type: BASE_ERROR404_SHOW,
  };
}

export function hide() {
  return {
    type: BASE_ERROR404_HIDE,
  };
}
