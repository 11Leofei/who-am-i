const CONFIG = {
    STAR_COUNT: 500,
    CONNECTION_DIST: 130,
    CONNECTION_DIST_SQ: 130 * 130,
    BASE_SPEED: 0.2,
    WARP_SPEED_FACTOR: 28,
    PARTICLE_LIFE_DECAY: 0.018,
    PARTICLE_LIMIT: 80
};

const TWO_PI = Math.PI * 2;

class Starfield {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.stars = [];
        this.shootingStars = [];
        this.particles = [];
        this.propheticStar = null;
        this.baziFragments = [];
        this.mouse = { x: null, y: null };

        this.speed = 0.5;
        this._targetSpeed = 0.5;
        this._speedLerp = 0; // 0 = no interpolation active

        this.interactive = false;
        this.isMorphing = false;
        this.isDescending = false;

        this.onStarClick = null;
        this.animationId = null;

        // Nebulae & Aurora
        this.nebulae = [];
        this._nebulaGradients = []; // cached gradients
        this.auroraActive = false;
        this.auroraAlpha = 0;

        // Throttle mouse particles
        this._lastParticleTime = 0;

        // Mood system (real-time answer feedback)
        this._moodTarget = { density: 1, brightness: 1, nebulaIntensity: 1, colorTemp: 0 };
        this._moodCurrent = { density: 1, brightness: 1, nebulaIntensity: 1, colorTemp: 0 };

        this.init();
    }

    initStars() {
        this.stars = [];
        this.particles = [];
        for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
            const z = 0.5 + Math.random() * 2.5;
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                z: z,
                size: Math.random() * 0.8 * z,
                opacity: Math.random(),
                pulseSpeed: 0.008 + Math.random() * 0.025,
                color: this.getRandomStarColor()
            });
        }
        this.initNebulae();
    }

    initNebulae() {
        const colors = [
            { r: 80, g: 30, b: 160 },
            { r: 20, g: 40, b: 140 },
            { r: 100, g: 20, b: 40 },
            { r: 20, g: 80, b: 60 },
            { r: 60, g: 20, b: 100 }
        ];
        this.nebulae = colors.map(c => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            radius: 150 + Math.random() * 250,
            color: c,
            alpha: 0.01 + Math.random() * 0.005,
            phase: Math.random() * Math.PI * 2,
            driftX: (Math.random() - 0.5) * 0.15,
            driftY: (Math.random() - 0.5) * 0.1,
            pulseSpeed: 0.0003 + Math.random() * 0.0003
        }));
        this._rebuildNebulaGradients();
    }

    _rebuildNebulaGradients() {
        // Pre-build gradients; we update position each frame via transform instead of recreating
        this._nebulaGradients = this.nebulae.map(n => {
            const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, n.radius);
            grad.addColorStop(0, `rgba(${n.color.r}, ${n.color.g}, ${n.color.b}, ${n.alpha})`);
            grad.addColorStop(1, `rgba(${n.color.r}, ${n.color.g}, ${n.color.b}, 0)`);
            return grad;
        });
    }

    drawNebulae(time) {
        const ctx = this.ctx;
        for (let i = 0; i < this.nebulae.length; i++) {
            const n = this.nebulae[i];

            // Drift
            n.x += n.driftX;
            n.y += n.driftY;
            if (n.x < -n.radius) n.x = this.width + n.radius;
            if (n.x > this.width + n.radius) n.x = -n.radius;
            if (n.y < -n.radius) n.y = this.height + n.radius;
            if (n.y > this.height + n.radius) n.y = -n.radius;

            const scale = 1 + 0.15 * Math.sin(time * n.pulseSpeed * 1000 + n.phase);
            const r = n.radius * scale;

            ctx.save();
            ctx.translate(n.x, n.y);
            ctx.scale(scale, scale);
            ctx.globalAlpha = Math.min(1, this._moodCurrent.nebulaIntensity);
            ctx.fillStyle = this._nebulaGradients[i];
            ctx.beginPath();
            ctx.arc(0, 0, n.radius, 0, TWO_PI);
            ctx.fill();
            ctx.restore();
        }
    }

    // Dynamic mood system — driven by test answers in real-time
    setMood(params) {
        // params: { density, brightness, nebulaIntensity, colorTemp }
        // All values are multipliers around 1.0 (default)
        this._moodTarget = { ...this._moodTarget, ...params };
    }

    resetMood() {
        this._moodTarget = { density: 1, brightness: 1, nebulaIntensity: 1, colorTemp: 0 };
        this._moodCurrent = { density: 1, brightness: 1, nebulaIntensity: 1, colorTemp: 0 };
    }

    _applyMood() {
        const t = this._moodTarget;
        const c = this._moodCurrent;
        const lerpRate = 0.05;
        c.density += (t.density - c.density) * lerpRate;
        c.brightness += (t.brightness - c.brightness) * lerpRate;
        c.nebulaIntensity += (t.nebulaIntensity - c.nebulaIntensity) * lerpRate;
        c.colorTemp += (t.colorTemp - c.colorTemp) * lerpRate;
    }

    setAuroraMode(active) {
        this.auroraActive = active;
    }

    drawAurora(time) {
        const targetAlpha = this.auroraActive ? 1 : 0;
        this.auroraAlpha += (targetAlpha - this.auroraAlpha) * 0.02;
        if (this.auroraAlpha < 0.001) return;

        const t = time * 0.5;
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const colors = this._themeAurora || [
            [40, 200, 100],
            [60, 120, 220],
            [140, 80, 220]
        ];

        ctx.save();
        ctx.globalAlpha = this.auroraAlpha;

        for (let i = 0; i < 3; i++) {
            const c = colors[i];
            const yBase = h * (0.1 + i * 0.12);
            const amplitude = 30 + i * 15;
            const freq = 0.003 + i * 0.001;
            const bandWidth = 60 + i * 20;
            const tOff = 1.5 + i * 0.3;

            ctx.beginPath();
            ctx.moveTo(0, yBase);
            // Use larger step size for perf (8px instead of 4px)
            for (let x = 0; x <= w; x += 8) {
                const y = yBase + Math.sin(x * freq + t * tOff) * amplitude
                    + Math.sin(x * freq * 0.5 + t * 0.7) * amplitude * 0.5;
                ctx.lineTo(x, y);
            }
            for (let x = w; x >= 0; x -= 8) {
                const y = yBase + bandWidth + Math.sin(x * freq + t * tOff + 1) * amplitude * 0.3;
                ctx.lineTo(x, y);
            }
            ctx.closePath();

            const grad = ctx.createLinearGradient(0, yBase - amplitude, 0, yBase + bandWidth + amplitude);
            grad.addColorStop(0, `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0)`);
            grad.addColorStop(0.3, `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.015)`);
            grad.addColorStop(0.5, `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.02)`);
            grad.addColorStop(0.7, `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.015)`);
            grad.addColorStop(1, `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0)`);

            ctx.fillStyle = grad;
            ctx.fill();
        }

        ctx.restore();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.initStars();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        // Rebuild cached gradients for new canvas context state
        if (this.nebulae.length > 0) {
            this._rebuildNebulaGradients();
        }
    }

    getRandomStarColor() {
        const colors = [
            '255, 255, 255',
            '200, 220, 255',
            '255, 240, 210',
            '180, 200, 255',
            '255, 220, 180'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    start() {
        if (!this.animationId) {
            this.animate();
        }
        this._shootingInterval = setInterval(() => this.spawnShootingStar(), 1800);
    }

    spawnShootingStar() {
        if (Math.random() > 0.35) return;

        this.shootingStars.push({
            x: Math.random() * this.width,
            y: Math.random() * this.height * 0.4,
            len: Math.random() * 100 + 20,
            speed: Math.random() * 12 + 14,
            opacity: 1,
            angle: Math.PI / 4 + (Math.random() * 0.3 - 0.15)
        });
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        // Throttle particle spawn to ~30fps
        const now = performance.now();
        if (now - this._lastParticleTime < 33) return;
        this._lastParticleTime = now;

        if (this.particles.length < CONFIG.PARTICLE_LIMIT) {
            this.particles.push({
                x: this.mouse.x,
                y: this.mouse.y,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                size: Math.random() * 1.5,
                life: 1.0,
                color: '180, 210, 255'
            });
        }
    }

    handleClick(e) {
        if (!this.interactive) return;
        const rect = this.canvas.getBoundingClientRect();
        if (this.onStarClick) {
            this.onStarClick({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    }

    animate() {
        const time = performance.now() * 0.001;
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Frame-based speed interpolation
        if (this._speedLerp > 0) {
            this.speed += (this._targetSpeed - this.speed) * this._speedLerp;
            if (Math.abs(this.speed - this._targetSpeed) < 0.01) {
                this.speed = this._targetSpeed;
                this._speedLerp = 0;
            }
        }

        // Lerp mood values
        this._applyMood();

        // Clear with background color (no alpha trail — use explicit clear for sharper rendering)
        // Apply color temperature to background tint
        const ct = this._moodCurrent.colorTemp;
        const bgR = 5 + Math.round(ct * -8);   // T (negative ct) → bluer
        const bgG = 5;
        const bgB = 16 + Math.round(ct * 8);   // F (positive ct) → warmer purple
        ctx.fillStyle = `rgb(${Math.max(2, bgR)}, ${bgG}, ${Math.min(30, bgB)})`;
        ctx.fillRect(0, 0, w, h);

        // 0. Nebulae & Aurora (drawn behind everything)
        this.drawNebulae(time);
        this.drawAurora(time);

        // 1. Particles (swap-and-pop removal)
        let pCount = this.particles.length;
        for (let i = 0; i < pCount; i++) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= CONFIG.PARTICLE_LIFE_DECAY;

            if (p.life <= 0) {
                this.particles[i] = this.particles[pCount - 1];
                this.particles.pop();
                pCount--;
                i--;
                continue;
            }

            ctx.beginPath();
            ctx.fillStyle = `rgba(${p.color}, ${p.life * 0.4})`;
            ctx.arc(p.x, p.y, p.size, 0, TWO_PI);
            ctx.fill();
        }

        // Constellation lines
        if (this.interactive && this.mouse.x) {
            this.drawConstellations();
        }

        // 2. Stars — batched rendering
        const isWarping = this.speed > 2;
        const stars = this.stars;
        const starCount = stars.length;

        if (isWarping) {
            // Warp mode: draw individual lines (can't easily batch different colors)
            for (let i = 0; i < starCount; i++) {
                const star = stars[i];
                star.y -= this.speed * star.z;
                if (star.y < -10) {
                    star.y = h + 10;
                    star.x = Math.random() * w;
                }

                star.opacity += star.pulseSpeed;
                if (star.opacity > 1 || star.opacity < 0.15) star.pulseSpeed = -star.pulseSpeed;
                const alpha = star.opacity > 1 ? 1 : (star.opacity < 0 ? 0 : star.opacity);

                const tailLen = this.speed * star.z * 3.5;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${star.color}, ${alpha})`;
                ctx.lineWidth = star.size * 0.8;
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(star.x, star.y + tailLen);
                ctx.stroke();
            }
        } else {
            // Normal mode: batch stars by color for fewer state changes
            // Group stars by color string
            const colorGroups = {};
            for (let i = 0; i < starCount; i++) {
                const star = stars[i];

                if (!this.isMorphing && !this.isDescending) {
                    star.y -= this.speed * star.z;
                    if (star.y < -10) {
                        star.y = h + 10;
                        star.x = Math.random() * w;
                    }
                } else if (this.isMorphing) {
                    star.x += (star.targetX - star.x) * 0.04;
                    star.y += (star.targetY - star.y) * 0.04;
                }

                star.opacity += star.pulseSpeed;
                if (star.opacity > 1 || star.opacity < 0.15) star.pulseSpeed = -star.pulseSpeed;

                // Apply mood brightness & density to star visibility
                let rawAlpha = star.opacity > 1 ? 1 : (star.opacity < 0 ? 0 : star.opacity);
                rawAlpha *= this._moodCurrent.brightness;
                // Density: lower density fades out dimmer stars
                if (rawAlpha < (1 - this._moodCurrent.density) * 0.5) rawAlpha = 0;
                rawAlpha = Math.min(1, Math.max(0, rawAlpha));
                // Quantize alpha to reduce unique fill styles (10 levels)
                const qAlpha = (Math.round(rawAlpha * 10) / 10).toFixed(1);
                const key = `${star.color}, ${qAlpha}`;

                if (!colorGroups[key]) colorGroups[key] = [];
                colorGroups[key].push(star);
            }

            // Draw each group in a single path
            const keys = Object.keys(colorGroups);
            for (let k = 0; k < keys.length; k++) {
                const group = colorGroups[keys[k]];
                ctx.fillStyle = `rgba(${keys[k]})`;
                ctx.beginPath();
                for (let j = 0; j < group.length; j++) {
                    const s = group[j];
                    ctx.moveTo(s.x + s.size, s.y);
                    ctx.arc(s.x, s.y, s.size, 0, TWO_PI);
                }
                ctx.fill();
            }
        }

        // 3. Prophetic Star descent
        if (this.isDescending) {
            this.updateAndDrawDescent(time);
        }

        // 4. Shooting Stars
        this.updateAndDrawShootingStars();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    morphToRealSky(starPositions) {
        this.isMorphing = true;
        this.speed = 0;
        this._speedLerp = 0;

        this.stars.forEach((star, i) => {
            if (starPositions[i]) {
                star.targetX = starPositions[i].x * this.width;
                star.targetY = starPositions[i].y * this.height;
            } else {
                star.targetX = star.x;
                star.targetY = -100;
            }
        });

        setTimeout(() => { this.isMorphing = false; }, 3000);
    }

    startPropheticDescent(baziTexts) {
        this.isDescending = true;
        this.interactive = false;

        this.propheticStar = this.stars.reduce((prev, curr) => {
            const prevDist = Math.abs(prev.x - this.width / 2) + Math.abs(prev.y - this.height / 2);
            const currDist = Math.abs(curr.x - this.width / 2) + Math.abs(curr.y - this.height / 2);
            return currDist < prevDist ? curr : prev;
        });

        this.baziFragments = baziTexts.map((text, i) => ({
            text,
            y: -80 - (i * 180),
            x: this.width / 2 + (Math.random() * 300 - 150),
            speed: 3.5 + Math.random() * 2,
            opacity: 0
        }));
    }

    updateAndDrawDescent(time) {
        if (!this.propheticStar) return;
        const ctx = this.ctx;

        this.propheticStar.size += 0.6;
        this.propheticStar.opacity = 1;

        this.propheticStar.x += (this.width / 2 - this.propheticStar.x) * 0.02;
        this.propheticStar.y += (this.height / 2 - this.propheticStar.y) * 0.02;

        const cx = this.propheticStar.x;
        const cy = this.propheticStar.y;
        const r = this.propheticStar.size;

        // God Rays
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(time * 0.08);
        const rayCount = 16;
        for (let i = 0; i < rayCount; i++) {
            ctx.rotate(TWO_PI / rayCount);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            const rayLen = r * (2.5 + Math.sin(time * 1.5 + i) * 0.8);
            ctx.lineTo(0, rayLen);
            ctx.lineWidth = 1.5;
            const a = 0.08 + Math.sin(time + i * 0.5) * 0.04;
            ctx.strokeStyle = `rgba(180, 220, 255, ${a})`;
            ctx.stroke();
        }
        ctx.restore();

        // Halo Glow
        const gradient = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r * 2.5);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        gradient.addColorStop(0.1, 'rgba(200, 240, 255, 0.5)');
        gradient.addColorStop(0.4, 'rgba(100, 150, 255, 0.15)');
        gradient.addColorStop(1, 'rgba(50, 100, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 2.5, 0, TWO_PI);
        ctx.fill();

        // Corona rings
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-time * 0.4);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 18]);
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.8, 0, TWO_PI);
        ctx.stroke();

        ctx.rotate(time * 1.0);
        ctx.strokeStyle = 'rgba(200, 220, 255, 0.2)';
        ctx.setLineDash([4, 12]);
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.2, 0, TWO_PI);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // White core
        ctx.save();
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.35, 0, TWO_PI);
        ctx.shadowBlur = 25;
        ctx.shadowColor = "white";
        ctx.fill();
        ctx.restore();

        // Anamorphic flare
        const flareAlpha = Math.min(0.5, r / 180);
        ctx.fillStyle = `rgba(200, 230, 255, ${flareAlpha})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 5, r * 0.04, 0, 0, TWO_PI);
        ctx.fill();

        // Bazi Fragments
        ctx.save();
        ctx.font = `400 1.3rem 'Noto Serif SC', serif`;
        ctx.textAlign = 'center';

        const fragments = this.baziFragments;
        for (let i = 0; i < fragments.length; i++) {
            const f = fragments[i];
            f.y += f.speed;
            if (f.y > 0 && f.y < this.height) {
                f.opacity = Math.min(1, f.opacity + 0.04);
            } else if (f.y > this.height) {
                f.opacity = Math.max(0, f.opacity - 0.04);
            }

            ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity * 0.9})`;
            ctx.fillText(f.text, f.x, f.y);
        }
        ctx.restore();
    }

    drawConstellations() {
        const ctx = this.ctx;
        const mx = this.mouse.x;
        const my = this.mouse.y;
        const distSq = CONFIG.CONNECTION_DIST_SQ;

        ctx.strokeStyle = 'rgba(140, 180, 255, 0.12)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();

        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            const dx = mx - star.x;
            const dy = my - star.y;
            if (dx * dx + dy * dy < distSq) {
                ctx.moveTo(mx, my);
                ctx.lineTo(star.x, star.y);
            }
        }

        ctx.stroke();
    }

    updateAndDrawShootingStars() {
        const ctx = this.ctx;
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const s = this.shootingStars[i];

            s.x -= s.speed * Math.cos(s.angle);
            s.y += s.speed * Math.sin(s.angle);
            s.opacity -= 0.015;

            if (s.opacity <= 0 || s.x < -50 || s.y > this.height + 50) {
                this.shootingStars.splice(i, 1);
                continue;
            }

            // Glow trail
            ctx.beginPath();
            ctx.strokeStyle = `rgba(200, 220, 255, ${s.opacity * 0.3})`;
            ctx.lineWidth = 4;
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x + s.len * 0.3 * Math.cos(s.angle), s.y - s.len * 0.3 * Math.sin(s.angle));
            ctx.stroke();

            // Core trail
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity})`;
            ctx.lineWidth = 1.5;
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x + s.len * Math.cos(s.angle), s.y - s.len * Math.sin(s.angle));
            ctx.stroke();
        }
    }

    warpSpeed() {
        this._targetSpeed = CONFIG.WARP_SPEED_FACTOR;
        this._speedLerp = 0.05; // smooth ramp up
    }

    steadySpeed() {
        this._targetSpeed = 0.3;
        this._speedLerp = 0.08; // slightly faster ramp down
    }

    activateInteraction() {
        this.interactive = true;
        this.canvas.style.cursor = 'crosshair';
    }

    zoomIn(targetStar) {
        this.interactive = false;
        this.canvas.style.cursor = 'default';
        this.mouse.x = null;

        let flashOpacity = 0;
        const flash = setInterval(() => {
            flashOpacity += 0.03;
            this.ctx.fillStyle = `rgba(255,255,255,${Math.min(flashOpacity, 0.15)})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }, 20);

        setTimeout(() => clearInterval(flash), 600);
    }

    setResultsMode(themeColors) {
        this._targetSpeed = 0.08;
        this._speedLerp = 0.05;
        const starTint = themeColors?.star || '200, 160, 255';
        const starTint2 = themeColors?.primary || '160, 180, 255';
        const stars = this.stars;
        for (let i = 0; i < stars.length; i++) {
            if (Math.random() > 0.55) {
                stars[i].color = starTint;
            } else if (Math.random() > 0.5) {
                stars[i].color = starTint2;
            }
        }
        if (themeColors?.aurora) {
            this._themeAurora = themeColors.aurora;
        }
        if (this._shootingInterval) {
            clearInterval(this._shootingInterval);
        }
        this._shootingInterval = setInterval(() => this.spawnShootingStar(), 5000);
        this.setAuroraMode(true);
    }

    reset() {
        this.speed = 0.5;
        this._targetSpeed = 0.5;
        this._speedLerp = 0;
        this.interactive = false;
        this.isMorphing = false;
        this.isDescending = false;
        this.propheticStar = null;
        this.baziFragments = [];
        this._themeAurora = null;
        this.canvas.style.cursor = 'default';
        this.shootingStars = [];
        this.setAuroraMode(false);
        this.resetMood();
        if (this._shootingInterval) {
            clearInterval(this._shootingInterval);
        }
        this.initStars();
        this._shootingInterval = setInterval(() => this.spawnShootingStar(), 1800);
    }
}
