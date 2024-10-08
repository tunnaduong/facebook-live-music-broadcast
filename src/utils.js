import axios from "axios";

const API_KEYS = [
  // "AIzaSyAfVMady7fkYvBdTiqeqkt3I6WaMXnP9ak",
  // "AIzaSyCQA29oDGxWKHnhv7qIeSkeVVbjcFaf9Bw",
  // "AIzaSyBL0rVQiEE83XpSw5HNad8SvIltQtHa7bA",
  // "AIzaSyA2-LY3jRpNm1ycJ_ribbSOvOr99wMQQqA",
  // "AIzaSyAKLubflIVrPOTU6KOIpkWqGXdWTp7dEEI",
  // "AIzaSyC9_pzo_I_4kLwD8FSm5ZHdvlZRFDA8YsI",
  // "AIzaSyDdVWJWCQVIKnD-p6IHJ-9rz6vFTg_CHtE",
  "AIzaSyB5qV77oNXYkbdIMHNsFCYPFLHggIzoA_Y",
  // "AIzaSyD9qo6OxJCd8hnATwFdbP-9Eqw1tyHUKgA",
  // "AIzaSyAYLddt4yOsGr_DyeBchGRdinmKhDsTSz4",
  // "AIzaSyDZubMAMRX6ca_yv1TdVNpJfmTljQ0PvEA",
  // "AIzaSyAyRE6e1HNeGHbavr1jl4nKIhGyDdn5Y6s"
  // "AIzaSyA7Ol1fk9CEV1jYxLc5J8ikT8MMfAuwPIg"
  // "AIzaSyArx9SDqF-2DCZ4SnbuURZPABNUgDJhup8"
  // "AIzaSyBUbeDMfZXlbFlIqBRH1M7tbBX3Hl69gQc"
  // AIzaSyDQTutsn3-O5Mx2JbOKdUlW1vyt9GJU5VQ
];

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

async function getSnippet(id) {
  for (const key of API_KEYS) {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${key}`
      );
      return response.data;
    } catch (err) {
      continue;
    }
  }
}

async function getChannelAvatar(id) {
  for (const key of API_KEYS) {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${id}&key=${key}`
      );
      return response.data;
    } catch (err) {
      continue;
    }
  }
}

async function getSearchResults(query) {
  for (const key of API_KEYS) {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=15&key=${key}&q=${query}`
      );
      return response.data;
    } catch (err) {
      continue;
    }
  }
}

async function getSuggestQueries(query) {
  const response = await axios.request({
    method: "GET",
    url: `http://suggestqueries.google.com/complete/search?q=${query}&client=firefox`,
    responseType: "arraybuffer",
    responseEncoding: "binary",
  });
  const decoder = new TextDecoder("ISO-8859-1");
  let html = decoder.decode(response.data);
  return html;
}

export default {
  shuffle,
  getSnippet,
  getChannelAvatar,
  getSearchResults,
  getSuggestQueries,
};
