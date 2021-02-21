import React from "react";
import VideoCall from "../../helpers/simple-peer";
import io from "socket.io-client";

class Video extends React.Component {
  constructor() {
    super();
    this.state = {
      localStream: {},
      remoteStreamUrl: "",
      streamUrl: "",
      initiator: false,
      full: false,
      connecting: false,
      waiting: true,
      camState: true,
    };
  }
  videoCall = new VideoCall();

  componentDidMount() {
    const socket = io(process.env.REACT_APP_SIGNALING_SERVER);
    const component = this;
    this.setState({ socket });
    const { roomId } = this.props.match.params;
    this.getUserMedia().then(() => {
      console.log("join");
      socket.emit("join", { roomId: roomId });
    });

    socket.on("init", () => {
      console.log("init");
      component.setState({ initiator: true });
    });
    socket.on("ready", () => {
      console.log("enter");
      component.enter(roomId);
    });
    socket.on("desc", (data) => {
      if (data.type === "offer" && component.state.initiator) return;
      if (data.type === "answer" && !component.state.initiator) return;
      component.call(data);
    });
    socket.on("disconnected", () => {
      component.setState({ initiator: true });
    });
    socket.on("full", () => {
      component.setState({ full: true });
    });
  }

  getUserMedia(cb) {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia = navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
      const op = {
        video: {
          width: { min: 160, ideal: 1280, max: 1280 },
          height: { min: 120, ideal: 720, max: 720 },
        },
        audio: false,
      };
      navigator.getUserMedia(
        op,
        (stream) => {
          this.setState({ streamUrl: stream, localStream: stream });
          this.localVideo.srcObject = stream;
          resolve();
        },
        () => {}
      );
    });
  }

  setVideoLocal() {
    if (this.state.localStream.getVideoTracks().length > 0) {
      this.state.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    this.setState({
      camState: !this.state.camState,
    });
  }

  enter = (roomId) => {
    console.log(roomId);
    this.setState({ connecting: true });
    const peer = this.videoCall.init(
      this.state.localStream,
      this.state.initiator
    );
    this.setState({ peer });

    peer.on("signal", (data) => {
      const signal = {
        room: roomId,
        desc: data,
      };
      this.state.socket.emit("signal", signal);
    });
    peer.on("stream", (stream) => {
      console.log("stream");
      this.remoteVideo.srcObject = stream;
      this.setState({ connecting: false, waiting: false });
    });
    peer.on("error", function (err) {
      console.log(err);
    });
  };

  call = (otherId) => {
    this.videoCall.connect(otherId);
  };

  renderFull = () => {
    if (this.state.full) {
      return "The room is full";
    }
  };
  
  capture = () => {
    const canvas = document.createElement("canvas");

    canvas.width = this.localVideo.videoWidth;
    canvas.height = this.localVideo.videoHeight;
    // draw the video at that frame
    canvas.getContext('2d')
      .drawImage(this.localVideo, 0, 0, canvas.width, canvas.height);
    // convert it to a usable data URL
    const dataURL = canvas.toDataURL();

    // TODO: send this to backend
    console.log(dataURL);
  }

  render() {
    return (
      <div>
        <div style={{display: "flex", flexDirection: "column"}}>
          <video
              autoPlay
              id="localVideo"
              muted
              ref={(video) => (this.localVideo = video)}
            />
          <video
            autoPlay
            className={`${
              this.state.connecting || this.state.waiting ? "hide" : ""
            }`}
            id="remoteVideo"
            ref={(video) => (this.remoteVideo = video)}
          />
        </div>

        {this.state.connecting && (
          <div className="status">
            <p>Establishing connection...</p>
          </div>
        )}
        {this.state.waiting && (
          <div className="status">
            <p>Waiting for someone...</p>
          </div>
        )}
        {this.renderFull()}
      </div>
    );
  }
}

export default Video;
