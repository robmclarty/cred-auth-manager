import React, { PropTypes } from 'react'
import { Link } from 'react-router'

const FriendshipForm = React.createClass({
  displayName: 'FriendshipForm',

  propTypes: {
    userId: PropTypes.number,
    friendships: PropTypes.array,
    // createFriendship: PropTypes.func,
    // declineFriendship: PropTypes.func
  },

  getDefaultProps: function () {
    return {
      userId: null,
      friendships: []
    }
  },

  // If the ENTER key is pressed, submit the current username string to add
  // it to the user's friendship list.
  onKeyPress: function (e) {
    if (e.key === 'Enter') {
      const usernames = this.refs.createFriendshipInput.value.split(' ')

      e.preventDefault()

      this.refs.createFriendshipInput.value = '' // reset input
      //this.props.createFriendship(this.props.userId, usernames)
    }
  },

  onClickDecline: function (e, friendshipId) {
    e.preventDefault()

    //this.props.removeContact(this.props.userId, friendshipId)
  },

  render: function () {
    const friendships = this.props.friendships

    return (
      <div className="friendships">
        <ul className="friendships-list">
          {friendships && friendships.length === 0 &&
            <div>--no friendships--</div>
          }

          {friendships && friendships.map(friendship => {
            const name = !friendship.friend || !friendship.friend.username ?
                `friend-${ friendship.friendId }` :
                friendship.friend.username

            return (
              <li key={friendship.id}>
                <span className="friendship-name">
                  <b>{name}</b>
                </span>
                <button
                    className="friendship-remove-button"
                    onClick={e => this.onClickDecline(e, friendship.id)}>
                  remove
                </button>
              </li>
            )
          })}
        </ul>
        <div className="field">
          <label htmlFor="addContactInput">Friend Request</label>
          <input type="text"
              ref="createFriendshipInput"
              id="createFriendshipInput"
              defaultValue=""
              placeholder="friend@email.com"
              onKeyPress={this.onKeyPress}
          />
        </div>
      </div>
    )
  }
})

export default FriendshipForm
