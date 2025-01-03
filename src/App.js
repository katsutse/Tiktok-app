import React, { useState, useEffect } from "react";
import { TextAnalyticsClient, AzureKeyCredential } from "@azure/ai-text-analytics"; // Importing Azure SDK
import "./App.css";
import Video from "./Video";
import background from "./assets/background1.jpg";
import videoBackground from "./assets/video-background.jpg";

// Azure credentials
const endpoint = "https://kafai.cognitiveservices.azure.com/"; 
const apiKey = "6pY4MAYPwxmi6ZA0XonWT5o1kQSKaAinyy2fn0aQfDKFMp7qkhkTJQQJ99ALACBsN54XJ3w3AAAAACOGsLWb"; 
const client = new TextAnalyticsClient(endpoint, new AzureKeyCredential(apiKey));

function App() {
  const [videos, setVideos] = useState([]); // Store videos
  const [filteredVideos, setFilteredVideos] = useState([]); // Filtered videos
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [signupForm, setSignupForm] = useState(true); // Toggle between signup and login
  const [forgotPassword, setForgotPassword] = useState(false); // State to toggle forgot password form
  const [formState, setFormState] = useState({
    username: "",
    email: "",
    password: "",
  }); // Store form data
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Check login state
  const [authToken, setAuthToken] = useState(""); // Store auth token
  const [profileMenuOpen, setProfileMenuOpen] = useState(false); // Profile menu toggle
  const [userDetails, setUserDetails] = useState({ username: "", email: "" }); // Store user details
  const [feedbackInput, setFeedbackInput] = useState(""); // Store feedback input
  const [sentimentResult, setSentimentResult] = useState(null); // Store sentiment result
  const [isPlaying, setIsPlaying] = useState(null); // Track which video is playing
  const [commentInput, setCommentInput] = useState({}); // Store comment input for each video

  useEffect(() => {
    if (isLoggedIn) {
      const fetchVideos = async () => {
        try {
          const response = await fetch("http://localhost:5000/videos");
          const data = await response.json();

          // Ensure videos have a default 'likes' property if not set
          const videosWithDefaults = data.map((video) => ({
            ...video,
            likes: video.likes || 0, // If 'likes' is not defined, set it to 0
          }));

          setVideos(videosWithDefaults);
          setFilteredVideos(videosWithDefaults);
        } catch (error) {
          console.error("Error fetching videos:", error);
        }
      };

      const fetchUserDetails = async () => {
        try {
          const response = await fetch("http://localhost:5000/profile", {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          const data = await response.json();
          setUserDetails(data);
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };

      fetchVideos();
      fetchUserDetails();
    }
  }, [isLoggedIn, authToken]);

  const handlePlayPause = (videoId) => {
    setIsPlaying(isPlaying === videoId ? null : videoId); // Toggle play/pause state
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    const filtered = videos.filter((video) =>
      video.channel.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredVideos(filtered);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (feedbackInput) {
      try {
        // Perform sentiment analysis using Azure Text Analytics API
        const response = await client.analyzeSentiment([feedbackInput]);
        const sentiment = response[0];
        setSentimentResult({
          sentiment: sentiment.sentiment,
          positiveScore: sentiment.confidenceScores.positive,
          negativeScore: sentiment.confidenceScores.negative,
          neutralScore: sentiment.confidenceScores.neutral,
        });
        setFeedbackInput(""); // Clear the feedback input field
      } catch (error) {
        console.error("Error analyzing sentiment:", error);
      }
    }
  };

  const handleLike = async (videoId) => {
    try {
      const response = await fetch(`http://localhost:5000/videos/${videoId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        // Update the video state to reflect the new like count
        setVideos((prevVideos) =>
          prevVideos.map((video) =>
            video.id === videoId ? { ...video, likes: (video.likes || 0) + 1 } : video
          )
        );
      } else {
        console.error("Failed to like the video:", data);
      }
    } catch (error) {
      console.error("Error liking video:", error);
    }
  };

  const handleCommentClick = (videoId) => {
    // Instead of keeping track of which video is being commented on, use the `commentInput` state directly.
    setCommentInput({
      ...commentInput,
      [videoId]: "", // Clear comment field when clicked
    });
  };

  const handleCommentSubmit = async (e, videoId) => {
    e.preventDefault();
    const commentText = commentInput[videoId];
    if (commentText) {
      try {
        const response = await fetch(`http://localhost:5000/videos/${videoId}/comment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ comment: commentText }),
        });
        const data = await response.json();
        if (data.success) {
          // Update the video state to reflect the new comment
          setVideos((prevVideos) =>
            prevVideos.map((video) =>
              video.id === videoId
                ? {
                    ...video,
                    comments: [
                      ...video.comments,
                      { text: commentText, user: userDetails.username },
                    ],
                  }
                : video
            )
          );
          setCommentInput({
            ...commentInput,
            [videoId]: "", // Clear the comment input after submitting
          });
        } else {
          console.error("Failed to add comment:", data);
        }
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  // Handle form submission (signup/login)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = signupForm ? "/register" : "/login";
    const body = signupForm
      ? { username: formState.username, email: formState.email, password: formState.password }
      : { username: formState.username, password: formState.password };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log("Response data:", data); // Log response for debugging

      if (response.ok) {
        if (signupForm) {
          alert("Signup successful! Please log in.");
          setSignupForm(false); // Redirect to login page
        } else {
          handleLogin(data); // Handle login
        }
      } else {
        alert(data.message || (signupForm ? "Signup failed" : "Login failed"));
      }
    } catch (error) {
      console.error("Error during authentication:", error);
    }
  };

  // Handle login
  const handleLogin = (data) => {
    console.log("Login data:", data); // Log login data for debugging
    if (data.token) {
      setAuthToken(data.token);
      setIsLoggedIn(true);
      localStorage.setItem("authToken", data.token); // Store token for session persistence
    } else {
      console.log("Token not received.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthToken("");
    setUserDetails({ username: "", email: "" });
    localStorage.removeItem("authToken"); // Remove token from local storage
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const { email } = formState;
    try {
      const response = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Password reset instructions have been sent to your email.");
        setForgotPassword(false);
      } else {
        alert(data.message || "Error resetting password");
      }
    } catch (error) {
      console.error("Error during password reset:", error);
    }
  };

  return (
    <div
      className="app"
      style={{
        backgroundImage: !isLoggedIn ? `url(${background})` : `url(${videoBackground})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      {!isLoggedIn ? (
        <div className="auth-container">
          <div className="banner">
            <h1>Welcome to Video Search</h1>
            <p>Sign up or log in to start searching for your favorite videos!</p>
          </div>
          <h2>{signupForm ? "Sign Up" : "Log In"}</h2>
          <form onSubmit={handleSubmit}>
            {signupForm && (
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  required
                />
              </div>
            )}
            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formState.username}
                onChange={(e) => setFormState({ ...formState, username: e.target.value })}
                required
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formState.password}
                onChange={(e) => setFormState({ ...formState, password: e.target.value })}
                required
              />
            </div>
            <button type="submit">{signupForm ? "Sign Up" : "Log In"}</button>
          </form>
          {signupForm && (
            <p
              className="toggle_form"
              onClick={() => setSignupForm(!signupForm)}
            >
              Already have an account? Log In
            </p>
          )}
          {!signupForm && (
            <>
              <p
                className="forgot-password"
                onClick={() => setForgotPassword(!forgotPassword)}
              >
                Forgot Password?
              </p>
              {forgotPassword && (
                <div className="forgot-password-form">
                  <h3>Reset your password</h3>
                  <form onSubmit={handleForgotPassword}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      required
                    />
                    <button type="submit">Send Reset Link</button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="main-content">
          <div className="sidebar">
            <h1 className="main-heading">Search for Videos</h1>
            <p className="welcome-message">Welcome, {userDetails.username}!</p>

            {/* Feedback section under Welcome */}
            <div className="feedback-section">
              <h2>Provide Feedback</h2>
              <textarea
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="Enter your feedback here"
              />
              <button onClick={handleFeedbackSubmit}>Submit Feedback</button>
              {sentimentResult && (
                <div className="sentiment-result">
                  <p>Sentiment: {sentimentResult.sentiment}</p>
                  <p>Positive: {sentimentResult.positiveScore}</p>
                  <p>Neutral: {sentimentResult.neutralScore}</p>
                  <p>Negative: {sentimentResult.negativeScore}</p>
                </div>
              )}
            </div>

            <div className="search-bar">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search videos..."
                className="search-input"
              />
            </div>
            <div
              className="profile-menu"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              {userDetails.username} ▼
              {profileMenuOpen && (
                <div className="profile-details">
                  <p>Username: {userDetails.username}</p>
                  <p>Email: {userDetails.email}</p>
                  <button className="signoff-button" onClick={handleLogout}>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="content">
            <div className="videos-container">
              {filteredVideos.map((video) => (
                <Video
                  key={video.id}
                  url={video.url}
                  channel={video.channel}
                  description={video.description}
                  song={video.song}
                  likes={video.likes}
                  messages={video.messages}
                  shares={video.shares}
                  comments={video.comments}
                  videoId={video.id}
                  isPlaying={isPlaying === video.id}
                  onPlayPause={handlePlayPause}
                  onLike={handleLike}
                  onCommentClick={handleCommentClick}
                  onCommentSubmit={handleCommentSubmit}
                  commentInput={commentInput[video.id] || ""}
                  onCommentChange={(e) => setCommentInput({ ...commentInput, [video.id]: e.target.value })}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
