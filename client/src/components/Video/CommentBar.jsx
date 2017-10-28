// React
import React from "react";

// NPM Modules
import { connect } from "react-redux";
import { css, StyleSheet } from "aphrodite";
import * as _ from "lodash";

// Local Components
import Comment from "./Comment.jsx";
import CommentInput from "./CommentInput.jsx";
import { CommentActions } from "../../actions/comment-actions.js";

class CommentBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: "",
      isAnonymous: false,
      timestamp: -1
    };
  }

  onInputFocus = () => {
    let { getTime } = this.props;
    let timestamp = getTime();
    this.setState({ timestamp });
  };

  onInputChange = event => {
    this.setState({ inputValue: event.target.value });
  };

  setAnonymous = bool => {
    this.setState({ isAnonymous: bool });
  };

  // called when user clicks post --> send info to backend
  handleSubmit = () => {
    let { videoId, authReducer } = this.props;
    let userName = authReducer.user.name;
    let { timestamp, inputValue, isAnonymous } = this.state;
    if (!_.isEmpty(inputValue) && timestamp !== -1) {
      this.props.makeComment(
        videoId,
        timestamp,
        userName,
        isAnonymous,
        inputValue
      );
    }
  };

  deleteComment = (commentId, timestamp) => {
    let { videoId } = this.props;
    this.props.deleteComment(videoId, commentId, timestamp, "video");
  };

  noComments = () => {
    let { commentsReducer } = this.props;
    return _.isEmpty(commentsReducer.video_comments);
  };

  render() {
    let { changeView, comments, authReducer } = this.props;
    let { inputValue } = this.state;

    let commentsToRender = null;
    if (!_.isEmpty(comments) && _.isArray(comments)) {
      commentsToRender = comments.map(c => {
        return (
          <Comment
            key={c._id}
            id={c._id}
            text={c.text}
            timestamp={c.timestamp}
            datePosted={c.datePosted}
            user={c.isAnonymous ? "Anonymous" : c.userName}
            isResolved={c.isResolved}
            isCurrentUser={_.isEqual(c._user, authReducer.user._id)}
            deleteComment={this.deleteComment}
          />
        );
      });
    }

    return (
      <div className={css(styles.commentBarContainer)}>
        <div className={css(styles.headerContainer)}>
          {!this.noComments() && (
            <i
              className={css(styles.icon) + " fa fa-chevron-left"}
              aria-hidden="true"
              onClick={() => changeView("status")}
            />
          )}
          <p className={css(styles.header)}>Comments</p>
        </div>
        <div className={css(styles.bodyContainer)}>{commentsToRender}</div>
        <CommentInput
          value={inputValue}
          onChange={e => this.onInputChange(e)}
          onFocus={this.onInputFocus}
          handleSubmit={this.handleSubmit}
          user={authReducer.user}
          setAnonymous={this.setAnonymous}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    authReducer: state.authReducer,
    commentsReducer: state.commentsReducer
  };
}

export default connect(mapStateToProps, CommentActions)(CommentBar);

const styles = StyleSheet.create({
  commentBarContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "10px 0"
  },

  headerContainer: {
    backgroundColor: "#F5F5F5",
    borderBottom: "3px solid #3F7BA9",
    color: "#333",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Fjalla One, sans-serif",
    fontSize: "1.25em",
    padding: "3px 0",
    position: "relative",
    textAlign: "center",
    textTransform: "uppercase",
    width: "100%"
  },

  icon: {
    color: "#3F7BA9",
    cursor: "pointer",
    fontSize: "0.9em",
    position: "absolute",
    left: "10px",
    margin: "0",
    padding: "0 10px"
  },

  header: {
    margin: 0,
    padding: 0
  },

  bodyContainer: {
    backgroundColor: "#E6E6E6",
    borderBottom: "3px solid #3F7BA9",
    width: "100%",
    overflow: "scroll"
  },

  input: {
    border: "none",
    color: "#333",
    fontFamily: "Open Sans, sans-serif",
    fontSize: "1em",
    margin: "5px",
    padding: "5px",
    outline: "none",
    resize: "none"
  },

  button: {
    border: "none",
    backgroundColor: "#3F7BA9",
    color: "#F5F5F5",
    cursor: "pointer",
    fontFamily: "Fjalla One, sans-serif",
    fontSize: "1em",
    outline: "none",
    padding: "3px 10px"
  }
});
