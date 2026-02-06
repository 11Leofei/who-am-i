const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const NEBULA_COLORS = {
    '木': '#0a1a0d',
    '火': '#1a0d0a',
    '土': '#1a1a0a',
    '金': '#14141e',
    '水': '#0a0d1a'
};

const ELEMENT_IDS = {
    '木': { bar: 'bar-wood', count: 'count-wood' },
    '火': { bar: 'bar-fire', count: 'count-fire' },
    '土': { bar: 'bar-earth', count: 'count-earth' },
    '金': { bar: 'bar-metal', count: 'count-metal' },
    '水': { bar: 'bar-water', count: 'count-water' }
};

const ARCHIVE_KEY = 'stardust_archive';

class App {
    constructor() {
        this.starfield = new Starfield('starfield');
        this.baziCalc = new BaziCalculator();
        this.personalityTest = new PersonalityTest();
        this.testAnswers = new Array(50).fill(null);
        this.testCurrentQ = 0;
        this.ui = {
            enterBtn: document.getElementById('enter-btn'),
            summonBtn: document.getElementById('summon-btn'),
            saveBtn: document.getElementById('save-btn'),
            resetBtn: document.getElementById('reset-btn'),
            archiveBtn: document.getElementById('archive-btn'),
            archiveCount: document.getElementById('archive-count'),
            archiveOverlay: document.getElementById('archive-overlay'),
            archiveGrid: document.getElementById('archive-grid'),
            archiveClose: document.getElementById('archive-close'),
            entranceSection: document.getElementById('entrance'),
            ritualSection: document.getElementById('ritual'),
            cosmosSection: document.getElementById('cosmos'),
            identitySection: document.getElementById('identity'),
            identityName: document.getElementById('identity-name'),
            identityDesc: document.getElementById('identity-desc'),
            zodiacDesc: document.getElementById('zodiac-desc'),
            wuxingInsight: document.getElementById('wuxing-insight'),
            zodiacTag: document.getElementById('zodiac-tag'),
            yinyangTag: document.getElementById('yinyang-tag'),
            cityTag: document.getElementById('city-tag'),
            elementOrb: document.getElementById('element-orb'),
            elementSymbol: document.getElementById('element-symbol'),
            identityCard: document.getElementById('identity-card'),
            pillarYear: document.getElementById('pillar-year'),
            pillarMonth: document.getElementById('pillar-month'),
            pillarDay: document.getElementById('pillar-day'),
            pillarHour: document.getElementById('pillar-hour'),
            // Analyzing interlude
            testAnalyzingSection: document.getElementById('test-analyzing'),
            // Personality test
            testEnterBtn: document.getElementById('test-enter-btn'),
            startTestBtn: document.getElementById('start-test-btn'),
            testIntroSection: document.getElementById('test-intro'),
            testQuestionsSection: document.getElementById('test-questions'),
            testResultsSection: document.getElementById('test-results'),
            testProgressBar: document.getElementById('test-progress-bar'),
            testProgressText: document.getElementById('test-progress-text'),
            questionText: document.getElementById('question-text'),
            questionNumber: document.getElementById('question-number'),
            testPrevBtn: document.getElementById('test-prev-btn'),
            saveTestBtn: document.getElementById('save-test-btn'),
            retestBtn: document.getElementById('retest-btn'),
            homeBtn: document.getElementById('home-btn'),
            mbtiType: document.getElementById('mbti-type'),
            mbtiCosmicName: document.getElementById('mbti-cosmic-name'),
            mbtiTitle: document.getElementById('mbti-title'),
            mbtiKeywords: document.getElementById('mbti-keywords'),
            mbtiDesc: document.getElementById('mbti-desc'),
            mbtiDimensions: document.getElementById('mbti-dimensions'),
            mbtiStrengths: document.getElementById('mbti-strengths'),
            mbtiGrowth: document.getElementById('mbti-growth'),
            big5Chart: document.getElementById('big5-chart'),
            big5Details: document.getElementById('big5-details'),
            enneagramType: document.getElementById('enneagram-type'),
            enneagramCosmicName: document.getElementById('enneagram-cosmic-name'),
            enneagramWing: document.getElementById('enneagram-wing'),
            enneagramKeywords: document.getElementById('enneagram-keywords'),
            enneagramCore: document.getElementById('enneagram-core'),
            enneagramFear: document.getElementById('enneagram-fear'),
            enneagramDesc: document.getElementById('enneagram-desc'),
            combinedAnalysis: document.getElementById('combined-analysis'),
            testResultsCard: document.getElementById('test-results-card'),
        };

        this.init();
    }

    init() {
        this.starfield.start();

        this.ui.enterBtn.addEventListener('click', () => this.enterRitual());
        this.ui.summonBtn.addEventListener('click', () => this.enterCosmos());
        this.ui.saveBtn.addEventListener('click', () => this.saveIdentityCard());
        this.ui.resetBtn.addEventListener('click', () => this.reset());
        this.ui.archiveBtn.addEventListener('click', () => this.showArchive());
        this.ui.archiveClose.addEventListener('click', () => this.hideArchive());

        // Personality test listeners
        this.ui.testEnterBtn.addEventListener('click', () => this.enterTestIntro());
        this.ui.startTestBtn.addEventListener('click', () => this.startTest());
        this.ui.testPrevBtn.addEventListener('click', () => this.prevQuestion());
        this.ui.saveTestBtn.addEventListener('click', () => this.saveTestCard());
        this.ui.retestBtn.addEventListener('click', () => this.retakeTest());
        this.ui.homeBtn.addEventListener('click', () => this.goHome());

        document.querySelectorAll('.scale-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const value = parseInt(btn.dataset.value, 10);
                this.selectAnswer(value);
            });
        });

        this.starfield.onStarClick = (starData) => this.revealIdentity(starData);

        // 3D tilt + holographic angle on identity card
        const card = this.ui.identityCard;
        if (card) {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rotateY = ((x / rect.width) - 0.5) * 16;
                const rotateX = ((y / rect.height) - 0.5) * -16;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

                // Holographic shimmer angle
                const angle = Math.atan2(y - rect.height / 2, x - rect.width / 2) * 180 / Math.PI + 180;
                card.style.setProperty('--holo-angle', angle + 'deg');
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
            });
        }

        this.initMagneticButtons();
        this.updateArchiveCount();
    }

    initMagneticButtons() {
        document.querySelectorAll('.glass-btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }

    // ==================== FLOW ====================

    async enterRitual() {
        this.ui.entranceSection.classList.remove('active');
        await wait(800);
        this.ui.entranceSection.classList.add('hidden');
        this.ui.ritualSection.classList.remove('hidden');
        void this.ui.ritualSection.offsetWidth;
        this.ui.ritualSection.classList.add('active');
    }

    async enterCosmos() {
        const dateStr = document.getElementById('birth-date').value;
        const city = document.getElementById('birth-city').value;
        const hourStr = document.getElementById('birth-hour').value;

        if (!dateStr || !city) {
            alert("请至少填写诞生日和降临之地");
            return;
        }

        this.city = city;
        this.dateStr = dateStr;
        this.hourStr = hourStr;

        const [y, m, d] = dateStr.split('-').map(Number);
        const hour = hourStr !== '' ? parseInt(hourStr, 10) : 12;

        const bazi = this.baziCalc.calculate(y, m, d, hour);
        this.currentBazi = bazi;

        const fragments = this.baziCalc.generateFragments(bazi);

        this.applyElementTheme(bazi.theme);

        // Fade out ritual
        this.ui.ritualSection.classList.remove('active');
        await wait(800);
        this.ui.ritualSection.classList.add('hidden');

        // Show HUD
        this.ui.cosmosSection.classList.remove('hidden');
        void this.ui.cosmosSection.offsetWidth;
        this.ui.cosmosSection.classList.add('active');

        // Phase 1: Warp
        this.starfield.warpSpeed();
        document.body.classList.add('rgb-shift');

        await wait(2000);

        document.body.classList.remove('rgb-shift');
        this.starfield.steadySpeed();

        // Phase 2: Morph
        const mockPositions = this.generateMockStarPositions();
        this.starfield.morphToRealSky(mockPositions);

        await wait(3000);

        // Phase 3: Descent
        this.starfield.startPropheticDescent(fragments);

        await wait(8000);
        this.completeDescentAndReveal(bazi);
    }

    applyElementTheme(theme) {
        const root = document.documentElement;
        root.style.setProperty('--element-color', theme.color);
        root.style.setProperty('--element-glow', theme.glow);
        root.style.setProperty('--element-bg', theme.bg);
    }

    applyNebulaColor(element) {
        const nebula = NEBULA_COLORS[element] || '#0d0d2b';
        document.documentElement.style.setProperty('--element-nebula', nebula);
        document.body.classList.add('element-revealed');
    }

    generateMockStarPositions() {
        const positions = [];
        for (let i = 0; i < 400; i++) {
            positions.push({ x: Math.random(), y: Math.random() });
        }
        return positions;
    }

    // ==================== CARD POPULATION ====================

    populateCard(bazi) {
        this.ui.identityName.textContent = bazi.cosmicName;

        this.ui.zodiacTag.textContent = `属${bazi.year.zodiac}`;
        this.ui.yinyangTag.textContent = `${bazi.yinYang}${bazi.mainElement}`;
        const cityDisplay = this.city.charAt(0).toUpperCase() + this.city.slice(1);
        this.ui.cityTag.textContent = cityDisplay;

        this.ui.elementSymbol.textContent = bazi.mainElement;

        this.setPillar(this.ui.pillarYear, bazi.year.stem, bazi.year.branch);
        this.setPillar(this.ui.pillarMonth, bazi.month.stem, bazi.month.branch);
        this.setPillar(this.ui.pillarDay, bazi.day.stem, bazi.day.branch);
        this.setPillar(this.ui.pillarHour, bazi.hour.stem, bazi.hour.branch);

        this.ui.identityDesc.textContent = bazi.personality;
        this.ui.zodiacDesc.textContent = `${bazi.year.zodiac}年生人 — ${bazi.zodiacTrait}`;
        this.ui.wuxingInsight.textContent = bazi.wuxingInsight;

        // Five elements chart (animate after a short delay)
        this.populateElementChart(bazi.elementCounts);
    }

    setPillar(el, stem, branch) {
        const stemEl = el.querySelector('.stem');
        const branchEl = el.querySelector('.branch');
        if (stemEl) stemEl.textContent = stem;
        if (branchEl) branchEl.textContent = branch;
    }

    populateElementChart(counts) {
        const max = Math.max(...Object.values(counts), 1);

        // Reset bars first
        Object.entries(ELEMENT_IDS).forEach(([, ids]) => {
            document.getElementById(ids.bar).style.width = '0%';
        });

        // Animate bars after a delay
        setTimeout(() => {
            Object.entries(counts).forEach(([element, count]) => {
                const ids = ELEMENT_IDS[element];
                if (!ids) return;
                const pct = (count / max) * 100;
                document.getElementById(ids.bar).style.width = pct + '%';
                document.getElementById(ids.count).textContent = count;
            });
        }, 300);
    }

    // ==================== REVEAL ====================

    async completeDescentAndReveal(bazi) {
        this.ui.cosmosSection.classList.remove('active');
        await wait(1000);

        this.ui.cosmosSection.classList.add('hidden');

        this.populateCard(bazi);
        this.applyNebulaColor(bazi.mainElement);

        this.ui.identitySection.classList.remove('hidden');
        void this.ui.identitySection.offsetWidth;
        this.ui.identitySection.classList.add('active');

        // Clean up starfield
        this.starfield.isDescending = false;
        this.starfield.propheticStar = null;
        this.starfield.baziFragments = [];

        // Auto-save to archive
        this.saveToArchive(bazi);
    }

    revealIdentity(starData) {
        if (!this.currentBazi) return;

        this.ui.cosmosSection.classList.remove('active');
        this.starfield.zoomIn(starData);

        setTimeout(() => {
            this.ui.cosmosSection.classList.add('hidden');
            this.populateCard(this.currentBazi);
            this.applyNebulaColor(this.currentBazi.mainElement);
            this.ui.identitySection.classList.remove('hidden');
            void this.ui.identitySection.offsetWidth;
            this.ui.identitySection.classList.add('active');

            this.saveToArchive(this.currentBazi);
        }, 1000);
    }

    // ==================== RESET ====================

    async reset() {
        const root = document.documentElement;
        root.style.setProperty('--element-color', '#8cb4ff');
        root.style.setProperty('--element-glow', 'rgba(140, 180, 255, 0.5)');
        root.style.setProperty('--element-bg', 'rgba(140, 180, 255, 0.08)');
        document.body.classList.remove('element-revealed');

        this.currentBazi = null;

        this.ui.identitySection.classList.remove('active');
        await wait(500);
        this.ui.identitySection.classList.add('hidden');

        this.ui.entranceSection.classList.remove('hidden');
        void this.ui.entranceSection.offsetWidth;
        this.ui.entranceSection.classList.add('active');

        this.starfield.reset();
        this.updateArchiveCount();
    }

    // ==================== ARCHIVE ====================

    loadArchive() {
        try {
            return JSON.parse(localStorage.getItem(ARCHIVE_KEY)) || [];
        } catch {
            return [];
        }
    }

    saveToArchive(bazi) {
        const archive = this.loadArchive();

        // Avoid duplicate if same date+city already saved
        const key = `${this.dateStr}_${this.hourStr}_${this.city}`;
        if (archive.some(a => a.key === key)) return;

        archive.unshift({
            key,
            id: Date.now(),
            dateStr: this.dateStr,
            hourStr: this.hourStr,
            city: this.city,
            cosmicName: bazi.cosmicName,
            mainElement: bazi.mainElement,
            zodiac: bazi.year.zodiac,
            yinYang: bazi.yinYang
        });

        // Keep max 20
        if (archive.length > 20) archive.length = 20;

        localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
        this.updateArchiveCount();
    }

    deleteFromArchive(id) {
        let archive = this.loadArchive();
        archive = archive.filter(a => a.id !== id);
        localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
        this.updateArchiveCount();
        this.renderArchiveGrid();
    }

    updateArchiveCount() {
        const count = this.loadArchive().length;
        this.ui.archiveCount.textContent = count > 0 ? count : '';
    }

    showArchive() {
        this.renderArchiveGrid();
        this.ui.archiveOverlay.classList.remove('hidden');
    }

    hideArchive() {
        this.ui.archiveOverlay.classList.add('hidden');
    }

    renderArchiveGrid() {
        const archive = this.loadArchive();
        const grid = this.ui.archiveGrid;

        if (archive.length === 0) {
            grid.innerHTML = '<div class="archive-empty">尚无探索记录</div>';
            return;
        }

        grid.innerHTML = archive.map(item => `
            <div class="archive-item" data-key="${item.key}">
                <button class="archive-item-delete" data-id="${item.id}" title="删除">&times;</button>
                <div class="archive-item-element">${item.mainElement}</div>
                <div class="archive-item-name">${item.cosmicName}</div>
                <div class="archive-item-meta">属${item.zodiac} · ${item.yinYang}${item.mainElement} · ${item.city}</div>
            </div>
        `).join('');

        // Click to view
        grid.querySelectorAll('.archive-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.classList.contains('archive-item-delete')) return;
                const key = el.dataset.key;
                const item = archive.find(a => a.key === key);
                if (item) this.viewArchiveItem(item);
            });
        });

        // Delete buttons
        grid.querySelectorAll('.archive-item-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id, 10);
                this.deleteFromArchive(id);
            });
        });
    }

    viewArchiveItem(item) {
        this.hideArchive();

        this.city = item.city;
        this.dateStr = item.dateStr;
        this.hourStr = item.hourStr;

        const [y, m, d] = item.dateStr.split('-').map(Number);
        const hour = item.hourStr !== '' ? parseInt(item.hourStr, 10) : 12;

        const bazi = this.baziCalc.calculate(y, m, d, hour);
        this.currentBazi = bazi;

        this.applyElementTheme(bazi.theme);
        this.applyNebulaColor(bazi.mainElement);
        this.populateCard(bazi);

        // Show identity directly
        this.ui.entranceSection.classList.remove('active');
        this.ui.entranceSection.classList.add('hidden');

        this.ui.identitySection.classList.remove('hidden');
        void this.ui.identitySection.offsetWidth;
        this.ui.identitySection.classList.add('active');
    }

    // ==================== PERSONALITY TEST ====================

    async enterTestIntro() {
        this.ui.entranceSection.classList.remove('active');
        await wait(800);
        this.ui.entranceSection.classList.add('hidden');
        this.ui.testIntroSection.classList.remove('hidden');
        void this.ui.testIntroSection.offsetWidth;
        this.ui.testIntroSection.classList.add('active');
    }

    async startTest() {
        this.testAnswers = new Array(50).fill(null);
        this.testCurrentQ = 0;

        this.ui.testIntroSection.classList.remove('active');
        await wait(800);
        this.ui.testIntroSection.classList.add('hidden');

        this.ui.testQuestionsSection.classList.remove('hidden');
        void this.ui.testQuestionsSection.offsetWidth;
        this.ui.testQuestionsSection.classList.add('active');

        this.showQuestion(0);
    }

    showQuestion(index) {
        const q = this.personalityTest.questions[index];
        if (!q) return;

        this.ui.questionNumber.textContent = `Q${index + 1}`;
        this.ui.questionText.textContent = q.text;
        this.ui.testProgressText.textContent = `${index + 1} / 50`;
        this.ui.testProgressBar.style.width = `${((index + 1) / 50) * 100}%`;

        // Show/hide prev button
        this.ui.testPrevBtn.style.visibility = index > 0 ? 'visible' : 'hidden';

        // Highlight previously selected answer
        document.querySelectorAll('.scale-btn').forEach(btn => {
            const val = parseInt(btn.dataset.value, 10);
            btn.classList.toggle('selected', val === this.testAnswers[index]);
        });

        // Re-trigger question text animation
        this.ui.questionText.style.animation = 'none';
        void this.ui.questionText.offsetWidth;
        this.ui.questionText.style.animation = '';
    }

    async selectAnswer(value) {
        this.testAnswers[this.testCurrentQ] = value;

        // Highlight the selected button briefly
        document.querySelectorAll('.scale-btn').forEach(btn => {
            const val = parseInt(btn.dataset.value, 10);
            btn.classList.toggle('selected', val === value);
        });

        await wait(350);

        if (this.testCurrentQ < 49) {
            this.testCurrentQ++;
            this.showQuestion(this.testCurrentQ);
        } else {
            this.calculateAndShowResults();
        }
    }

    prevQuestion() {
        if (this.testCurrentQ > 0) {
            this.testCurrentQ--;
            this.showQuestion(this.testCurrentQ);
        }
    }

    async calculateAndShowResults() {
        const results = this.personalityTest.calculateResults(this.testAnswers);

        // Hide questions
        this.ui.testQuestionsSection.classList.remove('active');
        await wait(600);
        this.ui.testQuestionsSection.classList.add('hidden');

        // Show analyzing interlude
        this.showAnalyzingPhase();
        this.starfield.warpSpeed();
        await wait(3500);
        this.starfield.steadySpeed();
        await wait(400);
        this.hideAnalyzingPhase();
        await wait(400);

        // Populate and show results
        this.populateTestResults(results);

        this.ui.testResultsSection.classList.remove('hidden');
        void this.ui.testResultsSection.offsetWidth;
        this.ui.testResultsSection.classList.add('active');

        // Starfield results mode
        this.starfield.setResultsMode();

        // 3D tilt + holo on result cards
        this.initResultCardEffects();

        // Spawn type particles
        setTimeout(() => {
            this.spawnTypeParticles(this.ui.mbtiType);
            this.spawnTypeParticles(this.ui.enneagramType);
        }, 600);
    }

    showAnalyzingPhase() {
        // Reset step animations
        this.ui.testAnalyzingSection.querySelectorAll('.analyzing-step').forEach(step => {
            step.classList.remove('done');
            step.style.animation = 'none';
            void step.offsetWidth;
            step.style.animation = '';
        });
        // Reset progress ring
        const progress = this.ui.testAnalyzingSection.querySelector('.analyzing-progress');
        if (progress) {
            progress.style.animation = 'none';
            void progress.offsetWidth;
            progress.style.animation = '';
        }

        this.ui.testAnalyzingSection.classList.remove('hidden');
        void this.ui.testAnalyzingSection.offsetWidth;
        this.ui.testAnalyzingSection.classList.add('active');

        // Mark steps as done sequentially
        const steps = this.ui.testAnalyzingSection.querySelectorAll('.analyzing-step');
        [1000, 1800, 2600].forEach((delay, i) => {
            setTimeout(() => {
                if (steps[i]) steps[i].classList.add('done');
            }, delay);
        });
    }

    hideAnalyzingPhase() {
        this.ui.testAnalyzingSection.classList.remove('active');
        setTimeout(() => {
            this.ui.testAnalyzingSection.classList.add('hidden');
        }, 400);
    }

    populateTestResults(results) {
        // ===== MBTI =====
        this.ui.mbtiType.textContent = results.mbti.type;
        this.ui.mbtiCosmicName.textContent = results.mbti.cosmic;
        this.ui.mbtiTitle.textContent = results.mbti.title || '';

        // Keywords with staggered animation
        this.ui.mbtiKeywords.innerHTML = (results.mbti.keywords || [])
            .map((k, i) => `<span class="keyword-tag" style="animation: tagAppear 0.4s ease-out ${0.8 + i * 0.12}s both;">${k}</span>`).join('');

        // Multi-paragraph description
        this.ui.mbtiDesc.innerHTML = (results.mbti.desc || '')
            .split('\n\n').filter(Boolean).map(p => `<p>${p}</p>`).join('');

        // Strengths & Growth
        this.ui.mbtiStrengths.textContent = results.mbti.strengths || '';
        this.ui.mbtiGrowth.textContent = results.mbti.growth || '';

        // Dimension bars with animated counters
        const dims = results.mbti.dimensions;
        const labels = this.personalityTest.mbtiDimLabels;
        this.ui.mbtiDimensions.innerHTML = ['ei', 'sn', 'tf', 'jp'].map(dim => {
            const pct = dims[dim];
            const posLabel = labels[dim].pos;
            const negLabel = labels[dim].neg;
            const dominant = pct >= 50 ? pct : 100 - pct;
            return `
                <div class="mbti-dim-row">
                    <span class="mbti-dim-label">${posLabel}</span>
                    <div class="mbti-dim-track">
                        <div class="mbti-dim-fill" style="width: 0%;" data-target="${pct}"></div>
                    </div>
                    <span class="mbti-dim-pct" data-counter="${dominant}">0%</span>
                    <span class="mbti-dim-label right">${negLabel}</span>
                </div>
            `;
        }).join('');

        setTimeout(() => {
            this.ui.mbtiDimensions.querySelectorAll('.mbti-dim-fill').forEach(el => {
                el.style.width = el.dataset.target + '%';
            });
            this.ui.mbtiDimensions.querySelectorAll('[data-counter]').forEach(el => {
                this.animateCounter(el, parseInt(el.dataset.counter, 10));
            });
        }, 300);

        // ===== Big Five — SVG Radar Chart =====
        const b5 = results.big5;
        const dimKeys = ['o', 'c', 'ex', 'a', 'n'];

        this.ui.big5Chart.innerHTML = this.renderBig5Radar(b5.percentages, b5.dimensions);
        setTimeout(() => this.animateRadar(), 500);

        // Per-dimension detail cards
        this.ui.big5Details.innerHTML = dimKeys.map(key => {
            const dim = b5.dimensions[key];
            const pct = b5.percentages[key];
            const level = pct >= 50 ? dim.high : dim.low;
            return `
                <div class="big5-detail-item">
                    <div class="big5-detail-header">
                        <span class="big5-detail-name">${dim.name}</span>
                        <span class="big5-detail-tag">${level.label}</span>
                    </div>
                    <p class="big5-detail-desc">${level.desc}</p>
                </div>
            `;
        }).join('');

        // ===== Enneagram =====
        const enn = results.enneagram;
        this.ui.enneagramType.textContent = `Type ${enn.type}`;
        this.ui.enneagramCosmicName.textContent = enn.cosmic;
        this.ui.enneagramWing.textContent = `${enn.name} · ${enn.type}w${enn.wing}`;

        // Keywords with staggered animation
        this.ui.enneagramKeywords.innerHTML = (enn.keywords || [])
            .map((k, i) => `<span class="keyword-tag" style="animation: tagAppear 0.4s ease-out ${0.8 + i * 0.12}s both;">${k}</span>`).join('');

        // Core & Fear
        this.ui.enneagramCore.textContent = enn.core || '';
        this.ui.enneagramFear.textContent = enn.fear || '';

        // Multi-paragraph description
        this.ui.enneagramDesc.innerHTML = (enn.desc || '')
            .split('\n\n').filter(Boolean).map(p => `<p>${p}</p>`).join('');

        // ===== Combined Analysis =====
        this.ui.combinedAnalysis.innerHTML = (results.combined || '')
            .split('\n\n').filter(Boolean).map(p => `<p>${p}</p>`).join('');
    }

    // ==================== VISUAL EFFECTS ====================

    animateCounter(element, targetValue, duration = 1200) {
        const start = performance.now();
        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = Math.round(eased * targetValue) + '%';
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    renderBig5Radar(percentages, dimensions) {
        const size = 220;
        const cx = size / 2, cy = size / 2;
        const maxR = 85;
        const dims = ['o', 'c', 'ex', 'a', 'n'];
        const dimLabels = ['开放', '自律', '社交', '亲和', '情绪'];

        const getPoint = (index, radius) => {
            const angle = (Math.PI * 2 * index / 5) - Math.PI / 2;
            return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
        };

        // Grid rings
        let gridLines = '';
        [0.25, 0.5, 0.75, 1.0].forEach(pct => {
            const pts = dims.map((_, i) => { const p = getPoint(i, maxR * pct); return `${p.x},${p.y}`; }).join(' ');
            gridLines += `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>`;
        });

        // Axis lines
        let axisLines = '';
        dims.forEach((_, i) => {
            const p = getPoint(i, maxR);
            axisLines += `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>`;
        });

        // Data polygon (start from center)
        const zeroPoints = dims.map(() => `${cx},${cy}`).join(' ');
        const targetPoints = dims.map((dim, i) => {
            const p = getPoint(i, maxR * percentages[dim] / 100);
            return `${p.x},${p.y}`;
        }).join(' ');

        // Labels
        let labelEls = '';
        dims.forEach((dim, i) => {
            const p = getPoint(i, maxR + 20);
            labelEls += `<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="central"
                fill="rgba(255,255,255,0.5)" font-size="11" font-family="Outfit, sans-serif">${dimLabels[i]}</text>`;
        });

        // Dots (hidden initially)
        let dots = '';
        dims.forEach((dim, i) => {
            const p = getPoint(i, maxR * percentages[dim] / 100);
            dots += `<circle cx="${cx}" cy="${cy}" r="3" fill="rgba(200,160,255,0.9)"
                class="radar-dot" data-tx="${p.x}" data-ty="${p.y}" style="opacity:0; filter: drop-shadow(0 0 4px rgba(200,160,255,0.6));"/>`;
        });

        // Pct labels near dots
        let pctLabels = '';
        dims.forEach((dim, i) => {
            const p = getPoint(i, maxR * percentages[dim] / 100 + 14);
            pctLabels += `<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="central"
                fill="rgba(200,160,255,0.7)" font-size="9" font-family="Outfit, sans-serif"
                class="radar-pct-label" data-target="${percentages[dim]}" style="opacity:0;">0%</text>`;
        });

        return `
            <svg viewBox="0 0 ${size} ${size}" class="big5-radar" style="width: 100%; max-width: 260px;">
                ${gridLines}
                ${axisLines}
                <polygon points="${zeroPoints}" fill="rgba(200,160,255,0.08)" stroke="rgba(200,160,255,0.6)"
                    stroke-width="1.5" class="radar-polygon" data-target="${targetPoints}"
                    style="filter: drop-shadow(0 0 6px rgba(200,160,255,0.3));"/>
                ${dots}
                ${labelEls}
                ${pctLabels}
            </svg>
        `;
    }

    animateRadar() {
        const polygon = this.ui.big5Chart.querySelector('.radar-polygon');
        if (!polygon) return;

        const targetStr = polygon.dataset.target;
        const targetPts = targetStr.split(' ').map(s => { const [x, y] = s.split(',').map(Number); return { x, y }; });
        const cx = 110, cy = 110;
        const startPts = targetPts.map(() => ({ x: cx, y: cy }));

        const duration = 1200;
        const start = performance.now();

        const dots = this.ui.big5Chart.querySelectorAll('.radar-dot');
        const pctLabels = this.ui.big5Chart.querySelectorAll('.radar-pct-label');

        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            const currentPts = startPts.map((sp, i) => ({
                x: sp.x + (targetPts[i].x - sp.x) * eased,
                y: sp.y + (targetPts[i].y - sp.y) * eased
            }));

            polygon.setAttribute('points', currentPts.map(p => `${p.x},${p.y}`).join(' '));

            // Move dots
            dots.forEach((dot, i) => {
                dot.setAttribute('cx', currentPts[i].x);
                dot.setAttribute('cy', currentPts[i].y);
                dot.style.opacity = eased;
            });

            // Animate pct labels
            pctLabels.forEach(label => {
                const target = parseInt(label.dataset.target, 10);
                label.textContent = Math.round(eased * target) + '%';
                label.style.opacity = eased;
            });

            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    initCardTilt(card) {
        if (!window.matchMedia('(hover: hover)').matches) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateY = ((x / rect.width) - 0.5) * 10;
            const rotateX = ((y / rect.height) - 0.5) * -10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            const angle = Math.atan2(y - rect.height / 2, x - rect.width / 2) * 180 / Math.PI + 180;
            card.style.setProperty('--holo-angle', angle + 'deg');
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    }

    initResultCardEffects() {
        document.querySelectorAll('#test-results-card .result-card').forEach(card => {
            this.initCardTilt(card);
        });
    }

    spawnTypeParticles(el) {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const parent = el.closest('.result-card');
        if (!parent) return;

        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('span');
            particle.className = 'type-particle';
            const px = (Math.random() - 0.5) * 30;
            const dur = 1.2 + Math.random() * 1;
            particle.style.setProperty('--px', px + 'px');
            particle.style.setProperty('--dur', dur + 's');
            particle.style.left = (rect.left - parent.getBoundingClientRect().left + rect.width * Math.random()) + 'px';
            particle.style.top = (rect.top - parent.getBoundingClientRect().top) + 'px';
            particle.style.width = (2 + Math.random() * 3) + 'px';
            particle.style.height = particle.style.width;
            parent.appendChild(particle);
            setTimeout(() => particle.remove(), dur * 1000);
        }
    }

    async retakeTest() {
        this.ui.testResultsSection.classList.remove('active');
        await wait(500);
        this.ui.testResultsSection.classList.add('hidden');

        this.starfield.reset();

        this.ui.testIntroSection.classList.remove('hidden');
        void this.ui.testIntroSection.offsetWidth;
        this.ui.testIntroSection.classList.add('active');
    }

    async goHome() {
        // Hide whichever test section is visible
        const sections = [this.ui.testIntroSection, this.ui.testQuestionsSection, this.ui.testResultsSection, this.ui.testAnalyzingSection];
        sections.forEach(s => {
            s.classList.remove('active');
            s.classList.add('hidden');
        });

        await wait(300);

        this.starfield.reset();

        this.ui.entranceSection.classList.remove('hidden');
        void this.ui.entranceSection.offsetWidth;
        this.ui.entranceSection.classList.add('active');
    }

    saveTestCard() {
        const card = this.ui.testResultsCard;
        if (!card) return;

        // Reset 3D transforms on all result cards before capture
        const resultCards = card.querySelectorAll('.result-card');
        resultCards.forEach(rc => { rc.style.transform = 'none'; });

        html2canvas(card, {
            backgroundColor: '#050510',
            scale: 2,
            logging: false,
            useCORS: true
        }).then(canvas => {
            resultCards.forEach(rc => { rc.style.transform = ''; });
            const link = document.createElement('a');
            link.download = 'stardust-personality.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }

    // ==================== SAVE IMAGE ====================

    saveIdentityCard() {
        const card = this.ui.identityCard;
        if (!card) return;

        const originalTransform = card.style.transform;
        card.style.transform = 'none';

        html2canvas(card, {
            backgroundColor: '#050510',
            scale: 2,
            logging: false,
            useCORS: true
        }).then(canvas => {
            card.style.transform = originalTransform;

            const link = document.createElement('a');
            link.download = 'stardust-identity.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
