// ============================================================
// Custom HTML5 video player — brand-matched controls
// ============================================================

function initCustomPlayer() {
  const wrap = document.getElementById('player-wrap');
  const video = document.getElementById('project-video');
  if (!wrap || !video) return;

  const playBtn = document.getElementById('play-pause-btn');
  const muteBtn = document.getElementById('mute-btn');
  const fsBtn = document.getElementById('fullscreen-btn');
  const seek = document.getElementById('player-seek');
  const seekFill = document.getElementById('player-seek-fill');
  const timeLabel = document.getElementById('player-time');

  function formatTime(s) {
    if (!isFinite(s)) return '00:00';
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  playBtn.addEventListener('click', () => {
    if (video.paused) { video.play(); } else { video.pause(); }
  });

  video.addEventListener('play', () => {
    playBtn.textContent = '❚❚';
    wrap.classList.remove('paused');
  });
  video.addEventListener('pause', () => {
    playBtn.textContent = '▶';
    wrap.classList.add('paused');
  });

  video.addEventListener('timeupdate', () => {
    const pct = (video.currentTime / video.duration) * 100 || 0;
    seekFill.style.width = pct + '%';
    timeLabel.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
  });

  seek.addEventListener('click', (e) => {
    const rect = seek.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * video.duration;
  });

  muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? '🔇' : '🔊';
  });

  fsBtn.addEventListener('click', () => {
    if (wrap.requestFullscreen) wrap.requestFullscreen();
  });

  // Tap the video itself to toggle play (mobile-friendly)
  video.addEventListener('click', () => {
    if (video.paused) { video.play(); } else { video.pause(); }
  });
}

document.addEventListener('DOMContentLoaded', initCustomPlayer);
