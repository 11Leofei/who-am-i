// Enhanced Bazi (八字) Calculator
// With day master analysis, element theming, and identity generation

class BaziCalculator {
    constructor() {
        // Heavenly Stems (天干)
        this.heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

        // Earthly Branches (地支)
        this.earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

        // Stem → Element mapping
        this.stemElements = {
            '甲': '木', '乙': '木',
            '丙': '火', '丁': '火',
            '戊': '土', '己': '土',
            '庚': '金', '辛': '金',
            '壬': '水', '癸': '水'
        };

        // Stem → Yin/Yang
        this.stemYinYang = {
            '甲': '阳', '乙': '阴',
            '丙': '阳', '丁': '阴',
            '戊': '阳', '己': '阴',
            '庚': '阳', '辛': '阴',
            '壬': '阳', '癸': '阴'
        };

        // Zodiac animals
        this.zodiac = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

        // Element visual themes
        this.elementThemes = {
            '木': { color: '#4ade80', glow: 'rgba(74, 222, 128, 0.5)', bg: 'rgba(74, 222, 128, 0.08)' },
            '火': { color: '#fb923c', glow: 'rgba(251, 146, 60, 0.5)', bg: 'rgba(251, 146, 60, 0.08)' },
            '土': { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)', bg: 'rgba(251, 191, 36, 0.08)' },
            '金': { color: '#e2e8f0', glow: 'rgba(226, 232, 240, 0.5)', bg: 'rgba(226, 232, 240, 0.08)' },
            '水': { color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.5)', bg: 'rgba(96, 165, 250, 0.08)' }
        };

        // Cosmic identity names (based on day stem — the "self")
        this.cosmicNames = {
            '甲': '苍龙破晓',
            '乙': '幽兰映月',
            '丙': '烈阳天行',
            '丁': '烛火星引',
            '戊': '山岳不动',
            '己': '沃野千里',
            '庚': '星陨铸刃',
            '辛': '霜华凝玉',
            '壬': '沧海横流',
            '癸': '寒露凝珠'
        };

        // Personality descriptions (based on day stem)
        this.personalities = {
            '甲': '你如参天古木，正直而坚韧。无论风暴如何肆虐，你始终向着光明生长。天生具有领导力，心怀仁慈，是他人风雨中的庇护之所。',
            '乙': '你如藤蔓兰草，柔韧而坚强。看似温柔，实则有着惊人的适应力与生命力。善于在逆境中找到生机，以柔克刚，四季常青。',
            '丙': '你如太阳当空，光芒万丈。热情洋溢，慷慨大方，你的存在本身就是温暖的源泉。照亮他人前行的路，却从不索取回报。',
            '丁': '你如暗夜烛火，温柔而深邃。在黑暗中，你用微光指引迷途之人。拥有洞察事物本质的智慧，内心燃烧着不灭的热忱。',
            '戊': '你如巍峨高山，沉稳而厚重。你是众人依靠的磐石，承载万物却不言辛苦。你的胸怀如大地般包容，存在即安全。',
            '己': '你如沃土良田，温润而滋养。默默耕耘，将养分给予身边的一切。细腻、耐心、务实，用双手创造丰盛的收获。',
            '庚': '你如利剑出鞘，果断而刚毅。钢铁般的意志和无畏的勇气，是你与生俱来的铠甲。爱憎分明，是黑暗中最锋利的光。',
            '辛': '你如珠玉美石，精致而珍贵。外表清冷，内心丰富。追求完美，注重细节，有着与生俱来的审美天赋。',
            '壬': '你如浩瀚大海，深邃而辽阔。思维如潮水般奔涌不息，充满智慧与创造力。包容万象，自由不羁，是真正的大智之人。',
            '癸': '你如晨露细雨，滋润而宁静。拥有水滴石穿的毅力和洞察秋毫的直觉。看似平静的表面下，蕴含着改变世界的力量。'
        };

        // Branch → primary element (地支藏干主气)
        this.branchElements = {
            '子': '水', '丑': '土', '寅': '木', '卯': '木',
            '辰': '土', '巳': '火', '午': '火', '未': '土',
            '申': '金', '酉': '金', '戌': '土', '亥': '水'
        };

        // Wu Xing cycle (五行生克)
        this.wuxingCycle = {
            '木': { generates: '火', overcomes: '土', generatedBy: '水', overcomedBy: '金' },
            '火': { generates: '土', overcomes: '金', generatedBy: '木', overcomedBy: '水' },
            '土': { generates: '金', overcomes: '水', generatedBy: '火', overcomedBy: '木' },
            '金': { generates: '水', overcomes: '木', generatedBy: '土', overcomedBy: '火' },
            '水': { generates: '木', overcomes: '火', generatedBy: '金', overcomedBy: '土' }
        };

        // Zodiac trait summaries (expanded with detailed descriptions)
        this.zodiacTraits = {
            '鼠': '机敏灵巧，洞察先机。鼠年生人天性聪颖敏捷，善于在复杂局势中捕捉稍纵即逝的机遇，直觉过人，适应力极强，能在逆境中灵活求变，化险为夷。',
            '牛': '勤恳踏实，坚韧不拔。牛年生人性情稳重厚实，做事脚踏实地，从不走捷径。拥有超乎常人的耐力和毅力，一旦认定目标便坚定不移，终成大器。',
            '虎': '勇猛无畏，王者之气。虎年生人天生霸气外露，敢于挑战权威和未知。行事果决、魄力十足，具有强大的感召力和领导力，在人群中自然而然成为核心。',
            '兔': '温雅从容，心思细腻。兔年生人气质优雅从容，待人温和有礼，善于洞察人心微妙之处。天赋审美能力卓越，内心丰富而敏感，重视和谐与美好。',
            '龙': '气吞山河，志存高远。龙年生人气场恢弘壮阔，胸怀远大理想，敢于追逐常人不敢想的梦。精力充沛、才华横溢，命中自带贵气，注定不凡。',
            '蛇': '深沉睿智，洞幽察微。蛇年生人外冷内热，思虑缜密深远，善于洞察事物本质。拥有敏锐的第六感和过人的分析力，外表从容内心丰富，智慧非凡。',
            '马': '奔放自由，热情如火。马年生人性格热烈奔放，崇尚自由与独立，浑身散发着勃勃生机。行动力极强、富有冒险精神，渴望广阔天地与无限可能。',
            '羊': '温良恭俭，艺术天赋。羊年生人心地善良温润，待人宽厚谦和，拥有与生俱来的艺术感知力。想象力丰富，感受力细腻，擅长用创造力装点生活。',
            '猴': '聪慧多变，机智过人。猴年生人才思敏捷、灵活多变，擅长在复杂环境中游刃有余。天生的创新者和问题解决者，幽默风趣，社交能力出众。',
            '鸡': '精明干练，一丝不苟。鸡年生人做事精准高效，注重细节，追求完美。观察力敏锐、条理分明，有强烈的责任感和上进心，勤勉不懈终有成就。',
            '狗': '忠诚正直，侠义心肠。狗年生人重情重义、光明磊落，对朋友和家人忠诚不渝。内心有着坚定的道德准则和强烈的正义感，是最值得信赖的伙伴。',
            '猪': '宽厚豁达，福泽深厚。猪年生人心胸宽广、乐天知命，待人真诚热忱，不计较得失。天生带有福气和好运，善于享受生活之美，人缘极佳。'
        };

        // Branch → Five Element mapping for zodiac
        this.zodiacElements = {
            '鼠': '水', '牛': '土', '虎': '木', '兔': '木',
            '龙': '土', '蛇': '火', '马': '火', '羊': '土',
            '猴': '金', '鸡': '金', '狗': '土', '猪': '水'
        };

        // Five element relationships
        this.elementRelations = {
            same: '比和',
            generates: '相生',
            generatedBy: '相生',
            overcomes: '相克',
            overcomedBy: '相克'
        };

        // Complementary advice for weak elements
        this.complementAdvice = {
            '木': { color: '绿色、青色', direction: '东方', activity: '亲近自然、园艺种植、晨间散步', season: '春季' },
            '火': { color: '红色、紫色', direction: '南方', activity: '阳光运动、社交聚会、艺术创作', season: '夏季' },
            '土': { color: '黄色、棕色', direction: '中央', activity: '冥想静坐、陶艺手作、登山远足', season: '四季之交' },
            '金': { color: '白色、金色', direction: '西方', activity: '音乐欣赏、精密手工、呼吸练习', season: '秋季' },
            '水': { color: '黑色、深蓝', direction: '北方', activity: '游泳潜水、阅读思考、夜间冥想', season: '冬季' }
        };

        // Hidden Stems (藏干): each branch contains 1-3 hidden stems (本气/中气/余气)
        this.hiddenStems = {
            '子': ['癸'],
            '丑': ['己', '癸', '辛'],
            '寅': ['甲', '丙', '戊'],
            '卯': ['乙'],
            '辰': ['戊', '乙', '癸'],
            '巳': ['丙', '庚', '戊'],
            '午': ['丁', '己'],
            '未': ['己', '丁', '乙'],
            '申': ['庚', '壬', '戊'],
            '酉': ['辛'],
            '戌': ['戊', '辛', '丁'],
            '亥': ['壬', '甲']
        };

        // Five element indices for ten god calculation
        this.elementIndex = { '木': 0, '火': 1, '土': 2, '金': 3, '水': 4 };

        // Ten God descriptions (十神解读)
        this.tenGodDescriptions = {
            '比肩': '独立自主，重义气，自我意识强，喜欢与人并肩前行。',
            '劫财': '果敢行动，竞争意识强，敢于争取，魄力十足。',
            '食神': '才华横溢，性情温和，享受生活之美，创造力旺盛。',
            '伤官': '聪明机敏，追求完美，表达力强，不拘传统。',
            '偏财': '慷慨大方，善于交际，理财灵活，人缘广泛。',
            '正财': '勤俭务实，稳健理财，重信守诺，脚踏实地。',
            '七杀': '魄力非凡，敢于挑战，抗压力强，英雄气概。',
            '正官': '正直守规，责任心强，注重秩序，温文尔雅。',
            '偏印': '悟性极高，思想独特，直觉敏锐，博学多才。',
            '正印': '仁慈宽厚，学识渊博，受人庇护，内心充盈。'
        };

        // Month branch → season element (月令五行)
        this.monthSeasonElement = {
            '寅': '木', '卯': '木',
            '巳': '火', '午': '火',
            '辰': '土', '未': '土', '戌': '土', '丑': '土',
            '申': '金', '酉': '金',
            '亥': '水', '子': '水'
        };
    }

    // Year pillar (年柱)
    getYearPillar(year) {
        const stemIndex = (year - 4) % 10;
        const branchIndex = (year - 4) % 12;
        return {
            stem: this.heavenlyStems[stemIndex],
            branch: this.earthlyBranches[branchIndex],
            zodiac: this.zodiac[branchIndex],
            element: this.stemElements[this.heavenlyStems[stemIndex]]
        };
    }

    // Month pillar (月柱) — improved with year-stem-based month stem rule
    getMonthPillar(year, month) {
        const yearStemIndex = (year - 4) % 10;
        // 甲己之年丙作首, 乙庚之岁戊为头...
        const monthStemStart = (yearStemIndex % 5) * 2 + 2;
        const stemIndex = (monthStemStart + month - 1) % 10;
        const branchIndex = (month + 1) % 12;
        return {
            stem: this.heavenlyStems[stemIndex],
            branch: this.earthlyBranches[branchIndex],
            element: this.stemElements[this.heavenlyStems[stemIndex]]
        };
    }

    // Day pillar (日柱)
    getDayPillar(year, month, day) {
        const a = Math.floor((14 - month) / 12);
        const y = year - a;
        const m = month + 12 * a - 3;
        const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4);
        const stemIndex = (jd + 9) % 10;
        const branchIndex = (jd + 1) % 12;
        return {
            stem: this.heavenlyStems[stemIndex],
            branch: this.earthlyBranches[branchIndex],
            element: this.stemElements[this.heavenlyStems[stemIndex]]
        };
    }

    // Hour pillar (时柱)
    getHourPillar(hour, dayStem) {
        const branchIndex = Math.floor((hour + 1) / 2) % 12;
        const stemBase = this.heavenlyStems.indexOf(dayStem);
        const stemIndex = (stemBase * 2 + branchIndex) % 10;
        return {
            stem: this.heavenlyStems[stemIndex],
            branch: this.earthlyBranches[branchIndex],
            element: this.stemElements[this.heavenlyStems[stemIndex]]
        };
    }

    // Get hidden stems for a branch
    getHiddenStems(branch) {
        return this.hiddenStems[branch] || [];
    }

    // Ten God relationship: given day stem and another stem, return the ten god name
    getTenGod(dayStem, otherStem) {
        const dayEl = this.stemElements[dayStem];
        const otherEl = this.stemElements[otherStem];
        const dayYY = this.stemYinYang[dayStem];
        const otherYY = this.stemYinYang[otherStem];
        const samePolarity = dayYY === otherYY;

        const dayIdx = this.elementIndex[dayEl];
        const otherIdx = this.elementIndex[otherEl];

        // Relationship: 0=same, 1=I generate, 2=generated overcomes me(克我生), 3=I overcome, 4=generates me
        // Using cycle: 木0→火1→土2→金3→水4
        const diff = (otherIdx - dayIdx + 5) % 5;

        if (diff === 0) return samePolarity ? '比肩' : '劫财';
        if (diff === 1) return samePolarity ? '食神' : '伤官'; // I generate
        if (diff === 2) return samePolarity ? '偏财' : '正财'; // I overcome
        if (diff === 3) return samePolarity ? '七杀' : '正官'; // Overcomes me
        if (diff === 4) return samePolarity ? '偏印' : '正印'; // Generates me
        return '';
    }

    // Analyze ten gods for all pillars
    analyzeTenGods(bazi) {
        const ds = bazi.dayMaster;

        // Stem ten gods (skip day stem itself)
        const yearStemGod = this.getTenGod(ds, bazi.year.stem);
        const monthStemGod = this.getTenGod(ds, bazi.month.stem);
        const hourStemGod = this.getTenGod(ds, bazi.hour.stem);

        // Hidden stem ten gods for all four branches
        const hiddenGods = {
            year: this.getHiddenStems(bazi.year.branch).map(s => ({ stem: s, god: this.getTenGod(ds, s) })),
            month: this.getHiddenStems(bazi.month.branch).map(s => ({ stem: s, god: this.getTenGod(ds, s) })),
            day: this.getHiddenStems(bazi.day.branch).map(s => ({ stem: s, god: this.getTenGod(ds, s) })),
            hour: this.getHiddenStems(bazi.hour.branch).map(s => ({ stem: s, god: this.getTenGod(ds, s) }))
        };

        // Distribution count
        const distribution = {};
        const allGods = [yearStemGod, monthStemGod, hourStemGod];
        Object.values(hiddenGods).forEach(arr => arr.forEach(h => allGods.push(h.god)));
        allGods.forEach(g => { distribution[g] = (distribution[g] || 0) + 1; });

        return {
            yearStem: yearStemGod,
            monthStem: monthStemGod,
            hourStem: hourStemGod,
            hidden: hiddenGods,
            distribution
        };
    }

    // Assess day master strength
    assessDayMasterStrength(bazi) {
        const ds = bazi.dayMaster;
        const dayEl = this.stemElements[ds];
        const rel = this.wuxingCycle[dayEl];
        let score = 50; // Start neutral

        // 1. Month branch (月令) — 40% weight
        const monthBranch = bazi.month.branch;
        const monthEl = this.monthSeasonElement[monthBranch];
        if (monthEl === dayEl) score += 16;           // 得令
        else if (monthEl === rel.generatedBy) score += 10; // 月令生我
        else if (monthEl === rel.overcomedBy) score -= 14; // 月令克我
        else if (monthEl === rel.generates) score -= 6;    // 我泄气
        else if (monthEl === rel.overcomes) score -= 4;    // 我耗气

        // 2. Hidden stems (藏干) — 30% weight
        const branches = [bazi.year.branch, bazi.month.branch, bazi.day.branch, bazi.hour.branch];
        branches.forEach(branch => {
            const hidden = this.getHiddenStems(branch);
            hidden.forEach((stem, idx) => {
                const el = this.stemElements[stem];
                const weight = idx === 0 ? 3 : (idx === 1 ? 1.5 : 1); // 本气>中气>余气
                if (el === dayEl) score += weight;
                else if (el === rel.generatedBy) score += weight * 0.6;
                else if (el === rel.overcomedBy) score -= weight * 0.5;
            });
        });

        // 3. Heavenly stems (天干) — 30% weight
        [bazi.year.stem, bazi.month.stem, bazi.hour.stem].forEach(stem => {
            const el = this.stemElements[stem];
            if (el === dayEl) score += 5;
            else if (el === rel.generatedBy) score += 3;
            else if (el === rel.overcomedBy) score -= 4;
            else if (el === rel.generates) score -= 2;
        });

        // Clamp to 0-100
        score = Math.max(0, Math.min(100, Math.round(score)));

        let strength, analysis;
        if (score >= 65) {
            strength = '偏强';
            analysis = `日主${dayEl}得令有助，根基深厚，气势充沛。宜以泄耗之法导引过剩能量，${rel.generates}与${rel.overcomes}皆为良方。`;
        } else if (score <= 35) {
            strength = '偏弱';
            analysis = `日主${dayEl}失令少助，力量不足。宜以生扶之道补充元气，${rel.generatedBy}相生、${dayEl}比和皆可增益。`;
        } else {
            strength = '中和';
            analysis = `日主${dayEl}强弱适中，格局平衡。既不过刚也不过柔，顺势而为，灵活应变即可。`;
        }

        return { strength, score, analysis };
    }

    // Classify pattern (格局判定)
    classifyPattern(bazi) {
        const tenGods = this.analyzeTenGods(bazi);
        const dist = tenGods.distribution;
        const monthHidden = this.getHiddenStems(bazi.month.branch);
        const ds = bazi.dayMaster;

        // Check what the month branch's main hidden stem produces as ten god
        const monthMainGod = monthHidden.length > 0 ? this.getTenGod(ds, monthHidden[0]) : '';

        // Check if month main god is "transparent" (透出) in stem
        const stems = [bazi.year.stem, bazi.month.stem, bazi.hour.stem];
        const stemGods = stems.map(s => this.getTenGod(ds, s));

        // Pattern priority: check if month god matches a stem god (透出)
        const transparentGod = stemGods.find(g => g === monthMainGod);

        const patterns = {
            '正官': { name: '正官格', desc: '正直守规，天赋领导力。注重秩序与原则，适合管理与公职。' },
            '七杀': { name: '七杀格', desc: '魄力非凡，敢于突破。抗压力强，适合开创事业或竞争环境。' },
            '正印': { name: '正印格', desc: '学识丰富，受人尊敬。心性仁厚，适合学术、教育或文化领域。' },
            '偏印': { name: '偏印格', desc: '思想独特，悟性超群。创意丰富，适合研究、技术或艺术。' },
            '正财': { name: '正财格', desc: '勤俭持家，稳健务实。善于积累，适合金融、管理或实业。' },
            '偏财': { name: '偏财格', desc: '交际广泛，财运灵活。为人慷慨，适合商业、投资或社交行业。' },
            '食神': { name: '食神格', desc: '才华横溢，性情淡泊。享受生活之美，适合餐饮、艺术或自由职业。' },
            '伤官': { name: '伤官格', desc: '聪明过人，表达力强。追求极致，适合演艺、设计或技术创新。' },
            '比肩': { name: '比肩格', desc: '独立自主，重义气。行事坚定，适合合伙经营或团队协作。' },
            '劫财': { name: '劫财格', desc: '果断行动，进取心强。竞争意识强烈，适合销售、体育或创业。' }
        };

        // Determine pattern
        let patternGod = transparentGod || monthMainGod;

        // Fallback: find the most frequent ten god (excluding 比肩/劫财 if possible)
        if (!patternGod || !patterns[patternGod]) {
            const sorted = Object.entries(dist)
                .filter(([g]) => g !== '比肩' && g !== '劫财')
                .sort((a, b) => b[1] - a[1]);
            patternGod = sorted.length > 0 ? sorted[0][0] : '比肩';
        }

        const p = patterns[patternGod] || patterns['比肩'];
        return { name: p.name, desc: p.desc, god: patternGod };
    }

    // Main calculation — day stem is the "self" (日主)
    calculate(year, month, day, hour = 12) {
        const yearPillar = this.getYearPillar(year);
        const monthPillar = this.getMonthPillar(year, month);
        const dayPillar = this.getDayPillar(year, month, day);
        const hourPillar = this.getHourPillar(hour, dayPillar.stem);

        const dayMaster = dayPillar.stem;
        const mainElement = this.stemElements[dayMaster];
        const yinYang = this.stemYinYang[dayMaster];

        const result = {
            year: yearPillar,
            month: monthPillar,
            day: dayPillar,
            hour: hourPillar,
            dayMaster,
            mainElement,
            yinYang,
            cosmicName: this.cosmicNames[dayMaster],
            personality: this.personalities[dayMaster],
            zodiacTrait: this.zodiacTraits[yearPillar.zodiac],
            theme: this.elementThemes[mainElement]
        };

        result.elementCounts = this.analyzeElements(result);
        result.wuxingInsight = this.getWuxingInsight(mainElement, result.elementCounts);
        result.stemZodiacSynthesis = this.getStemZodiacSynthesis(dayMaster, yearPillar.zodiac);
        result.complementaryAdvice = this.getComplementaryAdvice(mainElement, result.elementCounts);

        // Phase 1 deep analysis
        result.hiddenStems = {
            year: this.getHiddenStems(yearPillar.branch),
            month: this.getHiddenStems(monthPillar.branch),
            day: this.getHiddenStems(dayPillar.branch),
            hour: this.getHiddenStems(hourPillar.branch)
        };
        result.tenGods = this.analyzeTenGods(result);
        result.dayMasterStrength = this.assessDayMasterStrength(result);
        result.pattern = this.classifyPattern(result);
        result.tenGodDistribution = result.tenGods.distribution;

        return result;
    }

    // Analyze element distribution using all hidden stems (weighted)
    analyzeElements(bazi) {
        const counts = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

        // 4 heavenly stems (weight 1 each)
        [bazi.year.stem, bazi.month.stem, bazi.day.stem, bazi.hour.stem].forEach(stem => {
            counts[this.stemElements[stem]]++;
        });

        // 4 branches — use all hidden stems with decreasing weight
        [bazi.year.branch, bazi.month.branch, bazi.day.branch, bazi.hour.branch].forEach(branch => {
            const hidden = this.getHiddenStems(branch);
            hidden.forEach((stem, idx) => {
                const weight = idx === 0 ? 1 : (idx === 1 ? 0.5 : 0.3);
                counts[this.stemElements[stem]] += weight;
            });
        });

        // Round for display
        Object.keys(counts).forEach(k => { counts[k] = Math.round(counts[k] * 10) / 10; });

        return counts;
    }

    // Generate Wu Xing insight based on element distribution
    getWuxingInsight(mainElement, counts) {
        const rel = this.wuxingCycle[mainElement];
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const dominant = sorted[0][0];
        const dominantCount = sorted[0][1];
        const weakest = sorted[sorted.length - 1][0];
        const max = Math.max(...Object.values(counts));
        const min = Math.min(...Object.values(counts));

        if (dominantCount >= 4) {
            if (dominant === mainElement) {
                return `${mainElement}气极旺，身强气盛，宜以${rel.generates}泄秀生辉。`;
            }
            return `命局${dominant}气深厚，外力充沛，借势而行可成大器。`;
        }

        if (counts[rel.generatedBy] >= 2 && counts[mainElement] >= 2) {
            return `${rel.generatedBy}来生${mainElement}，源源不断之力，根基深厚，得天独厚。`;
        }

        if (counts[rel.overcomedBy] >= 3) {
            return `${rel.overcomedBy}重克${mainElement}，压力铸就非凡，逆境方显真我本色。`;
        }

        if (max - min <= 1) {
            return `五行趋于均衡，生克有序，天赋和谐圆融之象。`;
        }

        return `${dominant}气偏旺，${weakest}气稍弱，以${weakest}补之可得平衡圆满。`;
    }

    // Day Stem × Zodiac synthesis
    getStemZodiacSynthesis(stem, zodiac) {
        const stemElement = this.stemElements[stem];
        const zodiacElement = this.zodiacElements[zodiac];
        const rel = this.wuxingCycle[stemElement];

        let relation, desc;
        if (stemElement === zodiacElement) {
            relation = '比和';
            desc = `日主${stemElement}与生肖${zodiac}同属${stemElement}行，气场共振，内外合一。你的外在表现与内在本质高度统一，性格鲜明而纯粹，${stemElement}的能量在你身上被加倍放大，使你成为这一属性最纯正的代表。`;
        } else if (rel.generates === zodiacElement) {
            relation = '我生';
            desc = `日主${stemElement}生生肖${zodiacElement}，你天生具有付出和创造的本能。${stemElement}的根基滋养着${zodiacElement}的外在表达，让你在给予中找到生命的意义。你的能量向外流动，慷慨而不吝，是天生的创造者和给予者。`;
        } else if (rel.generatedBy === zodiacElement) {
            relation = '生我';
            desc = `生肖${zodiacElement}源源不断地滋养日主${stemElement}，你如同有活水之源的古木，根基深厚、底蕴充足。外部环境和与生俱来的特质为你的核心能量提供源源不断的支持，让你在任何处境中都能保持充盈。`;
        } else if (rel.overcomes === zodiacElement) {
            relation = '我克';
            desc = `日主${stemElement}克制生肖${zodiacElement}，你拥有强大的自我掌控力和塑造环境的能力。你不随波逐流，而是以坚定的意志改造周围的一切。这份力量让你在逆境中依然能开辟自己的道路。`;
        } else {
            relation = '克我';
            desc = `生肖${zodiacElement}挑战日主${stemElement}，外部的压力反而铸就了你非凡的韧性。你在磨砺中成长，在压力下绽放。这种内在的张力赋予你独特的深度和不屈不挠的生命力。`;
        }

        return { relation, desc };
    }

    // Complementary advice based on weakest element
    getComplementaryAdvice(_mainElement, counts) {
        const sorted = Object.entries(counts).sort((a, b) => a[1] - b[1]);
        const weakest = sorted[0][0];
        const advice = this.complementAdvice[weakest];
        return {
            weakElement: weakest,
            color: advice.color,
            direction: advice.direction,
            activity: advice.activity,
            season: advice.season,
            text: `你的五行中${weakest}气偏弱，可通过${advice.color}调和气场，宜朝${advice.direction}方位发展，适合${advice.activity}。${advice.season}是你补充能量的最佳时节。`
        };
    }

    // Generate prophetic descent text fragments
    generateFragments(bazi) {
        return [
            `${bazi.yinYang}${bazi.mainElement}之命`,
            `${bazi.year.stem}${bazi.year.branch}年`,
            `生肖属${bazi.year.zodiac}`,
            `${bazi.month.stem}${bazi.month.branch}月`,
            `${bazi.day.stem}${bazi.day.branch}日`,
            `${bazi.hour.stem}${bazi.hour.branch}时`,
            `天干地支交汇`,
            `命运之轮转动`
        ];
    }
}
