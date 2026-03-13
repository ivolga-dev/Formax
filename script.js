const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const seekBar = document.getElementById('seekBar');
const currentTrack = document.getElementById('currentTrack');
const playlistNode = document.getElementById('playlist');
const playIcon = document.getElementById('playIcon');
const playlistToggle = document.getElementById('playlistToggle');
const playlistMenu = document.getElementById('playlistMenu');

let tracks = [];
let currentIndex = 0;

const iconMap = {
  play: 'icons/play.png',
  pause: 'icons/pause.png',
};

playlistToggle.addEventListener('click', () => {
  const expanded = playlistToggle.getAttribute('aria-expanded') === 'true';
  playlistToggle.setAttribute('aria-expanded', String(!expanded));
  playlistMenu.hidden = expanded;
});

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
    const response = await fetch('mp3/');
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = [...doc.querySelectorAll('a')];

    const discovered = links
      .map((link) => link.getAttribute('href'))
      .filter((href) => href && href.toLowerCase().endsWith('.mp3'))
      .map((href) => `mp3/${decodeURIComponent(href).replace(/^\//, '')}`);

    if (discovered.length) return normalizeAndSort(discovered);
  } catch {
    // fallback below
  }

  try {
    const fallback = await fetch('mp3/playlist.json');
    if (fallback.ok) {
      const list = await fallback.json();
      if (Array.isArray(list) && list.length) {
        return normalizeAndSort(list.map((item) => `mp3/${item}`));
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

function renderPlaylist() {
  playlistNode.innerHTML = '';

  if (!tracks.length) {
    const li = document.createElement('li');
    li.textContent = 'Папка mp3 пуста. Добавьте файлы .mp3';
    li.style.opacity = '0.85';
    playlistNode.append(li);
    return;
  }

  tracks.forEach((track, index) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.textContent = track.title;
    if (index === currentIndex) button.classList.add('active');
    button.addEventListener('click', () => loadTrack(index, true));
    li.append(button);
    playlistNode.append(li);
  });
}

function loadTrack(index, autoplay = false) {
  const track = tracks[index];
  if (!track) return;

  currentIndex = index;
  audio.src = track.path;
  currentTrack.textContent = track.title;
  renderPlaylist();

  if (autoplay) {
    audio.play().catch(() => {
      // User gesture may be required.
    });
  }
}

async function init() {
  tracks = await discoverTracks();
  renderPlaylist();

  if (tracks.length) {
    loadTrack(0, false);
  } else {
    currentTrack.textContent = 'Нет доступных mp3-файлов';
  }
}

init();
