import {
  SHOW_FLASH,
  SHOW_FLASH_LOADING,
  HIDE_FLASH,
  ADD_FLASH_MESSAGE,
  RESET_FLASH,
  CHANGE_FLASH_STATUS
} from '../constants/ActionTypes'
import { STATUS_PENDING } from '../constants/FlashTypes'

const initialState = {
  isVisible: false,
  status: STATUS_PENDING,
  messages: [],
  pendingResources: []
}

const flash = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_FLASH:
      return {
        ...state,
        isVisible: true,
        status: action.status,
        messages: [...action.messages]
      }
    case SHOW_FLASH_LOADING:
      // NOTE: This *replaces* pendingResources rather than adding to them.
      return {
        ...state,
        isVisible: true,
        status: action.status,
        pendingResources: action.pendingResources,
        messages: [action.message || 'Loading resources...']
      }
    case HIDE_FLASH:
      // If a resourceName was provided, remove it from the pendingResources
      // array, and if that was the last thing in the array, hide the flash.
      // Otherwise, keep the flash active.
      if (action.resourceName) {
        const pendingResources = state.pendingResources.filter(name => {
          return name !== action.resourceName
        })
        const isVisible = pendingResources.length >= 1

        return {
          ...state,
          isVisible,
          pendingResources,
          messages: []
        }
      }

      // If no resourceName was provided, simply hide the flash.
      return {
        ...state,
        isVisible: false,
        messages: []
      }
    case ADD_FLASH_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.message]
      }
    case RESET_FLASH:
      return state.pendingResources.length > 0 ? state : initialState
    case CHANGE_FLASH_STATUS:
      return {
        ...state,
        status: action.status
      }
    default:
      return state
  }
}

export default flash
