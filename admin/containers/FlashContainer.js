import React from 'react'
import { connect } from 'react-redux'
import { hideFlash } from '../actions'
import Flash from '../components/Flash'

const mapStateToProps = (state, ownProps) => ({
  status: state.flash.status,
  messages: state.flash.messages,
  isVisible: state.flash.isVisible
})

const mapDispatchToProps = dispatch => ({
  onClickClose: () => dispatch(hideFlash())
})

const FlashContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Flash)

export default FlashContainer
