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

  React.useEffect(() => {
    function showTime() {
      var date = new Date();
      var h = date.getHours(); // 0 - 23
      var m = date.getMinutes(); // 0 - 59
      var s = date.getSeconds(); // 0 - 59
      var session = "AM";

      if (h == 0) {
        h = 12;
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

    getComments();
  }, []);

  const getComments = () => {
    axios
      .get("https://tunnaduong.com/test_api/fb_live_chat.php")
      .then((response) => {
        setComments(response.data.content);
        setTimeout(getComments, 15000);
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
  };

  return (
    <div>
      <div className="player-wrapper">
        <YouTube
          videoId="papuvlVeZg8"
          opts={{
            height: "100%",
            width: "100%",
            playerVars: {
              autoplay: 1,
              mute: 0,
              loop: 1,
            },
          }}
          className="player"
          onReady={onPlayerReady}
        />
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
          <Marquee autoFill speed={80}>
            <div style={{ marginRight: 10 }}>
              Lựa chọn bài hát tiếp theo bằng cách comment theo cú pháp: "/yt
              tên_bài_hát" bên dưới video!!!
            </div>
          </Marquee>
        </div>
      </div>
      <div className="now-playing-wrapper">
        <div className="live-cmt">Đang phát:</div>
        <div className="now-playing">
          <Marquee autoFill={false} speed={80}>
            <div style={{ marginRight: 10 }}>{videoTitle}</div>
          </Marquee>
        </div>
      </div>
      <div className="comment">
        <div className="live-cmt">Trò chuyện trực tiếp</div>
        <div className="comments">
          {comments?.slice(0, 3).map((comment, index) => (
            <div className="cmt">
              <div className="cmt-name">{comment.name}</div>
              <div className="cmt-content">
                {extractTextFromHTML(comment.comment)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
