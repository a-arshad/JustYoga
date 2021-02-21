import React, { useState } from "react";
// import {
//   createPeerConnection,
//   addMessageHandler,
//   shareFile,
// } from "../helpers/webrtc";

export default function Chatroom() {
  const MESSAGE_TYPE = {
    SDP: "SDP",
    CANDIDATE: "CANDIDATE",
  };

  const MAXIMUM_MESSAGE_SIZE = 65535;
  const END_OF_FILE_MESSAGE = "EOF";
  //   let code;
  //   let peerConnection;
  //   let signaling;
  //   const senders = [];
  //   let userMediaStream;
  let displayMediaStream;
  //   let file;

  const [videoRef, setVideoRef] = useState(React.createRef());
  const [showChatRoom, setChatRoom] = useState(false);
  const [code, setCode] = useState(false);
  const [file, setFile] = useState(false);
  const [peerConnection, setPeerConnection] = useState(false);
  const [senders, setSenders] = useState([]);
  const [userMediaStream, setUserMediaStream] = useState(null);
  const [signaling, setSignaling] = useState(null);

  // --------------------------------------------------- HELPERS

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.m.test.com:19000" }],
    });

    pc.onnegotiationneeded = async () => {
      await createAndSendOffer();
    };

    pc.onicecandidate = (iceEvent) => {
      if (iceEvent && iceEvent.candidate) {
        sendMessage({
          message_type: MESSAGE_TYPE.CANDIDATE,
          content: iceEvent.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const video = document.getElementById("remote-view");
      video.srcObject = event.streams[0];
    };

    pc.ondatachannel = (event) => {
      const { channel } = event;
      channel.binaryType = "arraybuffer";

      const receivedBuffers = [];
      channel.onmessage = async (event) => {
        const { data } = event;
        try {
          if (data !== END_OF_FILE_MESSAGE) {
            receivedBuffers.push(data);
          } else {
            const arrayBuffer = receivedBuffers.reduce((acc, arrayBuffer) => {
              const tmp = new Uint8Array(
                acc.byteLength + arrayBuffer.byteLength
              );
              tmp.set(new Uint8Array(acc), 0);
              tmp.set(new Uint8Array(arrayBuffer), acc.byteLength);
              return tmp;
            }, new Uint8Array());
            const blob = new Blob([arrayBuffer]);
            downloadFile(blob, channel.label);
            channel.close();
          }
        } catch (err) {
          console.log("File transfer failed");
        }
      };
    };

    return pc;
  };

  const addMessageHandler = (peerConnection) => {
    signaling.onmessage = async (message) => {
      const data = JSON.parse(message.data);

      if (!data) {
        return;
      }

      const { message_type, content } = data;
      try {
        if (message_type === MESSAGE_TYPE.CANDIDATE && content) {
          await peerConnection.addIceCandidate(content);
        } else if (message_type === MESSAGE_TYPE.SDP) {
          if (content.type === "offer") {
            await peerConnection.setRemoteDescription(content);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            sendMessage({
              message_type: MESSAGE_TYPE.SDP,
              content: answer,
            });
          } else if (content.type === "answer") {
            await peerConnection.setRemoteDescription(content);
          } else {
            console.log("Unsupported SDP type.");
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
  };

  const sendMessage = (message) => {
    if (code) {
      signaling.send(
        JSON.stringify({
          ...message,
          code,
        })
      );
    }
  };

  const createAndSendOffer = async () => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    sendMessage({
      message_type: MESSAGE_TYPE.SDP,
      content: offer,
    });
  };

  const shareFile = (file) => {
    if (file) {
      const channelLabel = file.name;
      const channel = peerConnection.createDataChannel(channelLabel);
      channel.binaryType = "arraybuffer";

      channel.onopen = async () => {
        const arrayBuffer = await file.arrayBuffer();
        for (let i = 0; i < arrayBuffer.byteLength; i += MAXIMUM_MESSAGE_SIZE) {
          channel.send(arrayBuffer.slice(i, i + MAXIMUM_MESSAGE_SIZE));
        }
        channel.send(END_OF_FILE_MESSAGE);
      };

      channel.onclose = () => {
        // closeDialog();
      };
    }
  };

  const downloadFile = (blob, fileName) => {
    const a = document.createElement("a");
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  //   ------------------------------------------------THINGS NEEDED FOR APP TO RUN
  const startChat = async () => {
    try {
      setUserMediaStream(
        await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        })
      );
      //   showChatRoom();
      setChatRoom(true);

      signaling = new WebSocket("ws://127.0.0.1:1337");
      setPeerConnection(createPeerConnection());

      addMessageHandler(signaling);

      userMediaStream
        .getTracks()
        .forEach((track) =>
          senders.push(peerConnection.addTrack(track, userMediaStream))
        );
      //   document.getElementById("self-view").srcObject = userMediaStream;
      setVideoRef(userMediaStream);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCodeInput = (event) => {
    const { value } = event.target;
    if (value.length > 8) {
      document.getElementById("start-button").disabled = false;
      code = value;
    } else {
      document.getElementById("start-button").disabled = true;
      code = null;
    }
  };

  const handleStartChat = () => {
    if (code) {
      startChat();
    }
  };

  const handleShareButton = async () => {
    if (!displayMediaStream) {
      displayMediaStream = await navigator.mediaDevices.getDisplayMedia();
    }

    senders
      .find((sender) => sender.track.kind === "video")
      .replaceTrack(displayMediaStream.getTracks()[0]);

    //show what you are showing in your "self-view" video.
    setVideoRef(displayMediaStream);
  };

  const handleStopShare = () => {
    senders
      .find((sender) => sender.track.kind === "video")
      .replaceTrack(
        userMediaStream.getTracks().find((track) => track.kind === "video")
      );

    setVideoRef(userMediaStream);
    // document.getElementById("share-button").style.display =
    //   "inline";
    // document.getElementById("stop-share-button").style.display =
    //   "none";
  };
  const handleShareFileButton = () => {
    // document.getElementById("select-file-dialog").style.display = "block";
  };

  const handleCancelButton = () => {
    // closeDialog();
    //done need for now^
    // closeDialog does:
    // document.getElementById("select-file-input").value = "";
    // document.getElementById("select-file-dialog").style.display = "none";
  };

  const handleSelectFileInput = (event) => {
    setFile(event.target.files[0]);
  };

  const handleOkButton = () => {
    shareFile(file, peerConnection);
  };

  return (
    <div>
      {showChatRoom ? (
        <div id="chat-room">
          <video ref={videoRef} id="self-view" autoplay></video>
          <div id="remote-view-container">
            <video id="remote-view" autoplay></video>
            <div id="view-buttons">
              <button
                class="view-button"
                id="share-button"
                onClick={handleShareButton}
              >
                <i id="share-button-icon" class="fas fa-eye"></i>
              </button>
              <button class="view-button" id="stop-share-button">
                <i id="stop-share-button-icon" class="fas fa-eye-slash"></i>
              </button>
              <button
                class="view-button"
                id="share-file-button"
                onClick={handleShareFileButton}
              >
                <i class="far fa-file-alt"></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div id="start">
          <input
            id="code-input"
            placeholder="Enter your code"
            onClick={handleCodeInput}
          />
          <button id="start-button" onClick={handleStartChat} disabled>
            Start Video Chat
          </button>
        </div>
      )}

      <div id="select-file-dialog"></div>
      <div>
        <div id="select-file-dialog">
          <div id="dialog-content">
            <div id="select-file">
              <div id="label">Select a file:</div>
              <input type="file" id="select-file-input" />
            </div>
            <div id="dialog-footer">
              <button id="ok-button" onClick={handleOkButton} disabled>
                Ok
              </button>
              <button
                id="cancel-button"
                class="cancel-button"
                onClick={handleCancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
