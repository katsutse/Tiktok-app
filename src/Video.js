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
  onLike,
  onComment,
  onShare,
}) => {
  const videoRef = useRef(null);

  const onVideoClick = () => {
    onPlayPause(videoId); // Toggle the play/pause state for the specific video
  };

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current
          .play()
          .catch((error) => {
            console.error(`Error playing video (videoId: ${videoId}):`, error);
          });
      } else {
        videoRef.current.pause(); // Ensure video is paused when not playing
      }
    }
  }, [isPlaying, videoId]); // Ensure the effect runs when isPlaying or videoId changes

  return (
    <div className="video">
      <video
        className="video_player"
        loop
        preload="auto" // Using 'auto' to preload the video as needed
        ref={videoRef}
        onClick={onVideoClick} // Handle video play/pause when clicked
        src={url}
        muted={!isPlaying} // Optionally mute the video if not playing
      ></video>
      <VideoFooter channel={channel} description={description} song={song} />
      <VideoSidebar
        likes={likes}
        messages={messages}
        shares={shares}
        comments={comments}
        onLike={() => onLike(videoId)} // Pass the onLike function with the videoId
        onComment={() => onComment(videoId)} // Pass the onComment function with the videoId
        onShare={() => onShare(videoId)} // Pass the onShare function with the videoId
      />
      {!isPlaying && <VideoPlayButton onVideoClick={onVideoClick} />} {/* Show play button when not playing */}
    </div>
  );
};

export default Video;
