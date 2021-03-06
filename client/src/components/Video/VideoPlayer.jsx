// React
import React from 'react';

// NPM Modules
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { css, StyleSheet } from 'aphrodite';
import * as _ from 'lodash';
import YouTube from 'react-youtube';

// Local Components
import SideBar from './SideBar.jsx';
import { CommentActions } from '../../actions/comment-actions.js';
import { VideoActions } from '../../actions/video-actions.js';

class VideoPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoId: '',
      player: {}
    };
    this.onReady = this.onReady.bind(this);
  }

  componentDidMount() {
    let videoId = this.props.match.params.videoId;
    this.timestamp = this.props.match.params.timestamp || 0;
    this.setState({ videoId });
    this.props.videoActions.fetchVideoStats(videoId);
    this.props.commentActions.fetchVideoComments(videoId);
  }

  componentWillReceiveProps(nextProps) {
    let videoId = this.props.match.params.videoId;
    let nextVideoId = nextProps.match.params.videoId;

    // if the video switches
    if (!_.isEqual(videoId, nextVideoId)) {
      this.setState({ videoId: nextVideoId });
      this.timestamp = nextProps.match.params.timestamp || 0;
      // fetch youtube statistics here, calling an action
      this.props.videoActions.fetchVideoStats(nextVideoId);
      this.props.commentActions.fetchVideoComments(nextVideoId);
    }

    let commentReducer = this.props;
    let nextCommentReducer = nextProps;
    // if a new comment is made
    if (!_.isEqual(commentReducer, nextCommentReducer)) {
      this.props.commentActions.fetchVideoComments(videoId);
    }
  }

  onReady = event => {
    this.setState({ player: event.target });
  };

  // use this when creating new threads
  getTime = () => {
    let { player } = this.state;
    if (_.isEmpty(player)) {
      return '0';
    }
    this.pauseVideo();
    return Math.round(player.getCurrentTime()); // whole seconds (i.e. 76, 12, 104)
  };

  pauseVideo = () => {
    let { player } = this.state;
    if (!_.isEmpty(player)) {
      player.pauseVideo();
    }
  };

  getDuration = () => {
    let { player } = this.state;
    let { videoReducer } = this.props;
    if (videoReducer.duration !== '-1') {
      return videoReducer.duration;
    }
    return !_.isEmpty(player) ? player.getDuration() : 0;
  };

  render() {
    document.title = 'Annot8';
    let { videoId } = this.state;
    let { videoReducer } = this.props;

    const opts = {
      height: '450',
      width: '720',
      playerVars: {
        autoplay: 1,
        cc_load_policy: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        start: this.timestamp
      }
    };

    return (
      <div className={css(styles.videoPlayerContainer, styles.fadeIn)}>
        <div className={css(styles.playerContainer)}>
          <h2 className={css(styles.videoTitle)}>{videoReducer.title}</h2>
          <YouTube
            id="video-player"
            videoId={videoId}
            className={css(styles.player)}
            opts={opts}
            onReady={this.onReady}
          />
        </div>
        <div className={css(styles.smallScreenContainer)}>
          Please use a device with a larger screen.
        </div>
        <SideBar
          videoId={videoId}
          videoTitle={videoReducer.title}
          getTime={this.getTime}
          getDuration={this.getDuration}
          pauseVideo={this.pauseVideo}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    authReducer: state.authReducer,
    commentsReducer: state.commentsReducer,
    videoReducer: state.videoReducer
  };
};

const mapDispatchToProps = dispatch => {
  return {
    commentActions: bindActionCreators(CommentActions, dispatch),
    videoActions: bindActionCreators(VideoActions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VideoPlayer);

const styles = StyleSheet.create({
  videoPlayerContainer: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: 'calc(100vh - 110px)'
  },

  playerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px 40px',
    '@media(max-width: 767px)': {
      display: 'none'
    }
  },

  videoTitle: {
    color: '#333',
    fontFamily: 'Open Sans, sans-serif',
    fontSize: '1.5em',
    margin: '5px 0',
    padding: '0',
    textAlign: 'center',
    width: '720px'
  },

  smallScreenContainer: {
    color: '#333',
    display: 'none',
    fontSize: '2em',
    textAlign: 'center',
    '@media(max-width: 767px)': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '10px 40px'
    }
  },

  player: {
    border: '3px solid #3F7BA9'
  }
});
