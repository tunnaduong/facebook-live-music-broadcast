import React from "react";
import "./App.css";
import YouTube from "react-youtube";
import { LogoFacebook, LogoYoutube, LogoInstagram } from "react-ionicons";
import Marquee from "react-fast-marquee";
import axios from "axios";

function App() {
  const [time, setTime] = React.useState("");
  const [second, setSecond] = React.useState("");
  const [session, setSession] = React.useState("");
  const [comments, setComments] = React.useState([]);
  const [videoTitle, setVideoTitle] = React.useState("");
  const [playingQueue, setPlayingQueue] = React.useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = React.useState(0);

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
    // Call getComments every 15 seconds
    setInterval(getComments, 15000);
    getComments();
  }, []);

  let searchCache = {};

  // Function to search YouTube API
  const searchYouTube = async (query) => {
    if (searchCache[query]) {
      console.log(`Cache hit for query: ${query}`);
      return searchCache[query];
    }

    const apiKey = "AIzaSyBUbeDMfZXlbFlIqBRH1M7tbBX3Hl69gQc";
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
      query
    )}&key=${apiKey}`;

    try {
      const searchResponse = await axios.get(searchUrl);
      const videoId = searchResponse.data.items[0].id.videoId;

      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
      const detailsResponse = await axios.get(detailsUrl);
      const videoTitle = detailsResponse.data.items[0].snippet.title;

      const videoData = { videoId, videoTitle };
      searchCache[query] = videoData; // Store the result in the cache
      return videoData;
    } catch (error) {
      console.error("YouTube API error:", error);
      return null;
    }
  };

  let addedVideoIds = new Set();

  const addToQueue = (videoData) => {
    setPlayingQueue((prevQueue) => {
      if (!prevQueue.some((video) => video.videoId === videoData.videoId)) {
        console.log(`Added video ID ${videoData.videoId} to the playing queue`);
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
      .get("https://tunnaduong.com/test_api/fb_live_chat.php")
      .then(async (response) => {
        const comments = response.data.content;
        setComments(comments);

        // Filter comments that start with "/yt"
        const ytComments = comments.filter(
          (commentObj) =>
            typeof commentObj.comment === "string" &&
            commentObj.comment.startsWith("/yt ")
        );

        for (const commentObj of ytComments) {
          const songName = commentObj.comment.slice(4).trim();
          const videoData = await searchYouTube(songName);
          if (videoData) {
            console.log(
              `Found video ID ${videoData.videoId} for song ${songName}`
            );
            if (!addedVideoIds.has(videoData.videoId)) {
              addToQueue(videoData);
              addedVideoIds.add(videoData.videoId);
            }
          }
        }
      })
      .catch((err) => console.log(err));
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
  };

  const onEnd = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % playingQueue.length);
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
      <div className="above">
        <Marquee>
          Lựa chọn bài hát tiếp theo bằng cách comment theo cú pháp: "/yt
          tên_bài_hát" bên dưới video!!!
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
          <Marquee speed={80}>
            {playingQueue.length == 0 ||
            currentVideoIndex >= playingQueue.length - 1 ? (
              <div style={{ marginRight: 10 }}>**ĐANG TRỐNG**</div>
            ) : (
              <div>
                {playingQueue
                  .slice(currentVideoIndex + 1)
                  .map((video, index) => (
                    <span key={index} style={{ marginRight: 10 }}>
                      {index + 1}) {video.videoTitle} ·
                    </span>
                  ))}
              </div>
            )}
          </Marquee>
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
          {comments?.length == 0 || !comments ? (
            <div className="cmt">
              <div>Hãy là người đầu tiên bình luận.</div>
            </div>
          ) : (
            comments?.slice(-3).map((comment, index) => (
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
