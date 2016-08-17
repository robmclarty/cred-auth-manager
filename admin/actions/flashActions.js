import {
  SHOW_FLASH,
  HIDE_FLASH,
  ADD_FLASH_MESSAGE,
  RESET_FLASH,
  CHANGE_FLASH_STATUS
} from '../constants/ActionTypes';
import {
  STATUS_PENDING,
  STATUS_ERROR,
  STATUS_SUCCESS,
  STATUS_INFO,
  STATUS_WARNING
} from '../constants/FlashTypes';

export const showFlash = ({ status, messages }) => ({
  type: SHOW_FLASH,
  status,
  messages
});

export const hideFlash= () => ({
  type: HIDE_FLASH
});

export const resetFlash = () => ({
  type: RESET_FLASH
})
