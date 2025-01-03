import React, { useRef, useEffect } from "react";
import "./Video.css";
import VideoFooter from "./VideoFooter";
import VideoSidebar from "./VideoSidebar";
import VideoPlayButton from "./VideoPlayButton";

const Video = ({
  url,
  channel,
  description,
  song,
  likes,
  messages,
  shares,
  comments,
  videoId,
  isPlaying,
  onPlayPause,
}) => {
  const videoRef = useRef(null);

  const onVideoClick = () => {
    onPlayPause(videoId); // Use the passed down onPlayPause function from parent
  };

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => console.log("Error playing video"));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]); // Correctly include `isPlaying` in the dependencies array

  return (
    <div className="video">
      <video
        className="video_player"
        loop
        preload="true"
        ref={videoRef}
        onClick={onVideoClick}
        src={url}
      ></video>
      <VideoFooter channel={channel} description={description} song={song} />
      <VideoSidebar
        likes={likes}
        messages={messages}
        shares={shares}
        comments={comments}
      />
      {!isPlaying && <VideoPlayButton onVideoClick={onVideoClick} />}
    </div>
  );
};

export default Video;
