import {
  SHOW_FLASH,
  HIDE_FLASH,
  ADD_FLASH_MESSAGE,
  RESET_FLASH,
  CHANGE_FLASH_STATUS
} from '../constants/ActionTypes'
import { STATUS_PENDING } from '../constants/FlashTypes'

const initialState = {
  isVisible: false,
  status: STATUS_PENDING,
  messages: []
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
    case HIDE_FLASH:
      return {
        ...state,
        isVisible: false
      }
    case ADD_FLASH_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.message]
      }
    case RESET_FLASH:
      return initialState
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
