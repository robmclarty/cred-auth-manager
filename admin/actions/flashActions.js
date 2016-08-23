import {
  SHOW_FLASH,
  SHOW_FLASH_LOADING,
  HIDE_FLASH,
  ADD_FLASH_MESSAGE,
  RESET_FLASH,
  CHANGE_FLASH_STATUS
} from '../constants/ActionTypes'
import { STATUS_PENDING } from '../constants/FlashTypes'

export const showFlash = ({ status, messages }) => ({
  type: SHOW_FLASH,
  status,
  messages
})

// Put the flash into a special state used for multiple async loading
// operations. Show the message in the flash and set the pendingResources to the
// names listed in the parameters. This way the flash will only hide itself when
// all listed resources have completed loading. Resources are removed from this
// array when each call of hideFlash(resourceName) is made, removing that
// resource from the list (ideally used after each individual resource has
// finished successfully loading).
export const showFlashLoading = ({ pendingResources, message }) => ({
  type: SHOW_FLASH_LOADING,
  status: STATUS_PENDING,
  messages: [message || 'Loading resources...'],
  pendingResources
})

// The resourceName is optional, if none is provided the flash will be
// immediately hidden, otherwise it will remove resourceName from
// pendingResources first, and only hide if there are no more pendingResources
// being loaded.
export const hideFlash = resourceName => ({
  type: HIDE_FLASH,
  resourceName
})

export const resetFlash = () => ({
  type: RESET_FLASH
})
