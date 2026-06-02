(function(window, document) {
  'use strict';

  var cfg = window.ANG_HR_CONFIG || {};
  var minutes = Number(cfg.idleMinutes || cfg.idle_minutes || 15);

  if (!isFinite(minutes) || minutes <= 0) minutes = 15;

  var limitMs = Math.max(1, minutes) * 60 * 1000;
  var timer = null;
  var enabled = true;
  var started = false;

  var PUBLIC_PAGES = {
    login: true,
    activate: true,
    noperm: true
  };

  function getPageName() {
    var page = '';

    try {
      page = document.body && document.body.getAttribute('data-page') || '';
    } catch (err) {}

    if (!page) {
      var file = String(location.pathname || '').split('/').pop() || 'index.html';
      page = file.replace(/\.html?$/i, '').replace(/\?.*$/, '') || 'index';
    }

    return String(page || '').toLowerCase();
  }

  function isPublicPage() {
    return !!PUBLIC_PAGES[getPageName()];
  }

  function getAuth() {
    if (window.ANGAuth) return window.ANGAuth;
    if (window.ANG_HR_AUTH) return window.ANG_HR_AUTH;
    return null;
  }

  function hasLogin() {
    var auth = getAuth();

    try {
      if (auth && typeof auth.isLoggedIn === 'function') {
        return !!auth.isLoggedIn();
      }
    } catch (err) {}

    try {
      if (auth && typeof auth.get === 'function') {
        var a = auth.get();
        if (a && a.id) return true;
      }
    } catch (err) {}

    try {
      if (auth && typeof auth.getUser === 'function') {
        var u = auth.getUser();
        if (u && u.id) return true;
      }
    } catch (err) {}

    try {
      if (auth && typeof auth.user === 'function') {
        var user = auth.user();
        if (user && user.id) return true;
      }
    } catch (err) {}

    try {
      var id = localStorage.getItem('ang_employee_id') ||
        localStorage.getItem('emp_logged_in') ||
        localStorage.getItem('loginId') ||
        sessionStorage.getItem('ang_employee_id') ||
        sessionStorage.getItem('emp_logged_in') ||
        sessionStorage.getItem('loginId');

      return !!String(id || '').trim();
    } catch (err) {
      return false;
    }
  }

  function clearTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function clearFrontSession() {
    var keys = [
      'ang_hr_session',
      'ang_employee_id',
      'ang_employee_name',
      'ang_employee_role',
      'ang_hr_token',
      'emp_logged_in',
      'emp_name',
      'isLoggedIn',
      'loginId',
      'emp_id',
      'employee_id',
      'auth_id',
      'auth_token',
      'token',
      'device_id',
      'auth_device_id',
      'ang_hr_plan',
      'ang_hr_role',
      'ang_hr_company_id',
      'ang_hr_company_name',
      'ang_hr_paid_status',
      'ang_hr_source'
    ];

    try {
      keys.forEach(function(k) {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
    } catch (err) {}
  }

  function goLogin() {
    try {
      location.replace('login.html?v=' + Date.now());
    } catch (err) {
      location.href = 'login.html?v=' + Date.now();
    }
  }

  function logoutNow(showMessage) {
    clearTimer();

    if (showMessage !== false) {
      try {
        alert('🔒 已閒置超過 ' + minutes + ' 分鐘，系統將自動登出。');
      } catch (err) {}
    }

    var auth = getAuth();

    try {
      if (auth && typeof auth.logout === 'function') {
        auth.logout();
        return;
      }
    } catch (err) {}

    try {
      if (auth && typeof auth.clear === 'function') {
        auth.clear();
      }
    } catch (err) {}

    try {
      if (auth && typeof auth.clearSession === 'function') {
        auth.clearSession();
      }
    } catch (err) {}

    clearFrontSession();
    goLogin();
  }

  function reset() {
    if (!enabled) return;

    clearTimer();

    if (isPublicPage() && !hasLogin()) return;
    if (!hasLogin()) return;

    timer = setTimeout(function() {
      if (!enabled) return;
      if (!hasLogin()) return;
      logoutNow(true);
    }, limitMs);
  }

  function start() {
    enabled = true;
    started = true;
    reset();
  }

  function stop() {
    enabled = false;
    clearTimer();
  }

  function bindEvent(target, evt, fn) {
    if (!target || !target.addEventListener) return;

    try {
      target.addEventListener(evt, fn, { capture: true, passive: true });
    } catch (err) {
      try {
        target.addEventListener(evt, fn, true);
      } catch (err2) {}
    }
  }

  [
    'mousedown',
    'mousemove',
    'keypress',
    'keydown',
    'scroll',
    'touchstart',
    'click'
  ].forEach(function(evt) {
    bindEvent(document, evt, reset);
  });

  bindEvent(document, 'visibilitychange', function() {
    if (!document.hidden) reset();
  });

  window.ANGIdle = {
    start: start,
    stop: stop,
    reset: reset,
    logoutNow: logoutNow,
    getState: function() {
      return {
        enabled: enabled,
        started: started,
        idleMinutes: minutes,
        limitMs: limitMs,
        hasTimer: !!timer,
        hasLogin: hasLogin(),
        page: getPageName()
      };
    }
  };

  window.ANG_HR_IDLE = window.ANGIdle;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(window, document);
