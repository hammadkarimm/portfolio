/* DotField: vanilla JS port of the React Bits <DotField /> component
   https://reactbits.dev/backgrounds/dot-field */
(function () {
    const TWO_PI = Math.PI * 2;

    function DotField(container, options) {
        const p = Object.assign({
            dotRadius: 1.5,
            dotSpacing: 14,
            cursorRadius: 500,
            cursorForce: 0.1,
            bulgeOnly: true,
            bulgeStrength: 67,
            glowRadius: 160,
            sparkle: false,
            waveAmplitude: 0,
            gradientFrom: 'rgba(168, 85, 247, 0.35)',
            gradientTo: 'rgba(180, 151, 207, 0.25)',
            glowColor: '#120F17'
        }, options || {});

        const NS = 'http://www.w3.org/2000/svg';
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
        const svg = document.createElementNS(NS, 'svg');
        svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';

        const glowId = 'dot-field-glow-' + Math.random().toString(36).slice(2, 9);
        const defs = document.createElementNS(NS, 'defs');
        const grad = document.createElementNS(NS, 'radialGradient');
        grad.setAttribute('id', glowId);
        const s1 = document.createElementNS(NS, 'stop');
        s1.setAttribute('offset', '0%');
        s1.setAttribute('stop-color', p.glowColor);
        const s2 = document.createElementNS(NS, 'stop');
        s2.setAttribute('offset', '100%');
        s2.setAttribute('stop-color', 'transparent');
        grad.append(s1, s2);
        defs.appendChild(grad);

        const glowEl = document.createElementNS(NS, 'circle');
        glowEl.setAttribute('cx', '-9999');
        glowEl.setAttribute('cy', '-9999');
        glowEl.setAttribute('r', p.glowRadius);
        glowEl.setAttribute('fill', 'url(#' + glowId + ')');
        glowEl.style.opacity = 0;
        glowEl.style.willChange = 'opacity';

        svg.append(defs, glowEl);
        container.append(canvas, svg);

        const ctx = canvas.getContext('2d', { alpha: true });
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
        let dots = [];
        let size = { w: 0, h: 0 };
        let glowOpacity = 0;
        let engagement = 0;
        let frameCount = 0;
        let raf = null;
        let visible = true;
        let resizeTimer;

        function buildDots(w, h) {
                        const step = p.dotRadius + p.dotSpacing;
            const cols = Math.ceil(w / step) + 1;
            const rows = Math.ceil(h / step) + 1;
            const padX = 0;
            const padY = 0;
            dots = new Array(rows * cols);
            let idx = 0;
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                                        const ax = padX + col * step;
                    const ay = padY + row * step;
                    dots[idx++] = { ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay };
                }
            }
        }

        function doResize() {
            const rect = container.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            size = { w, h };
            buildDots(w, h);
        }

        function onResize() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(doResize, 100);
        }

        function onMouseMove(e) {
            const rect = container.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        }

        const speedInterval = setInterval(function () {
            const dx = mouse.prevX - mouse.x;
            const dy = mouse.prevY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            mouse.speed += (dist - mouse.speed) * 0.5;
            if (mouse.speed < 0.001) mouse.speed = 0;
            mouse.prevX = mouse.x;
            mouse.prevY = mouse.y;
        }, 20);

        function tick() {
            raf = requestAnimationFrame(tick);
            if (!visible) return;

            frameCount++;
            const w = size.w, h = size.h;
            const len = dots.length;
            const t = frameCount * 0.02;

            const targetEngagement = Math.min(mouse.speed / 5, 1);
            engagement += (targetEngagement - engagement) * 0.06;
            if (engagement < 0.001) engagement = 0;
            const eng = engagement;

            glowOpacity += (eng - glowOpacity) * 0.08;
            glowEl.setAttribute('cx', mouse.x);
            glowEl.setAttribute('cy', mouse.y);
            glowEl.style.opacity = glowOpacity;

            ctx.clearRect(0, 0, w, h);
            const g = ctx.createLinearGradient(0, 0, w, h);
            g.addColorStop(0, p.gradientFrom);
            g.addColorStop(1, p.gradientTo);
            ctx.fillStyle = g;

            const cr = p.cursorRadius;
            const crSq = cr * cr;
            const rad = p.dotRadius / 2;
            const isBulge = p.bulgeOnly;

            ctx.beginPath();
            for (let i = 0; i < len; i++) {
                const d = dots[i];
                const dx = mouse.x - d.ax;
                const dy = mouse.y - d.ay;
                const distSq = dx * dx + dy * dy;

                if (distSq < crSq && eng > 0.01) {
                    const dist = Math.sqrt(distSq);
                    if (isBulge) {
                        const k = 1 - dist / cr;
                        const push = k * k * p.bulgeStrength * eng;
                        const angle = Math.atan2(dy, dx);
                        d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
                        d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
                    } else {
                        const angle = Math.atan2(dy, dx);
                        const move = (500 / dist) * (mouse.speed * p.cursorForce);
                        d.vx += Math.cos(angle) * -move;
                        d.vy += Math.sin(angle) * -move;
                    }
                } else if (isBulge) {
                    d.sx += (d.ax - d.sx) * 0.1;
                    d.sy += (d.ay - d.sy) * 0.1;
                }

                if (!isBulge) {
                    d.vx *= 0.9;
                    d.vy *= 0.9;
                    d.x = d.ax + d.vx;
                    d.y = d.ay + d.vy;
                    d.sx += (d.x - d.sx) * 0.1;
                    d.sy += (d.y - d.sy) * 0.1;
                }

                let drawX = d.sx;
                let drawY = d.sy;
                if (p.waveAmplitude > 0) {
                    drawY += Math.sin(d.ax * 0.03 + t) * p.waveAmplitude;
                    drawX += Math.cos(d.ay * 0.03 + t * 0.7) * p.waveAmplitude * 0.5;
                }

                let r = rad;
                if (p.sparkle) {
                    const hash = ((i * 2654435761) ^ (frameCount >> 3)) >>> 0;
                    if ((hash % 100) < 3) r = rad * 1.8;
                }
                ctx.moveTo(drawX + r, drawY);
                ctx.arc(drawX, drawY, r, 0, TWO_PI);
            }
            ctx.fill();
        }

        doResize();
        window.addEventListener('resize', onResize);
        window.addEventListener('mousemove', onMouseMove, { passive: true });

        // Pause rendering while the hero is off-screen
        const io = new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
        });
        io.observe(container);

        raf = requestAnimationFrame(tick);

        return {
            destroy: function () {
                cancelAnimationFrame(raf);
                clearInterval(speedInterval);
                clearTimeout(resizeTimer);
                window.removeEventListener('resize', onResize);
                window.removeEventListener('mousemove', onMouseMove);
                io.disconnect();
                container.innerHTML = '';
            }
        };
    }

    window.DotField = DotField;

    // ===== Auto-init on the hero background =====
    document.addEventListener('DOMContentLoaded', function () {
        const el = document.getElementById('heroDotField');
        if (!el) return;
        DotField(el, {
            dotRadius: 3,
            dotSpacing: 20,
            bulgeStrength: 90,
            glowRadius: 260,
            sparkle: false,
            waveAmplitude: 0,
            cursorRadius: 400,
            cursorForce: 0.21,
            // Colors matched to your yellow accent (#f1ff0a) on black
            gradientFrom: 'rgba(241, 255, 10, 0.45)',
            gradientTo: 'rgba(248, 255, 112, 0.30)',
            glowColor: '#000000'
        });
    });
})();
