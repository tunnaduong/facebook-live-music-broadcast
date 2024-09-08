import React from "react";
import "./App.css";
import YouTube from "react-youtube";
import { LogoFacebook, LogoYoutube, LogoInstagram } from "react-ionicons";
import Marquee from "react-fast-marquee";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [time, setTime] = React.useState("");
  const [second, setSecond] = React.useState("");
  const [session, setSession] = React.useState("");
  const [videoTitle, setVideoTitle] = React.useState("");
  const [playingQueue, setPlayingQueue] = React.useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = React.useState(0);
  const [player, setPlayer] = React.useState(null);

  React.useEffect(() => {
    function showTime() {
      var date = new Date();
      var h = date.getHours(); // 0 - 23
      var m = date.getMinutes(); // 0 - 59
      var s = date.getSeconds(); // 0 - 59
      var session = "AM";

      if (h === 0) {
        h = 12;
      }

      if (h >= 12) {
        // h = h - 12;
        session = "PM";
      }

      if (h > 12) {
        h = h - 12;
        session = "PM";
      }

      h = h < 10 ? "0" + h : h;
      m = m < 10 ? "0" + m : m;
      s = s < 10 ? "0" + s : s;

      var time = h + ":" + m;

      setTime(time);
      setSecond(s);
      setSession(session);

      setTimeout(showTime, 1000);
    }

    showTime();
    // Call getComments every 10 seconds
    const interval = setInterval(getComments, 3000);
    getComments();
    return () => clearInterval(interval);
  }, []);

  // let searchCache = {};

  // Function to search YouTube API
  var searchCache = {};
  const rateLimit = { count: 0, lastReset: Date.now() };
  const RATE_LIMIT_MAX = 100; // Max number of requests
  const RATE_LIMIT_INTERVAL = 1000 * 60 * 60 * 24; // 24 hours

  // Function to search YouTube API
  const searchYouTube = async (query) => {
    if (searchCache[query]) {
      console.log(`Cache hit for query: ${query}`);
      return searchCache[query];
    }

    // Rate limiting
    const now = Date.now();
    if (now - rateLimit.lastReset > RATE_LIMIT_INTERVAL) {
      rateLimit.count = 0;
      rateLimit.lastReset = now;
    }

    if (rateLimit.count >= RATE_LIMIT_MAX) {
      console.error("Rate limit exceeded. Please try again later.");
      return null;
    }

    const apiKey = "AIzaSyBUbeDMfZXlbFlIqBRH1M7tbBX3Hl69gQc";
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
      query
    )}&key=${apiKey}`;

    try {
      const searchResponse = await axios.get(searchUrl);
      const videoId = searchResponse.data.items[0].id.videoId;

      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
      const detailsResponse = await axios.get(detailsUrl);
      const videoTitle = detailsResponse.data.items[0].snippet.title;
      const duration = detailsResponse.data.items[0].contentDetails.duration;

      // Parse ISO 8601 duration to get the total minutes
      const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      const hours = parseInt(match[1]) || 0;
      const minutes = parseInt(match[2]) || 0;
      const totalMinutes = hours * 60 + minutes;

      if (totalMinutes > 20) {
        return null;
      }

      const videoData = { videoId, videoTitle };
      searchCache[query] = videoData; // Store the result in the cache
      rateLimit.count++; // Increment rate limit count
      return videoData;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.error("YouTube API quota exceeded.");
      } else {
        console.error("YouTube API error:", error);
      }
      return null;
    }
  };

  let addedVideoIds = new Set();

  const addToQueue = (videoData) => {
    setPlayingQueue((prevQueue) => {
      if (!prevQueue.some((video) => video.videoId === videoData.videoId)) {
        console.log(`Added video ID ${videoData.videoId} to the playing queue`);
        toast.success(`Đã thêm ${videoData.videoTitle} vào hàng đợi!`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        return [...prevQueue, videoData];
      } else {
        console.log(
          `Video ID ${videoData.videoId} is already in the playing queue`
        );
        return prevQueue;
      }
    });
  };

  const getComments = () => {
    axios
      .get("http://localhost:3103/php-test-live-chat/")
      .then(async (response) => {
        const newComments = response.data.content;

        // Retrieve old comments from local storage
        const oldComments = JSON.parse(localStorage.getItem("comments")) || [];

        // Compare old and new comments
        const areCommentsDifferent =
          JSON.stringify(oldComments) !== JSON.stringify(newComments);

        if (areCommentsDifferent) {
          // Save new comments to local storage
          localStorage.setItem("comments", JSON.stringify(newComments));

          // Filter comments that start with "/yt"
          const ytComments = JSON.parse(
            localStorage.getItem("comments")
          )?.filter(
            (commentObj) =>
              typeof commentObj.comment === "string" &&
              commentObj.comment.startsWith("/yt ")
          );
          console.log("ytComments", ytComments);

          let latestNotFoundKeyword = null; // Variable to store the latest not found keyword

          for (const commentObj of ytComments) {
            console.log("cmtobjj", commentObj);
            let songName = commentObj.comment.slice(4).trim();
            songName += " remix"; // Append " remix" to the song name

            const videoData = await searchYouTube(songName);
            if (videoData) {
              console.log(
                `Found video ID ${videoData.videoId} for song ${songName}`
              );
              if (!addedVideoIds.has(videoData.videoId)) {
                addToQueue(videoData);
                addedVideoIds.add(videoData.videoId);
              }
            } else {
              console.log(`No video found for song ${songName}`);
              latestNotFoundKeyword = songName; // Store the latest not found keyword
            }
          }

          // Show a single toast message for the latest not found keyword
          if (latestNotFoundKeyword) {
            toast.error(
              `Không tìm thấy video có tên ${latestNotFoundKeyword}!`,
              {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
              }
            );
          }
        } else {
          console.log("Comments have not changed.");
        }
      })
      .catch((error) => {
        console.error("Error fetching comments:", error);
      });
  };

  const extractTextFromHTML = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const onPlayerReady = (event) => {
    // access to player in all event handlers via event.target
    setVideoTitle(event.target.getVideoData().title);
    event.target.playVideo();
    setPlayer(event.target);
  };

  const onEnd = () => {
    setCurrentVideoIndex((prevIndex) => {
      if (prevIndex < playingQueue.length - 1) {
        player.playVideo();
        return prevIndex + 1;
      } else {
        player.playVideo();
        return prevIndex;
      }
    });
  };

  React.useEffect(() => {
    console.log("Updated playingQueue:", playingQueue);
    console.log("current index", currentVideoIndex);
    console.log("curent video", playingQueue[currentVideoIndex]);
  }, [playingQueue, currentVideoIndex]);

  return (
    <div>
      <div className="player-wrapper">
        <YouTube
          videoId={playingQueue[currentVideoIndex]?.videoId}
          key={playingQueue[currentVideoIndex]?.videoId}
          opts={{
            height: "100%",
            width: "100%",
            playerVars: {
              autoplay: 1,
              cc_load_policy: 0,
              fs: 0,
              iv_load_policy: 3,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
            },
          }}
          className="player"
          onReady={onPlayerReady}
          onEnd={onEnd}
        />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="above">
        <Marquee>
          <div style={{ marginRight: 10 }}>
            Lựa chọn bài hát tiếp theo bằng cách comment theo cú pháp: "/yt
            tên_bài_hát" bên dưới video!!!
          </div>
        </Marquee>
      </div>
      <div className="title">24/7 Music Radio</div>
      <div className="clock">
        <div>{time}</div>
        <div>
          <div className="session">{session}</div>
          <div className="second">{second}</div>
        </div>
      </div>
      <div className="social">
        <div className="link">
          <div className="link-icon">
            <LogoFacebook color={"#00000"} height="35px" width="35px" />
          </div>
          <div>/tunna.duong</div>
        </div>
        <div className="link">
          <div className="link-icon">
            <LogoYoutube color={"#00000"} height="35px" width="35px" />
          </div>
          <div>@tunnaduong</div>
        </div>
        <div className="link">
          <div className="link-icon">
            <LogoInstagram color={"#00000"} height="35px" width="35px" />
          </div>
          <div>@tunna.dg</div>
        </div>
      </div>
      <div className="slider-wrapper">
        <div className="live-cmt">Tiếp theo:</div>
        <div className="slider">
          {playingQueue.length == 0 ||
          currentVideoIndex >= playingQueue.length - 1 ? (
            <div style={{ marginRight: 10 }}>**ĐANG TRỐNG**</div>
          ) : (
            <div>
              {playingQueue.slice(currentVideoIndex + 1).map((video, index) => (
                <>
                  <div
                    key={index}
                    className="next-song"
                    style={{ marginRight: 10 }}
                  >
                    {index + 1}) {video.videoTitle}
                  </div>
                </>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="now-playing-wrapper">
        <div className="live-cmt">Đang phát:</div>
        <div className="now-playing">
          <Marquee autoFill={false} speed={80}>
            {videoTitle == "" ? (
              <div style={{ marginRight: 10 }}>**ĐANG TRỐNG**</div>
            ) : (
              <div style={{ marginRight: 10 }}>{videoTitle}</div>
            )}
          </Marquee>
        </div>
      </div>
      <div className="comment">
        <div className="live-cmt">Trò chuyện trực tiếp</div>
        <div className="comments">
          {!Array.isArray(JSON.parse(localStorage.getItem("comments"))) ||
          JSON.parse(localStorage.getItem("comments")).length === 0 ? (
            <div className="cmt">
              <div>Hãy là người đầu tiên bình luận.</div>
            </div>
          ) : (
            JSON.parse(localStorage.getItem("comments"))
              ?.slice(-5)
              .map((comment, index) => (
                <div className="cmt">
                  <div className="cmt-name">{comment.name}</div>
                  <div className="cmt-content">
                    {extractTextFromHTML(comment.comment)}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
