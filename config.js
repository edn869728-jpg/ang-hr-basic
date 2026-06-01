(function(){
  'use strict';

  var VERSION = 'v16';
  var CONFIG = window.ANG_HR_CONFIG || {};
  var EMPLOYEE_HOME = CONFIG.employeeHomeFile || 'employee_home.html';
  var ADMIN_HOME = CONFIG.adminHomeFile || 'admin_home.html';
  var GAS_URL = CONFIG.apiBaseUrl || CONFIG.gasUrl || 'https://script.google.com/macros/s/AKfycbylg5KENMMvwj6aqeK51ASk-uT6CsJLob6dix2ELmoP5rf8Yla5RnRKTiaVtkrA9dPm/exec';

  var KEYS = {
    id:'ang_employee_id',
    name:'ang_employee_name',
    role:'ang_employee_role',
    token:'ang_hr_token',
    legacyLogin:'emp_logged_in',
    legacyName:'emp_name',
    legacyIsLoggedIn:'isLoggedIn',
    legacyLoginId:'loginId'
  };

  function cleanId(v){ return String(v || '').trim().replace(/[^A-Za-z0-9_-]/g,'').toUpperCase(); }
  function cleanRole(v){ return String(v || '').trim().toLowerCase(); }

  function guessRole(id, role){
    id = cleanId(id);
    role = cleanRole(role || '');
    if(id === 'ANG0603') return 'creator';
    return role || 'employee';
  }

  function getId(){
    return cleanId(
      localStorage.getItem(KEYS.id) ||
      localStorage.getItem(KEYS.legacyLogin) ||
      localStorage.getItem(KEYS.legacyLoginId) ||
      localStorage.getItem('employeeId') ||
      localStorage.getItem('employee_id') ||
      localStorage.getItem('currentEmployeeId') ||
      localStorage.getItem('id') ||
      ''
    );
  }

  function getToken(){ return localStorage.getItem(KEYS.token) || localStorage.getItem('token') || ''; }

  function saveLogin(res, fallbackId){
    res = res || {};
    var u = res.user || {};
    var id = cleanId(res.id || res.employeeId || res.employee_id || res.account || u.id || u.employeeId || u.employee_id || fallbackId || getId());
    if(!id) return false;
    var name = String(res.name || res.nickname || res.displayName || u.name || u.nickname || u.displayName || id);
    var role = guessRole(id, res.role || res.permission || u.role || u.permission);
    var token = String(res.token || res.loginToken || res.sessionToken || u.token || u.loginToken || u.sessionToken || getToken() || ('login-token-' + Date.now()));

    localStorage.setItem(KEYS.id, id);
    localStorage.setItem(KEYS.name, name);
    localStorage.setItem(KEYS.role, role);
    localStorage.setItem(KEYS.token, token);
    localStorage.setItem(KEYS.legacyLogin, id);
    localStorage.setItem(KEYS.legacyName, name);
    localStorage.setItem(KEYS.legacyIsLoggedIn, 'true');
    localStorage.setItem(KEYS.legacyLoginId, id);
    localStorage.setItem('id', id);
    localStorage.setItem('employeeId', id);
    localStorage.setItem('employee_id', id);
    localStorage.setItem('currentEmployeeId', id);
    localStorage.setItem('token', token);
    return true;
  }

  function getUser(){
    var id = getId();
    if(!id) return null;
    var role = guessRole(id, localStorage.getItem(KEYS.role));
    if(role !== localStorage.getItem(KEYS.role)) localStorage.setItem(KEYS.role, role);
    return {id:id, employeeId:id, employee_id:id, account:id, name:localStorage.getItem(KEYS.name) || localStorage.getItem(KEYS.legacyName) || id, role:role, token:getToken()};
  }

  function isAdminRole(role){ role = cleanRole(role); return role === 'admin' || role === 'manager' || role === 'creator'; }

  function withAuthPayload(payload){
    var u = getUser();
    payload = payload || {};
    if(!u) return payload;
    var out = Object.prototype.toString.call(payload) === '[object Object]' ? Object.assign({}, payload) : {value:payload};
    ['id','employeeId','employee_id','account','empId','staffId','loginId','userId'].forEach(function(k){ if(!out[k]) out[k] = u.id; });
    ['token','authToken','loginToken'].forEach(function(k){ if(!out[k]) out[k] = u.token; });
    return out;
  }

  function normalizeResponse(data){
    if(!data) return {ok:false,message:'沒有收到系統回應'};
    if(typeof data === 'string'){
      try{ data = JSON.parse(data); }catch(e){ return {ok:true,raw:data}; }
    }
    if(data.success === true && data.ok !== true) data.ok = true;
    if(data.status === 'success' && data.ok !== true) data.ok = true;
    return data;
  }

  async function fallbackPost(action, payload){
    payload = withAuthPayload(payload || {});
    var body = Object.assign({}, payload, {action:action});
    var qs = new URLSearchParams();
    qs.set('action', action);
    qs.set('payload', JSON.stringify(payload));
    Object.keys(payload).forEach(function(k){ if(payload[k] !== undefined && payload[k] !== null && typeof payload[k] !== 'object') qs.set(k, String(payload[k])); });
    try{
      var res = await fetch(GAS_URL, {method:'POST', mode:'cors', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify(body)});
      return normalizeResponse(await res.text());
    }catch(postErr){
      try{
        var res2 = await fetch(GAS_URL + '?' + qs.toString(), {method:'GET', mode:'cors'});
        return normalizeResponse(await res2.text());
      }catch(getErr){
        return {ok:false,message:(getErr && getErr.message) || (postErr && postErr.message) || 'API 連線失敗'};
      }
    }
  }

  function patchApi(){
    if(!window.ANG_HR_API) window.ANG_HR_API = {};
    ['post','request','call','run'].forEach(function(fn){
      if(typeof window.ANG_HR_API[fn] === 'function' && !window.ANG_HR_API[fn].__angPatchedV16){
        var old = window.ANG_HR_API[fn].bind(window.ANG_HR_API);
        var wrapped = function(action, payload){ return old(action, withAuthPayload(payload)); };
        wrapped.__angPatchedV16 = true;
        window.ANG_HR_API[fn] = wrapped;
      }
    });
    if(typeof window.ANG_HR_API.post !== 'function') window.ANG_HR_API.post = fallbackPost;
    if(typeof window.ANG_HR_API.request !== 'function') window.ANG_HR_API.request = window.ANG_HR_API.post;
  }

  function patchFetch(){
    if(window.fetch && !window.fetch.__angHrPatchedV16){
      var oldFetch = window.fetch.bind(window);
      var patchedFetch = function(input, init){
        try{
          var url = (typeof input === 'string') ? input : (input && input.url) || '';
          if(url && /script\.google\.com\/macros\/s\//.test(url)){
            var u = getUser();
            if(u){
              init = init || {};
              var method = String(init.method || 'GET').toUpperCase();
              if(method === 'GET'){
                var absolute = new URL(url, location.href);
                ['id','employeeId','employee_id','account','empId','staffId','loginId'].forEach(function(k){ if(!absolute.searchParams.get(k)) absolute.searchParams.set(k, u.id); });
                if(!absolute.searchParams.get('token')) absolute.searchParams.set('token', u.token || '');
                input = typeof input === 'string' ? absolute.toString() : new Request(absolute.toString(), input);
              }
              if(method !== 'GET' && init.body){
                if(typeof init.body === 'string'){
                  try{ var obj = JSON.parse(init.body); obj = withAuthPayload(obj); if(obj.payload && typeof obj.payload === 'object') obj.payload = withAuthPayload(obj.payload); init.body = JSON.stringify(obj); }catch(e){}
                }else if(init.body instanceof URLSearchParams){
                  ['id','employeeId','employee_id','account'].forEach(function(k){ if(!init.body.get(k)) init.body.set(k, u.id); });
                  if(!init.body.get('token')) init.body.set('token', u.token || '');
                }else if(window.FormData && init.body instanceof FormData){
                  ['id','employeeId','employee_id','account'].forEach(function(k){ if(!init.body.get(k)) init.body.append(k, u.id); });
                  if(!init.body.get('token')) init.body.append('token', u.token || '');
                }
              }
            }
          }
        }catch(e){}
        return oldFetch(input, init);
      };
      patchedFetch.__angHrPatchedV16 = true;
      window.fetch = patchedFetch;
    }
  }

  function logout(){
    ['ang_employee_id','ang_employee_name','ang_employee_role','ang_hr_token','emp_logged_in','emp_name','isLoggedIn','loginId','id','employeeId','employee_id','currentEmployeeId','token'].forEach(function(k){ try{ localStorage.removeItem(k); }catch(e){} });
    try{ sessionStorage.clear(); }catch(e){}
    location.href = 'login.html?v=16';
  }

  function requireLogin(roleGroup){
    var u = getUser();
    if(!u){ location.href = 'login.html?v=16'; return null; }
    if(roleGroup === 'admin' && !isAdminRole(u.role)){ location.href = EMPLOYEE_HOME + '?v=16'; return null; }
    return u;
  }

  function goEmployee(){ location.href = EMPLOYEE_HOME + '?v=16'; }
  function goAdmin(){
    var u = getUser();
    if(!u){ location.href = 'login.html?v=16'; return; }
    if(!isAdminRole(u.role)){ alert('目前帳號沒有管理權限'); return; }
    location.href = ADMIN_HOME + '?v=16';
  }

  function pageToFile(page){
    page = String(page || '').toLowerCase();
    var map = {employee:EMPLOYEE_HOME,index:EMPLOYEE_HOME,home:EMPLOYEE_HOME,schedule:'employee_schedule.html',leave:'employee_schedule.html',clock:'employee_clock.html',mysalary:'employee_salary.html',salary:'employee_salary.html',upload:'employee_upload.html',admin:ADMIN_HOME,admin_home:ADMIN_HOME,review:'admin_review.html',admin_review:'admin_review.html',admin_schedule:'admin_schedule.html',people:'admin_people.html',admin_people:'admin_people.html',settings:'admin_settings.html',admin_settings:'admin_settings.html',admin_salary:'admin_salary.html',admin_data:'admin_data.html',notice:'admin_notice.html',admin_notice:'admin_notice.html'};
    return map[page] || page || EMPLOYEE_HOME;
  }

  function goPage(page){
    var file = pageToFile(page);
    if(file.indexOf('.html') < 0) file += '.html';
    if(file.indexOf('admin') === 0) return goAdmin();
    location.href = file + (file.indexOf('?') >= 0 ? '&' : '?') + 'v=16';
  }

  function bindClickDelegation(){
    document.addEventListener('click', function(e){
      var el = e.target.closest && e.target.closest('[data-page-link],[data-home-key],[data-admin-link],[data-employee-link],[data-href]');
      if(!el || el.disabled) return;
      var target = '';
      if(el.hasAttribute('data-page-link')) target = el.getAttribute('data-page-link');
      if(el.hasAttribute('data-href')) target = el.getAttribute('data-href');
      if(el.hasAttribute('data-employee-link')) target = el.getAttribute('data-employee-link');
      if(el.hasAttribute('data-admin-link')) target = el.getAttribute('data-admin-link');
      if(el.hasAttribute('data-home-key')){
        var key = String(el.getAttribute('data-home-key') || '').toLowerCase();
        e.preventDefault();
        if(key === 'admin') goAdmin(); else goEmployee();
        return;
      }
      if(target){
        e.preventDefault();
        if(target.indexOf('admin') === 0) goAdmin();
        else location.href = target + (target.indexOf('?') >= 0 ? '&' : '?') + 'v=16';
      }
    }, true);
  }

  function exposeGlobals(){
    window.goPage = goPage;
    window.goClock = function(){ goPage('clock'); };
    window.goSalary = function(){ goPage('salary'); };
    window.goUpload = function(){ goPage('upload'); };
    window.goIndex = function(){ goPage('home'); };
    window.logout = logout;
    window.ANG_HR_AUTH = {version:VERSION,gasUrl:GAS_URL,employeeHome:EMPLOYEE_HOME,adminHome:ADMIN_HOME,keys:KEYS,getId:getId,getToken:getToken,getUser:getUser,saveLogin:saveLogin,withAuthPayload:withAuthPayload,isAdminRole:isAdminRole,requireLogin:requireLogin,goEmployee:goEmployee,goAdmin:goAdmin,goPage:goPage,logout:logout};
  }

  function bootstrap(){ patchApi(); patchFetch(); bindClickDelegation(); exposeGlobals(); }
  bootstrap();
})();