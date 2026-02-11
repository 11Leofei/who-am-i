const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// HTML sanitizer — prevent XSS from AI-generated or user-input content
const escapeHTML = (str) => {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};
const safeParagraphs = (text) => {
    if (!text) return '';
    return text.split('\n\n').filter(Boolean).map(p => `<p>${escapeHTML(p.trim())}</p>`).join('');
};
const safeParagraphsWithSections = (text) => {
    if (!text) return '';
    return text.split('\n\n').filter(Boolean).map(p => {
        const t = p.trim();
        const m = t.match(/^§(.+?)§\n?([\s\S]*)$/);
        if (m) {
            const label = escapeHTML(m[1]);
            const body = m[2] ? `<p>${escapeHTML(m[2].trim())}</p>` : '';
            return `<div class="section-label">${label}</div>${body}`;
        }
        return `<p>${escapeHTML(t)}</p>`;
    }).join('');
};

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
const TEST_ARCHIVE_KEY = 'stardust_test_archive';

// ==================== 三系统交叉洞察引擎 ====================

const CROSS_ELEMENT_FUNCTION = {
    '木': { functions: ['Ni', 'Ne'], desc: '木之生发与直觉洞察共振，你的灵魂如春芽探索未见之境' },
    '火': { functions: ['Fe', 'Se'], desc: '火之热情与感知表达共振，你的生命如烈焰照亮当下瞬间' },
    '土': { functions: ['Si', 'Te'], desc: '土之稳固与经验秩序共振，你的根基如大地承载实在之物' },
    '金': { functions: ['Ti', 'Te'], desc: '金之锋锐与逻辑结构共振，你的心智如利刃剖析本质规律' },
    '水': { functions: ['Ni', 'Fi'], desc: '水之深邃与内在感受共振，你的灵魂如深渊映照隐秘真相' }
};

const CROSS_PATTERN_ENN = {
    '正官格': { types: [1, 3], desc: '正官之序与{T}之{R}互为表里，命运与人格共筑秩序之塔' },
    '偏财格': { types: [3, 7], desc: '偏财之机与{T}之{R}相互激发，天命与性格共舞于机遇之海' },
    '正财格': { types: [6, 2], desc: '正财之稳与{T}之{R}同频共振，宿命与心性共守恒久之道' },
    '食神格': { types: [9, 7], desc: '食神之悦与{T}之{R}彼此滋养，星命与人性共享宁和之境' },
    '伤官格': { types: [4, 8], desc: '伤官之锋与{T}之{R}相互淬炼，命格与个性共铸独立之魂' },
    '正印格': { types: [5, 9], desc: '正印之智与{T}之{R}交相辉映，天赋与性情共入深思之境' },
    '偏印格': { types: [4, 5], desc: '偏印之奇与{T}之{R}互为镜像，命盘与心灵共探非常之道' },
    '七杀格': { types: [8, 3], desc: '七杀之力与{T}之{R}同源共振，宿命与意志共筑权力之峰' },
    '比肩格': { types: [2, 8], desc: '比肩之独与{T}之{R}互相呼应，命局与性格共铸自主之路' },
    '劫财格': { types: [2, 8], desc: '劫财之争与{T}之{R}彼此强化，星盘与人格共入竞逐之局' },
    '从格': { types: [9, 6], desc: '从格之顺与{T}之{R}暗合天机，命势与心性共入随缘之流' }
};

const CROSS_ENN_TRAITS = {
    1: '完美主义', 2: '助人情怀', 3: '成就驱动', 4: '独特表达',
    5: '求知探索', 6: '忠诚谨慎', 7: '乐观追寻', 8: '力量掌控', 9: '和平调停'
};

const CROSS_MBTI_DOMINANT = {
    'INTJ': 'Ni', 'INFJ': 'Ni', 'ENTJ': 'Te', 'ENFJ': 'Fe',
    'INTP': 'Ti', 'INFP': 'Fi', 'ENTP': 'Ne', 'ENFP': 'Ne',
    'ISTJ': 'Si', 'ISFJ': 'Si', 'ESTJ': 'Te', 'ESFJ': 'Fe',
    'ISTP': 'Ti', 'ISFP': 'Fi', 'ESTP': 'Se', 'ESFP': 'Se'
};

const CROSS_FUNC_NAMES = {
    Ni: '内倾直觉', Ne: '外倾直觉', Fe: '外倾情感', Se: '外倾感知',
    Si: '内倾感知', Te: '外倾思考', Ti: '内倾思考', Fi: '内倾情感'
};

const CROSS_TRIGRAM_ELEM = {
    '乾': '金', '兑': '金', '离': '火', '震': '木',
    '巽': '木', '坎': '水', '艮': '土', '坤': '土'
};

function generateCrossSystemInsights(bazi, testResults, iching) {
    const r = { baziInsight: '', personalityInsight: '', ichingInsight: '' };

    // === 命盘 tab ===
    if (bazi && testResults) {
        const parts = [];
        const elData = CROSS_ELEMENT_FUNCTION[bazi.mainElement];
        const domFunc = CROSS_MBTI_DOMINANT[testResults.mbti?.type];
        if (elData && domFunc && elData.functions.includes(domFunc)) {
            parts.push(elData.desc);
        }
        if (bazi.pattern?.name && testResults.enneagram?.type) {
            const pd = CROSS_PATTERN_ENN[bazi.pattern.name];
            const et = testResults.enneagram.type;
            if (pd && pd.types.includes(et)) {
                parts.push(pd.desc.replace('{T}', et + '号').replace('{R}', CROSS_ENN_TRAITS[et]));
            }
        }
        if (iching?.primary && bazi.mainElement) {
            const ue = CROSS_TRIGRAM_ELEM[iching.primary.upper];
            const le = CROSS_TRIGRAM_ELEM[iching.primary.lower];
            if (ue === bazi.mainElement || le === bazi.mainElement) {
                parts.push(`${iching.primary.name}卦与你的${bazi.mainElement}行日主遥相呼应，天象与命盘在此刻交汇共鸣`);
            }
        }
        r.baziInsight = parts.length > 0 ? parts.slice(0, 2).join('。') + '。' : '你的命盘五行流转，与人格星图形成独特的生命底色。';
    }

    // === 人格 tab ===
    if (testResults && bazi) {
        const parts = [];
        const domFunc = CROSS_MBTI_DOMINANT[testResults.mbti?.type];
        const elData = CROSS_ELEMENT_FUNCTION[bazi.mainElement];
        if (domFunc && elData && elData.functions.includes(domFunc)) {
            parts.push(`你的${CROSS_FUNC_NAMES[domFunc]}与命中${bazi.mainElement}行交织，认知方式与天赋本源形成双螺旋共振`);
        }
        if (iching?.primary?.nature && testResults.mbti?.cosmic) {
            parts.push(`卦象之「${iching.primary.nature}」与${testResults.mbti.cosmic}的能量交汇，古老智慧映射你的现代人格`);
        }
        r.personalityInsight = parts.length > 0 ? parts.slice(0, 2).join('。') + '。' : '你的人格星图独立闪耀，等待与命理卦象的三维交汇。';
    }

    // === 卦象 tab ===
    if (iching?.primary) {
        const parts = [];
        if (bazi?.mainElement) {
            const ue = CROSS_TRIGRAM_ELEM[iching.primary.upper];
            const le = CROSS_TRIGRAM_ELEM[iching.primary.lower];
            const elems = [ue, le].filter(Boolean);
            if (elems.includes(bazi.mainElement)) {
                parts.push(`${iching.primary.name}卦携${[...new Set(elems)].join('、')}之气，与你命盘${bazi.mainElement}行主星遥相呼应，古今时空在此折叠`);
            }
        }
        if (testResults?.mbti) {
            const nature = iching.primary.nature;
            const ei = testResults.mbti.type?.[0];
            if ((/刚|壮|动/.test(nature)) && ei === 'E') {
                parts.push(`卦象「${nature}」之质与你${testResults.mbti.cosmic}的外向能量同频，人格特质在易象中找到镜像`);
            } else if ((/柔|顺|止|静/.test(nature)) && ei === 'I') {
                parts.push(`卦象「${nature}」之意与你${testResults.mbti.cosmic}的内敛气质共鸣，人格特质在易象中找到镜像`);
            }
        }
        r.ichingInsight = parts.length > 0 ? parts.slice(0, 2).join('。') + '。' : `${iching.primary.name}卦静候时机，等待与你的命盘人格形成三元共振场域。`;
    }

    return r;
}

class App {
    constructor() {
        this.starfield = new Starfield('starfield');
        this.baziCalc = new BaziCalculator();
        this.iching = new IChing();
        this.personalityTest = new PersonalityTest();
        this.audio = new CosmicAudio();
        this.ai = new CosmicAI();
        this.testAnswers = [];
        this.testCurrentQ = 0;
        this.testMode = 'quick'; // 'quick' or 'deep'
        this._audioInitialized = false;
        this._currentShareContext = null; // 'identity' or 'test'
        this._lastTestResults = null;
        this._lastIChingResult = null;

        // Dual mode
        this.dualMode = false;
        this.dualNames = ['旅者一', '旅者二'];
        this.dualResults = [null, null];
        this.dualCurrentPerson = 0; // 0 or 1
        this._lastDualCompatibility = null;

        // Remote match mode
        this.remoteMode = false;
        this.remoteInviterData = null; // { name, results }

        // Celebration canvas
        this.celebrationCanvas = document.getElementById('celebration-canvas');
        this.celebrationCtx = this.celebrationCanvas.getContext('2d');
        this.celebrationParticles = [];
        this._celebrationAnimId = null;

        this.ui = {
            enterBtn: document.getElementById('enter-btn'),
            summonBtn: document.getElementById('summon-btn'),
            saveBtn: document.getElementById('save-btn'),
            resetBtn: document.getElementById('reset-btn'),
            archiveBtn: document.getElementById('archive-btn'),
            archiveCount: document.getElementById('archive-count'),
            archiveOverlay: document.getElementById('archive-overlay'),
            archiveGrid: document.getElementById('archive-grid'),
            testArchiveGrid: document.getElementById('test-archive-grid'),
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
            // Phase 6: Bazi expansion
            synthesisBadge: document.getElementById('synthesis-badge'),
            synthesisDesc: document.getElementById('synthesis-desc'),
            complementTags: document.getElementById('complement-tags'),
            complementText: document.getElementById('complement-text'),
            // Analyzing interlude
            testAnalyzingSection: document.getElementById('test-analyzing'),
            // Personality test
            startTestBtn: document.getElementById('start-test-btn'),
            testIntroSection: document.getElementById('test-intro'),
            testQuestionsSection: document.getElementById('test-questions'),
            testResultsSection: document.getElementById('test-results'),
            testProgressBar: document.getElementById('test-progress-bar'),
            testProgressText: document.getElementById('test-progress-text'),
            questionText: document.getElementById('question-text'),
            questionNumber: document.getElementById('question-number'),
            questionWrapper: document.getElementById('question-wrapper'),
            testPrevBtn: document.getElementById('test-prev-btn'),
            saveTestBtn: document.getElementById('save-test-btn'),
            retestBtn: document.getElementById('retest-btn'),
            homeBtn: document.getElementById('home-btn'),
            mbtiType: document.getElementById('mbti-type'),
            mbtiCosmicName: document.getElementById('mbti-cosmic-name'),
            mbtiTitle: document.getElementById('mbti-title'),
            ennBadge: document.getElementById('enn-badge'),
            ennSubtitle: document.getElementById('enn-subtitle'),
            coreKeywords: document.getElementById('core-keywords'),
            mbtiDimensions: document.getElementById('mbti-dimensions'),
            coreDesc: document.getElementById('core-desc'),
            coreStrengths: document.getElementById('core-strengths'),
            coreDrive: document.getElementById('core-drive'),
            coreFear: document.getElementById('core-fear'),
            cognitiveFnArcs: document.getElementById('cognitive-fn-arcs'),
            cognitiveFunctions: document.getElementById('cognitive-functions'),
            cognitiveDesc: document.getElementById('cognitive-desc'),
            socialQuadrant: document.getElementById('social-quadrant'),
            relationshipsDesc: document.getElementById('relationships-desc'),
            energySpectrums: document.getElementById('energy-spectrums'),
            workDesc: document.getElementById('work-desc'),
            big5Chart: document.getElementById('big5-chart'),
            big5Dims: document.getElementById('big5-dims'),
            stressDesc: document.getElementById('stress-desc'),
            ennPath: document.getElementById('enn-path'),
            growthDesc: document.getElementById('growth-desc'),
            growthCognitive: document.getElementById('growth-cognitive'),
            growthActions: document.getElementById('growth-actions'),
            aiInsightCard: document.getElementById('card-ai-insight'),
            aiInsightText: document.getElementById('ai-insight-text'),
            primaryTabs: document.getElementById('primary-tabs'),
            resultTabs: document.getElementById('result-tabs'),
            tabPanels: document.getElementById('tab-panels'),
            tabAI: document.getElementById('tab-ai'),
            testResultsCard: document.getElementById('test-results-card'),
            // Sharing
            shareIdentityBtn: document.getElementById('share-identity-btn'),
            shareTestBtn: document.getElementById('share-test-btn'),
            sharePanel: document.getElementById('share-panel'),
            shareCopyLink: document.getElementById('share-copy-link'),
            shareCopyText: document.getElementById('share-copy-text'),
            sharePanelClose: document.getElementById('share-panel-close'),
            toast: document.getElementById('toast'),
            // Audio
            muteBtn: document.getElementById('mute-btn'),
            muteIcon: document.getElementById('mute-icon'),
            // Mode selector
            modeQuick: document.getElementById('mode-quick'),
            modeDeep: document.getElementById('mode-deep'),
            // Milestone
            milestoneOverlay: document.getElementById('milestone-overlay'),
            milestoneText: document.getElementById('milestone-text'),
            milestoneDim: document.getElementById('milestone-dim'),
            milestoneCount: document.getElementById('milestone-count'),
            milestoneRing: document.getElementById('milestone-ring-progress'),
            // Dual mode
            dualEnterBtn: document.getElementById('dual-enter-btn'),
            dualIntroSection: document.getElementById('dual-intro'),
            dualHandoffSection: document.getElementById('dual-handoff'),
            dualResultsSection: document.getElementById('dual-results'),
            startDualBtn: document.getElementById('start-dual-btn'),
            handoffReadyBtn: document.getElementById('handoff-ready-btn'),
            handoffTitle: document.getElementById('handoff-title'),
            handoffSubtitle: document.getElementById('handoff-subtitle'),
            dualRetestBtn: document.getElementById('dual-retest-btn'),
            dualHomeBtn: document.getElementById('dual-home-btn'),
            saveDualBtn: document.getElementById('save-dual-btn'),
            shareDualBtn: document.getElementById('share-dual-btn'),
            // Remote match
            remoteMatchIntroSection: document.getElementById('remote-match-intro'),
            startRemoteMatchBtn: document.getElementById('start-remote-match-btn'),
            inviteMatchBtn: document.getElementById('invite-match-btn'),
            remoteMyName: document.getElementById('remote-my-name'),
            remoteInviteText: document.getElementById('remote-invite-text'),
            // AI
            aiSettingsBtn: document.getElementById('ai-settings-btn'),
            aiKeyModal: document.getElementById('ai-key-modal'),
            aiKeyInput: document.getElementById('ai-key-input'),
            aiKeySave: document.getElementById('ai-key-save'),
            aiKeyClear: document.getElementById('ai-key-clear'),
            aiKeyCancel: document.getElementById('ai-key-cancel'),
            aiStatus: document.getElementById('ai-status'),
            aiStatusDual: document.getElementById('ai-status-dual'),
            aiUnlockBtn: document.getElementById('ai-unlock-btn'),
            aiUnlockBtnDual: document.getElementById('ai-unlock-btn-dual'),
            aiChat: document.getElementById('ai-chat'),
            aiChatToggle: document.getElementById('ai-chat-toggle'),
            aiChatMessages: document.getElementById('ai-chat-messages'),
            aiChatInput: document.getElementById('ai-chat-input'),
            aiChatSend: document.getElementById('ai-chat-send'),
        };

        this._chatHistory = [];
        this._chatBusy = false;
        this._transitioning = false;

        // Running dimension scores for dynamic starfield mood
        this._runningScores = { ei: 0, sn: 0, tf: 0, jp: 0 };
        this._runningCounts = { ei: 0, sn: 0, tf: 0, jp: 0 };

        this.init();
    }

    init() {
        this.starfield.start();
        this.resizeCelebrationCanvas();
        window.addEventListener('resize', () => this.resizeCelebrationCanvas());

        // rAF-throttled flag for mousemove handlers
        this._tiltRafPending = false;

        // Splash auto-remove
        const splash = document.getElementById('splash');
        if (splash) {
            setTimeout(() => splash.remove(), 3500);
        }

        // Initialize audio on first interaction
        const initAudioOnce = () => {
            if (!this._audioInitialized) {
                this._audioInitialized = true;
                this.audio.init();
                this.audio.startAmbient();
            }
        };
        document.addEventListener('click', initAudioOnce, { once: true });
        document.addEventListener('touchstart', initAudioOnce, { once: true });

        this.ui.enterBtn.addEventListener('click', () => { this.audio.playClick(); this.enterRitual(); });
        this.ui.summonBtn.addEventListener('click', () => { this.audio.playClick(); this.enterTestIntroFromRitual(); });
        this.ui.saveBtn.addEventListener('click', () => this.saveIdentityCard());
        this.ui.resetBtn.addEventListener('click', () => { this.audio.playClick(); this.reset(); });
        this.ui.archiveBtn.addEventListener('click', () => this.showArchive());
        this.ui.archiveClose.addEventListener('click', () => { this.audio.playClick(); this.hideArchive(); });

        // Privacy policy modal
        const privacyLink = document.getElementById('privacy-link');
        const privacyOverlay = document.getElementById('privacy-overlay');
        const privacyClose = document.getElementById('privacy-close');
        if (privacyLink && privacyOverlay) {
            privacyLink.addEventListener('click', () => privacyOverlay.classList.remove('hidden'));
            privacyClose?.addEventListener('click', () => privacyOverlay.classList.add('hidden'));
            privacyOverlay.addEventListener('click', (e) => {
                if (e.target === privacyOverlay) privacyOverlay.classList.add('hidden');
            });
        }

        // Archive tab switching
        document.querySelectorAll('.archive-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.audio.playClick();
                document.querySelectorAll('.archive-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const target = tab.dataset.tab;
                this.ui.archiveGrid.classList.toggle('hidden', target !== 'bazi');
                this.ui.testArchiveGrid.classList.toggle('hidden', target !== 'test');
                if (target === 'test') this.renderTestArchiveGrid();
            });
        });

        // Archive grid event delegation (avoids per-element listeners on re-render)
        this.ui.archiveGrid.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.archive-item-delete');
            if (deleteBtn) {
                e.stopPropagation();
                this.deleteFromArchive(parseInt(deleteBtn.dataset.id, 10));
                return;
            }
            const item = e.target.closest('.archive-item');
            if (item) {
                const archive = this.loadArchive();
                const found = archive.find(a => a.key === item.dataset.key);
                if (found) this.viewArchiveItem(found);
            }
        });

        this._compareMode = false;
        this._compareSelected = [];
        this.ui.testArchiveGrid.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.archive-item-delete');
            if (deleteBtn) {
                e.stopPropagation();
                this.deleteTestFromArchive(parseInt(deleteBtn.dataset.id, 10));
                return;
            }
            const item = e.target.closest('.archive-item');
            if (!item) return;
            if (this._compareMode) {
                this.toggleCompareSelect(item);
                return;
            }
            const archive = this.loadTestArchive();
            const found = archive.find(a => a.id === parseInt(item.dataset.id, 10));
            if (found) this.viewTestArchiveItem(found);
        });

        // Compare mode toggle
        const compareToggle = document.getElementById('archive-compare-toggle');
        if (compareToggle) {
            compareToggle.addEventListener('click', () => {
                this.audio.playClick();
                this.toggleCompareMode();
            });
        }
        const compareGoBtn = document.getElementById('compare-go-btn');
        if (compareGoBtn) {
            compareGoBtn.addEventListener('click', () => {
                this.audio.playClick();
                this.showComparison();
            });
        }

        // Date select initialization (year/month/day dropdowns)
        const birthYearSel = document.getElementById('birth-year');
        const birthMonthSel = document.getElementById('birth-month');
        const birthDaySel = document.getElementById('birth-day');
        if (birthYearSel) {
            const currentYear = new Date().getFullYear();
            for (let y = currentYear; y >= 1920; y--) {
                const opt = document.createElement('option');
                opt.value = y;
                opt.textContent = y;
                birthYearSel.appendChild(opt);
            }
        }
        const updateDayOptions = () => {
            if (!birthDaySel) return;
            const y = parseInt(birthYearSel?.value) || 2000;
            const m = parseInt(birthMonthSel?.value) || 1;
            const maxDay = new Date(y, m, 0).getDate();
            const curDay = parseInt(birthDaySel.value) || 0;
            const oldLen = birthDaySel.options.length - 1; // minus placeholder
            if (oldLen === maxDay) return;
            // Keep placeholder, rebuild day options
            while (birthDaySel.options.length > 1) birthDaySel.remove(1);
            for (let d = 1; d <= maxDay; d++) {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = d + '日';
                birthDaySel.appendChild(opt);
            }
            if (curDay > 0 && curDay <= maxDay) birthDaySel.value = curDay;
        };
        birthYearSel?.addEventListener('change', updateDayOptions);
        birthMonthSel?.addEventListener('change', updateDayOptions);
        // Helper: get date string from selects
        this._getBirthDateStr = () => {
            const y = birthYearSel?.value;
            const m = birthMonthSel?.value;
            const d = birthDaySel?.value;
            if (!y || !m || !d) return '';
            return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        };

        // True solar time auto-calculation
        const birthTimeInput = document.getElementById('birth-time');
        const birthCitySelect = document.getElementById('birth-city');
        const birthHourSelect = document.getElementById('birth-hour');
        const solarNote = document.getElementById('solar-time-note');
        const shiChenNames = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];
        const updateSolarTime = () => {
            const timeVal = birthTimeInput?.value;
            const cityVal = birthCitySelect?.value;
            const mon = parseInt(birthMonthSel?.value) || 0;
            const day = parseInt(birthDaySel?.value) || 0;
            if (!timeVal || !cityVal || !mon || !day) {
                if (solarNote) solarNote.classList.add('hidden');
                return;
            }
            const cityInfo = BaziCalculator.getCityData(cityVal);
            if (!cityInfo) { solarNote?.classList.add('hidden'); return; }
            const [h, m] = timeVal.split(':').map(Number);
            const solarHour = this.baziCalc.trueSolarHour(h, m, cityInfo.lng, mon, day, cityInfo.tz);
            const branchIndex = Math.floor((solarHour + 1) / 2) % 12;
            const shiChenValue = (branchIndex * 2) % 24;
            if (birthHourSelect) birthHourSelect.value = String(shiChenValue);
            const solarH = Math.floor(solarHour);
            const solarM = Math.round((solarHour - solarH) * 60);
            if (solarNote) {
                solarNote.textContent = `真太阳时 ${String(solarH).padStart(2,'0')}:${String(solarM).padStart(2,'0')} → ${shiChenNames[branchIndex]}`;
                solarNote.classList.remove('hidden');
            }
        };
        birthTimeInput?.addEventListener('change', updateSolarTime);
        birthCitySelect?.addEventListener('change', updateSolarTime);
        birthMonthSel?.addEventListener('change', updateSolarTime);
        birthDaySel?.addEventListener('change', updateSolarTime);

        // Personality test listeners
        this.ui.startTestBtn.addEventListener('click', () => { this.audio.playClick(); this.startTest(); });
        this.ui.testPrevBtn.addEventListener('click', () => { this.audio.playClick(); this.prevQuestion(); });
        this.ui.saveTestBtn.addEventListener('click', () => this.saveTestCard());
        document.getElementById('save-wallpaper-btn')?.addEventListener('click', () => { this.audio.playClick(); this.generateWallpaper(); });
        this.ui.retestBtn.addEventListener('click', () => { this.audio.playClick(); this.retakeTest(); });
        this.ui.homeBtn.addEventListener('click', () => { this.audio.playClick(); this.goHome(); });

        // Accuracy feedback
        document.querySelectorAll('.accuracy-star').forEach(star => {
            star.addEventListener('click', () => {
                this.audio.playClick();
                this.submitAccuracyFeedback(parseInt(star.dataset.value, 10));
            });
        });

        document.querySelectorAll('.scale-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const value = parseInt(btn.dataset.value, 10);
                this.selectAnswer(value);
            });
        });

        this.starfield.onStarClick = (starData) => this.revealIdentity(starData);

        // 3D tilt + holographic angle on identity card (rAF-throttled)
        const card = this.ui.identityCard;
        if (card) {
            let cardRaf = false;
            card.addEventListener('mousemove', (e) => {
                if (cardRaf) return;
                cardRaf = true;
                requestAnimationFrame(() => {
                    cardRaf = false;
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const rotateY = ((x / rect.width) - 0.5) * 16;
                    const rotateX = ((y / rect.height) - 0.5) * -16;
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                    const angle = Math.atan2(y - rect.height / 2, x - rect.width / 2) * 180 / Math.PI + 180;
                    card.style.setProperty('--holo-angle', angle + 'deg');
                });
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
            });
        }

        this.initAudioHoverEffects();
        this.updateArchiveCount();

        // Share buttons
        if (this.ui.shareIdentityBtn) {
            this.ui.shareIdentityBtn.addEventListener('click', () => this.openSharePanel('identity'));
        }
        if (this.ui.shareTestBtn) {
            this.ui.shareTestBtn.addEventListener('click', () => this.openSharePanel('test'));
        }
        this.ui.shareCopyLink.addEventListener('click', () => this.copyToClipboard(window.location.href, '链接已复制到剪贴板'));
        this.ui.shareCopyText.addEventListener('click', () => this.copyShareText());
        this.ui.sharePanelClose.addEventListener('click', () => this.closeSharePanel());

        // Mute button
        this.ui.muteBtn.addEventListener('click', () => {
            const muted = this.audio.toggleMute();
            this.ui.muteIcon.textContent = muted ? '🔇' : '🔊';
        });

        // Mode selector
        if (this.ui.modeQuick && this.ui.modeDeep) {
            this.ui.modeQuick.addEventListener('click', () => {
                this.audio.playClick();
                this.testMode = 'quick';
                this.ui.modeQuick.classList.add('active');
                this.ui.modeDeep.classList.remove('active');
            });
            this.ui.modeDeep.addEventListener('click', () => {
                this.audio.playClick();
                this.testMode = 'deep';
                this.ui.modeDeep.classList.add('active');
                this.ui.modeQuick.classList.remove('active');
            });
        }

        // Primary tab switching (L1: 命盘/人格/卦象/AI)
        this._primaryTabNames = ['bazi', 'personality', 'iching', 'ai'];
        this._currentPrimaryTab = 0;
        this.ui.primaryTabs.addEventListener('click', (e) => {
            const tab = e.target.closest('.primary-tab');
            if (!tab) return;
            this.audio.playClick();
            this.switchPrimaryTab(tab.dataset.ptab);
        });

        // Secondary tab switching (L2: 认知/关系/工作/压力/成长 within personality)
        this._tabNames = ['cognitive', 'relationships', 'work', 'stress', 'growth'];
        this._currentTab = 0;
        this.ui.resultTabs.addEventListener('click', (e) => {
            const tab = e.target.closest('.result-tab');
            if (!tab) return;
            this.audio.playClick();
            this.switchResultTab(tab.dataset.tab);
        });

        // Swipe gesture on primary panels
        let touchStartX = 0, touchStartY = 0, swiping = false;
        const resultsContainer = document.getElementById('test-results-card');
        resultsContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            swiping = true;
        }, { passive: true });
        resultsContainer.addEventListener('touchend', (e) => {
            if (!swiping) return;
            swiping = false;
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                const visibleTabs = this._primaryTabNames.filter(name => {
                    if (name === 'ai') return !this.ui.tabAI.classList.contains('hidden');
                    return true;
                });
                const currentIdx = visibleTabs.indexOf(this._primaryTabNames[this._currentPrimaryTab]);
                if (dx < 0 && currentIdx < visibleTabs.length - 1) {
                    this.switchPrimaryTab(visibleTabs[currentIdx + 1]);
                } else if (dx > 0 && currentIdx > 0) {
                    this.switchPrimaryTab(visibleTabs[currentIdx - 1]);
                }
            }
        }, { passive: true });

        // Dual mode listeners
        if (this.ui.dualEnterBtn) {
            this.ui.dualEnterBtn.addEventListener('click', () => { this.audio.playClick(); this.enterDualIntro(); });
        }
        if (this.ui.startDualBtn) {
            this.ui.startDualBtn.addEventListener('click', () => { this.audio.playClick(); this.startDualTest(); });
        }
        if (this.ui.handoffReadyBtn) {
            this.ui.handoffReadyBtn.addEventListener('click', () => { this.audio.playClick(); this.startDualPerson2(); });
        }
        if (this.ui.dualRetestBtn) {
            this.ui.dualRetestBtn.addEventListener('click', () => { this.audio.playClick(); this.restartDual(); });
        }
        if (this.ui.dualHomeBtn) {
            this.ui.dualHomeBtn.addEventListener('click', () => { this.audio.playClick(); this.goHome(); });
        }
        if (this.ui.saveDualBtn) {
            this.ui.saveDualBtn.addEventListener('click', () => this.saveDualCard());
        }
        if (this.ui.shareDualBtn) {
            this.ui.shareDualBtn.addEventListener('click', () => this.openSharePanel('dual'));
        }

        // Remote match listeners
        if (this.ui.startRemoteMatchBtn) {
            this.ui.startRemoteMatchBtn.addEventListener('click', () => { this.audio.playClick(); this.startRemoteMatch(); });
        }
        if (this.ui.inviteMatchBtn) {
            this.ui.inviteMatchBtn.addEventListener('click', () => this.generateMatchInviteLink());
        }

        // Check for remote match URL parameter
        this.checkRemoteMatchParam();

        // AI settings listeners
        if (this.ui.aiSettingsBtn) {
            this.ui.aiSettingsBtn.addEventListener('click', () => { this.audio.playClick(); this.showAIKeyModal(); });
        }
        if (this.ui.aiKeySave) {
            this.ui.aiKeySave.addEventListener('click', () => { this.audio.playClick(); this.saveAIKey(); });
        }
        if (this.ui.aiKeyClear) {
            this.ui.aiKeyClear.addEventListener('click', () => { this.audio.playClick(); this.clearAIKey(); });
        }
        if (this.ui.aiKeyCancel) {
            this.ui.aiKeyCancel.addEventListener('click', () => { this.audio.playClick(); this.hideAIKeyModal(); });
        }
        if (this.ui.aiKeyModal) {
            this.ui.aiKeyModal.querySelector('.ai-modal-backdrop').addEventListener('click', () => this.hideAIKeyModal());
        }
        if (this.ui.aiUnlockBtn) {
            this.ui.aiUnlockBtn.addEventListener('click', () => { this.audio.playClick(); this.showAIKeyModal(); });
        }
        if (this.ui.aiUnlockBtnDual) {
            this.ui.aiUnlockBtnDual.addEventListener('click', () => { this.audio.playClick(); this.showAIKeyModal(); });
        }
        this.updateAISettingsIndicator();

        // AI Chat
        if (this.ui.aiChatToggle) {
            this.ui.aiChatToggle.addEventListener('click', () => {
                this.audio.playClick();
                this.toggleAIChat();
            });
        }
        if (this.ui.aiChatSend) {
            this.ui.aiChatSend.addEventListener('click', () => this.sendAIChatMessage());
        }
        if (this.ui.aiChatInput) {
            this.ui.aiChatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendAIChatMessage();
                }
            });
        }

        // I Ching quick-ask buttons
        const quickAsks = document.getElementById('iching-quick-asks');
        if (quickAsks) {
            quickAsks.addEventListener('click', (e) => {
                const btn = e.target.closest('.quick-ask-btn');
                if (!btn) return;
                this.audio.playClick();
                if (!this.ai.hasKey) {
                    this.showToast('请先在设置中配置 AI Key');
                    return;
                }
                const questions = {
                    'changing': '请详细解读我卦象中变爻的含义，对我当前有什么启示？',
                    'relation': '本卦与变卦之间的关系是什么？这个变化趋势意味着什么？',
                    'advice': '基于我的卦象，当前阶段我该如何行动？需要注意什么？'
                };
                const chatPanel = document.getElementById('ai-chat');
                if (chatPanel.classList.contains('collapsed')) {
                    chatPanel.classList.remove('collapsed');
                }
                this.ui.aiChatInput.value = questions[btn.dataset.ask] || '';
                chatPanel.scrollIntoView({ behavior: 'smooth', block: 'end' });
                setTimeout(() => this.sendAIChatMessage(), 200);
            });
        }

        // Keyboard shortcuts (Phase 7)
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    // ==================== AUDIO HOVER EFFECTS ====================

    initAudioHoverEffects() {
        document.querySelectorAll('.glass-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => this.audio.playHover());
        });
    }

    // ==================== KEYBOARD SHORTCUTS ====================

    handleKeyDown(e) {
        // Only when test questions screen is active
        if (!this.ui.testQuestionsSection.classList.contains('active')) return;

        if (e.key >= '1' && e.key <= '5') {
            e.preventDefault();
            this.selectAnswer(parseInt(e.key, 10));
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.prevQuestion();
        }
    }

    // ==================== SCREEN TRANSITIONS ====================

    async transitionScreens(from, to, exitStyle = 'exit-zoom') {
        if (this._transitioning) return;
        this._transitioning = true;

        this.audio.playTransition();

        from.classList.remove('active');
        from.classList.add(exitStyle);

        // Wait for CSS transition to mostly complete (matches 0.8s CSS transition)
        await wait(600);

        from.classList.add('hidden');
        from.classList.remove(exitStyle);

        to.classList.remove('hidden');
        void to.offsetWidth;
        to.classList.add('active');

        this._transitioning = false;
    }

    // ==================== FLOW ====================

    async enterRitual() {
        await this.transitionScreens(this.ui.entranceSection, this.ui.ritualSection, 'exit-zoom');
    }

    async enterTestIntroFromRitual() {
        const dateStr = this._getBirthDateStr();
        const city = document.getElementById('birth-city').value;
        const hourStr = document.getElementById('birth-hour').value;

        if (!dateStr || !city) {
            this.showToast('请至少填写诞生日和降临之地');
            return;
        }

        this.city = city;
        this.dateStr = dateStr;
        this.hourStr = hourStr;

        const [y, m, d] = dateStr.split('-').map(Number);
        const hour = hourStr !== '' ? parseInt(hourStr, 10) : 12;

        const bazi = this.baziCalc.calculate(y, m, d, hour);

        // Attach solar time info if precise time was provided
        const preciseTime = document.getElementById('birth-time')?.value;
        const cityInfo = BaziCalculator.getCityData(city);
        if (preciseTime && cityInfo) {
            const [ph, pm] = preciseTime.split(':').map(Number);
            const solarH = this.baziCalc.trueSolarHour(ph, pm, cityInfo.lng, m, d, cityInfo.tz);
            bazi.solarTimeInfo = {
                clockTime: preciseTime,
                city: city,
                longitude: cityInfo.lng,
                timezone: cityInfo.tz,
                solarHour: solarH
            };
        }

        this.currentBazi = bazi;

        this.applyElementTheme(bazi.theme);

        // Go directly to test intro (skip cosmos animation for unified flow)
        await this.transitionScreens(this.ui.ritualSection, this.ui.testIntroSection, 'exit-up');
    }

    // Legacy enterCosmos kept for archive view
    async enterCosmos() {
        // noop — kept for compatibility
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

        // Phase 6: Stem-Zodiac Synthesis
        if (bazi.stemZodiacSynthesis) {
            this.ui.synthesisBadge.textContent = bazi.stemZodiacSynthesis.relation;
            this.ui.synthesisDesc.textContent = bazi.stemZodiacSynthesis.desc;
        }

        // Phase 6: Complementary Advice
        if (bazi.complementaryAdvice) {
            const adv = bazi.complementaryAdvice;
            this.ui.complementTags.innerHTML = [
                `宜补 ${adv.weakElement}`,
                adv.color,
                adv.direction,
                adv.season
            ].map(t => `<span class="complement-tag">${escapeHTML(t)}</span>`).join('');
            this.ui.complementText.textContent = adv.text;
        }
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

        // Audio + Celebration
        this.audio.playReveal();
        setTimeout(() => {
            this.spawnCelebration();
            this.audio.playCelebration();
        }, 400);

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

            this.audio.playReveal();
            setTimeout(() => {
                this.spawnCelebration();
                this.audio.playCelebration();
            }, 400);

            this.saveToArchive(this.currentBazi);
        }, 1000);
    }

    // ==================== CELEBRATION PARTICLES ====================

    resizeCelebrationCanvas() {
        if (!this.celebrationCanvas) return;
        this.celebrationCanvas.width = window.innerWidth;
        this.celebrationCanvas.height = window.innerHeight;
    }

    spawnCelebration() {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const colors = [
            'rgba(200, 160, 255,', // purple
            'rgba(100, 160, 255,', // blue
            'rgba(255, 240, 220,', // warm white
            'rgba(255, 160, 200,', // pink
            'rgba(160, 255, 200,', // mint
        ];

        for (let i = 0; i < 80; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            const isStar = Math.random() > 0.5;
            this.celebrationParticles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: 2 + Math.random() * 4,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                alpha: 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                isStar,
                gravity: 0.06 + Math.random() * 0.04,
                drag: 0.98
            });
        }

        if (!this._celebrationAnimId) {
            this._animateCelebration();
        }
    }

    _animateCelebration() {
        const ctx = this.celebrationCtx;
        const w = this.celebrationCanvas.width;
        const h = this.celebrationCanvas.height;
        const particles = this.celebrationParticles;

        ctx.clearRect(0, 0, w, h);

        // Forward loop with swap-and-pop for O(1) removal
        let count = particles.length;
        for (let i = 0; i < count; i++) {
            const p = particles[i];

            p.vx *= p.drag;
            p.vy *= p.drag;
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.alpha -= 0.012;

            if (p.alpha <= 0) {
                particles[i] = particles[count - 1];
                particles.pop();
                count--;
                i--;
                continue;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color + p.alpha + ')';

            if (p.isStar) {
                ctx.beginPath();
                for (let j = 0; j < 5; j++) {
                    const a = (j * 4 * Math.PI) / 5 - Math.PI / 2;
                    const r = j % 2 === 0 ? p.size : p.size * 0.4;
                    if (j === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                }
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }

        if (count > 0) {
            this._celebrationAnimId = requestAnimationFrame(() => this._animateCelebration());
        } else {
            this._celebrationAnimId = null;
        }
    }

    // ==================== RESET ====================

    async reset() {
        const root = document.documentElement;
        root.style.setProperty('--element-color', '#8cb4ff');
        root.style.setProperty('--element-glow', 'rgba(140, 180, 255, 0.5)');
        root.style.setProperty('--element-bg', 'rgba(140, 180, 255, 0.08)');
        document.body.classList.remove('element-revealed');

        this.currentBazi = null;

        await this.transitionScreens(this.ui.identitySection, this.ui.entranceSection, 'exit-zoom');

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
        const count = this.loadArchive().length + this.loadTestArchive().length;
        this.ui.archiveCount.textContent = count > 0 ? count : '';
    }

    showArchive() {
        // Reset to bazi tab
        document.querySelectorAll('.archive-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === 'bazi');
        });
        this.ui.archiveGrid.classList.remove('hidden');
        this.ui.testArchiveGrid.classList.add('hidden');
        this.renderArchiveGrid();
        this.ui.archiveOverlay.classList.remove('hidden');
    }

    hideArchive() {
        this.ui.archiveOverlay.classList.add('hidden');
        // Reset compare mode
        if (this._compareMode) {
            this._compareMode = false;
            this._compareSelected = [];
            const bar = document.getElementById('archive-compare-bar');
            const panel = document.getElementById('archive-compare-panel');
            const toggle = document.getElementById('archive-compare-toggle');
            if (bar) bar.classList.add('hidden');
            if (panel) panel.classList.add('hidden');
            if (toggle) toggle.textContent = '对比模式';
        }
    }

    renderArchiveGrid() {
        const archive = this.loadArchive();
        const grid = this.ui.archiveGrid;

        if (archive.length === 0) {
            grid.innerHTML = '<div class="archive-empty">尚无探索记录</div>';
            return;
        }

        grid.innerHTML = archive.map(item => `
            <div class="archive-item" data-key="${escapeHTML(item.key)}">
                <button class="archive-item-delete" data-id="${item.id}" title="删除">&times;</button>
                <div class="archive-item-element">${escapeHTML(item.mainElement)}</div>
                <div class="archive-item-name">${escapeHTML(item.cosmicName)}</div>
                <div class="archive-item-meta">属${escapeHTML(item.zodiac)} · ${escapeHTML(item.yinYang)}${escapeHTML(item.mainElement)} · ${escapeHTML(item.city)}</div>
            </div>
        `).join('');

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

    // ==================== TEST ARCHIVE ====================

    loadTestArchive() {
        try {
            return JSON.parse(localStorage.getItem(TEST_ARCHIVE_KEY)) || [];
        } catch {
            return [];
        }
    }

    saveTestToArchive(results) {
        const archive = this.loadTestArchive();
        const key = `${results.mbti.type}_${results.enneagram.type}w${results.enneagram.wing}_${this.testMode}`;

        const entry = {
            key,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            testMode: this.testMode,
            mbtiType: results.mbti.type,
            mbtiCosmic: results.mbti.cosmic,
            enneagramType: results.enneagram.type,
            enneagramWing: results.enneagram.wing,
            enneagramCosmic: results.enneagram.cosmic,
            big5Top: this._getTopBig5(results.big5),
            results: results
        };

        if (this.currentBazi) entry.bazi = this.currentBazi;
        if (this._lastIChingResult) entry.iching = this._lastIChingResult;

        archive.unshift(entry);

        if (archive.length > 20) archive.length = 20;
        localStorage.setItem(TEST_ARCHIVE_KEY, JSON.stringify(archive));
        this.updateArchiveCount();
    }

    _getTopBig5(big5) {
        const keys = ['o', 'c', 'ex', 'a', 'n'];
        const names = { o: '开放', c: '自律', ex: '外向', a: '宜人', n: '情绪' };
        let topKey = keys[0];
        keys.forEach(k => { if (big5.percentages[k] > big5.percentages[topKey]) topKey = k; });
        return names[topKey];
    }

    deleteTestFromArchive(id) {
        let archive = this.loadTestArchive();
        archive = archive.filter(a => a.id !== id);
        localStorage.setItem(TEST_ARCHIVE_KEY, JSON.stringify(archive));
        this.updateArchiveCount();
        this.renderTestArchiveGrid();
    }

    renderTestArchiveGrid() {
        const archive = this.loadTestArchive();
        const grid = this.ui.testArchiveGrid;

        if (archive.length === 0) {
            grid.innerHTML = '<div class="archive-empty">尚无人格测试记录</div>';
            return;
        }

        grid.innerHTML = archive.map(item => {
            const date = new Date(item.timestamp);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
            const modeLabel = item.testMode === 'quick' ? '闪电' : '深度';
            return `
                <div class="archive-item" data-id="${item.id}">
                    <button class="archive-item-delete" data-id="${item.id}" title="删除">&times;</button>
                    <div class="archive-item-element">${escapeHTML(item.mbtiType)}</div>
                    <div class="archive-item-name">${escapeHTML(item.mbtiCosmic)}</div>
                    <div class="archive-item-meta">Type ${escapeHTML(String(item.enneagramType))}「${escapeHTML(item.enneagramCosmic)}」· ${modeLabel}模式</div>
                    <div class="archive-item-meta">${dateStr}</div>
                </div>
            `;
        }).join('');

    }

    // ==================== ARCHIVE COMPARISON ====================

    toggleCompareMode() {
        this._compareMode = !this._compareMode;
        this._compareSelected = [];
        const bar = document.getElementById('archive-compare-bar');
        const panel = document.getElementById('archive-compare-panel');
        const toggle = document.getElementById('archive-compare-toggle');

        if (this._compareMode) {
            // Must be on test tab
            const testTab = document.querySelector('.archive-tab[data-tab="test"]');
            if (testTab && !testTab.classList.contains('active')) {
                testTab.click();
            }
            bar.classList.remove('hidden');
            panel.classList.add('hidden');
            toggle.textContent = '退出对比';
            // Add compare-mode class to items
            this.ui.testArchiveGrid.querySelectorAll('.archive-item').forEach(el => {
                el.classList.add('compare-mode');
                el.classList.remove('compare-selected');
            });
        } else {
            bar.classList.add('hidden');
            panel.classList.add('hidden');
            toggle.textContent = '对比模式';
            this.ui.testArchiveGrid.querySelectorAll('.archive-item').forEach(el => {
                el.classList.remove('compare-mode', 'compare-selected');
                el.removeAttribute('aria-selected');
            });
        }
        this.updateCompareCount();
    }

    toggleCompareSelect(itemEl) {
        const id = parseInt(itemEl.dataset.id, 10);
        const idx = this._compareSelected.indexOf(id);
        if (idx >= 0) {
            this._compareSelected.splice(idx, 1);
            itemEl.classList.remove('compare-selected');
            itemEl.setAttribute('aria-selected', 'false');
        } else if (this._compareSelected.length < 2) {
            this._compareSelected.push(id);
            itemEl.classList.add('compare-selected');
            itemEl.setAttribute('aria-selected', 'true');
        }
        this.updateCompareCount();
    }

    updateCompareCount() {
        const countEl = document.getElementById('compare-count');
        const goBtn = document.getElementById('compare-go-btn');
        if (countEl) countEl.textContent = `已选 ${this._compareSelected.length}/2`;
        if (goBtn) goBtn.disabled = this._compareSelected.length !== 2;
    }

    showComparison() {
        const archive = this.loadTestArchive();
        const a = archive.find(x => x.id === this._compareSelected[0]);
        const b = archive.find(x => x.id === this._compareSelected[1]);
        if (!a || !b) return;

        const panel = document.getElementById('archive-compare-panel');
        const fmtDate = (ts) => {
            const d = new Date(ts);
            return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
        };

        // MBTI dimensions
        const mbtiDims = ['E/I', 'S/N', 'T/F', 'J/P'];
        const dimKeys = [
            { key: 'ei', left: 'E', right: 'I' },
            { key: 'sn', left: 'S', right: 'N' },
            { key: 'tf', left: 'T', right: 'F' },
            { key: 'jp', left: 'J', right: 'P' }
        ];

        let dimsHtml = '';
        dimKeys.forEach((dim, i) => {
            const aVal = a.results.mbti.dimensions?.[dim.key] ?? 50;
            const bVal = b.results.mbti.dimensions?.[dim.key] ?? 50;
            dimsHtml += `<div class="compare-dim-row">
                <div class="compare-dim-label">${mbtiDims[i]}</div>
                <div class="compare-dim-bars">
                    <div class="compare-bar-track"><div class="compare-bar-a" style="width:${aVal}%"></div></div>
                    <div class="compare-bar-track"><div class="compare-bar-b" style="width:${bVal}%"></div></div>
                </div>
            </div>`;
        });

        // Big5 dimensions
        const b5Labels = { o: '开放', c: '尽责', ex: '外向', a: '宜人', n: '情绪' };
        let b5Html = '';
        if (a.results.big5?.percentages && b.results.big5?.percentages) {
            Object.entries(b5Labels).forEach(([key, label]) => {
                const aV = Math.round(a.results.big5.percentages[key] || 0);
                const bV = Math.round(b.results.big5.percentages[key] || 0);
                b5Html += `<div class="compare-dim-row">
                    <div class="compare-dim-label">${label}</div>
                    <div class="compare-dim-bars">
                        <div class="compare-bar-track"><div class="compare-bar-a" style="width:${aV}%"></div></div>
                        <div class="compare-bar-track"><div class="compare-bar-b" style="width:${bV}%"></div></div>
                    </div>
                </div>`;
            });
        }

        // Hexagram names
        let hexHtml = '';
        if (a.iching?.primary || b.iching?.primary) {
            const aHex = a.iching?.primary?.name || '—';
            const bHex = b.iching?.primary?.name || '—';
            hexHtml = `<div class="compare-section-label">卦象</div>
                <div class="compare-hex-row">
                    <div class="compare-hex-item"><div class="compare-hex-name">${escapeHTML(aHex)}卦</div></div>
                    <div class="compare-vs">✦</div>
                    <div class="compare-hex-item"><div class="compare-hex-name">${escapeHTML(bHex)}卦</div></div>
                </div>`;
        }

        panel.innerHTML = `
            <div class="compare-header">人格轨迹对比</div>
            <div class="compare-legend">
                <div class="compare-legend-item"><span class="compare-legend-dot-a"></span>${fmtDate(a.timestamp)}</div>
                <div class="compare-legend-item"><span class="compare-legend-dot-b"></span>${fmtDate(b.timestamp)}</div>
            </div>
            <div class="compare-row">
                <div class="compare-side">
                    <div class="compare-type">${escapeHTML(a.mbtiType)}</div>
                    <div class="compare-cosmic">${escapeHTML(a.mbtiCosmic)}</div>
                </div>
                <div class="compare-vs">VS</div>
                <div class="compare-side">
                    <div class="compare-type">${escapeHTML(b.mbtiType)}</div>
                    <div class="compare-cosmic">${escapeHTML(b.mbtiCosmic)}</div>
                </div>
            </div>
            <div class="compare-section-label">MBTI 维度</div>
            ${dimsHtml}
            ${b5Html ? `<div class="compare-section-label">大五人格</div>${b5Html}` : ''}
            <div class="compare-section-label">九型人格</div>
            <div class="compare-enn-row">
                <div class="compare-enn-item">
                    <div class="compare-enn-num">Type ${a.enneagramType}</div>
                    <div class="compare-enn-label">${escapeHTML(a.enneagramCosmic)}</div>
                </div>
                <div class="compare-vs">✦</div>
                <div class="compare-enn-item">
                    <div class="compare-enn-num">Type ${b.enneagramType}</div>
                    <div class="compare-enn-label">${escapeHTML(b.enneagramCosmic)}</div>
                </div>
            </div>
            ${hexHtml}
        `;
        panel.classList.remove('hidden');
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    viewTestArchiveItem(item) {
        this.hideArchive();
        this._lastTestResults = item.results;
        this.testMode = item.testMode;

        // Restore bazi if saved
        if (item.bazi) {
            this.currentBazi = item.bazi;
            this.populateBaziResults(item.bazi);
        }

        // Restore iching if saved
        if (item.iching) {
            this._lastIChingResult = item.iching;
            this.populateIChingResults(item.iching);
        }

        this.populateTestResults(item.results);
        this.renderConstellation(item.results);

        // Show results directly
        const sections = [this.ui.entranceSection, this.ui.ritualSection, this.ui.identitySection, this.ui.testIntroSection, this.ui.testQuestionsSection];
        sections.forEach(s => { s.classList.remove('active'); s.classList.add('hidden'); });

        // Show hero card immediately
        const heroCard = document.getElementById('card-core');
        heroCard.classList.remove('reveal-hidden');
        heroCard.classList.add('reveal-show');

        // Show tabs immediately
        this._radarAnimated = false;
        this.ui.primaryTabs.classList.add('show');
        this.switchPrimaryTab('personality');
        this.ui.resultTabs.classList.add('show');
        this.switchResultTab('cognitive');

        this.ui.testResultsSection.classList.remove('hidden');
        void this.ui.testResultsSection.offsetWidth;
        this.ui.testResultsSection.classList.add('active');

        // Animate dimensions
        this.ui.mbtiDimensions.querySelectorAll('.mbti-dim-fill').forEach(el => {
            el.style.width = el.dataset.target + '%';
        });
        this.ui.mbtiDimensions.querySelectorAll('[data-counter]').forEach(el => {
            this.animateCounter(el, parseInt(el.dataset.counter, 10));
        });

        // Animate bazi element bars
        if (item.bazi) {
            this.populateElementChartResult(item.bazi.elementCounts);
        }

        this.populateCrossInsights();
        this.initResultCardEffects();
        this.applyMBTITheme(item.results.mbti.type);

        // AI enhancement if available
        if (this.ai.hasKey) {
            this.triggerAIPersonality();
        }
    }

    // ==================== PERSONALITY TEST ====================

    async enterTestIntro() {
        // No longer used directly — entrance now goes to ritual first
    }

    get testTotal() {
        return this.testMode === 'quick'
            ? this.personalityTest.quickQuestionIndices.length
            : this.personalityTest.questions.length;
    }

    getQuestionByIndex(i) {
        if (this.testMode === 'quick') {
            const realIdx = this.personalityTest.quickQuestionIndices[i];
            return this.personalityTest.questions[realIdx];
        }
        return this.personalityTest.questions[i];
    }

    async startTest() {
        const total = this.testTotal;
        this.testAnswers = new Array(total).fill(null);
        this.testCurrentQ = 0;
        this._runningScores = { ei: 0, sn: 0, tf: 0, jp: 0 };
        this._runningCounts = { ei: 0, sn: 0, tf: 0, jp: 0 };

        // Update ARIA max
        const progressRegion = document.getElementById('test-progress-region');
        if (progressRegion) progressRegion.setAttribute('aria-valuemax', total);

        await this.transitionScreens(this.ui.testIntroSection, this.ui.testQuestionsSection, 'exit-left');

        this.showQuestion(0);
    }

    showQuestion(index) {
        const total = this.testTotal;
        const q = this.getQuestionByIndex(index);
        if (!q) return;

        const wrapper = this.ui.questionWrapper;

        // Question flip animation
        wrapper.classList.remove('q-enter');
        wrapper.classList.add('q-exit');

        setTimeout(() => {
            const personLabel = this.dualMode ? `${this.dualNames[this.dualCurrentPerson]} · ` : '';
            this.ui.questionNumber.textContent = `${personLabel}Q${index + 1}`;
            this.ui.questionText.textContent = q.text;
            this.ui.testProgressText.textContent = `${index + 1} / ${total}`;
            this.ui.testProgressBar.style.transform = `scaleX(${(index + 1) / total})`;

            // Update progressbar ARIA
            const progressRegion = document.getElementById('test-progress-region');
            if (progressRegion) progressRegion.setAttribute('aria-valuenow', index + 1);

            // Show/hide prev button
            this.ui.testPrevBtn.style.visibility = index > 0 ? 'visible' : 'hidden';

            // Highlight previously selected answer
            document.querySelectorAll('.scale-btn').forEach(btn => {
                const val = parseInt(btn.dataset.value, 10);
                btn.classList.toggle('selected', val === this.testAnswers[index]);
            });

            wrapper.classList.remove('q-exit');
            wrapper.classList.add('q-enter');

            setTimeout(() => wrapper.classList.remove('q-enter'), 250);
        }, 200);
    }

    async selectAnswer(value) {
        const q = this.getQuestionByIndex(this.testCurrentQ);
        const oldValue = this.testAnswers[this.testCurrentQ];

        // Rollback old answer's contribution if re-answering (after prevQuestion)
        if (oldValue != null && q && q.w) {
            const oldCentered = oldValue - 3;
            ['ei', 'sn', 'tf', 'jp'].forEach(dim => {
                if (q.w[dim]) {
                    this._runningScores[dim] -= q.w[dim] * oldCentered;
                    this._runningCounts[dim]--;
                }
            });
        }

        this.testAnswers[this.testCurrentQ] = value;

        // Update running dimension scores for dynamic starfield
        if (q && q.w) {
            const centered = value - 3; // -2 to +2
            ['ei', 'sn', 'tf', 'jp'].forEach(dim => {
                if (q.w[dim]) {
                    this._runningScores[dim] += q.w[dim] * centered;
                    this._runningCounts[dim]++;
                }
            });
            this.updateStarfieldMood();
        }

        // Audio feedback
        this.audio.playAnswer(this.testCurrentQ);

        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(15);

        // Highlight the selected button briefly + particle burst
        const selectedBtn = document.querySelector(`.scale-btn[data-value="${value}"]`);
        document.querySelectorAll('.scale-btn').forEach(btn => {
            const val = parseInt(btn.dataset.value, 10);
            btn.classList.toggle('selected', val === value);
        });
        this.burstParticles(selectedBtn);

        await wait(250);

        const total = this.testTotal;
        const answeredCount = this.testCurrentQ + 1;

        // Check for milestone
        const milestones = this.testMode === 'quick'
            ? this.personalityTest.milestoneMessages.quick
            : this.personalityTest.milestoneMessages.deep;
        const milestone = milestones.find(m => m.at === answeredCount);

        if (milestone && answeredCount < total) {
            await this.showMilestone(milestone, answeredCount, total);
        }

        if (this.testCurrentQ < total - 1) {
            this.testCurrentQ++;
            this.showQuestion(this.testCurrentQ);
        } else if (this.dualMode) {
            await this.completeDualPerson();
        } else {
            this.calculateAndShowResults();
        }
    }

    async showMilestone(milestone, current, total) {
        const overlay = this.ui.milestoneOverlay;
        overlay.classList.remove('hidden');
        void overlay.offsetWidth;

        this.ui.milestoneDim.textContent = milestone.dim;
        this.ui.milestoneText.textContent = milestone.text;
        this.ui.milestoneCount.textContent = `${current}/${total}`;

        // Animate ring
        const circumference = 220; // 2 * PI * 35
        const offset = circumference * (1 - current / total);
        this.ui.milestoneRing.style.strokeDashoffset = circumference;
        void this.ui.milestoneRing.offsetWidth;

        overlay.classList.add('visible');
        await wait(100);
        this.ui.milestoneRing.style.strokeDashoffset = offset;

        this.audio.playReveal();

        await wait(1800);

        overlay.classList.remove('visible');
        await wait(500);
        overlay.classList.add('hidden');
    }

    prevQuestion() {
        if (this.testCurrentQ > 0) {
            this.testCurrentQ--;
            this.showQuestion(this.testCurrentQ);
        }
    }

    async calculateAndShowResults() {
        const questionIndices = this.testMode === 'quick'
            ? this.personalityTest.quickQuestionIndices
            : null;
        const results = this.personalityTest.calculateResults(this.testAnswers, questionIndices);
        this._lastTestResults = results;

        // Cast I Ching hexagram (deterministic from bazi + test results)
        if (this.currentBazi) {
            this._lastIChingResult = this.iching.castHexagram(this.currentBazi, results);
        }

        // Hide questions
        this.ui.testQuestionsSection.classList.remove('active');
        this.ui.testQuestionsSection.classList.add('exit-left');
        await wait(600);
        this.ui.testQuestionsSection.classList.add('hidden');
        this.ui.testQuestionsSection.classList.remove('exit-left');

        // Show unified analyzing interlude (3 steps)
        this.showAnalyzingPhase();
        this.starfield.warpSpeed();
        this.audio.playWarp();
        await wait(4000);
        this.starfield.steadySpeed();
        await wait(400);
        this.hideAnalyzingPhase();
        await wait(400);

        // Populate all results: bazi + personality + iching
        this.populateTestResults(results);
        if (this.currentBazi) {
            this.populateBaziResults(this.currentBazi);
        }
        if (this._lastIChingResult) {
            this.populateIChingResults(this._lastIChingResult);
        }
        this.renderConstellation(results);

        // Hide hero card for reveal animation
        const heroCard = document.getElementById('card-core');
        heroCard.classList.add('reveal-hidden');

        // Hide secondary tabs initially
        this.ui.resultTabs.classList.remove('show');
        this._radarAnimated = false;

        // Reset to bazi primary tab, cognitive secondary tab
        this.switchPrimaryTab('bazi');
        this.switchResultTab('cognitive');

        this.ui.testResultsSection.classList.remove('hidden');
        void this.ui.testResultsSection.offsetWidth;
        this.ui.testResultsSection.classList.add('active');

        // Starfield results mode + theme
        this.applyMBTITheme(results.mbti.type);
        if (this.currentBazi) {
            this.applyNebulaColor(this.currentBazi.mainElement);
        }

        // Celebration
        this.audio.playReveal();
        await wait(300);
        this.spawnCelebration();
        this.audio.playCelebration();

        await wait(200);
        heroCard.classList.add('revealing');
        await wait(400);
        heroCard.classList.remove('revealing');
        heroCard.classList.remove('reveal-hidden');
        heroCard.classList.add('reveal-show');

        // Animate MBTI dimensions
        setTimeout(() => {
            this.ui.mbtiDimensions.querySelectorAll('.mbti-dim-fill').forEach(el => {
                el.style.width = el.dataset.target + '%';
            });
            this.ui.mbtiDimensions.querySelectorAll('[data-counter]').forEach(el => {
                this.animateCounter(el, parseInt(el.dataset.counter, 10));
            });
        }, 100);

        // Show secondary tabs after hero settles
        await wait(600);
        this.ui.resultTabs.classList.add('show');

        // Show primary tabs
        this.ui.primaryTabs.classList.add('show');

        // Animate bazi element bars
        this.populateElementChartResult(this.currentBazi?.elementCounts);

        // Cross-system insights
        this.populateCrossInsights();

        // 3D tilt + holo on result cards
        this.initResultCardEffects();

        // Save to archive
        this.saveTestToArchive(results);

        // AI enhancement
        if (this.ai.hasKey) {
            this.triggerAIPersonality();
        } else {
            this.ui.aiUnlockBtn.classList.remove('hidden');
        }
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
        const lifeAreas = this.personalityTest.generateLifeAreaAnalysis(results);
        const pt = this.personalityTest;

        // ===== Card 1: Core Portrait =====
        this.ui.mbtiType.textContent = results.mbti.type;
        this.ui.mbtiCosmicName.textContent = results.mbti.cosmic;
        this.ui.mbtiTitle.textContent = results.mbti.title || '';

        // Enneagram badge + subtitle
        const enn = results.enneagram;
        this.ui.ennBadge.textContent = `${enn.type}w${enn.wing}`;
        this.ui.ennSubtitle.textContent = `${enn.cosmic} · ${enn.name}`;

        // Combined keywords from MBTI + Enneagram
        const allKeywords = [...(results.mbti.keywords || []), ...(enn.keywords || [])];
        const uniqueKeywords = [...new Set(allKeywords)].slice(0, 7);
        this.ui.coreKeywords.innerHTML = uniqueKeywords
            .map((k, i) => `<span class="keyword-tag" style="animation: tagAppear 0.4s ease-out ${0.8 + i * 0.1}s both;">${escapeHTML(k)}</span>`).join('');

        // Celebrities
        const celebContainer = document.getElementById('mbti-celebrities');
        if (celebContainer && results.mbti.celebrities) {
            celebContainer.innerHTML = `<span class="celeb-label">同类星辰</span>` +
                results.mbti.celebrities.map((c, i) =>
                    `<span class="celeb-tag" style="animation: tagAppear 0.4s ease-out ${1.2 + i * 0.15}s both;">${escapeHTML(c)}</span>`
                ).join('');
        }

        // Dimension bars
        const dims = results.mbti.dimensions;
        const labels = pt.mbtiDimLabels;
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

        // Core description: positioning + MBTI personality portrait + strengths
        this.ui.coreDesc.innerHTML = safeParagraphs(lifeAreas.positioning + '\n\n' + (results.mbti.desc || ''));
        this.ui.coreStrengths.textContent = results.mbti.strengths || '';
        this.ui.coreDrive.textContent = enn.core || '';
        this.ui.coreFear.textContent = enn.fear || '';

        // ===== Card 2: Cognitive Style =====
        const funcs = pt.cognitiveFunctions[results.mbti.type];
        this.ui.cognitiveFnArcs.innerHTML = this.renderCognitiveFnArcs(funcs);
        const roles = pt.functionRoles;
        const fnStrengths = [100, 75, 45, 20]; // visual strength indicator
        this.ui.cognitiveFunctions.innerHTML = funcs.map((fn, i) => {
            const info = pt.functionDescriptions[fn];
            return `
                <div class="cognitive-fn-item fn-level-${i}">
                    <div class="fn-header">
                        <span class="fn-role">${roles[i]}</span>
                        <span class="fn-code">${fn}</span>
                        <span class="fn-name">${escapeHTML(info.name)}</span>
                        <span class="fn-short">${escapeHTML(info.short)}</span>
                    </div>
                    <div class="fn-bar-track">
                        <div class="fn-bar-fill" style="width: ${fnStrengths[i]}%;"></div>
                    </div>
                    <p class="fn-desc">${escapeHTML(info.desc)}</p>
                </div>
            `;
        }).join('');
        this.ui.cognitiveDesc.innerHTML = safeParagraphsWithSections(lifeAreas.cognitiveStyle);

        // ===== Card 3: Relationships =====
        this.ui.socialQuadrant.innerHTML = this.renderSocialQuadrant(dims);
        this.ui.relationshipsDesc.innerHTML = safeParagraphsWithSections(lifeAreas.relationships);

        // ===== Card 4: Work & Energy =====
        const b5 = results.big5;
        this.ui.energySpectrums.innerHTML = this.renderEnergySpectrums(dims, b5.percentages);
        this.ui.workDesc.innerHTML = safeParagraphsWithSections(lifeAreas.workEnergy);

        // ===== Card 5: Stress & Emotions =====
        this.ui.big5Chart.innerHTML = this.renderBig5Radar(b5.percentages, b5.dimensions);

        // Big5 dimension tags
        const b5Dims = ['o', 'c', 'ex', 'a', 'n'];
        this.ui.big5Dims.innerHTML = b5Dims.map(dim => {
            const info = b5.dimensions[dim];
            const pct = b5.percentages[dim];
            const tag = pct >= 50 ? info.high.label : info.low.label;
            return `<span class="b5-dim-tag"><span class="b5-dim-name">${escapeHTML(info.name)}</span><span class="b5-dim-pct">${pct}%</span><span class="b5-dim-trait">${escapeHTML(tag)}</span></span>`;
        }).join('');

        this.ui.stressDesc.innerHTML = safeParagraphsWithSections(lifeAreas.stressEmotions);

        // ===== Card 6: Growth Map =====
        this.ui.ennPath.innerHTML = this.renderEnnPath(results.enneagram.type);
        const gm = lifeAreas.growthMap;
        this.ui.growthDesc.innerHTML = safeParagraphsWithSections(gm.overview);
        this.ui.growthCognitive.textContent = gm.cognitive;
        this.ui.growthActions.textContent = gm.actions;

        // Reset AI primary tab
        this.ui.tabAI.classList.add('hidden');
        this.ui.aiInsightText.innerHTML = '';
    }

    // ==================== BAZI RESULTS POPULATION ====================

    populateBaziResults(bazi) {
        // Hero card
        document.getElementById('element-symbol-result').textContent = bazi.mainElement;
        document.getElementById('bazi-result-name').textContent = bazi.cosmicName;
        document.getElementById('bazi-result-zodiac').textContent = `属${bazi.year.zodiac}`;
        document.getElementById('bazi-result-yinyang').textContent = `${bazi.yinYang}${bazi.mainElement}`;

        // Pattern badge
        if (bazi.pattern) {
            document.getElementById('bazi-result-pattern-badge').textContent = bazi.pattern.name;
        }

        // Enhanced pillars with hidden stems + ten gods
        const pillarsEl = document.getElementById('bazi-pillars-enhanced');
        const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
        const pillarKeys = ['year', 'month', 'day', 'hour'];

        pillarsEl.innerHTML = pillarKeys.map((key, i) => {
            const pillar = bazi[key];
            const hidden = bazi.hiddenStems[key];
            const tenGod = key === 'day' ? '日主' : (bazi.tenGods[key + 'Stem'] || '');
            const hiddenGods = bazi.tenGods.hidden[key] || [];

            return `
                <div class="bazi-pillar-enhanced">
                    <div class="bazi-pillar-label">${pillarNames[i]}</div>
                    ${tenGod ? `<div class="bazi-tengod-tag">${escapeHTML(tenGod)}</div>` : '<div class="bazi-tengod-tag dim">日主</div>'}
                    <div class="bazi-pillar-stem">${escapeHTML(pillar.stem)}</div>
                    <div class="bazi-pillar-branch">${escapeHTML(pillar.branch)}</div>
                    <div class="bazi-hidden-stems">
                        ${hidden.map((s, j) => {
                            const god = hiddenGods[j] ? hiddenGods[j].god : '';
                            return `<span class="bazi-hidden-stem" title="${escapeHTML(god)}">${escapeHTML(s)}</span>`;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Day master strength
        const dms = bazi.dayMasterStrength;
        document.getElementById('day-master-strength').innerHTML = `
            <div class="dms-header">
                <span class="dms-label">日主</span>
                <span class="dms-element">${escapeHTML(bazi.dayMaster)}${escapeHTML(bazi.mainElement)}</span>
                <span class="dms-strength dms-${dms.strength === '偏强' ? 'strong' : dms.strength === '偏弱' ? 'weak' : 'neutral'}">${escapeHTML(dms.strength)}</span>
            </div>
            <p class="dms-analysis">${escapeHTML(dms.analysis)}</p>
        `;

        // Pattern section
        document.getElementById('pattern-section').innerHTML = `
            <div class="pattern-badge-large">${escapeHTML(bazi.pattern.name)}</div>
            <p class="pattern-desc">${escapeHTML(bazi.pattern.desc)}</p>
        `;

        // Five elements (result version)
        document.getElementById('wuxing-insight-result').textContent = bazi.wuxingInsight;

        // Complementary advice
        if (bazi.complementaryAdvice) {
            const adv = bazi.complementaryAdvice;
            document.getElementById('complement-tags-result').innerHTML = [
                `宜补 ${adv.weakElement}`,
                adv.color,
                adv.direction,
                adv.season
            ].map(t => `<span class="complement-tag">${escapeHTML(t)}</span>`).join('');
            document.getElementById('complement-text-result').textContent = adv.text;
        }
    }

    populateElementChartResult(counts) {
        if (!counts) return;
        const ids = {
            '木': { bar: 'bar-wood-r', count: 'count-wood-r' },
            '火': { bar: 'bar-fire-r', count: 'count-fire-r' },
            '土': { bar: 'bar-earth-r', count: 'count-earth-r' },
            '金': { bar: 'bar-metal-r', count: 'count-metal-r' },
            '水': { bar: 'bar-water-r', count: 'count-water-r' }
        };
        const max = Math.max(...Object.values(counts), 1);

        // Reset bars first
        Object.entries(ids).forEach(([, v]) => {
            const el = document.getElementById(v.bar);
            if (el) el.style.width = '0%';
        });

        // Animate bars after a delay
        setTimeout(() => {
            Object.entries(counts).forEach(([element, count]) => {
                const v = ids[element];
                if (!v) return;
                const pct = (count / max) * 100;
                const barEl = document.getElementById(v.bar);
                const countEl = document.getElementById(v.count);
                if (barEl) barEl.style.width = pct + '%';
                if (countEl) countEl.textContent = count;
            });
        }, 300);
    }

    // ==================== ICHING RESULTS POPULATION ====================

    populateIChingResults(result) {
        // Primary hexagram display (6 lines)
        const displayEl = document.getElementById('hexagram-display');
        displayEl.innerHTML = this.renderHexagramLines(result.primaryLines, result.changingLines);

        document.getElementById('hexagram-name').textContent =
            `${result.primary.name}卦（第${result.primary.num}卦）`;
        document.getElementById('hexagram-nature').textContent = result.primary.nature;
        document.getElementById('hexagram-judgement').textContent = `卦辞：${result.primary.judgement}`;
        document.getElementById('hexagram-image').textContent = result.primary.image;

        // Stagger reveal animation: bottom (初爻) → top (上爻)
        const hexLines = displayEl.querySelectorAll('.hex-line');
        const linesContainer = displayEl.querySelector('.hexagram-lines');
        if (linesContainer) linesContainer.classList.add('animating');
        const lineArr = Array.from(hexLines).reverse(); // DOM top→bottom reversed = 初→上
        lineArr.forEach((line, i) => {
            setTimeout(() => {
                line.classList.add('revealed');
                this.audio.playYaoReveal(i);
                if (line.classList.contains('changing')) {
                    this.audio.playChangingYao();
                }
            }, 200 + i * 280);
        });

        // Click-to-expand yao detail (event delegation, bind once)
        displayEl._ichingResult = result; // update reference for click handler
        if (!displayEl._yaoClickBound) {
            displayEl._yaoClickBound = true;
            displayEl.addEventListener('click', (e) => {
                const line = e.target.closest('.hex-line');
                if (!line) return;
                const yaoIdx = parseInt(line.dataset.yao);
                const detail = displayEl.querySelector(`[data-yao-detail="${yaoIdx}"]`);
                if (!detail) return;
                if (detail.classList.contains('expanded')) {
                    detail.classList.remove('expanded');
                } else {
                    displayEl.querySelectorAll('.hex-line-detail.expanded').forEach(d => d.classList.remove('expanded'));
                    if (!detail.innerHTML) {
                        const curResult = displayEl._ichingResult;
                        const lt = this.iching.getLineText(curResult.primary.num, yaoIdx);
                        detail.innerHTML = `<div class="hex-line-detail-classical">${escapeHTML(lt.text)}</div>
                            <div class="hex-line-detail-text">${escapeHTML(lt.interpretation)}</div>`;
                    }
                    detail.classList.add('expanded');
                    this.audio.playClick();
                }
            });
        }

        // Transformed hexagram
        const transCard = document.getElementById('card-iching-transformed');
        if (result.transformed && result.changingLines.length > 0) {
            transCard.classList.remove('hidden');

            const transformedLines = [...result.primaryLines];
            result.changingLines.forEach(i => {
                transformedLines[i] = transformedLines[i] === 1 ? 0 : 1;
            });

            document.getElementById('hexagram-mini-primary').innerHTML =
                this.renderHexagramLinesMini(result.primaryLines);
            document.getElementById('hexagram-mini-transformed').innerHTML =
                this.renderHexagramLinesMini(transformedLines);

            document.getElementById('hexagram-trans-name').textContent =
                `${result.transformed.name}卦（第${result.transformed.num}卦）`;
            document.getElementById('hexagram-trans-nature').textContent = result.transformed.nature;
        } else {
            transCard.classList.add('hidden');
        }

        // Changing line texts (爻辞)
        const linesCard = document.getElementById('card-iching-lines');
        const linesList = document.getElementById('yao-lines-list');
        if (result.changingLines.length > 0) {
            const lineData = this.iching.getChangingLineTexts(result.primary.num, result.changingLines);
            linesList.innerHTML = lineData.map(ld => `
                <div class="yao-line-item">
                    <div class="yao-line-position">${escapeHTML(ld.position)}</div>
                    <div class="yao-line-classical">${escapeHTML(ld.text)}</div>
                    <div class="yao-line-interpretation">${escapeHTML(ld.interpretation)}</div>
                </div>
            `).join('');
            linesCard.classList.remove('hidden');
        } else {
            linesCard.classList.add('hidden');
        }

        // Interpretation
        document.getElementById('iching-interpretation').innerHTML =
            safeParagraphs(result.interpretation);

        // Cosmic advice
        document.getElementById('iching-cosmic-advice').textContent = result.cosmicAdvice;

        // Apply I Ching theme color based on upper trigram element
        this.applyIChingTheme(result);
    }

    populateCrossInsights() {
        const insights = generateCrossSystemInsights(this.currentBazi, this._lastTestResults, this._lastIChingResult);
        const baziEl = document.getElementById('bazi-cross-text');
        const persEl = document.getElementById('personality-cross-text');
        const ichEl = document.getElementById('iching-cross-text');
        if (baziEl) baziEl.textContent = insights.baziInsight;
        if (persEl) persEl.textContent = insights.personalityInsight;
        if (ichEl) ichEl.textContent = insights.ichingInsight;
    }

    renderHexagramLines(lines, changingLines = []) {
        // Render 6 lines from bottom (index 0) to top (index 5)
        let html = '<div class="hexagram-lines">';
        for (let i = 5; i >= 0; i--) {
            const isYang = lines[i] === 1;
            const isChanging = changingLines.includes(i);
            const changingClass = isChanging ? ' changing' : '';
            const yaoLabel = this.iching.yaoNames[i];

            if (isYang) {
                html += `<div class="hex-line yang${changingClass}" data-yao="${i}" title="${yaoLabel}">
                    <div class="hex-line-solid"></div>
                    ${isChanging ? '<span class="hex-changing-mark">○</span>' : ''}
                </div>`;
            } else {
                html += `<div class="hex-line yin${changingClass}" data-yao="${i}" title="${yaoLabel}">
                    <div class="hex-line-broken"><span></span><span></span></div>
                    ${isChanging ? '<span class="hex-changing-mark">×</span>' : ''}
                </div>`;
            }
            // Expandable detail panel per yao
            html += `<div class="hex-line-detail" data-yao-detail="${i}"></div>`;
        }
        html += '</div>';
        return html;
    }

    renderHexagramLinesMini(lines) {
        let html = '<div class="hexagram-lines-mini">';
        for (let i = 5; i >= 0; i--) {
            if (lines[i] === 1) {
                html += '<div class="hex-line-mini yang"><div class="hex-line-solid-mini"></div></div>';
            } else {
                html += '<div class="hex-line-mini yin"><div class="hex-line-broken-mini"><span></span><span></span></div></div>';
            }
        }
        html += '</div>';
        return html;
    }

    // ==================== PRIMARY TAB NAVIGATION ====================

    switchPrimaryTab(tabName) {
        const prevIdx = this._currentPrimaryTab;
        const newIdx = this._primaryTabNames.indexOf(tabName);
        const direction = newIdx > prevIdx ? 'slide-right' : 'slide-left';
        this._currentPrimaryTab = newIdx;

        // Update primary tab buttons
        this.ui.primaryTabs.querySelectorAll('.primary-tab').forEach(t => {
            const isActive = t.dataset.ptab === tabName;
            t.classList.toggle('active', isActive);
            t.setAttribute('aria-selected', isActive);
        });

        // Update primary panels with slide direction
        document.querySelectorAll('.primary-panel').forEach(p => {
            p.classList.remove('active', 'slide-left', 'slide-right');
            if (p.dataset.ppanel === tabName) {
                p.classList.add('active', direction);
            }
        });

        // Show/hide secondary tabs based on which primary tab is active
        if (tabName === 'personality') {
            this.ui.resultTabs.classList.add('show');
        } else {
            this.ui.resultTabs.classList.remove('show');
        }

        // Trigger radar animation when stress panel is shown
        if (tabName === 'personality' && this._tabNames[this._currentTab] === 'stress' && !this._radarAnimated) {
            this._radarAnimated = true;
            setTimeout(() => this.animateRadar(), 200);
        }

        // Scroll active tab into view
        const activeTab = this.ui.primaryTabs.querySelector('.primary-tab.active');
        if (activeTab) {
            activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    applyIChingTheme(result) {
        const trigramEl = { '乾': 'metal', '兑': 'metal', '离': 'fire', '震': 'wood', '巽': 'wood', '坎': 'water', '艮': 'earth', '坤': 'earth' };
        const elem = trigramEl[result.primary.upper] || 'metal';
        const panel = document.querySelector('[data-ppanel="iching"]');
        if (panel) {
            panel.className = panel.className.replace(/iching-theme-\w+/g, '').trim();
            panel.classList.add(`iching-theme-${elem}`);
        }
    }

    // ==================== SECONDARY TAB NAVIGATION ====================

    switchResultTab(tabName) {
        this._currentTab = this._tabNames.indexOf(tabName);

        // Update tab buttons
        this.ui.resultTabs.querySelectorAll('.result-tab').forEach(t => {
            const isActive = t.dataset.tab === tabName;
            t.classList.toggle('active', isActive);
            t.setAttribute('aria-selected', isActive);
        });

        // Update panels
        this.ui.tabPanels.querySelectorAll('.tab-panel').forEach(p => {
            p.classList.toggle('active', p.dataset.panel === tabName);
        });

        // Trigger radar animation when stress tab is first shown
        if (tabName === 'stress' && !this._radarAnimated) {
            this._radarAnimated = true;
            setTimeout(() => this.animateRadar(), 200);
        }

        // Scroll tab bar to keep active tab visible
        const activeTab = this.ui.resultTabs.querySelector('.result-tab.active');
        if (activeTab) {
            activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    // Legacy populateCard for identity section (still used by archive)
    populateCardLegacy(bazi) {
        this.populateCard(bazi);
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

    // ==================== VISUALIZATION CHARTS ====================

    renderSocialQuadrant(dims) {
        // Clean, spacious 2-axis map — E/I horizontal, T/F vertical
        const w = 280, h = 220;
        const cx = w / 2, cy = h / 2;
        const areaL = 44, areaR = w - 44, areaT = 28, areaB = h - 28;
        const areaW = areaR - areaL, areaH = areaB - areaT;

        // User position: ei 0=E 100=I → x left→right, tf 0=T 100=F → y top→bottom
        const px = areaL + (dims.ei / 100) * areaW;
        const py = areaT + (dims.tf / 100) * areaH;

        // Quadrant soft fills — highlight user's quadrant
        const qIdx = (dims.ei >= 50 ? 1 : 0) + (dims.tf >= 50 ? 2 : 0);
        const qRects = [
            { x: areaL, y: areaT, w: areaW / 2, h: areaH / 2 },       // 0: E+T
            { x: cx,    y: areaT, w: areaW / 2, h: areaH / 2 },       // 1: I+T
            { x: areaL, y: cy,    w: areaW / 2, h: areaH / 2 },       // 2: E+F
            { x: cx,    y: cy,    w: areaW / 2, h: areaH / 2 },       // 3: I+F
        ];
        const qNames = ['理性行动派', '冷静观察者', '热情连接者', '温暖倾听者'];
        const qCenters = qRects.map(r => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 }));

        let quadBg = '';
        qRects.forEach((r, i) => {
            const active = i === qIdx;
            quadBg += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="3"
                fill="${active ? 'rgba(200,160,255,0.06)' : 'none'}"/>`;
            quadBg += `<text x="${qCenters[i].x}" y="${qCenters[i].y}" text-anchor="middle" dominant-baseline="central"
                fill="rgba(255,255,255,${active ? 0.55 : 0.18})" font-size="10" font-family="Outfit,sans-serif"
                letter-spacing="0.05em">${qNames[i]}</text>`;
        });

        return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="sq-glow"><stop offset="0%" stop-color="rgba(200,160,255,0.25)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
            </defs>
            ${quadBg}
            <!-- Axes -->
            <line x1="${cx}" y1="${areaT}" x2="${cx}" y2="${areaB}" stroke="rgba(255,255,255,0.07)" stroke-width="0.5"/>
            <line x1="${areaL}" y1="${cy}" x2="${areaR}" y2="${cy}" stroke="rgba(255,255,255,0.07)" stroke-width="0.5"/>
            <!-- Axis endpoint labels -->
            <text x="${areaL - 6}" y="${cy}" text-anchor="end" dominant-baseline="central" fill="rgba(200,160,255,0.5)" font-size="10" font-weight="600" font-family="Outfit,sans-serif">E</text>
            <text x="${areaR + 6}" y="${cy}" text-anchor="start" dominant-baseline="central" fill="rgba(200,160,255,0.5)" font-size="10" font-weight="600" font-family="Outfit,sans-serif">I</text>
            <text x="${cx}" y="${areaT - 8}" text-anchor="middle" fill="rgba(200,160,255,0.5)" font-size="10" font-weight="600" font-family="Outfit,sans-serif">理性 T</text>
            <text x="${cx}" y="${areaB + 16}" text-anchor="middle" fill="rgba(200,160,255,0.5)" font-size="10" font-weight="600" font-family="Outfit,sans-serif">感性 F</text>
            <!-- User position -->
            <circle cx="${px}" cy="${py}" r="28" fill="url(#sq-glow)"/>
            <circle cx="${px}" cy="${py}" r="6" fill="rgba(200,160,255,0.85)" style="filter:drop-shadow(0 0 8px rgba(200,160,255,0.5))"/>
            <circle cx="${px}" cy="${py}" r="2.5" fill="rgba(255,255,255,0.95)"/>
        </svg>`;
    }

    renderEnergySpectrums(dims, pcts) {
        // 3 clean spectrum bars with generous spacing
        const w = 300, rowH = 50;
        const padL = 46, padR = 46;
        const barW = w - padL - padR;
        const barH = 8;
        const spectrums = [
            { left: '计划', right: '即兴', value: 100 - ((100 - dims.jp) * 0.6 + pcts.c * 0.4) },
            { left: '协作', right: '独立', value: dims.ei * 0.6 + (100 - pcts.ex) * 0.4 },
            { left: '策略', right: '执行', value: 100 - ((dims.sn > 50 ? dims.sn : 100 - dims.sn) * 0.5 + pcts.o * 0.5) }
        ];
        const h = spectrums.length * rowH + 8;

        const rows = spectrums.map((s, i) => {
            const yBase = i * rowH + 16;
            const barY = yBase + 14;
            const markerX = padL + (s.value / 100) * barW;
            const pctLabel = s.value >= 50 ? Math.round(s.value) : Math.round(100 - s.value);
            const dominant = s.value >= 50 ? s.right : s.left;

            return `
                <text x="${padL - 10}" y="${barY + barH / 2}" text-anchor="end" dominant-baseline="central" fill="rgba(255,255,255,${s.value < 50 ? 0.65 : 0.3})" font-size="10" font-family="Outfit,sans-serif">${s.left}</text>
                <text x="${w - padR + 10}" y="${barY + barH / 2}" text-anchor="start" dominant-baseline="central" fill="rgba(255,255,255,${s.value >= 50 ? 0.65 : 0.3})" font-size="10" font-family="Outfit,sans-serif">${s.right}</text>
                <!-- Track -->
                <rect x="${padL}" y="${barY}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="rgba(255,255,255,0.04)"/>
                <!-- Fill gradient -->
                <rect x="${padL}" y="${barY}" width="${markerX - padL}" height="${barH}" rx="${barH / 2}" fill="rgba(200,160,255,0.1)"/>
                <!-- Center line -->
                <line x1="${padL + barW / 2}" y1="${barY - 2}" x2="${padL + barW / 2}" y2="${barY + barH + 2}" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
                <!-- Marker -->
                <circle cx="${markerX}" cy="${barY + barH / 2}" r="7" fill="rgba(200,160,255,0.8)" style="filter:drop-shadow(0 0 5px rgba(200,160,255,0.4))"/>
                <circle cx="${markerX}" cy="${barY + barH / 2}" r="3" fill="rgba(255,255,255,0.9)"/>
                <!-- Percentage above marker -->
                <text x="${markerX}" y="${barY - 6}" text-anchor="middle" fill="rgba(200,160,255,0.6)" font-size="8" font-family="Outfit,sans-serif">${pctLabel}% ${escapeHTML(dominant)}</text>
            `;
        }).join('');

        return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${rows}</svg>`;
    }

    renderEnnPath(ennType) {
        // Focused 3-node linear layout: stress ← current → growth
        // Much clearer than a full 9-node ring
        const w = 280, h = 120;
        const cy = 50;

        const stressMap = { 1: 4, 2: 8, 3: 9, 4: 2, 5: 7, 6: 3, 7: 1, 8: 5, 9: 6 };
        const integrationMap = { 1: 7, 2: 4, 3: 6, 4: 1, 5: 8, 6: 9, 7: 5, 8: 2, 9: 3 };
        const integration = integrationMap[ennType];
        const stress = stressMap[ennType];

        const pt = this.personalityTest;
        const ennNames = {};
        for (let i = 1; i <= 9; i++) ennNames[i] = pt.enneagramTypes[i].name;

        const nodeX = { stress: 50, current: w / 2, growth: w - 50 };

        // Arrow paths (curved)
        const arrowY = cy;
        const stressArrow = `M ${nodeX.current - 24},${arrowY} C ${nodeX.current - 50},${arrowY - 20} ${nodeX.stress + 50},${arrowY - 20} ${nodeX.stress + 22},${arrowY}`;
        const growthArrow = `M ${nodeX.current + 24},${arrowY} C ${nodeX.current + 50},${arrowY - 20} ${nodeX.growth - 50},${arrowY - 20} ${nodeX.growth - 22},${arrowY}`;

        return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <marker id="arr-g" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <path d="M1,1 L7,4 L1,7" fill="none" stroke="rgba(100,200,160,0.7)" stroke-width="1.2" stroke-linecap="round"/>
                </marker>
                <marker id="arr-r" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <path d="M1,1 L7,4 L1,7" fill="none" stroke="rgba(255,140,120,0.45)" stroke-width="1.2" stroke-linecap="round"/>
                </marker>
                <radialGradient id="en-glow"><stop offset="0%" stop-color="rgba(200,160,255,0.2)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
            </defs>
            <!-- Arrows -->
            <path d="${stressArrow}" fill="none" stroke="rgba(255,140,120,0.3)" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#arr-r)"/>
            <path d="${growthArrow}" fill="none" stroke="rgba(100,200,160,0.5)" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-g)"/>
            <!-- Arrow labels -->
            <text x="${(nodeX.stress + nodeX.current) / 2}" y="${arrowY - 26}" text-anchor="middle" fill="rgba(255,140,120,0.4)" font-size="8" font-family="Outfit,sans-serif">压力方向</text>
            <text x="${(nodeX.growth + nodeX.current) / 2}" y="${arrowY - 26}" text-anchor="middle" fill="rgba(100,200,160,0.5)" font-size="8" font-family="Outfit,sans-serif">成长方向</text>
            <!-- Current node (center, largest) -->
            <circle cx="${nodeX.current}" cy="${cy}" r="32" fill="url(#en-glow)"/>
            <circle cx="${nodeX.current}" cy="${cy}" r="20" fill="rgba(200,160,255,0.12)" stroke="rgba(200,160,255,0.5)" stroke-width="1.5"/>
            <text x="${nodeX.current}" y="${cy + 1}" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.9)" font-size="16" font-weight="600" font-family="Outfit,sans-serif">${ennType}</text>
            <text x="${nodeX.current}" y="${cy + 34}" text-anchor="middle" fill="rgba(200,160,255,0.6)" font-size="9" font-family="Outfit,sans-serif">${escapeHTML(ennNames[ennType])}</text>
            <!-- Stress node (left) -->
            <circle cx="${nodeX.stress}" cy="${cy}" r="15" fill="rgba(255,140,120,0.06)" stroke="rgba(255,140,120,0.3)" stroke-width="1"/>
            <text x="${nodeX.stress}" y="${cy + 1}" text-anchor="middle" dominant-baseline="central" fill="rgba(255,140,120,0.7)" font-size="13" font-weight="500" font-family="Outfit,sans-serif">${stress}</text>
            <text x="${nodeX.stress}" y="${cy + 28}" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="8" font-family="Outfit,sans-serif">${escapeHTML(ennNames[stress])}</text>
            <!-- Growth node (right) -->
            <circle cx="${nodeX.growth}" cy="${cy}" r="15" fill="rgba(100,200,160,0.08)" stroke="rgba(100,200,160,0.4)" stroke-width="1"/>
            <text x="${nodeX.growth}" y="${cy + 1}" text-anchor="middle" dominant-baseline="central" fill="rgba(100,200,160,0.85)" font-size="13" font-weight="500" font-family="Outfit,sans-serif">${integration}</text>
            <text x="${nodeX.growth}" y="${cy + 28}" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="8" font-family="Outfit,sans-serif">${escapeHTML(ennNames[integration])}</text>
        </svg>`;
    }

    renderCognitiveFnArcs(funcs) {
        // Concentric rings radiating outward — dominant in center, inferior at edge
        // Clean layout: arcs above, labels below each arc
        const w = 260, h = 160;
        const cx = w / 2, baseY = h - 4;
        const radii = [38, 62, 86, 110];
        const sweeps = [0.82, 0.65, 0.45, 0.28]; // fraction of PI
        const widths = [5, 4, 3, 2];
        const colors = [
            ['rgba(200,160,255,0.8)', 'rgba(200,160,255,0.5)'],
            ['rgba(160,180,255,0.65)', 'rgba(160,180,255,0.35)'],
            ['rgba(140,200,220,0.5)', 'rgba(140,200,220,0.25)'],
            ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']
        ];

        const pt = this.personalityTest;
        let arcs = '';

        funcs.forEach((fn, i) => {
            const r = radii[i];
            const sweep = Math.PI * sweeps[i];
            const startA = Math.PI + (Math.PI - sweep) / 2;
            const endA = startA + sweep;

            const x1 = cx + r * Math.cos(startA);
            const y1 = baseY + r * Math.sin(startA);
            const x2 = cx + r * Math.cos(endA);
            const y2 = baseY + r * Math.sin(endA);

            const info = pt.functionDescriptions[fn];

            // Arc
            arcs += `<path d="M ${x1.toFixed(1)},${y1.toFixed(1)} A ${r},${r} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)}"
                fill="none" stroke="${colors[i][0]}" stroke-width="${widths[i]}" stroke-linecap="round"/>`;

            // Label at arc midpoint (above the arc)
            const midA = (startA + endA) / 2;
            const labelR = r + (i === 0 ? 12 : 10);
            const lx = cx + labelR * Math.cos(midA);
            const ly = baseY + labelR * Math.sin(midA);

            arcs += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="central"
                fill="${colors[i][0]}" font-size="${i === 0 ? 10 : 8.5}" font-weight="${i === 0 ? 600 : 400}"
                font-family="Outfit,sans-serif">${fn}</text>`;

            // Short label at arc ends (right side only — avoid clutter)
            const endLabelR = r;
            const elx = cx + endLabelR * Math.cos(endA) + 8;
            const ely = baseY + endLabelR * Math.sin(endA);

            arcs += `<text x="${elx.toFixed(1)}" y="${ely.toFixed(1)}" text-anchor="start" dominant-baseline="central"
                fill="${colors[i][1]}" font-size="7.5" font-family="Outfit,sans-serif">${escapeHTML(info.short)}</text>`;
        });

        return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${arcs}</svg>`;
    }

    initCardTilt(card) {
        if (!window.matchMedia('(hover: hover)').matches) return;
        if (card._tiltInitialized) return;
        card._tiltInitialized = true;

        let tiltRaf = false;
        card.addEventListener('mousemove', (e) => {
            if (tiltRaf) return;
            tiltRaf = true;
            requestAnimationFrame(() => {
                tiltRaf = false;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rotateY = ((x / rect.width) - 0.5) * 10;
                const rotateX = ((y / rect.height) - 0.5) * -10;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                const angle = Math.atan2(y - rect.height / 2, x - rect.width / 2) * 180 / Math.PI + 180;
                card.style.setProperty('--holo-angle', angle + 'deg');
            });
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    }

    // ==================== SOUL CONSTELLATION ====================

    renderConstellation(results) {
        const container = document.getElementById('constellation-container');
        const canvas = document.getElementById('constellation-canvas');
        if (!canvas || !container) return;

        // Remove previous labels
        container.querySelectorAll('.constellation-label').forEach(l => l.remove());

        const size = 320;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        // Seeded random from MBTI type + enneagram
        const seedStr = results.mbti.type + results.enneagram.type;
        let seed = 0;
        for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) | 0;
        seed = Math.abs(seed) || 1;
        const rng = () => { seed = (seed * 16807 + 0) % 2147483647; return seed / 2147483647; };

        // Generate 8-12 stars
        const numStars = 8 + Math.floor(rng() * 5);
        const padding = 40;
        const stars = [];
        const dimKeys = ['o', 'c', 'ex', 'a', 'n'];
        const dimLabels = ['开放', '自律', '社交', '亲和', '情绪'];
        const mbtiDimKeys = ['ei', 'sn', 'tf', 'jp'];
        const mbtiDimLabels = ['外向/内向', '感觉/直觉', '思维/情感', '判断/知觉'];

        for (let i = 0; i < numStars; i++) {
            const x = padding + rng() * (size - padding * 2);
            const y = padding + rng() * (size - padding * 2);
            // Star size driven by Big Five percentages for first 5 stars, then MBTI dims
            let magnitude = 2 + rng() * 3;
            let label = '';
            if (i < 5) {
                const pct = results.big5.percentages[dimKeys[i]] || 50;
                magnitude = 2 + (pct / 100) * 5;
                label = dimLabels[i] + ' ' + pct + '%';
            } else if (i < 9) {
                const dimIdx = i - 5;
                const pct = results.mbti.dimensions[mbtiDimKeys[dimIdx]] || 50;
                magnitude = 2 + Math.abs(pct - 50) / 50 * 4;
                label = mbtiDimLabels[dimIdx];
            }
            stars.push({ x, y, magnitude, label, alpha: 0, lineAlpha: 0 });
        }

        // Build edges: minimum spanning tree + a few random extras
        const edges = this._buildConstellationEdges(stars, rng);

        // Get theme colors
        const theme = this.personalityTest.mbtiThemes[results.mbti.type] || { primary: '200, 160, 255', secondary: '140, 180, 255' };
        const [pr, pg, pb] = theme.primary.split(',').map(Number);
        const [sr, sg, sb] = theme.secondary.split(',').map(Number);

        // Store for animation
        this._constellationData = { ctx, stars, edges, pr, pg, pb, sr, sg, sb, size, container, dpr };

        // Animate
        this.animateConstellation();
    }

    _buildConstellationEdges(stars, rng) {
        const n = stars.length;
        if (n < 2) return [];

        // Prim's MST
        const inTree = new Set([0]);
        const edges = [];
        while (inTree.size < n) {
            let bestDist = Infinity, bestA = -1, bestB = -1;
            for (const a of inTree) {
                for (let b = 0; b < n; b++) {
                    if (inTree.has(b)) continue;
                    const dx = stars[a].x - stars[b].x;
                    const dy = stars[a].y - stars[b].y;
                    const d = dx * dx + dy * dy;
                    if (d < bestDist) { bestDist = d; bestA = a; bestB = b; }
                }
            }
            if (bestB >= 0) {
                edges.push([bestA, bestB]);
                inTree.add(bestB);
            }
        }
        // Add 2-3 random extra edges for visual interest
        const extra = 2 + Math.floor(rng() * 2);
        for (let i = 0; i < extra; i++) {
            const a = Math.floor(rng() * n);
            const b = Math.floor(rng() * n);
            if (a !== b && !edges.some(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))) {
                edges.push([a, b]);
            }
        }
        return edges;
    }

    animateConstellation() {
        const d = this._constellationData;
        if (!d) return;
        const { ctx, stars, edges, pr, pg, pb, sr, sg, sb, size, container, dpr } = d;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const stagger = prefersReducedMotion ? 0 : 200;
        const totalStarTime = stars.length * stagger;
        const lineDelay = totalStarTime + 200;
        const start = performance.now();

        // Remove old labels, create new ones
        container.querySelectorAll('.constellation-label').forEach(l => l.remove());
        const labels = stars.map(star => {
            if (!star.label) return null;
            const label = document.createElement('div');
            label.className = 'constellation-label';
            label.textContent = star.label;
            const canvasRect = container.getBoundingClientRect();
            const scaleX = canvasRect.width / size;
            const scaleY = canvasRect.height / size;
            label.style.left = (star.x * scaleX) + 'px';
            label.style.top = (star.y * scaleY - 14) + 'px';
            container.appendChild(label);
            return label;
        });

        const draw = () => {
            const elapsed = performance.now() - start;
            ctx.clearRect(0, 0, size, size);

            // Draw edges
            const lineProgress = Math.max(0, Math.min(1, (elapsed - lineDelay) / 800));
            if (lineProgress > 0) {
                ctx.lineWidth = 0.8;
                for (const [a, b] of edges) {
                    const alpha = lineProgress * 0.25;
                    ctx.strokeStyle = `rgba(${sr}, ${sg}, ${sb}, ${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(stars[a].x, stars[a].y);
                    // Partial draw during animation
                    const ex = stars[a].x + (stars[b].x - stars[a].x) * lineProgress;
                    const ey = stars[a].y + (stars[b].y - stars[a].y) * lineProgress;
                    ctx.lineTo(ex, ey);
                    ctx.stroke();
                }
            }

            // Draw stars
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                const starStart = i * stagger;
                const starProgress = Math.max(0, Math.min(1, (elapsed - starStart) / 400));
                const easedProgress = 1 - Math.pow(1 - starProgress, 3);
                s.alpha = easedProgress;

                if (s.alpha <= 0) continue;

                // Glow
                const glowR = s.magnitude * 3;
                const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
                grad.addColorStop(0, `rgba(${pr}, ${pg}, ${pb}, ${0.3 * s.alpha})`);
                grad.addColorStop(1, `rgba(${pr}, ${pg}, ${pb}, 0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * s.alpha})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.magnitude * 0.5 * easedProgress, 0, Math.PI * 2);
                ctx.fill();

                // Show label
                if (labels[i] && s.alpha > 0.5) {
                    labels[i].classList.add('visible');
                }
            }

            if (elapsed < lineDelay + 1000) {
                requestAnimationFrame(draw);
            }
        };

        if (prefersReducedMotion) {
            // Instant draw
            stars.forEach(s => s.alpha = 1);
            ctx.clearRect(0, 0, size, size);
            // Lines
            ctx.lineWidth = 0.8;
            for (const [a, b] of edges) {
                ctx.strokeStyle = `rgba(${sr}, ${sg}, ${sb}, 0.25)`;
                ctx.beginPath();
                ctx.moveTo(stars[a].x, stars[a].y);
                ctx.lineTo(stars[b].x, stars[b].y);
                ctx.stroke();
            }
            // Stars
            for (const s of stars) {
                const glowR = s.magnitude * 3;
                const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
                grad.addColorStop(0, `rgba(${pr}, ${pg}, ${pb}, 0.3)`);
                grad.addColorStop(1, `rgba(${pr}, ${pg}, ${pb}, 0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.magnitude * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
            labels.forEach(l => { if (l) l.classList.add('visible'); });
        } else {
            requestAnimationFrame(draw);
        }
    }

    updateStarfieldMood() {
        const s = this._runningScores;
        const c = this._runningCounts;
        // Normalize scores to 0-100 range (50 = neutral)
        const eiPct = c.ei > 0 ? 50 + (s.ei / c.ei) * 15 : 50;
        const snPct = c.sn > 0 ? 50 + (s.sn / c.sn) * 15 : 50;
        const tfPct = c.tf > 0 ? 50 + (s.tf / c.tf) * 15 : 50;

        // Map to starfield params
        const density = 0.6 + (eiPct / 100) * 0.8;    // E→denser, I→sparser
        const brightness = 0.7 + (eiPct / 100) * 0.6;  // E→brighter
        const nebulaIntensity = 0.3 + ((100 - snPct) / 100) * 1.2; // N→more nebula (negative sn = N)
        const colorTemp = (tfPct - 50) / 100 * -0.6;   // T→cold(neg), F→warm(pos)

        this.starfield.setMood({ density, brightness, nebulaIntensity, colorTemp });
    }

    burstParticles(buttonElement) {
        if (!buttonElement || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const rect = buttonElement.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const container = document.createElement('div');
        container.className = 'answer-particles';
        container.style.left = cx + 'px';
        container.style.top = cy + 'px';

        const count = 12 + Math.floor(Math.random() * 5);
        for (let i = 0; i < count; i++) {
            const span = document.createElement('span');
            span.className = 'particle';
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 50;
            span.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
            span.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
            span.style.setProperty('--dur', (400 + Math.random() * 300) + 'ms');
            span.style.width = (2 + Math.random() * 3) + 'px';
            span.style.height = span.style.width;
            container.appendChild(span);
        }

        document.body.appendChild(container);
        setTimeout(() => container.remove(), 800);
    }

    initResultCardEffects() {
        document.querySelectorAll('#test-results-card .result-card').forEach(card => {
            this.initCardTilt(card);
        });
    }

    async retakeTest() {
        this.resetAIState();
        this.resetMBTITheme();
        await this.transitionScreens(this.ui.testResultsSection, this.ui.testIntroSection, 'exit-zoom');
        this.starfield.reset();
    }

    applyMBTITheme(mbtiType) {
        const theme = this.personalityTest.mbtiThemes[mbtiType];
        if (!theme) return;

        const root = document.documentElement;
        root.style.setProperty('--primary-glow', `rgba(${theme.primary}, 0.6)`);
        root.style.setProperty('--secondary-glow', `rgba(${theme.secondary}, 0.4)`);
        root.style.setProperty('--element-color', `rgb(${theme.primary})`);
        root.style.setProperty('--element-glow', `rgba(${theme.primary}, 0.5)`);
        root.style.setProperty('--element-bg', `rgba(${theme.primary}, 0.08)`);

        this.starfield.setResultsMode(theme);
    }

    submitAccuracyFeedback(rating) {
        if (!this._lastTestResults) return;
        const hints = ['', '看来星尘还需要更了解你', '还需继续探索', '不错的共鸣', '星尘懂你', '灵魂深处的共振！'];
        const stars = document.querySelectorAll('.accuracy-star');
        stars.forEach(s => {
            const v = parseInt(s.dataset.value, 10);
            s.textContent = v <= rating ? '★' : '☆';
            s.classList.toggle('active', v <= rating);
        });

        const hint = document.getElementById('accuracy-hint');
        if (hint) hint.textContent = hints[rating] || '';

        // Save to localStorage
        const feedbackKey = 'stardust_feedback';
        try {
            const feedbacks = JSON.parse(localStorage.getItem(feedbackKey) || '[]');
            feedbacks.push({
                timestamp: Date.now(),
                mbtiType: this._lastTestResults.mbti.type,
                enneagramType: this._lastTestResults.enneagram.type,
                rating: rating,
                testMode: this.testMode
            });
            if (feedbacks.length > 50) feedbacks.splice(0, feedbacks.length - 50);
            localStorage.setItem(feedbackKey, JSON.stringify(feedbacks));
        } catch {}

        this.showToast(`感谢反馈 ${'★'.repeat(rating)}`);
    }

    resetAccuracyFeedback() {
        document.querySelectorAll('.accuracy-star').forEach(s => {
            s.textContent = '☆';
            s.classList.remove('active');
        });
        const hint = document.getElementById('accuracy-hint');
        if (hint) hint.textContent = '';
    }

    resetMBTITheme() {
        const root = document.documentElement;
        root.style.removeProperty('--primary-glow');
        root.style.removeProperty('--secondary-glow');
        root.style.removeProperty('--element-color');
        root.style.removeProperty('--element-glow');
        root.style.removeProperty('--element-bg');
    }

    resetAIState() {
        this._aiRunning = false;
        this.ui.aiStatus.classList.add('hidden');
        this.ui.aiStatusDual.classList.add('hidden');
        this.ui.aiUnlockBtn.classList.add('hidden');
        this.ui.aiUnlockBtnDual.classList.add('hidden');
        this.ui.tabAI.classList.add('hidden');
        // Remove AI card loading dots
        document.querySelectorAll('.ai-card-loading').forEach(el => el.remove());
        // Remove AI big5 text blocks
        document.querySelectorAll('.ai-big5-text').forEach(el => el.remove());
        // Reset chat
        this.resetAIChatState();
        // Reset feedback
        this.resetAccuracyFeedback();
    }

    async goHome() {
        this.dualMode = false;
        this.remoteMode = false;
        this.remoteInviterData = null;
        this._transitioning = false;
        this._lastIChingResult = null;
        this.currentBazi = null;
        this.resetMBTITheme();
        this.resetAIState();
        this._runningScores = { ei: 0, sn: 0, tf: 0, jp: 0 };
        this._runningCounts = { ei: 0, sn: 0, tf: 0, jp: 0 };
        // Hide whichever section is visible
        const sections = [this.ui.ritualSection, this.ui.testIntroSection, this.ui.testQuestionsSection, this.ui.testResultsSection, this.ui.testAnalyzingSection, this.ui.identitySection, this.ui.dualIntroSection, this.ui.dualHandoffSection, this.ui.dualResultsSection, this.ui.remoteMatchIntroSection];
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

    // ==================== AI DEEP ANALYSIS ====================

    showAIKeyModal() {
        this.ui.aiKeyInput.value = this.ai.apiKey;
        this.ui.aiKeyModal.classList.remove('hidden');
    }

    hideAIKeyModal() {
        this.ui.aiKeyModal.classList.add('hidden');
    }

    saveAIKey() {
        const key = this.ui.aiKeyInput.value.trim();
        if (!key) {
            this.showToast('请输入 API Key');
            return;
        }
        this.ai.setKey(key);
        this.hideAIKeyModal();
        this.updateAISettingsIndicator();
        this.showToast('API Key 已保存');

        // If we're on test results, trigger AI enhancement now
        if (this._lastTestResults && this.ui.testResultsSection.classList.contains('active')) {
            this.triggerAIPersonality();
        }
        if (this._lastDualCompatibility && this.ui.dualResultsSection.classList.contains('active')) {
            this.triggerAIDual();
        }
    }

    clearAIKey() {
        this.ai.clearKey();
        this.hideAIKeyModal();
        this.updateAISettingsIndicator();
        this.showToast('API Key 已清除');
    }

    updateAISettingsIndicator() {
        if (this.ui.aiSettingsBtn) {
            this.ui.aiSettingsBtn.classList.toggle('has-key', this.ai.hasKey);
        }
    }

    async triggerAIPersonality() {
        if (!this.ai.hasKey || !this._lastTestResults || this._aiRunning) return;
        this._aiRunning = true;

        // Show AI primary tab, switch to it, show loading
        this.ui.tabAI.classList.remove('hidden');
        this.switchPrimaryTab('ai');
        this.ui.aiStatus.classList.remove('hidden');
        this.ui.aiUnlockBtn.classList.add('hidden');

        try {
            let fullText = '';
            let lastTickTime = 0;
            await this.ai.enhancePersonalityResults(this._lastTestResults, this.currentBazi, this._lastIChingResult, (chunk) => {
                fullText = chunk;
                this.applyAIPersonalityResults(fullText, false);
                const now = Date.now();
                if (now - lastTickTime > 200) {
                    this.audio.playAITick();
                    lastTickTime = now;
                }
            });
            this.applyAIPersonalityResults(fullText, true);
            this.audio.playAIDone();
            this.ui.aiStatus.classList.add('hidden');
        } catch (err) {
            this.ui.aiStatus.classList.add('hidden');
            this.ui.aiUnlockBtn.classList.remove('hidden');
            this.showToast('AI 解读暂时不可用');
            console.warn('AI enhancement failed:', err);
        } finally {
            this._aiRunning = false;
        }
    }

    applyAIPersonalityResults(text, isFinal) {
        this.ui.aiInsightText.innerHTML = safeParagraphs(text);
        this.ui.aiInsightText.classList.add('ai-text-enter');
    }

    async triggerAIDual() {
        if (!this.ai.hasKey || !this._lastDualCompatibility || !this.dualResults[0] || !this.dualResults[1] || this._aiRunning) return;
        this._aiRunning = true;

        this.ui.aiStatusDual.classList.remove('hidden');
        this.ui.aiUnlockBtnDual.classList.add('hidden');

        try {
            let fullText = '';
            let lastTickTime = 0;
            await this.ai.enhanceMatchResults(
                this.dualResults[0],
                this.dualResults[1],
                this._lastDualCompatibility,
                this.dualNames,
                (chunk) => {
                    fullText = chunk;
                    this.applyAIMatchResults(fullText);
                    const now = Date.now();
                    if (now - lastTickTime > 200) {
                        this.audio.playAITick();
                        lastTickTime = now;
                    }
                }
            );
            this.applyAIMatchResults(fullText);
            this.audio.playAIDone();
            this.ui.aiStatusDual.classList.add('hidden');
        } catch (err) {
            this.ui.aiStatusDual.classList.add('hidden');
            this.ui.aiUnlockBtnDual.classList.remove('hidden');
            this.showToast('AI 解读暂时不可用');
            console.warn('AI match enhancement failed:', err);
        } finally {
            this._aiRunning = false;
        }
    }

    applyAIMatchResults(text) {
        const narrativeEl = document.getElementById('dual-narrative');
        if (narrativeEl && text.trim()) {
            narrativeEl.innerHTML = safeParagraphs(text);
            narrativeEl.classList.add('ai-text-enter');
        }
    }

    // ==================== AI CHAT ====================

    toggleAIChat() {
        if (!this.ai.hasKey) {
            this.showAIKeyModal();
            return;
        }
        const chat = this.ui.aiChat;
        const isCollapsed = chat.classList.contains('collapsed');
        chat.classList.toggle('collapsed', !isCollapsed);
        if (isCollapsed) {
            this.ui.aiChatInput.focus();
        }
    }

    async sendAIChatMessage() {
        if (this._chatBusy || !this.ai.hasKey || !this._lastTestResults) return;
        const input = this.ui.aiChatInput;
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        input.disabled = true;
        this._chatBusy = true;
        this.ui.aiChatSend.disabled = true;

        // Add user bubble
        this._appendChatBubble('user', text);

        // Build messages
        if (this._chatHistory.length === 0) {
            this._chatHistory.push({
                role: 'system',
                content: this.ai.buildChatSystemPrompt(this._lastTestResults, this.currentBazi, this._lastIChingResult)
            });
        }
        this._chatHistory.push({ role: 'user', content: text });

        // Keep max 5 user-assistant turns (+ system)
        while (this._chatHistory.filter(m => m.role === 'user').length > 5) {
            const idx = this._chatHistory.findIndex((m, i) => i > 0 && m.role === 'user');
            if (idx <= 0) break;
            this._chatHistory.splice(idx, 1); // Remove oldest user message
            // Remove its assistant response if present
            if (idx < this._chatHistory.length && this._chatHistory[idx].role === 'assistant') {
                this._chatHistory.splice(idx, 1);
            }
        }

        // Add assistant placeholder
        const aiEl = this._appendChatBubble('assistant', '');
        const textEl = aiEl.querySelector('.ai-chat-bubble-text');

        let lastTickTime = 0;
        try {
            const fullText = await this.ai.chat(this._chatHistory, (chunk) => {
                textEl.textContent = chunk;
                this._scrollChatToBottom();
                const now = Date.now();
                if (now - lastTickTime > 300) {
                    this.audio.playAITick();
                    lastTickTime = now;
                }
            });
            this._chatHistory.push({ role: 'assistant', content: fullText });
            this.audio.playAIDone();
        } catch (err) {
            textEl.textContent = '星尘暂时无法回应，请稍后再试…';
            console.warn('AI chat error:', err);
        } finally {
            this._chatBusy = false;
            this.ui.aiChatSend.disabled = false;
            input.disabled = false;
            input.focus();
        }
    }

    _appendChatBubble(role, text) {
        const container = this.ui.aiChatMessages;
        const bubble = document.createElement('div');
        bubble.className = `ai-chat-bubble ${role}`;
        bubble.innerHTML = `<div class="ai-chat-bubble-text">${escapeHTML(text)}</div>`;
        container.appendChild(bubble);
        this._scrollChatToBottom();
        return bubble;
    }

    _scrollChatToBottom() {
        const container = this.ui.aiChatMessages;
        container.scrollTop = container.scrollHeight;
    }

    resetAIChatState() {
        this._chatHistory = [];
        this._chatBusy = false;
        if (this.ui.aiChatMessages) this.ui.aiChatMessages.innerHTML = '';
        if (this.ui.aiChat) this.ui.aiChat.classList.add('collapsed');
    }

    // ==================== SHARING SYSTEM ====================

    openSharePanel(context) {
        this._currentShareContext = context;
        this.ui.sharePanel.classList.remove('hidden');
    }

    closeSharePanel() {
        this.ui.sharePanel.classList.add('hidden');
        this._currentShareContext = null;
    }

    generateShareText() {
        const url = window.location.href;

        if (this._currentShareContext === 'identity' && this.currentBazi) {
            const b = this.currentBazi;
            return `🌌 星尘·身份 | 我的宇宙命格\n` +
                `命名：${b.cosmicName}\n` +
                `属${b.year.zodiac} · ${b.yinYang}${b.mainElement}\n` +
                `来探索你的宇宙命格 → ${url}`;
        }

        if (this._currentShareContext === 'test' && this._lastTestResults) {
            const r = this._lastTestResults;
            return `🌌 星尘·身份 | 我的宇宙人格\n` +
                `MBTI: ${r.mbti.type}「${r.mbti.cosmic}」\n` +
                `九型: Type ${r.enneagram.type}「${r.enneagram.cosmic}」\n` +
                `来探索你的宇宙人格 → ${url}`;
        }

        if (this._currentShareContext === 'dual' && this._lastDualCompatibility) {
            const c = this._lastDualCompatibility;
            return `🌌 星尘·身份 | 灵魂共振测试\n` +
                `${this.dualNames[0]}(${c.mbtiMatch.typeA}) × ${this.dualNames[1]}(${c.mbtiMatch.typeB})\n` +
                `共振指数：${c.score} —「${c.level}」\n` +
                `来测测你们的灵魂契合度 → ${url}`;
        }

        return `🌌 星尘·身份 — 探索你的宇宙人格\n${url}`;
    }

    async copyToClipboard(text, message) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast(message || '已复制到剪贴板');
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            this.showToast(message || '已复制到剪贴板');
        }
        this.closeSharePanel();
    }

    copyShareText() {
        const text = this.generateShareText();
        this.copyToClipboard(text, '结果已复制到剪贴板');
    }

    showToast(message) {
        const toast = this.ui.toast;
        toast.textContent = message;
        toast.classList.remove('hidden');
        // Force reflow
        void toast.offsetWidth;
        toast.classList.add('visible');

        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 2000);
    }

    // ==================== SAVE IMAGE ====================

    populateShareCard() {
        const r = this._lastTestResults;
        if (!r) return;

        document.getElementById('share-card-type').textContent = r.mbti.type;
        document.getElementById('share-card-cosmic').textContent = r.mbti.cosmic;
        document.getElementById('share-card-subtitle').textContent = r.mbti.title || '';

        // MBTI dimensions
        const dims = r.mbti.dimensions;
        const labels = this.personalityTest.mbtiDimLabels;
        document.getElementById('share-card-dims').innerHTML = ['ei', 'sn', 'tf', 'jp'].map(dim => {
            const pct = dims[dim];
            const dominant = pct >= 50 ? pct : 100 - pct;
            return `
                <div class="share-dim-row">
                    <span class="share-dim-label">${labels[dim].pos}</span>
                    <div class="share-dim-track"><div class="share-dim-fill" style="width:${pct}%"></div></div>
                    <span class="share-dim-pct">${dominant}%</span>
                    <span class="share-dim-label right">${labels[dim].neg}</span>
                </div>
            `;
        }).join('');

        // Secondary tags
        document.getElementById('share-card-big5').textContent =
            `大五 · ${['开放', '自律', '社交', '亲和', '情绪'].map((l, i) => {
                const k = ['o', 'c', 'ex', 'a', 'n'][i];
                return r.big5.percentages[k] >= 60 ? l : null;
            }).filter(Boolean).join('·') || '均衡'}`;

        document.getElementById('share-card-enn').textContent =
            `九型 · Type ${r.enneagram.type}「${r.enneagram.cosmic}」`;

        // Keywords
        const kws = r.mbti.keywords || [];
        document.getElementById('share-card-keywords').innerHTML =
            kws.map(k => `<span class="share-kw">${escapeHTML(k)}</span>`).join('');

        // I Ching hexagram summary
        const ichingTag = document.getElementById('share-card-iching');
        if (ichingTag && this._lastIChingResult) {
            const ic = this._lastIChingResult;
            let ichingText = `卦象 · ${ic.primary.name}`;
            if (ic.transformed) ichingText += ` → ${ic.transformed.name}`;
            ichingTag.textContent = ichingText;
            ichingTag.style.display = 'block';
        } else if (ichingTag) {
            ichingTag.style.display = 'none';
        }

        // AI insight excerpt (from AI deep insight card)
        const aiInsight = document.getElementById('share-card-ai-insight');
        const aiTextEl = document.getElementById('ai-insight-text');
        if (aiInsight && aiTextEl) {
            const aiText = aiTextEl.textContent.trim();
            if (aiText && aiText.length > 20) {
                const sentences = aiText.match(/[^。！？]+[。！？]/g) || [];
                const excerpt = sentences.slice(0, 2).join('');
                aiInsight.textContent = excerpt || aiText.slice(0, 80) + '…';
                aiInsight.style.display = 'block';
            } else {
                aiInsight.style.display = 'none';
            }
        }
    }

    saveTestCard() {
        if (!this._lastTestResults) return;

        this.populateShareCard();

        const shareCard = document.getElementById('share-card');
        // Move into view temporarily for capture
        const container = document.getElementById('share-card-container');
        container.style.left = '0';
        container.style.opacity = '0';

        // Give DOM time to render
        setTimeout(() => {
            html2canvas(shareCard, {
                backgroundColor: '#050510',
                scale: 2,
                logging: false,
                useCORS: true,
                width: 540,
                height: 960
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'stardust-personality.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).catch(() => {
                this.showToast('图片生成失败，请重试');
            }).finally(() => {
                container.style.left = '-9999px';
                container.style.opacity = '';
            });
        }, 100);
    }

    generateWallpaper() {
        const r = this._lastTestResults;
        if (!r) return;

        const W = 1080, H = 1920;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        const theme = this.personalityTest.mbtiThemes[r.mbti.type] || { primary: '200, 160, 255', secondary: '140, 180, 255', aurora: [[40, 200, 100], [60, 120, 220], [140, 80, 220]] };
        const [pr, pg, pb] = theme.primary.split(',').map(Number);
        const [sr, sg, sb] = theme.secondary.split(',').map(Number);

        // Background gradient
        const bgGrad = ctx.createRadialGradient(W * 0.3, H * 0.4, 0, W * 0.5, H * 0.5, H * 0.7);
        bgGrad.addColorStop(0, `rgb(${Math.floor(pr * 0.1)}, ${Math.floor(pg * 0.1)}, ${Math.floor(pb * 0.15)})`);
        bgGrad.addColorStop(1, '#050510');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // Nebulae (opacity based on openness)
        const nebulaAlpha = 0.02 + (r.big5.percentages.o / 100) * 0.04;
        for (let i = 0; i < 3; i++) {
            const c = theme.aurora[i];
            const nx = W * (0.2 + Math.random() * 0.6);
            const ny = H * (0.15 + i * 0.3);
            const nr = W * (0.3 + Math.random() * 0.2);
            const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
            grad.addColorStop(0, `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${nebulaAlpha})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
        }

        // Stars (density based on extraversion)
        const starCount = 200 + Math.floor((r.big5.percentages.ex / 100) * 300);
        const seed = r.mbti.type.charCodeAt(0) + r.enneagram.type;
        let rng = seed;
        const seededRandom = () => { rng = (rng * 16807 + 0) % 2147483647; return rng / 2147483647; };

        for (let i = 0; i < starCount; i++) {
            const x = seededRandom() * W;
            const y = seededRandom() * H;
            const size = 0.5 + seededRandom() * 2;
            const alpha = 0.3 + seededRandom() * 0.7;
            // Tint some stars
            if (seededRandom() > 0.6) {
                ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${alpha * 0.5})`;
            } else if (seededRandom() > 0.5) {
                ctx.fillStyle = `rgba(${sr}, ${sg}, ${sb}, ${alpha * 0.4})`;
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
            }
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();

            // Glow on larger stars
            if (size > 1.5) {
                ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${alpha * 0.08})`;
                ctx.beginPath();
                ctx.arc(x, y, size * 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Text overlay
        ctx.textAlign = 'center';

        // MBTI type (large)
        ctx.font = '700 120px "Outfit", sans-serif';
        ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, 0.15)`;
        ctx.fillText(r.mbti.type, W / 2, H * 0.42);

        ctx.font = '300 48px "Noto Serif SC", serif';
        ctx.fillStyle = `rgba(255, 255, 255, 0.7)`;
        ctx.fillText(r.mbti.cosmic, W / 2, H * 0.48);

        // Enneagram
        ctx.font = '300 28px "Outfit", sans-serif';
        ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
        ctx.fillText(`Type ${r.enneagram.type}「${r.enneagram.cosmic}」`, W / 2, H * 0.53);

        // Keywords at bottom
        const kws = (r.mbti.keywords || []).join('  ·  ');
        ctx.font = '300 22px "Outfit", sans-serif';
        ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
        ctx.fillText(kws, W / 2, H * 0.92);

        // Watermark
        ctx.font = '300 18px "Outfit", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillText('星尘·身份', W / 2, H * 0.96);

        // Download
        const link = document.createElement('a');
        link.download = `stardust-${r.mbti.type}-wallpaper.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        this.showToast('壁纸已生成');
    }

    saveIdentityCard() {
        const card = this.ui.identityCard;
        if (!card) return;

        // Add watermark temporarily
        const watermark = document.createElement('div');
        watermark.className = 'watermark';
        watermark.textContent = '星尘·身份 — stardust identity';
        card.appendChild(watermark);

        const originalTransform = card.style.transform;
        card.style.transform = 'none';

        html2canvas(card, {
            backgroundColor: '#050510',
            scale: 2,
            logging: false,
            useCORS: true
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'stardust-identity.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(() => {
            this.showToast('图片生成失败，请重试');
        }).finally(() => {
            card.style.transform = originalTransform;
            watermark.remove();
        });
    }

    // ==================== DUAL MODE ====================

    async enterDualIntro() {
        await this.transitionScreens(this.ui.entranceSection, this.ui.dualIntroSection, 'exit-zoom');
    }

    async startDualTest() {
        const name1 = document.getElementById('dual-name-1').value.trim() || '旅者一';
        const name2 = document.getElementById('dual-name-2').value.trim() || '旅者二';
        this.dualNames = [name1, name2];
        this.dualResults = [null, null];
        this.dualCurrentPerson = 0;
        this.dualMode = true;
        this.testMode = 'quick'; // Dual mode always uses quick

        const total = this.testTotal;
        this.testAnswers = new Array(total).fill(null);
        this.testCurrentQ = 0;

        await this.transitionScreens(this.ui.dualIntroSection, this.ui.testQuestionsSection, 'exit-left');
        this.showQuestion(0);
    }

    async completeDualPerson() {
        // Calculate results for current person
        const questionIndices = this.personalityTest.quickQuestionIndices;
        const results = this.personalityTest.calculateResults(this.testAnswers, questionIndices);
        this.dualResults[this.dualCurrentPerson] = results;

        if (this.dualCurrentPerson === 0) {
            // Person 1 done — show handoff
            this.ui.handoffTitle.textContent = `${this.dualNames[0]} 的频率已锁定`;
            this.ui.handoffSubtitle.textContent = `请将设备交给 ${this.dualNames[1]}`;
            await this.transitionScreens(this.ui.testQuestionsSection, this.ui.dualHandoffSection, 'exit-left');
        } else {
            // Person 2 done — show results
            await this.calculateAndShowDualResults();
        }
    }

    async startDualPerson2() {
        this.dualCurrentPerson = 1;
        const total = this.testTotal;
        this.testAnswers = new Array(total).fill(null);
        this.testCurrentQ = 0;

        await this.transitionScreens(this.ui.dualHandoffSection, this.ui.testQuestionsSection, 'exit-left');
        this.showQuestion(0);
    }

    async calculateAndShowDualResults() {
        // Hide questions
        this.ui.testQuestionsSection.classList.remove('active');
        this.ui.testQuestionsSection.classList.add('exit-left');
        await wait(600);
        this.ui.testQuestionsSection.classList.add('hidden');
        this.ui.testQuestionsSection.classList.remove('exit-left');

        // Analyzing interlude
        this.showAnalyzingPhase();
        this.starfield.warpSpeed();
        this.audio.playWarp();
        await wait(3500);
        this.starfield.steadySpeed();
        await wait(400);
        this.hideAnalyzingPhase();
        await wait(400);

        // Calculate compatibility
        const compatibility = this.personalityTest.generateCompatibility(
            this.dualResults[0], this.dualResults[1]
        );
        this._lastDualCompatibility = compatibility;

        // Populate results
        this.populateDualResults(compatibility);

        // Show results
        this.ui.dualResultsSection.classList.remove('hidden');
        void this.ui.dualResultsSection.offsetWidth;
        this.ui.dualResultsSection.classList.add('active');

        // Audio + Celebration
        this.audio.playReveal();
        setTimeout(() => {
            this.spawnCelebration();
            this.audio.playCelebration();
        }, 400);

        // Use first person's MBTI for theme
        if (this.dualResults[0]) {
            this.applyMBTITheme(this.dualResults[0].mbti.type);
        }

        // Animate score counter
        this.animateResonanceScore(compatibility.score);

        // AI enhancement
        if (this.ai.hasKey) {
            this.triggerAIDual();
        } else {
            this.ui.aiUnlockBtnDual.classList.remove('hidden');
        }
    }

    populateDualResults(c) {
        // Resonance hero
        document.getElementById('resonance-level').textContent = c.level;
        document.getElementById('resonance-level-desc').textContent = c.levelDesc;

        // MBTI comparison
        document.getElementById('match-name-a').textContent = this.dualNames[0];
        document.getElementById('match-name-b').textContent = this.dualNames[1];
        document.getElementById('match-type-a').textContent = c.mbtiMatch.typeA;
        document.getElementById('match-type-b').textContent = c.mbtiMatch.typeB;
        document.getElementById('match-cosmic-a').textContent = c.mbtiMatch.cosmicA;
        document.getElementById('match-cosmic-b').textContent = c.mbtiMatch.cosmicB;
        document.getElementById('match-same-letters').textContent = `${c.mbtiMatch.sameLetters}/4 维度`;

        // Dimension comparison bars
        const labels = this.personalityTest.mbtiDimLabels;
        document.getElementById('dual-dims').innerHTML = ['ei', 'sn', 'tf', 'jp'].map(dim => {
            const pctA = c.mbtiMatch.dimsA[dim];
            const pctB = c.mbtiMatch.dimsB[dim];
            return `
                <div class="dual-dim-row">
                    <span class="dual-dim-label">${labels[dim].pos}</span>
                    <div class="dual-dim-tracks">
                        <div class="dual-dim-track"><div class="dual-dim-fill-a" style="width:0%" data-target="${pctA}"></div></div>
                        <div class="dual-dim-track"><div class="dual-dim-fill-b" style="width:0%" data-target="${pctB}"></div></div>
                    </div>
                    <span class="dual-dim-label">${labels[dim].neg}</span>
                </div>
            `;
        }).join('');

        // Animate dimension bars
        setTimeout(() => {
            document.querySelectorAll('.dual-dim-fill-a, .dual-dim-fill-b').forEach(el => {
                el.style.width = el.dataset.target + '%';
            });
        }, 300);

        // Big Five dual radar
        document.getElementById('legend-name-a').textContent = this.dualNames[0];
        document.getElementById('legend-name-b').textContent = this.dualNames[1];
        document.getElementById('dual-big5-chart').innerHTML = this.renderDualRadar(
            this.dualResults[0].big5.percentages,
            this.dualResults[1].big5.percentages
        );
        setTimeout(() => this.animateDualRadar(), 500);

        // Enneagram
        document.getElementById('enn-type-a').textContent = `Type ${c.ennDynamics.typeA}`;
        document.getElementById('enn-type-b').textContent = `Type ${c.ennDynamics.typeB}`;
        document.getElementById('enn-cosmic-a').textContent = c.ennDynamics.cosmicA;
        document.getElementById('enn-cosmic-b').textContent = c.ennDynamics.cosmicB;
        document.getElementById('enn-relation').textContent = c.ennDynamics.relation;

        // Narrative
        document.getElementById('dual-narrative').innerHTML = safeParagraphs(c.narrative);
    }

    animateResonanceScore(target) {
        const el = document.getElementById('resonance-score');
        const duration = 1500;
        const start = performance.now();
        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    renderDualRadar(pctA, pctB) {
        const size = 220;
        const cx = size / 2, cy = size / 2;
        const maxR = 85;
        const dims = ['o', 'c', 'ex', 'a', 'n'];
        const dimLabels = ['开放', '自律', '社交', '亲和', '情绪'];

        const getPoint = (index, radius) => {
            const angle = (Math.PI * 2 * index / 5) - Math.PI / 2;
            return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
        };

        // Grid
        let gridLines = '';
        [0.25, 0.5, 0.75, 1.0].forEach(pct => {
            const pts = dims.map((_, i) => { const p = getPoint(i, maxR * pct); return `${p.x},${p.y}`; }).join(' ');
            gridLines += `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>`;
        });

        // Axes
        let axisLines = '';
        dims.forEach((_, i) => {
            const p = getPoint(i, maxR);
            axisLines += `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>`;
        });

        // Person A polygon
        const zeroPts = dims.map(() => `${cx},${cy}`).join(' ');
        const targetA = dims.map((dim, i) => {
            const p = getPoint(i, maxR * pctA[dim] / 100);
            return `${p.x},${p.y}`;
        }).join(' ');
        const targetB = dims.map((dim, i) => {
            const p = getPoint(i, maxR * pctB[dim] / 100);
            return `${p.x},${p.y}`;
        }).join(' ');

        // Labels
        let labelEls = '';
        dims.forEach((dim, i) => {
            const p = getPoint(i, maxR + 20);
            labelEls += `<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="central"
                fill="rgba(255,255,255,0.5)" font-size="11" font-family="Outfit, sans-serif">${dimLabels[i]}</text>`;
        });

        return `
            <svg viewBox="0 0 ${size} ${size}" class="big5-radar" style="width: 100%; max-width: 260px;">
                ${gridLines}
                ${axisLines}
                <polygon points="${zeroPts}" fill="rgba(200,160,255,0.08)" stroke="rgba(200,160,255,0.6)"
                    stroke-width="1.5" class="dual-polygon-a" data-target="${targetA}"
                    style="filter: drop-shadow(0 0 4px rgba(200,160,255,0.2));"/>
                <polygon points="${zeroPts}" fill="rgba(140,180,255,0.08)" stroke="rgba(140,180,255,0.6)"
                    stroke-width="1.5" class="dual-polygon-b" data-target="${targetB}"
                    style="filter: drop-shadow(0 0 4px rgba(140,180,255,0.2));"/>
                ${labelEls}
            </svg>
        `;
    }

    animateDualRadar() {
        const chart = document.getElementById('dual-big5-chart');
        const polyA = chart.querySelector('.dual-polygon-a');
        const polyB = chart.querySelector('.dual-polygon-b');
        if (!polyA || !polyB) return;

        const cx = 110, cy = 110;
        const parsePoints = (str) => str.split(' ').map(s => { const [x, y] = s.split(',').map(Number); return { x, y }; });

        const targetA = parsePoints(polyA.dataset.target);
        const targetB = parsePoints(polyB.dataset.target);
        const start5 = targetA.map(() => ({ x: cx, y: cy }));

        const duration = 1200;
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            const curA = start5.map((sp, i) => ({
                x: sp.x + (targetA[i].x - sp.x) * eased,
                y: sp.y + (targetA[i].y - sp.y) * eased
            }));
            const curB = start5.map((sp, i) => ({
                x: sp.x + (targetB[i].x - sp.x) * eased,
                y: sp.y + (targetB[i].y - sp.y) * eased
            }));

            polyA.setAttribute('points', curA.map(p => `${p.x},${p.y}`).join(' '));
            polyB.setAttribute('points', curB.map(p => `${p.x},${p.y}`).join(' '));

            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    async restartDual() {
        this.resetAIState();
        if (this.remoteMode) {
            // Remote mode: go back to entrance
            this.remoteMode = false;
            this.remoteInviterData = null;
            this.dualMode = false;
            await this.transitionScreens(this.ui.dualResultsSection, this.ui.entranceSection, 'exit-zoom');
        } else {
            await this.transitionScreens(this.ui.dualResultsSection, this.ui.dualIntroSection, 'exit-zoom');
        }
        this.starfield.reset();
        this.dualMode = false;
    }

    saveDualCard() {
        const card = document.getElementById('dual-results-content');
        if (!card) return;

        const watermark = document.createElement('div');
        watermark.className = 'watermark';
        watermark.textContent = '星尘·身份 — stardust identity';
        card.appendChild(watermark);

        const resultCards = card.querySelectorAll('.result-card');
        resultCards.forEach(rc => { rc.style.transform = 'none'; });

        html2canvas(card, {
            backgroundColor: '#050510',
            scale: 2,
            logging: false,
            useCORS: true
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'stardust-resonance.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(() => {
            this.showToast('保存失败，请重试');
        }).finally(() => {
            resultCards.forEach(rc => { rc.style.transform = ''; });
            watermark.remove();
        });
    }

    // ==================== REMOTE MATCH ====================

    checkRemoteMatchParam() {
        const params = new URLSearchParams(window.location.search);
        const matchData = params.get('match');
        if (!matchData) return;

        // Decode the inviter's results
        const decoded = this.personalityTest.decodeSharedResults(matchData);
        if (!decoded) {
            this.showToast('匹配链接无效');
            return;
        }

        this.remoteInviterData = decoded;

        // Update invite text with inviter's name
        if (this.ui.remoteInviteText) {
            this.ui.remoteInviteText.textContent = `「${decoded.name}」邀请你进行灵魂共振测试`;
        }

        // Show remote match intro instead of entrance (after splash)
        setTimeout(() => {
            this.ui.entranceSection.classList.remove('active');
            this.ui.entranceSection.classList.add('hidden');

            this.ui.remoteMatchIntroSection.classList.remove('hidden');
            void this.ui.remoteMatchIntroSection.offsetWidth;
            this.ui.remoteMatchIntroSection.classList.add('active');
        }, 3600); // After splash finishes

        // Clean the URL without reloading
        window.history.replaceState({}, '', window.location.pathname);
    }

    async startRemoteMatch() {
        const myName = (this.ui.remoteMyName.value || '').trim() || '旅者';

        // Setup dual mode with inviter as person 0
        this.dualMode = true;
        this.remoteMode = true;
        this.dualNames = [this.remoteInviterData.name, myName];
        this.dualResults = [this.remoteInviterData.results, null];
        this.dualCurrentPerson = 1; // We are person 1
        this.testMode = 'quick';

        const total = this.testTotal;
        this.testAnswers = new Array(total).fill(null);
        this.testCurrentQ = 0;

        await this.transitionScreens(this.ui.remoteMatchIntroSection, this.ui.testQuestionsSection, 'exit-left');
        this.showQuestion(0);
    }

    async generateMatchInviteLink() {
        if (!this._lastTestResults) return;

        const myName = await this.showPromptModal('输入你的昵称', '将显示在匹配页面', '神秘人');
        if (myName === null) return; // cancelled

        const encoded = this.personalityTest.encodeResultsForShare(this._lastTestResults, myName || '神秘人');
        const baseUrl = window.location.origin + window.location.pathname;
        const matchUrl = `${baseUrl}?match=${encoded}`;

        this.copyToClipboard(matchUrl, '匹配链接已复制！分享给好友即可开始灵魂共振');
    }

    showPromptModal(title, subtitle, placeholder) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'prompt-modal-overlay';
            overlay.innerHTML = `
                <div class="prompt-modal">
                    <h3 class="prompt-modal-title">${escapeHTML(title)}</h3>
                    <p class="prompt-modal-subtitle">${escapeHTML(subtitle)}</p>
                    <input type="text" class="prompt-modal-input" placeholder="${escapeHTML(placeholder)}" maxlength="8">
                    <div class="prompt-modal-actions">
                        <button class="glass-btn small prompt-modal-ok"><span class="btn-text">确定</span></button>
                        <button class="text-btn prompt-modal-cancel">取消</button>
                    </div>
                </div>
            `;
            document.getElementById('app').appendChild(overlay);
            const input = overlay.querySelector('.prompt-modal-input');
            const okBtn = overlay.querySelector('.prompt-modal-ok');
            const cancelBtn = overlay.querySelector('.prompt-modal-cancel');
            setTimeout(() => { overlay.classList.add('visible'); input.focus(); }, 10);
            const close = (value) => {
                overlay.classList.remove('visible');
                setTimeout(() => overlay.remove(), 300);
                resolve(value);
            };
            okBtn.addEventListener('click', () => close(input.value.trim()));
            cancelBtn.addEventListener('click', () => close(null));
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') close(input.value.trim()); });
            overlay.addEventListener('click', (e) => { if (e.target === overlay) close(null); });
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
