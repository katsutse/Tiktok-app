import React, { useState } from "react";
import "./VideoSidebar.css";
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import MessageIcon from "@material-ui/icons/Message";
import ShareIcon from "@material-ui/icons/Share";
import CommentIcon from "@material-ui/icons/Comment"; // New Comment Icon

const VideoSidebar = ({ likes, shares, messages, comments }) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="videoSidebar">
      <div className="videoSidebar_button" onClick={() => setLiked(!liked)}>
        {liked ? (
          <FavoriteIcon fontSize="large" />
        ) : (
          <FavoriteBorderIcon fontSize="large" />
        )}
        <p>{liked ? likes + 1 : likes}</p>
      </div>
      <div className="videoSidebar_button">
        <MessageIcon fontSize="large" />
        <p>{messages}</p>
      </div>
      <div className="videoSidebar_button">
        <CommentIcon fontSize="large" /> {/* New Comment Icon */}
        <p>{comments}</p>
      </div>
      <div className="videoSidebar_button">
        <ShareIcon fontSize="large" />
        <p>{shares}</p>
      </div>
    </div>
  );
};

export default VideoSidebar;
