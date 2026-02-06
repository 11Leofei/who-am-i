const CONFIG = {
    STAR_COUNT: 500,
    CONNECTION_DIST: 130,
    BASE_SPEED: 0.2,
    WARP_SPEED_FACTOR: 28,
    PARTICLE_LIFE_DECAY: 0.018,
    PARTICLE_LIMIT: 80
};

const TWO_PI = Math.PI * 2;

class Starfield {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.stars = [];
        this.shootingStars = [];
        this.particles = [];
        this.propheticStar = null;
        this.baziFragments = [];
        this.mouse = { x: null, y: null };

        this.speed = 0.5;

        this.interactive = false;
        this.isMorphing = false;
        this.isDescending = false;

        this.onStarClick = null;
        this.animationId = null;

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
        // Dark trail effect for smoother motion blur
        this.ctx.fillStyle = 'rgba(5, 5, 16, 0.15)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 1. Particles
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

            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(${p.color}, ${p.life * 0.4})`;
            this.ctx.arc(p.x, p.y, p.size, 0, TWO_PI);
            this.ctx.fill();
        }

        // Constellation lines
        if (this.interactive && this.mouse.x) {
            this.drawConstellations();
        }

        // 2. Stars
        const isWarping = this.speed > 2;

        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];

            if (!this.isMorphing && !this.isDescending) {
                star.y -= this.speed * star.z;
                if (star.y < -10) {
                    star.y = this.height + 10;
                    star.x = Math.random() * this.width;
                }
            } else if (this.isMorphing) {
                star.x += (star.targetX - star.x) * 0.04;
                star.y += (star.targetY - star.y) * 0.04;
            }

            star.opacity += star.pulseSpeed;
            if (star.opacity > 1 || star.opacity < 0.15) star.pulseSpeed = -star.pulseSpeed;

            const alpha = Math.max(0, Math.min(1, star.opacity));

            if (isWarping) {
                const tailLen = this.speed * star.z * 3.5;
                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(${star.color}, ${alpha})`;
                this.ctx.lineWidth = star.size * 0.8;
                this.ctx.moveTo(star.x, star.y);
                this.ctx.lineTo(star.x, star.y + tailLen);
                this.ctx.stroke();
            } else {
                this.ctx.beginPath();
                this.ctx.fillStyle = `rgba(${star.color}, ${alpha})`;
                this.ctx.arc(star.x, star.y, star.size, 0, TWO_PI);
                this.ctx.fill();
            }
        }

        // 3. Prophetic Star descent
        if (this.isDescending) {
            this.updateAndDrawDescent();
        }

        // 4. Shooting Stars
        this.updateAndDrawShootingStars();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    morphToRealSky(starPositions) {
        this.isMorphing = true;
        this.speed = 0;

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

        // Pick star closest to center
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

    updateAndDrawDescent() {
        if (!this.propheticStar) return;

        this.propheticStar.size += 0.6;
        this.propheticStar.opacity = 1;

        this.propheticStar.x += (this.width / 2 - this.propheticStar.x) * 0.02;
        this.propheticStar.y += (this.height / 2 - this.propheticStar.y) * 0.02;

        const cx = this.propheticStar.x;
        const cy = this.propheticStar.y;
        const r = this.propheticStar.size;
        const time = Date.now() * 0.001;

        // God Rays
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(time * 0.08);
        const rayCount = 16;
        for (let i = 0; i < rayCount; i++) {
            this.ctx.rotate(TWO_PI / rayCount);
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            const rayLen = r * (2.5 + Math.sin(time * 1.5 + i) * 0.8);
            this.ctx.lineTo(0, rayLen);
            this.ctx.lineWidth = 1.5;
            const a = 0.08 + Math.sin(time + i * 0.5) * 0.04;
            this.ctx.strokeStyle = `rgba(180, 220, 255, ${a})`;
            this.ctx.stroke();
        }
        this.ctx.restore();

        // Halo Glow
        const gradient = this.ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r * 2.5);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        gradient.addColorStop(0.1, 'rgba(200, 240, 255, 0.5)');
        gradient.addColorStop(0.4, 'rgba(100, 150, 255, 0.15)');
        gradient.addColorStop(1, 'rgba(50, 100, 255, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r * 2.5, 0, TWO_PI);
        this.ctx.fill();

        // Corona rings
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(-time * 0.4);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([8, 18]);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, r * 0.8, 0, TWO_PI);
        this.ctx.stroke();

        this.ctx.rotate(time * 1.0);
        this.ctx.strokeStyle = 'rgba(200, 220, 255, 0.2)';
        this.ctx.setLineDash([4, 12]);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, r * 1.2, 0, TWO_PI);
        this.ctx.stroke();
        this.ctx.restore();

        // White core
        this.ctx.save();
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r * 0.35, 0, TWO_PI);
        this.ctx.shadowBlur = 25;
        this.ctx.shadowColor = "white";
        this.ctx.fill();
        this.ctx.restore();

        // Anamorphic flare
        const flareAlpha = Math.min(0.5, r / 180);
        this.ctx.fillStyle = `rgba(200, 230, 255, ${flareAlpha})`;
        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy, r * 5, r * 0.04, 0, 0, TWO_PI);
        this.ctx.fill();

        // Bazi Fragments
        this.ctx.save();
        this.ctx.font = `400 1.3rem 'Noto Serif SC', serif`;
        this.ctx.textAlign = 'center';

        this.baziFragments.forEach(f => {
            f.y += f.speed;
            if (f.y > 0 && f.y < this.height) {
                f.opacity = Math.min(1, f.opacity + 0.04);
            } else if (f.y > this.height) {
                f.opacity = Math.max(0, f.opacity - 0.04);
            }

            this.ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity * 0.9})`;
            this.ctx.fillText(f.text, f.x, f.y);
        });
        this.ctx.restore();
    }

    drawConstellations() {
        this.ctx.strokeStyle = 'rgba(140, 180, 255, 0.12)';
        this.ctx.lineWidth = 0.5;

        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            const dx = this.mouse.x - star.x;
            const dy = this.mouse.y - star.y;
            const dist = dx * dx + dy * dy;

            if (dist < CONFIG.CONNECTION_DIST * CONFIG.CONNECTION_DIST) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.mouse.x, this.mouse.y);
                this.ctx.lineTo(star.x, star.y);
                this.ctx.stroke();
            }
        }
    }

    updateAndDrawShootingStars() {
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
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(200, 220, 255, ${s.opacity * 0.3})`;
            this.ctx.lineWidth = 4;
            this.ctx.moveTo(s.x, s.y);
            this.ctx.lineTo(s.x + s.len * 0.3 * Math.cos(s.angle), s.y - s.len * 0.3 * Math.sin(s.angle));
            this.ctx.stroke();

            // Core trail
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity})`;
            this.ctx.lineWidth = 1.5;
            this.ctx.moveTo(s.x, s.y);
            this.ctx.lineTo(s.x + s.len * Math.cos(s.angle), s.y - s.len * Math.sin(s.angle));
            this.ctx.stroke();
        }
    }

    warpSpeed() {
        let accel = 0;
        const rampUp = setInterval(() => {
            accel += 0.5;
            this.speed = CONFIG.BASE_SPEED + accel;
            if (this.speed > CONFIG.WARP_SPEED_FACTOR) clearInterval(rampUp);
        }, 50);
    }

    steadySpeed() {
        const target = 0.3;
        const rampDown = setInterval(() => {
            this.speed *= 0.9;
            if (this.speed <= target) {
                this.speed = target;
                clearInterval(rampDown);
            }
        }, 50);
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

    setResultsMode() {
        this.speed = 0.08;
        this.stars.forEach(star => {
            if (Math.random() > 0.55) {
                star.color = '200, 160, 255';
            } else if (Math.random() > 0.5) {
                star.color = '160, 180, 255';
            }
        });
        if (this._shootingInterval) {
            clearInterval(this._shootingInterval);
        }
        this._shootingInterval = setInterval(() => this.spawnShootingStar(), 5000);
    }

    reset() {
        this.speed = 0.5;
        this.interactive = false;
        this.isMorphing = false;
        this.isDescending = false;
        this.propheticStar = null;
        this.baziFragments = [];
        this.canvas.style.cursor = 'default';
        this.shootingStars = [];
        if (this._shootingInterval) {
            clearInterval(this._shootingInterval);
        }
        this.initStars();
        this._shootingInterval = setInterval(() => this.spawnShootingStar(), 1800);
    }
}
