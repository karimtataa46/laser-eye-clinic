/* Shared behaviour for every page: language switch, opening hours, copy buttons. */
(function () {
  const site = document.getElementById('site');
  const toAr = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

  // ---- Language ----
  // Other scripts listen for the "langchange" event to redraw their own text.
  function setLang(lang) {
    site.dataset.lang = lang;
    site.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    const btn = document.getElementById('langBtn');
    if (btn) {
      // The button offers the other language, so it is labelled in that language.
      btn.textContent = lang === 'ar' ? 'EN' : 'عربي';
      btn.lang = lang === 'ar' ? 'en' : 'ar';
      btn.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    }
    try { localStorage.setItem('lec-lang', lang); } catch (e) {}
    renderHours();
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }
  const langBtn = document.getElementById('langBtn');
  if (langBtn) langBtn.addEventListener('click', () => setLang(site.dataset.lang === 'ar' ? 'en' : 'ar'));

  // ---- Hours (from the clinic's Instagram bio), evaluated in Syria time ----
  const DAYS = [
    { key: 'Sat', ar: 'السبت', en: 'Saturday', open: 10, close: 16 },
    { key: 'Sun', ar: 'الأحد', en: 'Sunday', open: 10, close: 16 },
    { key: 'Mon', ar: 'الاثنين', en: 'Monday', open: 10, close: 16 },
    { key: 'Tue', ar: 'الثلاثاء', en: 'Tuesday', open: 10, close: 16 },
    { key: 'Wed', ar: 'الأربعاء', en: 'Wednesday', open: 10, close: 16 },
    { key: 'Thu', ar: 'الخميس', en: 'Thursday', open: 10, close: 15 },
    { key: 'Fri', ar: 'الجمعة', en: 'Friday', open: null, close: null }
  ];
  function nowInSyria() {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Damascus', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      const get = t => parts.find(p => p.type === t).value;
      return { day: get('weekday'), mins: (+get('hour') % 24) * 60 + +get('minute') };
    } catch (e) { return null; }
  }
  function fmt(h, lang) {
    const hh = h > 12 ? h - 12 : h;
    if (lang === 'en') return hh + ':00 ' + (h >= 12 ? 'pm' : 'am');
    return toAr(hh) + ':٠٠ ' + (h >= 12 ? 'م' : 'ص');
  }

  function renderTable(lang, now) {
    const table = document.getElementById('hours');
    if (!table) return;
    table.innerHTML = '';
    DAYS.forEach(d => {
      const tr = document.createElement('tr');
      if (now && now.day === d.key) tr.classList.add('today');
      if (d.open === null) tr.classList.add('closed');
      const a = document.createElement('td');
      a.textContent = d[lang];
      a.dataset.today = lang === 'ar' ? 'اليوم' : 'Today';
      const b = document.createElement('td');
      b.textContent = d.open === null ? (lang === 'ar' ? 'مغلق' : 'Closed') : fmt(d.open, lang) + ' – ' + fmt(d.close, lang);
      tr.append(a, b);
      table.append(tr);
    });
  }

  // Every element marked data-status gets the dot + "open now / closed" line.
  function renderStatus(lang, now) {
    let text, isOpen = false;
    if (!now) {
      text = lang === 'ar' ? 'السبت – الخميس، من ١٠ صباحاً' : 'Saturday – Thursday, from 10 am';
    } else {
      const today = DAYS.find(d => d.key === now.day);
      isOpen = !!today && today.open !== null && now.mins >= today.open * 60 && now.mins < today.close * 60;
      if (isOpen) {
        text = lang === 'ar' ? 'مفتوح الآن حتى الساعة ' + fmt(today.close, 'ar') : 'Open now until ' + fmt(today.close, 'en');
      } else {
        let next = null;
        if (today && today.open !== null && now.mins < today.open * 60) next = { d: today, same: true };
        else {
          const i = DAYS.indexOf(today);
          for (let k = 1; k <= 7; k++) { const d = DAYS[(i + k) % 7]; if (d.open !== null) { next = { d, same: false }; break; } }
        }
        text = lang === 'ar'
          ? 'مغلق الآن · نفتح ' + (next.same ? 'اليوم' : next.d.ar) + ' الساعة ' + fmt(next.d.open, 'ar')
          : 'Closed now · opens ' + (next.same ? 'today' : next.d.en) + ' at ' + fmt(next.d.open, 'en');
      }
    }
    document.querySelectorAll('[data-status]').forEach(el => {
      el.querySelector('.dot').className = 'dot' + (isOpen ? ' open' : '');
      el.querySelector('.status-text').textContent = text;
    });
    const pill = document.getElementById('pill');
    if (pill) {
      pill.hidden = !now;
      pill.className = 'pill' + (isOpen ? ' open' : '');
      pill.textContent = isOpen ? (lang === 'ar' ? 'مفتوح الآن' : 'Open now') : (lang === 'ar' ? 'مغلق الآن' : 'Closed now');
    }
  }

  function renderHours() {
    const lang = site.dataset.lang, now = nowInSyria();
    renderTable(lang, now);
    renderStatus(lang, now);
  }

  // ---- Menu (phones and tablets): opens under the header, closes on a link, Escape or a click outside ----
  const menuBtn = document.getElementById('menuBtn'), menu = document.getElementById('menu');
  if (menuBtn && menu) {
    const setMenu = open => {
      menu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
    };
    menuBtn.addEventListener('click', () => setMenu(menu.hidden));
    menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('click', e => { if (!menu.hidden && !e.target.closest('header')) setMenu(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
    });
    matchMedia('(min-width: 1021px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
  }

  // ---- Copy buttons: <button data-copy="id-of-element-to-copy"> ----
  document.querySelectorAll('[data-copy]').forEach(btn => {
    const original = btn.innerHTML;
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.copy);
      const done = () => {
        btn.textContent = site.dataset.lang === 'ar' ? 'تم النسخ' : 'Copied';
        setTimeout(() => { btn.innerHTML = original; }, 1600);
      };
      const fallback = () => {
        const r = document.createRange();
        r.selectNodeContents(target);
        const s = getSelection();
        s.removeAllRanges();
        s.addRange(r);
      };
      try { navigator.clipboard.writeText(target.textContent.trim()).then(done, fallback); } catch (e) { fallback(); }
    });
  });

  // ---- Init ----
  let saved = 'ar';
  try { saved = localStorage.getItem('lec-lang') || 'ar'; } catch (e) {}
  setLang(saved);
  setInterval(renderHours, 60000);
})();
