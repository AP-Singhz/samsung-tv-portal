(function () {
  'use strict';

  var COLUMNS = 4;
  var KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 10009 };
  var WEATHER_REFRESH_MS = 30 * 60 * 1000;

  // Simplified brand marks drawn inline so there's nothing to download.
  var LOGOS = {
    youtube: '<svg viewBox="0 0 160 112" style="width:96px;height:68px"><rect width="160" height="112" rx="30" fill="#ff0000"/><path d="M64 34v44l38-22z" fill="#fff"/></svg>',
    netflix: '<svg viewBox="0 0 60 110" style="width:44px;height:80px"><path d="M8 0h16l20 60V0h16v110c-6-2-10-3-16-3L24 48v62c-6 0-10 1-16 2z" fill="#e50914"/></svg>',
    spotify: '<svg viewBox="0 0 100 100" style="width:80px;height:80px"><circle cx="50" cy="50" r="48" fill="#1ed760"/><path d="M26 38c16-5 36-4 50 4M29 52c13-4 29-3 41 3M32 65c10-3 22-2 31 2" fill="none" stroke="#000" stroke-width="7" stroke-linecap="round"/></svg>',
    prime: '<div class="word light" style="font-size:34px;color:#fff">prime <b>video</b><svg viewBox="0 0 120 24" style="display:block;width:124px;height:24px;margin:-2px auto 0"><path d="M4 6c30 18 78 18 108 0" fill="none" stroke="#00a8e1" stroke-width="4" stroke-linecap="round"/><path d="M100 2l14 4-9 11" fill="none" stroke="#00a8e1" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
    disney: '<div class="word" style="font-size:44px;color:#fff">Disney<span style="font-weight:400;color:#8ab4ff">+</span></div>',
    appletv: '<div class="word" style="font-size:42px;color:#fff"><svg viewBox="0 0 24 28" style="width:32px;height:38px;vertical-align:-6px;margin-right:3px"><path fill="#fff" d="M19.7 14.9c0-3 2.5-4.5 2.6-4.6-1.4-2.1-3.6-2.4-4.4-2.4-1.9-.2-3.6 1.1-4.6 1.1-1 0-2.4-1.1-4-1-2 0-3.9 1.2-5 3-2.1 3.7-.5 9.1 1.5 12.1 1 1.5 2.2 3.1 3.8 3 1.5-.1 2.1-1 3.9-1s2.3 1 3.9 1c1.6 0 2.7-1.5 3.7-3 1.2-1.7 1.6-3.3 1.7-3.4-.1 0-3.1-1.2-3.1-4.8zM16.7 5.9c.8-1 1.4-2.4 1.2-3.9-1.2.1-2.7.8-3.5 1.8-.8.9-1.5 2.3-1.3 3.7 1.4.1 2.8-.7 3.6-1.6z"/></svg>tv</div>',
    tubi: '<div class="word" style="font-size:48px;color:#ffe033;letter-spacing:-2px">tubi</div>',
    tv: '<svg viewBox="0 0 24 24" fill="none" stroke="#8ab4ff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:68px;height:68px"><rect x="2.5" y="4" width="19" height="13" rx="2.5"/><path d="M8 21h8"/></svg>'
  };

  // Weather icons keyed by Open-Meteo WMO code group.
  var WX = {
    sun: '<svg viewBox="0 0 64 64" fill="none" stroke="#ffd166" stroke-width="3.5" stroke-linecap="round"><circle cx="32" cy="32" r="12" fill="#ffd166"/><path d="M32 6v8M32 50v8M6 32h8M50 32h8M13.6 13.6l5.7 5.7M44.7 44.7l5.7 5.7M13.6 50.4l5.7-5.7M44.7 19.3l5.7-5.7"/></svg>',
    partly: '<svg viewBox="0 0 64 64" fill="none" stroke-width="3.5" stroke-linecap="round"><circle cx="24" cy="24" r="10" fill="#ffd166" stroke="#ffd166"/><path d="M24 6v5M6 24h5M11.3 11.3l3.5 3.5" stroke="#ffd166"/><path d="M22 52h24a9 9 0 0 0 1-18 13 13 0 0 0-25 3 7.5 7.5 0 0 0 0 15z" fill="#dfe6f2" stroke="#dfe6f2"/></svg>',
    cloud: '<svg viewBox="0 0 64 64"><path d="M20 50h26a10 10 0 0 0 1-20 14 14 0 0 0-27 3 8.5 8.5 0 0 0 0 17z" fill="#c9d2e0"/></svg>',
    fog: '<svg viewBox="0 0 64 64" fill="none" stroke="#c9d2e0" stroke-width="4" stroke-linecap="round"><path d="M12 24h40M8 34h48M14 44h36"/></svg>',
    rain: '<svg viewBox="0 0 64 64"><path d="M20 40h26a10 10 0 0 0 1-20 14 14 0 0 0-27 3 8.5 8.5 0 0 0 0 17z" fill="#c9d2e0"/><path d="M24 46l-3 8M34 46l-3 8M44 46l-3 8" stroke="#6cb4ff" stroke-width="3.5" stroke-linecap="round"/></svg>',
    snow: '<svg viewBox="0 0 64 64"><path d="M20 40h26a10 10 0 0 0 1-20 14 14 0 0 0-27 3 8.5 8.5 0 0 0 0 17z" fill="#c9d2e0"/><circle cx="23" cy="50" r="3" fill="#fff"/><circle cx="33" cy="54" r="3" fill="#fff"/><circle cx="43" cy="50" r="3" fill="#fff"/></svg>',
    storm: '<svg viewBox="0 0 64 64"><path d="M20 38h26a10 10 0 0 0 1-20 14 14 0 0 0-27 3 8.5 8.5 0 0 0 0 17z" fill="#aab4c4"/><path d="M34 36l-7 12h7l-4 12 11-16h-7l4-8z" fill="#ffd166"/></svg>'
  };

  var settings = window.SETTINGS;
  var tiles = [];
  var focusIndex = 0;   // -1 means the gear is focused
  var lastTileIndex = 0;

  function byId(id) { return document.getElementById(id); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function textDiv(className, text) {
    var el = document.createElement('div');
    el.className = className;
    el.textContent = text;
    return el;
  }

  /* ---------- tiles ---------- */

  function renderTiles() {
    var grid = byId('apps');
    settings.apps.forEach(function (app, i) {
      var el = document.createElement('div');
      el.className = 'tile';
      el.style.animationDelay = (0.15 + i * 0.04) + 's';
      var box = textDiv('box', '');
      if (LOGOS[app.logo]) {
        box.innerHTML = LOGOS[app.logo];
      } else {
        var word = textDiv('word', app.name);
        word.style.fontSize = '34px';
        box.appendChild(word);
      }
      el.appendChild(box);
      el.appendChild(textDiv('name', app.name));
      grid.appendChild(el);
      tiles.push(el);
    });
    setFocus(0);
  }

  function focusedEl() {
    return focusIndex < 0 ? byId('gear') : tiles[focusIndex];
  }

  function setFocus(index) {
    var old = focusedEl();
    if (old) old.classList.remove('focused');
    focusIndex = index;
    if (index >= 0) lastTileIndex = index;
    var next = focusedEl();
    if (next) next.classList.add('focused');
  }

  function onKey(e) {
    var i = focusIndex;
    var count = tiles.length;
    switch (e.keyCode) {
      case KEY.LEFT:
        if (i > 0 && i % COLUMNS > 0) i--;
        break;
      case KEY.RIGHT:
        if (i >= 0 && i % COLUMNS < COLUMNS - 1 && i + 1 < count) i++;
        break;
      case KEY.UP:
        if (i >= COLUMNS) i -= COLUMNS;
        else if (i >= 0) i = -1;
        break;
      case KEY.DOWN:
        if (i < 0) i = lastTileIndex;
        else if (i + COLUMNS < count) i += COLUMNS;
        break;
      case KEY.ENTER:
        if (i < 0) openSettings();
        else launch(settings.apps[i]);
        return;
      case KEY.BACK:
        exitApp();
        return;
      default:
        return;
    }
    e.preventDefault();
    setFocus(i);
  }

  /* ---------- launching ---------- */

  function showToast(message) {
    var toast = byId('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () { toast.classList.remove('show'); }, 4000);
  }

  function openSettings() {
    if (!window.tizen) { showToast('Would open Settings'); return; }
    tizen.application.launch('com.samsung.tv.settings', null, function () { showToast('Could not open Settings'); });
  }

  // Samsung store apps don't always accept their short ID in tizen.application.launch,
  // so fall back to the TV's own local launch API.
  function launchViaLocalApi(app) {
    fetch('http://127.0.0.1:8001/api/v2/applications/' + app.id, { method: 'POST' })
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); })
      .catch(function () { showToast('Could not open ' + app.name); });
  }

  function launch(app) {
    if (!window.tizen) { showToast('Would open ' + app.name); return; }
    if (app.input) { switchInput(app); return; }
    tizen.application.launch(app.id, null, function () { launchViaLocalApi(app); });
  }

  // The TV only accepts source objects from its own list, and the switch
  // becomes visible once this app closes.
  function switchInput(app) {
    var label = app.input.type + ' ' + app.input.number;
    function matches(source) {
      return source.type === app.input.type && source.number === app.input.number;
    }
    tizen.systeminfo.getPropertyValue('VIDEOSOURCE', function (sources) {
      var source = sources.connected.filter(matches)[0];
      if (!source) { showToast(label + ': nothing connected'); return; }
      tizen.tvwindow.setSource(source, exitApp, function () { showToast('Could not switch to ' + label); });
    }, function () {
      showToast('Could not read TV inputs');
    });
  }

  function exitApp() {
    if (window.tizen) tizen.application.getCurrentApplication().exit();
  }

  /* ---------- clock + calendar grid ---------- */

  function renderClock() {
    var now = new Date();
    byId('clock').textContent = pad(now.getHours()) + ':' + pad(now.getMinutes());
    byId('date').textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    if (renderClock.day !== now.getDate()) {
      renderClock.day = now.getDate();
      renderMonth();
    }
  }

  function renderMonth() {
    var now = new Date();
    var first = new Date(now.getFullYear(), now.getMonth(), 1);
    var daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    var prevDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    var html = '';
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(function (d) { html += '<div class="head">' + d + '</div>'; });
    for (var b = first.getDay() - 1; b >= 0; b--) html += '<div class="dim">' + (prevDays - b) + '</div>';
    for (var day = 1; day <= daysInMonth; day++) {
      html += '<div' + (day === now.getDate() ? ' class="today"' : '') + '>' + day + '</div>';
    }
    var trailing = (7 - (first.getDay() + daysInMonth) % 7) % 7;
    for (var t = 1; t <= trailing; t++) html += '<div class="dim">' + t + '</div>';
    byId('month').innerHTML = html;
    byId('month-title').textContent = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }

  /* ---------- weather (Open-Meteo, no API key) ---------- */

  function describeWeather(code) {
    if (code === 0) return { icon: 'sun', text: 'Clear' };
    if (code <= 2) return { icon: 'partly', text: 'Partly cloudy' };
    if (code === 3) return { icon: 'cloud', text: 'Overcast' };
    if (code <= 48) return { icon: 'fog', text: 'Fog' };
    if (code <= 57) return { icon: 'rain', text: 'Drizzle' };
    if (code <= 67) return { icon: 'rain', text: 'Rain' };
    if (code <= 77) return { icon: 'snow', text: 'Snow' };
    if (code <= 82) return { icon: 'rain', text: 'Showers' };
    if (code <= 86) return { icon: 'snow', text: 'Snow showers' };
    return { icon: 'storm', text: 'Thunderstorm' };
  }

  function fetchJson(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }

  function locate() {
    if (settings.latitude && settings.longitude) {
      return Promise.resolve({ lat: settings.latitude, lon: settings.longitude, city: '' });
    }
    return fetchJson('http://ip-api.com/json/?fields=lat,lon,city').then(function (d) {
      return { lat: d.lat, lon: d.lon, city: d.city };
    });
  }

  function refreshWeather() {
    locate().then(function (loc) {
      var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + loc.lat + '&longitude=' + loc.lon +
        '&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto' +
        '&temperature_unit=' + (settings.units || 'celsius');
      return fetchJson(url).then(function (d) {
        var wx = describeWeather(d.current.weather_code);
        byId('weather-icon').innerHTML = WX[wx.icon];
        byId('temp').textContent = Math.round(d.current.temperature_2m) + '°';
        byId('conditions').textContent = wx.text + (loc.city ? ' · ' + loc.city : '');
        byId('range').textContent = 'H ' + Math.round(d.daily.temperature_2m_max[0]) + '°   L ' + Math.round(d.daily.temperature_2m_min[0]) + '°';
      });
    }).catch(function () {
      if (!byId('temp').textContent) byId('conditions').textContent = 'Weather unavailable';
    });
  }

  /* ---------- boot ---------- */

  byId('title').textContent = settings.title || 'Home';
  renderTiles();
  renderClock();
  document.addEventListener('keydown', onKey);
  // The app stays alive while another app is in front; refresh when it comes back.
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { renderClock(); refreshWeather(); }
  });
  // Let the intro animation finish before touching the network.
  setTimeout(refreshWeather, 1200);
  setInterval(renderClock, 10 * 1000);
  setInterval(refreshWeather, WEATHER_REFRESH_MS);
})();
