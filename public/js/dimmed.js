/* Dimmed theme controller: auto/night mode with sunrise-sunset.org
   Modes: 'auto' | 'dark' | 'light' (localStorage key: dimMode)
*/
(function(){
  const STORAGE_KEY = 'dimMode';
  const LEGACY_KEY = 'dimmed';
  const DEFAULT_LATLNG = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires fallback

  function applyMode(mode){
    if (mode === 'dark') {
      document.body.classList.add('dimmed-theme');
    } else if (mode === 'light') {
      document.body.classList.remove('dimmed-theme');
    }
  }

  function saveMode(mode){
    try { localStorage.setItem(STORAGE_KEY, mode); } catch(_){}
  }

  function readMode(){
    try {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy === '1') return 'dark';
      if (legacy === '0') return 'light';
      const v = localStorage.getItem(STORAGE_KEY);
      return v || 'auto';
    } catch(_) { return 'auto'; }
  }

  function setMode(mode){
    if (mode === 'auto') {
      saveMode('auto');
      startAuto();
    } else {
      stopAuto();
      applyMode(mode);
      saveMode(mode);
      updateControls(mode);
    }
  }

  // UI controls (top-right)
  function ensureControls(){
    if (document.getElementById('dim-controls')) return;
    const box = document.createElement('div');
    box.id = 'dim-controls';
    box.innerHTML = `
      <button data-mode="light" title="Modo claro (Sol)"><i class="fas fa-sun"></i></button>
      <button data-mode="dark" title="Modo atenuado (Luna)"><i class="fas fa-moon"></i></button>
      <button data-mode="auto" title="Automático"><i class="fas fa-adjust"></i></button>
    `;
    document.body.appendChild(box);
    box.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-mode]');
      if (!btn) return;
      const mode = btn.getAttribute('data-mode');
      setMode(mode);
    });
  }

  function updateControls(mode){
    const box = document.getElementById('dim-controls');
    if (!box) return;
    box.querySelectorAll('button').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-mode') === mode);
    });
  }

  let autoTimer = null;
  let autoSessionId = 0;
  function stopAuto(){ if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; } }

  function startAuto(){
    stopAuto();
    const session = ++autoSessionId;
    getSunTimes().then(({sunrise, sunset}) => {
      if (session !== autoSessionId) return; // cancel if mode changed mid-flight
      const now = new Date();
      const isNight = (now < sunrise) || (now > sunset);
      document.body.classList.toggle('dimmed-theme', isNight);
      updateControls('auto');
      // Schedule next change
      const nextChange = isNight ? sunrise : sunset;
      let delay = nextChange - now;
      if (delay < 0) delay += 24*60*60*1000; // fallback 24h
      autoTimer = setTimeout(() => { if (session === autoSessionId) startAuto(); }, Math.min(delay, 6*60*60*1000)); // clamp ≤ 6h
    }).catch(() => {
      if (session !== autoSessionId) return;
      // Fallback: night between 19:00-07:00 local
      const h = new Date().getHours();
      const isNight = (h >= 19 || h < 7);
      document.body.classList.toggle('dimmed-theme', isNight);
      updateControls('auto');
      autoTimer = setTimeout(() => { if (session === autoSessionId) startAuto(); }, 60*60*1000);
    });
  }

  async function getSunTimes(){
    const coords = await getCoords();
    const url = `https://api.sunrise-sunset.org/json?lat=${coords.lat}&lng=${coords.lng}&formatted=0`;
    const r = await fetch(url, { headers: { 'accept': 'application/json' } });
    const j = await r.json();
    if (!j || j.status !== 'OK') throw new Error('sun api');
    const sr = new Date(j.results.sunrise);
    const ss = new Date(j.results.sunset);
    return { sunrise: sr, sunset: ss };
  }

  function getCoords(){
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(DEFAULT_LATLNG);
      let done = false;
      const timeout = setTimeout(() => { if (!done) { done = true; resolve(DEFAULT_LATLNG); } }, 3000);
      navigator.geolocation.getCurrentPosition(
        (pos) => { if (!done) { done = true; clearTimeout(timeout); resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }); } },
        () => { if (!done) { done = true; clearTimeout(timeout); resolve(DEFAULT_LATLNG); } },
        { enableHighAccuracy: false, maximumAge: 3600000, timeout: 2500 }
      );
    });
  }

  // Public toggler for inline links
  window.toggleDimmed = function(){
    const current = readMode();
    if (current === 'auto') setMode('dark'); else setMode('auto');
  };

  // init
  ensureControls();
  const mode = readMode();
  if (mode === 'auto') startAuto(); else { stopAuto(); applyMode(mode); updateControls(mode); }
})();




