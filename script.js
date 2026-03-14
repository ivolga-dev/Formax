const audio = document.getElementById('audio');
const trackNameEl = document.getElementById('trackName');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let playlist = [];
let currentIndex = -1;

const iconPlay = 'icons/play.png';
const iconPause = 'icons/pause.png';

function prettifyName(fileName) {
  return fileName
    .replace(/\.mp3$/i, '')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .trim();
}

function setTrack(index) {
  if (!playlist.length) {
    currentIndex = -1;
    audio.removeAttribute('src');
    trackNameEl.textContent = 'Нет трека';
    playIcon.src = iconPlay;
    return;
  }

  currentIndex = (index + playlist.length) % playlist.length;
  const trackFile = playlist[currentIndex];
  audio.src = `mp3/${encodeURIComponent(trackFile)}`;
  trackNameEl.textContent = prettifyName(trackFile);
}

async function loadPlaylist() {
  try {
    const response = await fetch('mp3/playlist.json', { cache: 'no-store' });
    const files = await response.json();
    playlist = Array.isArray(files) ? files.filter((name) => typeof name === 'string' && name) : [];

    if (playlist.length > 0) {
      setTrack(0);
    } else {
      setTrack(-1);
    }
  } catch {
    playlist = [];
    setTrack(-1);
  }
}

playBtn.addEventListener('click', async () => {
  if (!playlist.length) return;

  if (audio.paused) {
    try {
      await audio.play();
      playIcon.src = iconPause;
    } catch {
      playIcon.src = iconPlay;
    }
  } else {
    audio.pause();
    playIcon.src = iconPlay;
  }
});

prevBtn.addEventListener('click', () => {
  if (!playlist.length) return;
  const wasPlaying = !audio.paused;
  setTrack(currentIndex - 1);
  if (wasPlaying) {
    audio.play().catch(() => {});
  }
});

nextBtn.addEventListener('click', () => {
  if (!playlist.length) return;
  const wasPlaying = !audio.paused;
  setTrack(currentIndex + 1);
  if (wasPlaying) {
    audio.play().catch(() => {});
  }
});

audio.addEventListener('ended', () => {
  if (!playlist.length) return;
  setTrack(currentIndex + 1);
  audio.play().catch(() => {});
});

audio.addEventListener('play', () => {
  playIcon.src = iconPause;
});

audio.addEventListener('pause', () => {
  playIcon.src = iconPlay;
});

loadPlaylist();
