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

  // Toggle play/pause when video is clicked
  const onVideoClick = () => {
    onPlayPause(videoId);
  };

  // Handle video play/pause based on `isPlaying`
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch((error) => {
          console.error(`Error playing video (videoId: ${videoId}):`, error);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, videoId]); // Re-run the effect when `isPlaying` or `videoId` changes

  return (
    <div className="video">
      <video
        className="video_player"
        loop
        preload="auto" // Preload the video 
        ref={videoRef}
        onClick={onVideoClick} // Toggle play/pause
        src={url}
        muted={!isPlaying} // Mute when not playing
      />
      <VideoFooter channel={channel} description={description} song={song} />
      <VideoSidebar
        likes={likes}
        messages={messages}
        shares={shares}
        comments={comments}
        onLike={() => onLike(videoId)} // Handle like
        onComment={() => onComment(videoId)} // Handle comment
        onShare={() => onShare(videoId)} // Handle share
      />
      {!isPlaying && <VideoPlayButton onVideoClick={onVideoClick} />} {/* Show play button when not playing */}
    </div>
  );
};

export default Video;
