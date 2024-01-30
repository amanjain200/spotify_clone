console.log("Hello World");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  // Ensure seconds is a non-negative number
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format the result with leading zeros
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`./${folder}/`);

  let response = await a.text();
  //console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
                <img class="invert" src="music.svg" alt="" />
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>Aman Jain</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img class="invert" src="play.svg" alt="">
                </div>
              </li>`;
    //console.log(songUL.innerHTML);
  }

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
    //console.log(e.querySelector(".info").firstElementChild.innerHTML);
  });

  playMusic(songs[0], true);
}

const playMusic = (track, pause = false) => {
  // let audio = new Audio(`/${folder}/` + track);
  // audio.play();
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00";
};

async function displayAlbums() {
  let a = await fetch(`./songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/")) {
      console.log(e.href);
      let folder = e.href.split("/").slice(-1)[0];

      console.log(folder);
      //getting metadata of folder
      let a = await fetch(`./songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
              <div class="play">
                <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="22" fill="#1fdf64" />
                  <svg
                    x="10"
                    y="10"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="black"
                  >
                    <path
                      d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                      stroke="#141B34"
                      stroke-width="1.5"
                      stroke-linejoin="round"
                    />
                  </svg>
                </svg>
              </div>
              <img
                src="/songs/${folder}/cover.jpeg"
                alt=""
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
    }
  }
  //Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}

async function main() {
  //get the songs
  await getSongs("songs/Arijit%20Singh");
  //console.log(songs);
  playMusic(songs[0], true);

  //Display all the albums on the page
  await displayAlbums();
}

main();

//attach an event listener to play/pause button

play.addEventListener("click", () => {
  if (currentSong.paused) {
    currentSong.play();
    play.src = "pause.svg";
  } else {
    currentSong.pause();
    play.src = "play.svg";
  }
});

//add event listener to timeupdate event
currentSong.addEventListener("timeupdate", () => {
  document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
    currentSong.currentTime
  )}/${secondsToMinutesSeconds(currentSong.duration)}`;
  document.querySelector(".circle").style.left =
    (currentSong.currentTime / currentSong.duration) * 100 + "%";
});

//add event listerner to seekbar

document.querySelector(".seekbar").addEventListener("click", (e) => {
  let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
  document.querySelector(".circle").style.left = percent + "%";
  currentSong.currentTime = (percent / 100) * currentSong.duration;
});

//add an event listerner for hamburger menu

document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left").style.left = "0";
});

document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".left").style.left = "-120%";
});

//adding event listener to prev and next
prev.addEventListener("click", () => {
  currentSong.pause();
  let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
  if (index - 1 >= 0) {
    playMusic(songs[index - 1]);
  }
});

next.addEventListener("click", () => {
  console.log(songs);
  currentSong.pause();
  console.log(currentSong.src.split("/").slice(-1)[0]);
  let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
  if (index + 1 < songs.length) {
    playMusic(songs[index + 1]);
  }
});

//add an eventlisterner to volume
document
  .querySelector(".range")
  .getElementsByTagName("input")[0]
  .addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });

//Load the playlist whenever card is clicked
Array.from(document.getElementsByClassName("card")).forEach((e) => {
  e.addEventListener("click", async (item) => {
    songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
  });
});

document.querySelector(".volume>img").addEventListener("click", (e) => {
  console.log(e);
  if (e.target.src.includes("volume-loud-svgrepo-com.svg")) {
    e.target.src = "mute.svg";
    currentSong.volume = 0;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
  } else {
    e.target.src = "volume-loud-svgrepo-com.svg";
    currentSong.volume = 0.1;
    document
      .querySelector(".range")
      .getElementsByTagName("input")[0].value = 10;
  }
});
