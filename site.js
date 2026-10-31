(() => {
  const durations = { focus: 25, short: 5, long: 15 };
  const labels = { focus: 'READY WHEN YOU ARE', short: 'TAKE A BREATH', long: 'A LITTLE MORE SPACE' };
  let mode = 'focus';
  let seconds = durations[mode] * 60;
  let running = false;
  let endAt = 0;
  let sessions = 2;
  let ticker;

  const time = document.getElementById('previewTime');
  const caption = document.getElementById('previewCaption');
  const ring = document.getElementById('ringProgress');
  const ringContext = ring?.getContext('2d');
  const start = document.getElementById('startPreview');
  const playIcon = document.getElementById('playIcon');
  const startLabel = document.getElementById('startLabel');
  const circumference = 2 * Math.PI * 98;

  function render() {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    time.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    caption.textContent = running ? (mode === 'focus' ? 'STAY WITH IT' : 'REST A MOMENT') : labels[mode];
    playIcon.textContent = running ? 'Ⅱ' : '▶';
    startLabel.textContent = running ? 'Pause timer' : mode === 'focus' ? 'Start focus' : 'Start break';
    if (ringContext) {
      const progress = 1 - seconds / (durations[mode] * 60);
      ringContext.clearRect(0, 0, ring.width, ring.height);
      ringContext.lineWidth = 5;
      ringContext.lineCap = 'round';
      ringContext.beginPath();
      ringContext.arc(110, 110, 98, 0, Math.PI * 2);
      ringContext.strokeStyle = 'rgba(255,255,255,.08)';
      ringContext.stroke();
      if (progress > 0) {
        ringContext.beginPath();
        ringContext.arc(110, 110, 98, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        ringContext.strokeStyle = mode === 'focus' ? '#a8d7aa' : '#c7c7ef';
        ringContext.stroke();
      }
    }
    document.getElementById('sessionLabel').textContent = `${sessions} sessions completed`;
    document.querySelectorAll('.session-dots i').forEach((dot, i) => dot.classList.toggle('filled', i < sessions % 4));
  }

  function stop() {
    running = false;
    clearInterval(ticker);
  }

  function step() {
    seconds = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    if (seconds === 0) {
      stop();
      if (mode === 'focus') sessions += 1;
      mode = mode === 'focus' ? (sessions % 4 === 0 ? 'long' : 'short') : 'focus';
      seconds = durations[mode] * 60;
      document.querySelectorAll('.phase-switch button').forEach(b => b.classList.toggle('selected', b.dataset.mode === mode));
    }
    render();
  }

  start?.addEventListener('click', () => {
    if (running) {
      seconds = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      stop();
    } else {
      running = true;
      endAt = Date.now() + seconds * 1000;
      ticker = setInterval(step, 200);
    }
    render();
  });

  document.getElementById('resetPreview')?.addEventListener('click', () => {
    stop(); seconds = durations[mode] * 60; render();
  });

  document.getElementById('skipPreview')?.addEventListener('click', () => {
    stop(); mode = mode === 'focus' ? 'short' : 'focus'; seconds = durations[mode] * 60;
    document.querySelectorAll('.phase-switch button').forEach(b => b.classList.toggle('selected', b.dataset.mode === mode));
    render();
  });

  document.querySelectorAll('.phase-switch button').forEach(button => {
    button.addEventListener('click', () => {
      stop(); mode = button.dataset.mode; seconds = durations[mode] * 60;
      document.querySelectorAll('.phase-switch button').forEach(b => b.classList.toggle('selected', b === button));
      render();
    });
  });
  render();
})();
