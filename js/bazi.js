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

        // Zodiac trait summaries
        this.zodiacTraits = {
            '鼠': '机敏灵巧，洞察先机',
            '牛': '勤恳踏实，坚韧不拔',
            '虎': '勇猛无畏，王者之气',
            '兔': '温雅从容，心思细腻',
            '龙': '气吞山河，志存高远',
            '蛇': '深沉睿智，洞幽察微',
            '马': '奔放自由，热情如火',
            '羊': '温良恭俭，艺术天赋',
            '猴': '聪慧多变，机智过人',
            '鸡': '精明干练，一丝不苟',
            '狗': '忠诚正直，侠义心肠',
            '猪': '宽厚豁达，福泽深厚'
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

        return result;
    }

    // Analyze element distribution across all 8 characters
    analyzeElements(bazi) {
        const counts = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

        // 4 stems
        [bazi.year.stem, bazi.month.stem, bazi.day.stem, bazi.hour.stem].forEach(stem => {
            counts[this.stemElements[stem]]++;
        });

        // 4 branches (primary hidden stem element)
        [bazi.year.branch, bazi.month.branch, bazi.day.branch, bazi.hour.branch].forEach(branch => {
            counts[this.branchElements[branch]]++;
        });

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
