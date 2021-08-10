import { React, useEffect, useRef, useState } from "react";
import startPlay from "../libs/utils/webrtc/startPlay";

const Player = () => {
  const videoElement = useRef(null);
  const [websocket, setWebSocket] = useState();
  const [playSettings, setPlaySettings] = useState({
    playStart: true, // change to true to start playing,
    signalingURL: "wss://6110cd121a4ad.streamlock.net:449/webrtc-session.json",
    applicationName: "newapp",
    streamName: "live",
  });
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState();
  const [videoTrack, setVideoTrack] = useState();
  const [audioTrack, setAudioTrack] = useState();
  const [peerConnection, setPeerConnection] = useState();

  useEffect(() => {
    if (playSettings.playStart && !connected) {
      setPlaySettings({
        playStart: false,
      });
      startPlay(playSettings, websocket, {
        onError: (error) => {
          console.log(error);
          setError(error.message);
        },
        onConnectionStateChange: (result) => {
          setConnected(result.connected);
        },
        onSetPeerConnection: (result) => {
          setPeerConnection(result.peerConnection);
        },
        onSetWebsocket: (result) => {
          setWebSocket(result.websocket);
        },
        onPeerConnectionOnTrack: (event) => {
          if (event.track != null && event.track.kind != null) {
            if (event.track.kind === "audio") {
              setAudioTrack(event.track);
            } else if (event.track.kind === "video") {
              setVideoTrack(event.track);
            }
          }
        },
      });
    }
  }, [videoElement, playSettings, peerConnection, websocket, connected]);

  useEffect(() => {
    if (connected) {
      let newStream = new MediaStream();
      if (audioTrack != null) newStream.addTrack(audioTrack);

      if (videoTrack != null) newStream.addTrack(videoTrack);

      if (videoElement != null && videoElement.current != null)
        videoElement.current.srcObject = newStream;
    } else {
      if (videoElement != null && videoElement.current != null)
        videoElement.current.srcObject = null;
    }
  }, [audioTrack, videoTrack, connected, videoElement]);

  if (!connected) return null;

  return (
    <video
      id="player-video"
      ref={videoElement}
      autoPlay
      playsInline
      muted
      controls
    ></video>
  );
};

export default Player;
