const ANG_HR_API = (() => {
  const cfg = window.ANG_HR_CONFIG || {};

  async function post(action, payload = {}) {
    if (!cfg.apiBaseUrl) {
      return { ok: false, message: '尚未設定 GAS API URL，請修改 config.js 的 apiBaseUrl。' };
    }

    const res = await fetch(cfg.apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload })
    });

    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      return { ok: false, message: 'API 回傳不是 JSON', raw: text };
    }
  }

  return { post };
})();
