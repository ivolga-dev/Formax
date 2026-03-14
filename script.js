const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const playIcon = document.getElementById('playIcon');
const currentTrack = document.getElementById('currentTrack');
const seekBar = document.getElementById('seekBar');

const MUSIC_DIR = 'mp';

let tracks = [];
let currentIndex = 0;

const iconMap = {
  play: 'icons/play.png',
  pause: 'icons/pause.png',
};

playBtn.addEventListener('click', () => {
  if (!tracks.length) return;
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
});

prevBtn.addEventListener('click', () => {
  if (!tracks.length) return;
  currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  loadTrack(currentIndex, true);
});

nextBtn.addEventListener('click', () => {
  if (!tracks.length) return;
  currentIndex = (currentIndex + 1) % tracks.length;
  loadTrack(currentIndex, true);
});

audio.addEventListener('play', () => {
  playIcon.src = iconMap.pause;
});

audio.addEventListener('pause', () => {
  playIcon.src = iconMap.play;
});

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  seekBar.value = (audio.currentTime / audio.duration) * 100;
});

audio.addEventListener('ended', () => {
  if (!tracks.length) return;
  currentIndex = (currentIndex + 1) % tracks.length;
  loadTrack(currentIndex, true);
});

seekBar.addEventListener('input', () => {
  if (!audio.duration) return;
  audio.currentTime = (seekBar.value / 100) * audio.duration;
});

async function discoverTracks() {
  try {
    const response = await fetch(`${MUSIC_DIR}/`);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = [...doc.querySelectorAll('a')];

    const discovered = links
      .map((link) => link.getAttribute('href'))
      .filter((href) => href && href.toLowerCase().endsWith('.mp3'))
      .map((href) => `${MUSIC_DIR}/${decodeURIComponent(href).replace(/^\//, '')}`);

    if (discovered.length) return normalizeAndSort(discovered);
  } catch {
    // fallback below
  }

  try {
    const fallback = await fetch(`${MUSIC_DIR}/playlist.json`);
    if (fallback.ok) {
      const list = await fallback.json();
      if (Array.isArray(list) && list.length) {
        return normalizeAndSort(list.map((item) => `${MUSIC_DIR}/${item}`));
      }
    }
  } catch {
    // ignore
  }

  return [];
}

function normalizeAndSort(items) {
  return [...new Set(items)]
    .map((path) => ({
      path,
      title: path.split('/').pop().replace(/\.mp3$/i, '').replace(/[-_]/g, ' '),
    }))
    .sort((a, b) => a.title.localeCompare(b.title, 'ru', { sensitivity: 'base' }));
}

function loadTrack(index, autoplay = false) {
  const track = tracks[index];
  if (!track) return;

  currentIndex = index;
  audio.src = track.path;
  currentTrack.textContent = track.title;

  if (autoplay) {
    audio.play().catch(() => {
      // user gesture may be required
    });
  }
}

async function init() {
  tracks = await discoverTracks();

  if (tracks.length) {
    loadTrack(0, false);
  } else {
    currentTrack.textContent = 'Нет доступных mp3-файлов в папке /mp';
  }
}

init();
