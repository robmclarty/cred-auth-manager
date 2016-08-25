import React, { PropTypes } from 'react';

const Flash = ({
  status,
  messages,
  isVisible,
  onClickClose
}) => {
  if (!isVisible) return false;

  return (
    <div className={`flash ${ status }`}>
      <span className={`flash-icon ${ status }`}>{status}</span>
      <span className="flash-text">
        <ul className="flash-list">
          {messages && messages.map((message, i) => (
            <li key={i}>{message}</li>
          ))}
        </ul>
      </span>
      <button
          className="flash-close-button ion-close-circled"
          onClick={onClickClose}>
        x
      </button>
    </div>
  );
};

Flash.propTypes = {
  status: PropTypes.string,
  messages: PropTypes.array,
  isVisible: PropTypes.bool,
  onClickClose: PropTypes.func
};

export default Flash;
