import React from "react";
import PropTypes from "prop-types";
// import "../Styles/submitAnimation.css";

function SubmitAnimation(props) {
  const { currentState, children, ...rest } = props;
  return (
    <div className="container" style={{ marginBottom: "15px" }}>
      <button
        type="button"
        className={`animatedButton ${currentState}`}
        {...rest}
      >
        {children}
      </button>
    </div>
  );
}

SubmitAnimation.propTypes = {
  currentState: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default SubmitAnimation;
