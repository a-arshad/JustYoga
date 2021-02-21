import React from "react";
import VideoCall from "../../helpers/simple-peer";
import io from "socket.io-client";
import { Typography } from "@material-ui/core";
import styles from "./Video.module.css";

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
      imageNumber: 0,
      countdown: 10,
      roundStart: false,
    };
  }
  videoCall = new VideoCall();

  componentDidMount() {
    const socket = io(process.env.REACT_APP_SIGNALING_SERVER);
    const component = this;
    this.setState({ socket });
    const { roomId } = this.props.roomId;
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
    socket.on("roundStarted", () => {
      console.log("roundStarted");
      this.setState({ roundStart: true });
      this.startTimer();
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

  startRound = () => {
    if (!this.state.waiting && !this.state.connecting && this.state.socket) {
      const { roomId } = this.props.roomId;
      this.state.socket.emit("startRound");
    }
  };

  startTimer = () => {
    this.setState({ countdown: 10, imageNumber: 0 });

    if (this.state.countdown > 0) {
      let timer = setInterval(() => {
        this.setState({ countdown: this.state.countdown - 1 });
        if (this.state.countdown <= 0) {
          // next pose
          this.props.poses.shift();
          this.props.setPoses(this.props.poses);

          // capture image
          this.setState({
            imageNumber: this.state.imageNumber + 1,
            countdown: 10,
          });
          console.log(this.state.imageNumber);
          if (this.state.imageNumber > 4) {
            // round over
            clearInterval(timer);
            this.setState({ roundStart: false });
          }
        }
      }, 1000);
    }
  };

  capture = () => {
    const canvas = document.createElement("canvas");

    canvas.width = this.localVideo.videoWidth;
    canvas.height = this.localVideo.videoHeight;
    // draw the video at that frame
    canvas
      .getContext("2d")
      .drawImage(this.localVideo, 0, 0, canvas.width, canvas.height);
    // convert it to a usable data URL
    const dataURL = canvas.toDataURL();

    // TODO: send this to backend
    return dataURL;
  };

  render() {
    return (
      <div style={{ width: "88vh", alignItems: "center", display: "flex" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div className={styles.counterContainer}>
            <Typography
              style={{ fontWeight: 700, fontSize: "5em", color: "#A49EA6" }}
            >
              {this.state.countdown}
            </Typography>

            {!this.state.roundStart && this.state.initiator && (
              <button onClick={this.startRound}>Start Round</button>
            )}
          </div>

          <video
            autoPlay
            id="localVideo"
            muted
            ref={(video) => (this.localVideo = video)}
            style={{ width: "100%", maxHeight: "100%" }}
          />
          <video
            autoPlay
            className={`${
              this.state.connecting || this.state.waiting ? "hide" : ""
            }`}
            id="remoteVideo"
            ref={(video) => (this.remoteVideo = video)}
            style={{ width: "100%", maxHeight: "100%" }}
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
        {this.state.full && (
          <div className="status">
            <p>Room is full</p>
          </div>
        )}
      </div>
    );
  }
}

export default Video;
