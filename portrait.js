/* Home + About motion. Needs GSAP, ScrollTrigger and Lenis (loaded before this file). Replaces old portrait.js. */
/* Fresh load / refresh always starts at Home (runs before anything else) */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
document.documentElement.style.scrollBehavior = 'auto';   // CSS smooth-scroll must not animate the reset
scrollTo(0, 0);
addEventListener('beforeunload', () => scrollTo(0, 0));   // browser saves 0 as the position to restore
addEventListener('pageshow', e => { if (e.persisted) scrollTo(0, 0); });

(function () {
  const $ = s => document.querySelector(s);
  const wrap = $('#portraitWrap'), heroSlot = $('#heroSlot'), aboutSlot = $('#aboutSlot');
  if (!wrap || !heroSlot || !aboutSlot || !window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.clearScrollMemory('manual');   // ScrollTrigger otherwise restores the old scroll after a refresh
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine) and (min-width:769px)').matches;
  const mob = matchMedia('(max-width:768px)');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t, smooth = t => t * t * (3 - 2 * t);

  // ---- smooth scroll (one engine drives everything) ----
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.scrollTo(0, { immediate: true, force: true });
  }
  document.documentElement.style.scrollBehavior = '';
    const closeMenu = () => {
    const nl = $('#navLinks'), ic = $('#hamburger i');
    if (nl) nl.classList.remove('open');
    if (ic) { ic.classList.add('fa-bars'); ic.classList.remove('fa-times'); }
  };
  const TIGHT = { services: 1, portfolio: 1, experience: 1, education: 1 };
  document.addEventListener('click', e => {
    const nl = $('#navLinks');
    if (nl && nl.classList.contains('open') && !e.target.closest('#navLinks, #hamburger')) closeMenu();
    const a = e.target.closest('a[href^="#"]');
    const t = a && a.getAttribute('href').length > 1 && document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault(); e.stopImmediatePropagation();
    closeMenu();
    const home = t.id === 'hero', off = TIGHT[t.id] ? (mob.matches ? -55 : -48) : -70;
    if (lenis) lenis.scrollTo(home ? 0 : t, { offset: home ? 0 : off, duration: 1.4 });
    else if (home) scrollTo({ top: 0, behavior: 'smooth' }); else t.scrollIntoView({ behavior: 'smooth' });
  }, true);

  // ---- elements ----
  const disc = $('.portrait-disc'), img = $('.portrait-img'), band = $('#aboutBand'), bgText = $('.hero-bgtext'), hero = $('#hero');
  const bgIn = bgText.firstElementChild;
  const fade = document.createElement('div');            // scroll-driven opacity lives on this wrapper only
  fade.className = 'disc-fade'; disc.parentNode.insertBefore(fade, disc); fade.appendChild(disc);
  const pills = [...wrap.querySelectorAll('.pill')].map(el => ({
    el, td: el.querySelector('.pill-3d'), inn: el.querySelector('.pill-in'),
    depth: +el.dataset.d || 24, ry: +el.dataset.ry || 0, rz: +el.dataset.rz || 0,
    qx: gsap.quickSetter(el, 'x', 'px'), qy: gsap.quickSetter(el, 'y', 'px'),
    sx_: gsap.quickSetter(el, 'scaleX'), sy_: gsap.quickSetter(el, 'scaleY'), qo: gsap.quickSetter(el, 'opacity')
  }));
  const sx = gsap.quickSetter(wrap, 'x', 'px'), sy = gsap.quickSetter(wrap, 'y', 'px');
  const ssx = gsap.quickSetter(wrap, 'scaleX'), ssy = gsap.quickSetter(wrap, 'scaleY'), ss = k => { ssx(k); ssy(k); };
  const sDisc = gsap.quickSetter(fade, 'opacity');
  const sBandO = band && gsap.quickSetter(band, 'opacity'), sBandY = band && gsap.quickSetter(band, 'scaleY');
  gsap.set(wrap, { transformOrigin: '0 0' });
 if (band) wrap.insertBefore(band, img);   // behind the portrait   // strip now lives inside the portrait layer, above the image
  pills.forEach(p => gsap.set(p.td, { transformPerspective: 800, rotationY: p.ry, rotationZ: p.rz, scale: +p.el.dataset.s || 1, transformOrigin: p.ry > 0 ? '100% 50%' : '0% 50%' }));

  // ---- PORTFOLIO: fit the real glyph ink box (Chakra Petch 300) into a target rectangle ----
  const cx = document.createElement('canvas').getContext('2d');
  function fitBig() {
    const H0 = hero.clientHeight, W0 = hero.clientWidth;
    const hb = $('.hero-text').getBoundingClientRect().bottom - hero.getBoundingClientRect().top;
    cx.font = '400 100px "Chakra Petch", sans-serif';
    const m = cx.measureText('PORTFOLIO');
    const inkL = m.actualBoundingBoxLeft, inkW = inkL + m.actualBoundingBoxRight, inkA = m.actualBoundingBoxAscent, inkH = inkA + m.actualBoundingBoxDescent;
    const baseY = (100 - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent; // baseline inside the 100px line box
    const top = hb + clamp(H0 * 0.02, 10, 22), bottom = H0 - 4;
    const Wt = W0 * (W0 < 760 ? 0.84 : W0 < 1100 ? 0.62 : 0.474);   // reference: word spans ~47% of a 1920 screen
    const kx = Wt / inkW, ky = Math.min((bottom - top) / inkH, kx * 4.6);   // fills the Home section; 4.6x max keeps bars/stems balanced
    bgText.style.setProperty('--fade', Math.round((bottom - top) * 0.26 + (H0 - bottom)) + 'px');
    bgIn.style.transform = 'translate(' + ((W0 - Wt) / 2 + kx * inkL) + 'px,' + (top - ky * (baseY - inkA)) + 'px) scale(' + kx + ',' + ky + ')';
  }

  // ---- layout is measured only on refresh, never per frame ----
  let size = 0, H = {}, A = {}, end = 1;
  function measure() {
    const sc = scrollY, hr = heroSlot.getBoundingClientRect(), ar = aboutSlot.getBoundingClientRect();
    size = hr.width;
    wrap.style.width = wrap.style.height = size + 'px';
    H = { x: hr.left, y: hr.top + sc };
    A = { x: ar.left, y: ar.top + sc, w: ar.width, h: ar.height };
    end = Math.max(1, A.y + A.h / 2 - (innerHeight + 76) / 2);
    fitBig();
    pills.forEach(p => { p.dx = size / 2 - p.el.offsetLeft; p.dy = size * 0.6 - p.el.offsetTop; });
  }

  // ---- Home -> About: one portrait travelling with scroll ----
   const last = {};
  function update() {
    const sc = scrollY, p = clamp(sc / end, 0, 1), e = smooth(p);
    const k = lerp(1, A.w / size, e);
    const y = sc <= end ? lerp(H.y, A.y - end, e) : A.y - sc;
    sx(lerp(H.x, A.x, e)); sy(y); ss(k);
    const vis = y + size * k < -20 ? 'hidden' : 'visible';
    if (last.vis !== vis) { last.vis = vis; wrap.style.visibility = vis; }
    const pull = +smooth(clamp(p / 0.45, 0, 1)).toFixed(3);
    if (last.pull !== pull) { last.pull = pull; pills.forEach(o => { o.qx(o.dx * pull); o.qy(o.dy * pull); o.sx_(1 - 0.8 * pull); o.sy_(1 - 0.8 * pull); o.qo(1 - pull); }); }
    const d = +(1 - smooth(clamp((p - 0.04) / 0.7, 0, 1))).toFixed(3);
    if (last.d !== d) { last.d = d; sDisc(d); }
   const g = +smooth(clamp((p - 0.12) / 0.6, 0, 1)).toFixed(2);  // 0 = colour (Home), 1 = black & white (About) — applies on ALL screen sizes
    if (last.g !== g) { last.g = g; img.style.filter = g ? 'grayscale(' + g + ')' : ''; }
    if (band) { const b = +smooth(clamp((p - 0.5) / 0.5, 0, 1)).toFixed(3); if (last.b !== b) { last.b = b; sBandO(b); sBandY(0.35 + 0.65 * b); } }
  }
  ScrollTrigger.create({ trigger: document.documentElement, start: 0, end: 'max', onUpdate: update, onRefresh: () => { measure(); update(); } });
  ScrollTrigger.addEventListener('refreshInit', measure);

  // ---- entrance (one orchestrated moment) ----
  const hello = $('.hero-hello');
  const gFonts = { done: false };
  Promise.all(['700 1em "Noto Nastaliq Urdu"','700 1em "Noto Naskh Arabic"','800 1em "Noto Sans Devanagari"','800 1em "Noto Sans Gurmukhi"','800 1em "Titillium Web"']
    .map(f => document.fonts.load(f, 'السلام علیکم नमस्ते ਸਤ ਸ੍ਰੀ ਅਕਾਲ مرحباً Hello').catch(() => {}))).then(() => gFonts.done = true);
  const G = [['Hello!','en'],['السلام علیکم!','ur','rtl'],['नमस्ते!','hi'],['ਸਤ ਸ੍ਰੀ ਅਕਾਲ!','pa'],['مرحباً!','ar','rtl'],['Hola!','es'],['Hallo!','de']];
  hello.innerHTML = '<span lang="en">Hello!</span><span></span>';
  let cur = hello.children[0], nxt = hello.children[1], gi = 0;
  const gEl = cur;
  gsap.set(nxt, { opacity: 0 });
  // Measure the real glyph ink of THIS greeting (its own script font) and fit it inside the greeting frame:
  // shrink only if needed, and centre the ink vertically so tall scripts (Nastaliq) are never clipped.
  const mctx = document.createElement('canvas').getContext('2d');
  const place = el => {
    const box = el.parentNode;
    el.style.fontSize = ''; el.style.translate = '';
    const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight) || fs * 1.2;
    const ink = size => {
      mctx.font = cs.fontWeight + ' ' + size + 'px ' + cs.fontFamily; mctx.direction = el.dir || 'ltr';
      const m = mctx.measureText(el.textContent);
      return { w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight, a: m.actualBoundingBoxAscent, d: m.actualBoundingBoxDescent, fa: m.fontBoundingBoxAscent, fd: m.fontBoundingBoxDescent };
    };
    let m = ink(fs);
    const k = Math.min(1, (box.clientWidth * 0.92) / m.w, (box.clientHeight * 1.2) / (m.a + m.d));
    let size = fs;
    if (k < 1) { size = fs * k; el.style.fontSize = size + 'px'; m = ink(size); }
    const L = lh * (size / fs), base = (L - (m.fa + m.fd)) / 2 + m.fa;      // baseline inside the line box
    el.style.translate = '0 ' + (L / 2 - (base - (m.a - m.d) / 2)).toFixed(1) + 'px';
  };
  // one continuous slide: the old greeting leaves left while the next enters from the right, never touching
  const swap = () => {
    if (!gFonts.done) return gsap.delayedCall(0.4, swap);
    gi = (gi + 1) % G.length; const g = G[gi];
    nxt.textContent = g[0]; nxt.lang = g[1]; nxt.dir = g[2] || 'ltr'; place(nxt);
    const s = (cur.offsetWidth + nxt.offsetWidth) / 2 + 90;
    gsap.set(nxt, { x: s, opacity: 0 });
    gsap.timeline({ onComplete: () => { [cur, nxt] = [nxt, cur]; gsap.delayedCall(2.4, swap); } })
      .to(cur, { x: -s, opacity: 0, duration: 0.85, ease: 'power2.inOut' }, 0)
      .to(nxt, { x: 0, opacity: 1, duration: 0.85, ease: 'power2.inOut' }, 0);
  };
  let live = false;
  let rz; addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => place(cur)); });
  function intro() {
    gsap.set(wrap, { opacity: 1 });
    place(cur);
    document.documentElement.classList.add('hero-ready');
    if (!reduce && !mob.matches) gsap.to(disc, { y: -10, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    if (!reduce) gsap.timeline({ defaults: { ease: 'power4.out' }, onComplete: () => { live = true; gsap.delayedCall(2.4, swap); } })
      .from(gEl, { yPercent: 80, opacity: 0, duration: 1.1 })
      .from('.hero-name', { y: 36, opacity: 0, duration: 1 }, '-=0.7')
      .from('.hero-sub', { y: 28, opacity: 0, duration: 0.9, stagger: 0.1 }, '-=0.8')
      .from(bgText, { opacity: 0, duration: 1.6 }, 0.2)
      .from(disc, { scale: 0.4, opacity: 0, duration: 1.5, ease: 'expo.out' }, 0.3)
      .from(img, { y: 90, opacity: 0, duration: 1.3 }, 0.5)
      .from('.pill-in', { scale: 0.2, opacity: 0, y: 30, duration: 0.9, ease: 'back.out(1.7)', stagger: 0.1 }, 1);
    else { live = true; }
  }

  const need = Promise.all([
    document.fonts.load('400 100px "Chakra Petch"').catch(() => {}),
    document.fonts.load('600 20px "Titillium Web"').catch(() => {}),
    document.fonts.load('700 20px "Titillium Web"').catch(() => {}),
    document.fonts.load('800 20px "Titillium Web"').catch(() => {}),
    img.decode ? img.decode().catch(() => {}) : Promise.resolve()
  ]);
  Promise.race([need, new Promise(r => setTimeout(r, 2500))]).then(() => { ScrollTrigger.refresh(); intro(); });

  // ---- pointer depth: each layer moves a different amount ----
  if (fine && !reduce) {
    const mk = (el, d) => ({ d, x: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 1, ease: 'power3' }) });
   const layers = [mk(fade, 10), mk(img, 18)];
    pills.forEach(p => { layers.push(mk(p.td, p.depth)); p.rot = gsap.quickTo(p.td, 'rotationY', { duration: 1, ease: 'power3' }); });
    addEventListener('pointermove', e => {
      if (!live || scrollY > innerHeight * 0.6) return;
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      layers.forEach(l => { l.x(clamp(nx * l.d * 2, -14, 14)); l.y(clamp(ny * l.d, -14, 14)); });
      pills.forEach(p => p.rot(p.ry + nx * 16));
    }, { passive: true });
  }

  // ---- About copy reveal ----
  if (!reduce) gsap.from('.about-content > *', { y: 40, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '#about', start: 'top 70%' } });

    const vids = [...document.querySelectorAll('.webdev-video')];
  if (vids.length && 'IntersectionObserver' in window) {
    const vo = new IntersectionObserver(es => es.forEach(en => en.isIntersecting ? en.target.play().catch(() => {}) : en.target.pause()), { threshold: 0.2 });
    vids.forEach(v => vo.observe(v));
  }
})();