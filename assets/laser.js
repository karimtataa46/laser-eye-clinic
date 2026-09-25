/* Laser page: draws the day-by-day pain chart inside each laser type card.
   Each chart reads its data from data-levels: one number per day, starting on surgery day.
   0 = no pain, 1 = mild, 2 = moderate, 3 = strong. */
(function () {
  const site = document.getElementById('site');
  const toAr = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const LEVELS = {
    ar: ['لا ألم', 'خفيف', 'متوسط', 'قوي'],
    en: ['No pain', 'Mild', 'Moderate', 'Strong']
  };
  const TEXT = {
    ar: { day0: 'يوم العملية', day: 'اليوم ', axis: 'الأيام بعد العملية (٠ = يوم العملية)', sep: '، ' },
    en: { day0: 'Surgery day', day: 'Day ', axis: 'Days after surgery (0 = surgery day)', sep: ', ' }
  };

  function render() {
    const lang = site.dataset.lang;
    const t = TEXT[lang];
    const num = n => (lang === 'ar' ? toAr(n) : String(n));
    const dayName = d => (d === 0 ? t.day0 : t.day + num(d));

    document.querySelectorAll('.pain[data-levels]').forEach(chart => {
      const levels = chart.dataset.levels.split(',').map(Number);
      const grid = [3, 2, 1].map(l =>
        '<div class="pain-grid" style="--l:' + l + '"><span>' + LEVELS[lang][l] + '</span></div>').join('');
      const cols = levels.map((v, d) =>
        '<div class="pain-col" style="--v:' + v + '" data-v="' + v + '" data-tip="' + dayName(d) + ': ' + LEVELS[lang][v] + '">' +
        '<i></i><b>' + num(d) + '</b></div>').join('');
      chart.innerHTML = '<div class="pain-plot">' + grid + '<div class="pain-cols">' + cols + '</div></div>' +
        '<p class="pain-axis">' + t.axis + '</p>';
      chart.setAttribute('role', 'img');
      chart.setAttribute('aria-label', levels.map((v, d) => dayName(d) + ': ' + LEVELS[lang][v]).join(t.sep));
    });
  }

  // Touch screens have no hover, so tapping a day shows its label.
  document.addEventListener('click', e => {
    const col = e.target.closest('.pain-col');
    document.querySelectorAll('.pain-col.show').forEach(c => { if (c !== col) c.classList.remove('show'); });
    if (col) col.classList.toggle('show');
  });

  render();
  document.addEventListener('langchange', render);
})();
