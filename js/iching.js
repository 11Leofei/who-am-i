// 周易卦象系统 — I Ching Hexagram Engine
// 确定性起卦：八字 + 人格测试数据 → 本卦 + 变爻 + 变卦

class IChing {
    constructor() {
        // 八经卦 (8 trigrams)
        this.trigrams = {
            '乾': { symbol: '☰', nature: '天', element: '金', lines: [1,1,1] },
            '坤': { symbol: '☷', nature: '地', element: '土', lines: [0,0,0] },
            '震': { symbol: '☳', nature: '雷', element: '木', lines: [1,0,0] },
            '巽': { symbol: '☴', nature: '风', element: '木', lines: [0,1,1] },
            '坎': { symbol: '☵', nature: '水', element: '水', lines: [0,1,0] },
            '离': { symbol: '☲', nature: '火', element: '火', lines: [1,0,1] },
            '艮': { symbol: '☶', nature: '山', element: '土', lines: [0,0,1] },
            '兑': { symbol: '☱', nature: '泽', element: '金', lines: [1,1,0] }
        };

        // Trigram lookup by lines pattern
        this._trigramByLines = {};
        Object.entries(this.trigrams).forEach(([name, t]) => {
            this._trigramByLines[t.lines.join('')] = name;
        });

        // 64 hexagrams: [upper trigram, lower trigram] → hexagram data
        // Order follows King Wen sequence
        this.hexagrams = [
            { num: 1, name: '乾', upper: '乾', lower: '乾', nature: '刚健中正', judgement: '元亨利贞', image: '天行健，君子以自强不息', cosmicDesc: '你的灵魂如纯阳之天，自强不息，创造力与领导力并驱。宇宙赋予你开创格局的使命。' },
            { num: 2, name: '坤', upper: '坤', lower: '坤', nature: '柔顺包容', judgement: '元亨，利牝马之贞', image: '地势坤，君子以厚德载物', cosmicDesc: '你的灵魂如大地般包容万物，以柔顺之力承载一切。宇宙赋予你滋养与成就的使命。' },
            { num: 3, name: '屯', upper: '坎', lower: '震', nature: '初生蓄势', judgement: '元亨利贞，勿用有攸往', image: '云雷屯，君子以经纶', cosmicDesc: '你正处于万物初生的星云期，虽有波折但蕴含无限可能。静待时机，厚积薄发。' },
            { num: 4, name: '蒙', upper: '艮', lower: '坎', nature: '启蒙求知', judgement: '亨，匪我求童蒙', image: '山下出泉，蒙', cosmicDesc: '你的灵魂正在觉醒之旅中，如山泉初涌。保持谦逊求知之心，智慧将如泉水般汩汩而出。' },
            { num: 5, name: '需', upper: '坎', lower: '乾', nature: '等待时机', judgement: '有孚，光亨贞吉', image: '云上于天，需', cosmicDesc: '你如云积于天际，等待化雨的时刻。耐心与信念是你最大的星际武器。' },
            { num: 6, name: '讼', upper: '乾', lower: '坎', nature: '争辩明理', judgement: '有孚，窒惕', image: '天与水违行，讼', cosmicDesc: '你的内心有着坚定的立场和追求正义的勇气。学会和解，方能化干戈为玉帛。' },
            { num: 7, name: '师', upper: '坤', lower: '坎', nature: '统御之道', judgement: '贞，丈人吉', image: '地中有水，师', cosmicDesc: '你天生具有统领能力，如大地蓄水般深藏不露。纪律与仁慈并行，方成大器。' },
            { num: 8, name: '比', upper: '坎', lower: '坤', nature: '亲近团结', judgement: '吉，原筮元永贞', image: '地上有水，比', cosmicDesc: '你的灵魂渴望连接与共鸣。以真诚为纽带，你将汇聚星光般的伙伴。' },
            { num: 9, name: '小畜', upper: '巽', lower: '乾', nature: '以柔蓄刚', judgement: '亨，密云不雨', image: '风行天上，小畜', cosmicDesc: '你正在积蓄力量的阶段，如密云酝酿大雨。小步积累，终将迎来丰沛的释放。' },
            { num: 10, name: '履', upper: '乾', lower: '兑', nature: '谨慎前行', judgement: '履虎尾，不咥人亨', image: '上天下泽，履', cosmicDesc: '你以优雅和勇气行走于宇宙之间。礼仪与胆识并重，即使踏虎尾亦能全身而退。' },
            { num: 11, name: '泰', upper: '坤', lower: '乾', nature: '通泰安乐', judgement: '小往大来，吉亨', image: '天地交，泰', cosmicDesc: '天地交泰，你正处于最和谐的星际频率中。内外通达，万事亨通，珍惜这段黄金时光。' },
            { num: 12, name: '否', upper: '乾', lower: '坤', nature: '闭塞不通', judgement: '否之匪人', image: '天地不交，否', cosmicDesc: '暂时的闭塞是宇宙给予你的沉潜期。守住本心，否极泰来，黑暗后必有星光。' },
            { num: 13, name: '同人', upper: '乾', lower: '离', nature: '志同道合', judgement: '同人于野，亨', image: '天与火，同人', cosmicDesc: '你的灵魂频率吸引着志同道合之人。以光明正大之心团结众人，共创星辰大海。' },
            { num: 14, name: '大有', upper: '离', lower: '乾', nature: '大有所得', judgement: '元亨', image: '火在天上，大有', cosmicDesc: '你如烈日当空，光芒普照。丰盛的能量与资源汇聚于你，以德行驾驭方能长久。' },
            { num: 15, name: '谦', upper: '坤', lower: '艮', nature: '谦逊有礼', judgement: '亨，君子有终', image: '地中有山，谦', cosmicDesc: '你的灵魂拥有山般的实力却藏于大地之下。谦逊是你最闪耀的星光，越低调越有力量。' },
            { num: 16, name: '豫', upper: '震', lower: '坤', nature: '愉悦振奋', judgement: '利建侯行师', image: '雷出地奋，豫', cosmicDesc: '你如春雷破土，充满愉悦和生机。热情与行动力是你感染宇宙的方式。' },
            { num: 17, name: '随', upper: '兑', lower: '震', nature: '随顺适时', judgement: '元亨利贞', image: '泽中有雷，随', cosmicDesc: '你善于顺应宇宙的节奏而行。灵活变通不是软弱，而是与星辰共舞的智慧。' },
            { num: 18, name: '蛊', upper: '艮', lower: '巽', nature: '整饬革新', judgement: '元亨，利涉大川', image: '山下有风，蛊', cosmicDesc: '你正面临需要革新的课题。勇敢面对积弊，拨乱反正，你将开创全新的星际篇章。' },
            { num: 19, name: '临', upper: '坤', lower: '兑', nature: '居高临下', judgement: '元亨利贞', image: '泽上有地，临', cosmicDesc: '你以宽广的胸怀俯瞰全局。温柔而有力地影响周围，如大地临泽般滋润万物。' },
            { num: 20, name: '观', upper: '巽', lower: '坤', nature: '观察领悟', judgement: '盥而不荐，有孚颙若', image: '风行地上，观', cosmicDesc: '你拥有洞察宇宙深处的慧眼。沉静观察，领悟星辰的语言，智慧便从观照中诞生。' },
            { num: 21, name: '噬嗑', upper: '离', lower: '震', nature: '明断果决', judgement: '亨，利用狱', image: '雷电噬嗑', cosmicDesc: '你如闪电般明快果断，有拨云见日的魄力。面对障碍，你选择咬碎它而非绕行。' },
            { num: 22, name: '贲', upper: '艮', lower: '离', nature: '文饰之美', judgement: '亨，小利有攸往', image: '山下有火，贲', cosmicDesc: '你的灵魂天生追求美与和谐。内在的光芒经过精心雕琢，绽放出独特的星辰之美。' },
            { num: 23, name: '剥', upper: '艮', lower: '坤', nature: '剥落更新', judgement: '不利有攸往', image: '山附于地，剥', cosmicDesc: '旧的能量正在剥落，为新生让路。这是宇宙的自然循环，不必恐惧，静候黎明。' },
            { num: 24, name: '复', upper: '坤', lower: '震', nature: '复归本初', judgement: '亨，出入无疾', image: '雷在地中，复', cosmicDesc: '一阳复始，新的能量正从灵魂深处萌发。回归初心，你将发现最本真的力量。' },
            { num: 25, name: '无妄', upper: '乾', lower: '震', nature: '至诚不妄', judgement: '元亨利贞', image: '天下雷行，无妄', cosmicDesc: '你的灵魂追求真实与纯粹。不虚妄、不伪装，以至诚之心行走宇宙间。' },
            { num: 26, name: '大畜', upper: '艮', lower: '乾', nature: '大蓄大成', judgement: '利贞，不家食吉', image: '天在山中，大畜', cosmicDesc: '你正在蓄积巨大的宇宙能量。学习与沉淀将在未来化为磅礴的力量。' },
            { num: 27, name: '颐', upper: '艮', lower: '震', nature: '颐养正道', judgement: '贞吉，观颐', image: '山下有雷，颐', cosmicDesc: '你的灵魂需要滋养与被滋养。注意身心的平衡，以正道养生，方得长久之力。' },
            { num: 28, name: '大过', upper: '兑', lower: '巽', nature: '非常之行', judgement: '栋桡，利有攸往', image: '泽灭木，大过', cosmicDesc: '你正经历超越常规的考验。这是宇宙对强者的磨炼，以非常之勇行非常之事。' },
            { num: 29, name: '坎', upper: '坎', lower: '坎', nature: '临险不惧', judgement: '习坎，有孚', image: '水洊至，习坎', cosmicDesc: '你的灵魂如水般坚韧，面对重重险阻依然从容流淌。以信念穿越暗夜，终见星河。' },
            { num: 30, name: '离', upper: '离', lower: '离', nature: '光明附丽', judgement: '利贞亨，畜牝牛吉', image: '明两作，离', cosmicDesc: '你是光之使者，双重火焰照亮宇宙。依附正道而行，你的光芒将绵延不绝。' },
            { num: 31, name: '咸', upper: '兑', lower: '艮', nature: '感应相通', judgement: '亨利贞，取女吉', image: '山上有泽，咸', cosmicDesc: '你的灵魂拥有强大的感应力，能与万物产生共鸣。开放心灵，让宇宙的讯息自由流通。' },
            { num: 32, name: '恒', upper: '震', lower: '巽', nature: '恒久不变', judgement: '亨无咎利贞', image: '雷风恒', cosmicDesc: '你的灵魂拥有持之以恒的力量。在变幻的宇宙中，你是那颗不移的恒星。' },
            { num: 33, name: '遁', upper: '乾', lower: '艮', nature: '适时退隐', judgement: '亨，小利贞', image: '天下有山，遁', cosmicDesc: '你懂得适时退一步的智慧。战略性的隐退不是逃避，而是蓄势待发的宇宙韬略。' },
            { num: 34, name: '大壮', upper: '震', lower: '乾', nature: '阳刚壮盛', judgement: '利贞', image: '雷在天上，大壮', cosmicDesc: '你的能量正处于巅峰状态，如天雷滚滚。以正道引导这股力量，避免刚而过折。' },
            { num: 35, name: '晋', upper: '离', lower: '坤', nature: '光明上进', judgement: '康侯用锡马蕃庶', image: '明出地上，晋', cosmicDesc: '你如旭日东升，前途一片光明。以大地的厚德为根基，你的光芒将不断上升。' },
            { num: 36, name: '明夷', upper: '坤', lower: '离', nature: '韬光养晦', judgement: '利艰贞', image: '明入地中，明夷', cosmicDesc: '你的光芒暂时隐入大地之中。在黑暗中保持内心的光明，这是最高级的宇宙智慧。' },
            { num: 37, name: '家人', upper: '巽', lower: '离', nature: '家道和睦', judgement: '利女贞', image: '风自火出，家人', cosmicDesc: '你的灵魂以家与归属为根基。从最亲密的关系出发，你的爱将如风般传播到更远处。' },
            { num: 38, name: '睽', upper: '离', lower: '兑', nature: '异中求同', judgement: '小事吉', image: '上火下泽，睽', cosmicDesc: '你善于在差异中发现共通之处。对立并非矛盾，而是宇宙赋予你的多元视角。' },
            { num: 39, name: '蹇', upper: '坎', lower: '艮', nature: '知难而进', judgement: '利西南，不利东北', image: '山上有水，蹇', cosmicDesc: '前路虽有险阻，但你拥有跋山涉水的勇气。反省自我，借助同伴，困难终将化解。' },
            { num: 40, name: '解', upper: '震', lower: '坎', nature: '解除困厄', judgement: '利西南，无所往', image: '雷雨作，解', cosmicDesc: '如春雷化雨，你正在经历一场解脱。困扰消散，束缚解除，轻装上阵迎接新旅程。' },
            { num: 41, name: '损', upper: '艮', lower: '兑', nature: '减损益上', judgement: '有孚，元吉', image: '山下有泽，损', cosmicDesc: '适度的舍弃是更高层次的获得。减去多余的执着，你的灵魂将变得更加轻盈通透。' },
            { num: 42, name: '益', upper: '巽', lower: '震', nature: '增益进取', judgement: '利有攸往，利涉大川', image: '风雷益', cosmicDesc: '宇宙正在为你注入新的能量。抓住这个增益的窗口期，大胆行动，利涉大川。' },
            { num: 43, name: '夬', upper: '兑', lower: '乾', nature: '果断决绝', judgement: '扬于王庭', image: '泽上于天，夬', cosmicDesc: '你正面临需要果断抉择的时刻。以正义之心做出决断，光明将驱散最后的阴霾。' },
            { num: 44, name: '姤', upper: '乾', lower: '巽', nature: '不期而遇', judgement: '女壮，勿用取女', image: '天下有风，姤', cosmicDesc: '一股意想不到的力量正在接近。保持觉察，审慎对待每一次不期而遇的际会。' },
            { num: 45, name: '萃', upper: '兑', lower: '坤', nature: '聚合汇萃', judgement: '亨，王假有庙', image: '泽上于地，萃', cosmicDesc: '你拥有汇聚众人的星际引力。以诚心为核心，你将吸引志同道合的灵魂聚集身旁。' },
            { num: 46, name: '升', upper: '坤', lower: '巽', nature: '上升进步', judgement: '元亨，用见大人', image: '地中生木，升', cosmicDesc: '你如破土而出的大树，稳步上升。以谦逊和坚韧向上生长，终将触及更广阔的天际。' },
            { num: 47, name: '困', upper: '兑', lower: '坎', nature: '困境磨炼', judgement: '亨贞，大人吉', image: '泽无水，困', cosmicDesc: '暂时的困顿是宇宙对你的考验。守住内心的光芒，以言行一致穿越困境。' },
            { num: 48, name: '井', upper: '坎', lower: '巽', nature: '滋养不竭', judgement: '改邑不改井', image: '木上有水，井', cosmicDesc: '你的灵魂如一口深井，源源不断地滋养着周围。保持清澈纯净，你的价值永恒不变。' },
            { num: 49, name: '革', upper: '兑', lower: '离', nature: '变革更新', judgement: '巳日乃孚，元亨利贞', image: '泽中有火，革', cosmicDesc: '你正处于深刻变革的宇宙节点。旧的秩序正在瓦解，新的可能正在诞生。拥抱变化。' },
            { num: 50, name: '鼎', upper: '离', lower: '巽', nature: '鼎新革故', judgement: '元吉亨', image: '木上有火，鼎', cosmicDesc: '你如宝鼎般承载着转化的力量。将经验和智慧熔炼升华，你将创造出全新的价值。' },
            { num: 51, name: '震', upper: '震', lower: '震', nature: '震动奋起', judgement: '亨，震来虩虩', image: '洊雷震', cosmicDesc: '双重震动激活了你灵魂中沉睡的力量。在震惊之后归于沉静，你将获得前所未有的清明。' },
            { num: 52, name: '艮', upper: '艮', lower: '艮', nature: '止定沉静', judgement: '艮其背，不获其身', image: '兼山艮', cosmicDesc: '你的灵魂正在学习静止的艺术。该止则止，在宁静中找到真正的力量与智慧。' },
            { num: 53, name: '渐', upper: '巽', lower: '艮', nature: '循序渐进', judgement: '女归吉，利贞', image: '山上有木，渐', cosmicDesc: '你如山上之木，循序渐进地成长。不急不躁，按照自然的节奏，你终将枝繁叶茂。' },
            { num: 54, name: '归妹', upper: '震', lower: '兑', nature: '归宿依附', judgement: '征凶，无攸利', image: '泽上有雷，归妹', cosmicDesc: '你的灵魂在寻找归属和依附。明确自己的位置和角色，在关系中找到恰当的平衡。' },
            { num: 55, name: '丰', upper: '震', lower: '离', nature: '丰盛光大', judgement: '亨，王假之', image: '雷电皆至，丰', cosmicDesc: '你正处于能量最丰沛的时刻，如雷电交加般壮丽。在丰盛中保持清醒，光大不骄。' },
            { num: 56, name: '旅', upper: '离', lower: '艮', nature: '旅途修行', judgement: '小亨，旅贞吉', image: '山上有火，旅', cosmicDesc: '你是宇宙间的旅行者，在行走中修行。保持谦逊和谨慎，旅途中的每一步都是修炼。' },
            { num: 57, name: '巽', upper: '巽', lower: '巽', nature: '柔顺渗透', judgement: '小亨，利有攸往', image: '随风巽', cosmicDesc: '你如风般柔顺而无孔不入。以温和而持续的力量渗透一切障碍，润物无声。' },
            { num: 58, name: '兑', upper: '兑', lower: '兑', nature: '喜悦和谐', judgement: '亨利贞', image: '丽泽兑', cosmicDesc: '你的灵魂散发着愉悦与和谐的光辉。以喜悦感染世界，在分享中获得更大的幸福。' },
            { num: 59, name: '涣', upper: '巽', lower: '坎', nature: '涣散重聚', judgement: '亨，王假有庙', image: '风行水上，涣', cosmicDesc: '打破固有的壁垒，让能量自由流动。涣散不是消亡，而是重新聚合前的必要释放。' },
            { num: 60, name: '节', upper: '坎', lower: '兑', nature: '节制适度', judgement: '亨，苦节不可贞', image: '泽上有水，节', cosmicDesc: '你的灵魂正在学习节制的智慧。适度则吉，过犹不及。在限制中找到自由的真谛。' },
            { num: 61, name: '中孚', upper: '巽', lower: '兑', nature: '诚信感化', judgement: '豚鱼吉，利涉大川', image: '泽上有风，中孚', cosmicDesc: '你以至诚之心感化万物。如风拂水面，内心的真诚是你最强大的宇宙力量。' },
            { num: 62, name: '小过', upper: '震', lower: '艮', nature: '小有超越', judgement: '亨利贞，可小事', image: '山上有雷，小过', cosmicDesc: '你正在经历小范围的突破与超越。在细节处精进，谦逊行事，小过必有小成。' },
            { num: 63, name: '既济', upper: '坎', lower: '离', nature: '功成有序', judgement: '亨小，利贞', image: '水在火上，既济', cosmicDesc: '你的各方面能量已趋于完成和平衡。在圆满中保持警觉，防微杜渐方能长久。' },
            { num: 64, name: '未济', upper: '离', lower: '坎', nature: '未竟之志', judgement: '亨，小狐汔济', image: '火在水上，未济', cosmicDesc: '你正站在新旅程的起点，一切尚未完成。这是宇宙的提醒：最精彩的篇章还在前方。' }
        ];

        // Build lookup: upper+lower → hexagram index
        this._hexagramMap = {};
        this.hexagrams.forEach((h, i) => {
            this._hexagramMap[h.upper + '_' + h.lower] = i;
        });

        // Yao (爻) position names
        this.yaoNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
        this.yaoPositionDesc = [
            '初始萌动，潜龙勿用',
            '渐露光芒，见龙在田',
            '内卦之巅，小心谨慎',
            '进入外卦，变化之际',
            '至尊之位，飞龙在天',
            '极高之处，亢龙有悔'
        ];

        // 384 爻辞 — Classical line texts for all 64 hexagrams
        this.lineTexts = {
            1:[{text:'潜龙勿用',interpretation:'力量尚在积蓄，宜静待时机'},{text:'见龙在田，利见大人',interpretation:'才华初露，寻找引路之人'},{text:'君子终日乾乾，夕惕若厉，无咎',interpretation:'保持警觉精进，方可无忧'},{text:'或跃在渊，无咎',interpretation:'进退之间审慎抉择'},{text:'飞龙在天，利见大人',interpretation:'能量巅峰，大展宏图之时'},{text:'亢龙有悔',interpretation:'盛极必衰，知进退方为智'}],
            2:[{text:'履霜，坚冰至',interpretation:'见微知著，防患未然'},{text:'直方大，不习无不利',interpretation:'以柔顺之德自然应对'},{text:'含章可贞，或从王事，无成有终',interpretation:'韬光养晦，静待成就'},{text:'括囊，无咎无誉',interpretation:'谨言慎行，守护内心'},{text:'黄裳，元吉',interpretation:'守正中和，获至高福祉'},{text:'龙战于野，其血玄黄',interpretation:'阴阳相争，需化解冲突'}],
            3:[{text:'磐桓，利居贞，利建侯',interpretation:'初始艰难，坚守方能立足'},{text:'屯如邅如，乘马班如，匪寇婚媾',interpretation:'困境中坚持，终得善果'},{text:'即鹿无虞，惟入于林中',interpretation:'莫追无望之事，放手为上'},{text:'乘马班如，求婚媾，往吉',interpretation:'主动求助，化险为夷'},{text:'屯其膏，小贞吉，大贞凶',interpretation:'小有积累，勿急于求成'},{text:'乘马班如，泣血涟如',interpretation:'困顿之极，需转换思路'}],
            4:[{text:'发蒙，利用刑人',interpretation:'教化蒙昧，需立规矩'},{text:'包蒙吉，纳妇吉，子克家',interpretation:'包容接纳，方能育才'},{text:'勿用取女，见金夫，不有躬',interpretation:'勿为虚华所惑，守本心'},{text:'困蒙，吝',interpretation:'困于无知，需虚心求教'},{text:'童蒙，吉',interpretation:'保持纯真求知，可获吉'},{text:'击蒙，不利为寇，利御寇',interpretation:'以正道破执念，勿入歧途'}],
            5:[{text:'需于郊，利用恒，无咎',interpretation:'远离纷扰，静心等待'},{text:'需于沙，小有言，终吉',interpretation:'近处等待，小有波折终安'},{text:'需于泥，致寇至',interpretation:'危险渐近，需提高警觉'},{text:'需于血，出自穴',interpretation:'身陷险境，需待机脱身'},{text:'需于酒食，贞吉',interpretation:'以平和之心待时而动'},{text:'入于穴，有不速之客三人来，敬之终吉',interpretation:'意外助力降临，恭敬以待'}],
            6:[{text:'不永所事，小有言，终吉',interpretation:'及时止损，避免深陷'},{text:'不克讼，归而逋',interpretation:'退让求和，保全己身'},{text:'食旧德，贞厉，终吉',interpretation:'守住本分，不争功名'},{text:'不克讼，复即命，渝安贞，吉',interpretation:'转变心态，化争为和'},{text:'讼元吉',interpretation:'秉持公正，可获吉祥'},{text:'或锡之鞶带，终朝三褫之',interpretation:'争得虚名终失，不如不争'}],
            7:[{text:'师出以律，否臧凶',interpretation:'行动需有纪律，否则危险'},{text:'在师中，吉无咎，王三锡命',interpretation:'居中协调，获得认可'},{text:'师或舆尸，凶',interpretation:'执行不力，招致失败'},{text:'师左次，无咎',interpretation:'战略撤退，保存实力'},{text:'田有禽，利执言，无咎',interpretation:'由贤能者领导，方能成功'},{text:'大君有命，开国承家，小人勿用',interpretation:'论功行赏，但需慎选人才'}],
            8:[{text:'有孚比之，无咎',interpretation:'以诚相待，终获信任'},{text:'比之自内，贞吉',interpretation:'从内心建立联结，吉祥'},{text:'比之匪人',interpretation:'亲近不当之人，需警惕'},{text:'外比之，贞吉',interpretation:'向外寻求盟友，可获吉'},{text:'显比，王用三驱',interpretation:'光明磊落，不强求结盟'},{text:'比之无首，凶',interpretation:'群龙无首，易生祸端'}],
            9:[{text:'复自道，何其咎，吉',interpretation:'回归正途，无需自责'},{text:'牵复，吉',interpretation:'被善缘牵引，得以回归'},{text:'舆说辐，夫妻反目',interpretation:'前行受阻，关系生变'},{text:'有孚，血去惕出，无咎',interpretation:'以诚化解危机，转危为安'},{text:'有孚挛如，富以其邻',interpretation:'真诚凝聚众力，共享丰盛'},{text:'既雨既处，尚德载',interpretation:'积累已满，暂缓前行为宜'}],
            10:[{text:'素履，往无咎',interpretation:'以本真行事，可顺利前行'},{text:'履道坦坦，幽人贞吉',interpretation:'守正道者安稳吉祥'},{text:'眇能视，跛能履，履虎尾，咥人凶',interpretation:'能力不足强为之，危险'},{text:'履虎尾，愬愬终吉',interpretation:'虽临险境，谨慎可得吉'},{text:'夬履，贞厉',interpretation:'果决而行，需防过刚'},{text:'视履考祥，其旋元吉',interpretation:'回顾经验，总结可获大吉'}],
            11:[{text:'拔茅茹，以其汇，征吉',interpretation:'携手同行，共创盛世'},{text:'包荒，用冯河，不遐遗',interpretation:'包容广大，中正行事'},{text:'无平不陂，无往不复',interpretation:'万物流转，守正应变'},{text:'翩翩，不富以其邻，不戒以孚',interpretation:'以诚待人，财富共享'},{text:'帝乙归妹，以祉元吉',interpretation:'谦卑联姻，获至高福祉'},{text:'城复于隍，勿用师',interpretation:'盛极转衰，需内省自守'}],
            12:[{text:'拔茅茹，以其汇，贞吉亨',interpretation:'结盟撤离，保存实力'},{text:'包承，小人吉，大人否亨',interpretation:'顺应时势，韬光养晦'},{text:'包羞',interpretation:'承受屈辱，等待转机'},{text:'有命无咎，畴离祉',interpretation:'顺应天命，终获福祉'},{text:'休否，大人吉',interpretation:'转危为安，但需常怀危机'},{text:'倾否，先否后喜',interpretation:'困境终结，喜悦将至'}],
            13:[{text:'同人于门，无咎',interpretation:'在起点就开放包容'},{text:'同人于宗，吝',interpretation:'仅限同类，格局太小'},{text:'伏戎于莽，升其高陵，三岁不兴',interpretation:'暗藏敌意，难以和合'},{text:'乘其墉，弗克攻，吉',interpretation:'放弃攻击，转向和解'},{text:'同人，先号咷而后笑',interpretation:'经历波折后终获团结'},{text:'同人于郊，无悔',interpretation:'广结善缘，无怨无悔'}],
            14:[{text:'无交害，匪咎，艰则无咎',interpretation:'初获丰盛，保持谦逊'},{text:'大车以载，有攸往，无咎',interpretation:'承载丰盛，广泛分享'},{text:'公用亨于天子，小人弗克',interpretation:'德行不足难守富贵'},{text:'匪其彭，无咎',interpretation:'不显富炫耀，方能无咎'},{text:'厥孚交如，威如，吉',interpretation:'以诚相交，建立威信'},{text:'自天佑之，吉无不利',interpretation:'天降福泽，事事顺遂'}],
            15:[{text:'谦谦君子，用涉大川，吉',interpretation:'谦逊至极，可渡艰险'},{text:'鸣谦，贞吉',interpretation:'美名在外，守正得吉'},{text:'劳谦君子，有终吉',interpretation:'谦而有为，终获圆满'},{text:'无不利，撝谦',interpretation:'谦卑处事，百事皆利'},{text:'不富以其邻，利用侵伐',interpretation:'谦德服众，令行禁止'},{text:'鸣谦，利用行师，征邑国',interpretation:'谦声远播，可成大事'}],
            16:[{text:'鸣豫，凶',interpretation:'过度欢愉，招致凶险'},{text:'介于石，不终日，贞吉',interpretation:'保持警觉，不沉溺享乐'},{text:'盱豫，悔，迟有悔',interpretation:'醉心逸乐，悔之已晚'},{text:'由豫，大有得，勿疑',interpretation:'由此凝聚众力，共享成果'},{text:'贞疾，恒不死',interpretation:'虽染顽疾，坚持可活'},{text:'冥豫，成有渝，无咎',interpretation:'从迷醉中觉醒，可得解脱'}],
            17:[{text:'官有渝，贞吉，出门交有功',interpretation:'改变方向，开放交流'},{text:'系小子，失丈夫',interpretation:'择善而从，放弃不当'},{text:'系丈夫，失小子，随有求得',interpretation:'跟随正道，必有所得'},{text:'随有获，贞凶，有孚在道以明',interpretation:'随波逐流有险，守正则安'},{text:'孚于嘉，吉',interpretation:'追随美善，吉祥如意'},{text:'拘系之，乃从维之',interpretation:'坚定追随，获天命认可'}],
            18:[{text:'干父之蛊，有子，考无咎',interpretation:'修复旧患，承担责任'},{text:'干母之蛊，不可贞',interpretation:'处理遗留问题需柔和'},{text:'干父之蛊，小有悔，无大咎',interpretation:'纠正前人错误，稍有遗憾'},{text:'裕父之蛊，往见吝',interpretation:'宽容前人过失，勿苛责'},{text:'干父之蛊，用誉',interpretation:'革新有功，获得赞誉'},{text:'不事王侯，高尚其事',interpretation:'超脱世俗，追求更高境界'}],
            19:[{text:'咸临，贞吉',interpretation:'感召众人，正道吉祥'},{text:'咸临，吉，无不利',interpretation:'以感化力聚众，万事顺遂'},{text:'甘临，无攸利，既忧之，无咎',interpretation:'以利诱人不长久，需警醒'},{text:'至临，无咎',interpretation:'亲临现场，方能无误'},{text:'知临，大君之宜，吉',interpretation:'以智慧领导，君王之道'},{text:'敦临，吉，无咎',interpretation:'以厚道待人，终得吉祥'}],
            20:[{text:'童观，小人无咎，君子吝',interpretation:'浅薄观察，难获深意'},{text:'闚观，利女贞',interpretation:'窥探表象，格局受限'},{text:'观我生，进退',interpretation:'观察自我，审时度势'},{text:'观国之光，利用宾于王',interpretation:'见识更大格局，提升视野'},{text:'观我生，君子无咎',interpretation:'反观自省，君子之道'},{text:'观其生，君子无咎',interpretation:'观察他者，觉察万物'}],
            21:[{text:'屦校灭趾，无咎',interpretation:'小受惩戒，防微杜渐'},{text:'噬肤灭鼻，无咎',interpretation:'深层惩治，断除顽疾'},{text:'噬腊肉，遇毒，小吝，无咎',interpretation:'处理积弊，遇阻但无妨'},{text:'噬干胏，得金矢，利艰贞，吉',interpretation:'艰难决断，终获正果'},{text:'噬干肉，得黄金，贞厉，无咎',interpretation:'坚定执行，虽险无咎'},{text:'何校灭耳，凶',interpretation:'执法过度，招致凶险'}],
            22:[{text:'贲其趾，舍车而徒',interpretation:'不求虚饰，脚踏实地'},{text:'贲其须',interpretation:'修饰外表，追随主流'},{text:'贲如濡如，永贞吉',interpretation:'润泽修饰，持久方吉'},{text:'贲如皤如，白马翰如',interpretation:'朴素纯净，获真诚相待'},{text:'贲于丘园，束帛戋戋，吝，终吉',interpretation:'回归朴素，舍奢从简'},{text:'白贲，无咎',interpretation:'返璞归真，本色无咎'}],
            23:[{text:'剥床以足，蔑贞凶',interpretation:'根基动摇，危险降临'},{text:'剥床以辨，蔑贞凶',interpretation:'崩解加剧，难以维系'},{text:'剥之，无咎',interpretation:'顺应剥落，放手为安'},{text:'剥床以肤，凶',interpretation:'侵蚀切肤，凶险至极'},{text:'贯鱼，以宫人宠，无不利',interpretation:'以柔顺应对，化险为夷'},{text:'硕果不食，君子得舆，小人剥庐',interpretation:'保留核心，待来年重生'}],
            24:[{text:'不远复，无祗悔，元吉',interpretation:'及时回归，无悔大吉'},{text:'休复，吉',interpretation:'止息妄念，回归安宁'},{text:'频复，厉无咎',interpretation:'反复犹豫，终能回归'},{text:'中行独复',interpretation:'独自醒悟，回归正道'},{text:'敦复，无悔',interpretation:'笃定归来，无怨无悔'},{text:'迷复，凶，有灾眚',interpretation:'迷失太久，难以挽回'}],
            25:[{text:'无妄，往吉',interpretation:'纯真而行，顺利前进'},{text:'不耕获，不菑畲，则利有攸往',interpretation:'不妄求回报，自有收获'},{text:'无妄之灾，或系之牛',interpretation:'无妄遭难，非己之过'},{text:'可贞，无咎',interpretation:'守住本心，可得无咎'},{text:'无妄之疾，勿药有喜',interpretation:'本无病患，无需妄治'},{text:'无妄，行有眚，无攸利',interpretation:'失去真诚，行事多阻'}],
            26:[{text:'有厉，利已',interpretation:'遇险即止，保存积蓄'},{text:'舆说輹',interpretation:'止步等待，蓄势待发'},{text:'良马逐，利艰贞',interpretation:'精进修习，方可前行'},{text:'童牛之牿，元吉',interpretation:'及早规范，可获大吉'},{text:'豮豕之牙，吉',interpretation:'去其锋芒，转危为安'},{text:'何天之衢，亨',interpretation:'积蓄圆满，通达天际'}],
            27:[{text:'舍尔灵龟，观我朵颐，凶',interpretation:'舍本逐末，自招凶险'},{text:'颠颐，拂经，于丘颐，征凶',interpretation:'养育之道需循正理'},{text:'拂颐，贞凶，十年勿用',interpretation:'违背正道滋养，无益'},{text:'颠颐，吉，虎视眈眈',interpretation:'以正道养人，可获吉'},{text:'拂经，居贞吉，不可涉大川',interpretation:'守住原则滋养，暂勿冒险'},{text:'由颐，厉吉，利涉大川',interpretation:'养育大众，可成大业'}],
            28:[{text:'藉用白茅，无咎',interpretation:'谨慎行事，以敬化险'},{text:'枯杨生稊，老夫得其女妻',interpretation:'枯木逢春，重获生机'},{text:'栋桡，凶',interpretation:'栋梁弯折，危机深重'},{text:'栋隆，吉，有它吝',interpretation:'力挽狂澜，虽吉有忧'},{text:'枯杨生华，老妇得其士夫',interpretation:'强撑外表，难以持久'},{text:'过涉灭顶，凶，无咎',interpretation:'冒险过度，虽败无悔'}],
            29:[{text:'习坎，入于坎窞，凶',interpretation:'陷入困境，越陷越深'},{text:'坎有险，求小得',interpretation:'险中求生，小有所获'},{text:'来之坎坎，险且枕，入于坎窞',interpretation:'前后皆险，暂勿妄动'},{text:'樽酒簋贰，用缶，纳约自牖',interpretation:'简朴诚恳，可化险为夷'},{text:'坎不盈，祗既平，无咎',interpretation:'险境未满，顺应即平'},{text:'系用徽纆，寘于丛棘，三岁不得',interpretation:'深陷囹圄，难以脱困'}],
            30:[{text:'履错然，敬之无咎',interpretation:'谨慎应对变化，保持敬畏'},{text:'黄离，元吉',interpretation:'中正光明，大吉大利'},{text:'日昃之离，不鼓缶而歌',interpretation:'辉煌已过，需看破放下'},{text:'突如其来如，焚如，死如，弃如',interpretation:'盛极而衰，瞬间陨落'},{text:'出涕沱若，戚嗟若，吉',interpretation:'哀伤之中，反思得吉'},{text:'王用出征，有嘉折首',interpretation:'以正义之师，扫除邪恶'}],
            31:[{text:'咸其拇',interpretation:'初有感应，尚需等待'},{text:'咸其腓，凶，居吉',interpretation:'冲动妄动则凶，守静为吉'},{text:'咸其股，执其随，往吝',interpretation:'盲目追随，难获善果'},{text:'贞吉，悔亡，憧憧往来',interpretation:'心念专一，感召同道'},{text:'咸其脢，无悔',interpretation:'感而不动，保持自持'},{text:'咸其辅颊舌',interpretation:'仅靠言语，难以动人'}],
            32:[{text:'浚恒，贞凶，无攸利',interpretation:'急于求成，反而有害'},{text:'悔亡',interpretation:'恒久坚持，悔恨消散'},{text:'不恒其德，或承之羞',interpretation:'不能恒久，招致羞辱'},{text:'田无禽',interpretation:'守恒无获，需调整方向'},{text:'恒其德贞，妇人吉，夫子凶',interpretation:'固守不变，需因时制宜'},{text:'振恒，凶',interpretation:'恒久过度，动荡不安'}],
            33:[{text:'遯尾，厉，勿用有攸往',interpretation:'退避太慢，陷入险境'},{text:'执之用黄牛之革，莫之胜说',interpretation:'坚守本心，不被诱惑'},{text:'系遯，有疾厉',interpretation:'欲退不能，需断舍离'},{text:'好遯，君子吉，小人否',interpretation:'善于退隐，君子之道'},{text:'嘉遯，贞吉',interpretation:'从容隐退，正道吉祥'},{text:'肥遯，无不利',interpretation:'彻底超脱，万事皆利'}],
            34:[{text:'壮于趾，征凶，有孚',interpretation:'初有强势，冒进则凶'},{text:'贞吉',interpretation:'守正而壮，可获吉祥'},{text:'小人用壮，君子用罔',interpretation:'逞强硬碰，反受其害'},{text:'贞吉，悔亡，藩决不羸',interpretation:'刚柔并济，可破困局'},{text:'丧羊于易，无悔',interpretation:'舍弃强势，反得自在'},{text:'羝羊触藩，不能退，不能遂',interpretation:'进退两难，守艰可解'}],
            35:[{text:'晋如摧如，贞吉',interpretation:'进而复退，保持宽裕'},{text:'晋如愁如，贞吉',interpretation:'虽有忧虑，坚持得福'},{text:'众允，悔亡',interpretation:'众人信任，前进无悔'},{text:'晋如鼫鼠，贞厉',interpretation:'似鼠窃进，终有危险'},{text:'悔亡，失得勿恤，往吉',interpretation:'放下得失，勇往直前'},{text:'晋其角，维用伐邑',interpretation:'强势进取，需防过刚'}],
            36:[{text:'明夷于飞，垂其翼',interpretation:'韬光养晦，忍辱负重'},{text:'明夷，夷于左股，用拯马壮，吉',interpretation:'明伤暗救，自保待时'},{text:'明夷于南狩，得其大首',interpretation:'暗中积蓄，终获转机'},{text:'入于左腹，获明夷之心',interpretation:'洞悉暗昧，果断脱离'},{text:'箕子之明夷，利贞',interpretation:'内明外晦，守正自保'},{text:'不明晦，初登于天，后入于地',interpretation:'极盛转暗，需有自知'}],
            37:[{text:'闲有家，悔亡',interpretation:'从家庭做起，建立秩序'},{text:'无攸遂，在中馈，贞吉',interpretation:'各司其职，守住本分'},{text:'家人嗃嗃，悔厉吉',interpretation:'严格治家，勿过度放纵'},{text:'富家，大吉',interpretation:'家业兴旺，大吉之兆'},{text:'王假有家，勿恤，吉',interpretation:'以身作则，感化家人'},{text:'有孚威如，终吉',interpretation:'诚信树威，终获和睦'}],
            38:[{text:'悔亡，丧马勿逐，自复',interpretation:'暂别求同，容纳差异'},{text:'遇主于巷，无咎',interpretation:'偶遇同道，化解隔阂'},{text:'见舆曳，其牛掣',interpretation:'历经磨难，终得和合'},{text:'睽孤，遇元夫，交孚',interpretation:'在孤独中寻得知音'},{text:'悔亡，厥宗噬肤，往何咎',interpretation:'回归本源，消解对立'},{text:'睽孤，见豕负涂，载鬼一车',interpretation:'疑云散去，误会冰释'}],
            39:[{text:'往蹇来誉',interpretation:'暂缓前进，反思得誉'},{text:'王臣蹇蹇，匪躬之故',interpretation:'为公忘私，虽难无悔'},{text:'往蹇来反',interpretation:'知难而退，回归修整'},{text:'往蹇来连',interpretation:'前遇险阻，需携手共进'},{text:'大蹇朋来',interpretation:'艰难之时，盟友相助'},{text:'往蹇来硕，吉，利见大人',interpretation:'克服困难，终获硕果'}],
            40:[{text:'无咎',interpretation:'解脱初现，无忧无咎'},{text:'田获三狐，得黄矢，贞吉',interpretation:'扫除障碍，获得正道'},{text:'负且乘，致寇至，贞吝',interpretation:'不当负重，招致麻烦'},{text:'解而拇，朋至斯孚',interpretation:'放下执着，诚意感召'},{text:'君子维有解，吉',interpretation:'君子以德化小人'},{text:'公用射隼于高墉之上，获之',interpretation:'果断除害，万事顺遂'}],
            41:[{text:'已事遄往，无咎，酌损之',interpretation:'速成己事，适度减损'},{text:'利贞，征凶，弗损益之',interpretation:'守正为利，减损反增'},{text:'三人行则损一人，一人行则得其友',interpretation:'精简团队，方得知己'},{text:'损其疾，使遄有喜，无咎',interpretation:'去除病患，速得喜悦'},{text:'或益之十朋之龟，弗克违，元吉',interpretation:'减损换来天降福泽'},{text:'弗损益之，无咎，贞吉',interpretation:'减损至极反得增益'}],
            42:[{text:'利用为大作，元吉，无咎',interpretation:'顺势增益，可成大业'},{text:'或益之十朋之龟，弗克违',interpretation:'受赐天福，长久吉祥'},{text:'益之用凶事，无咎，有孚中行',interpretation:'在危难中施益，获信'},{text:'中行告公从，利用为依迁国',interpretation:'顺应增益，可迁移造福'},{text:'有孚惠心，勿问元吉',interpretation:'以诚心施惠，获元吉'},{text:'莫益之，或击之，立心勿恒，凶',interpretation:'不增反损，摇摆不定'}],
            43:[{text:'壮于前趾，往不胜为咎',interpretation:'操之过急，反为过失'},{text:'惕号，莫夜有戎，勿恤',interpretation:'保持警觉，防患未然'},{text:'壮于頄，有凶',interpretation:'刚决过度，独行可免咎'},{text:'臀无肤，其行次且',interpretation:'进退不定，需坚定决断'},{text:'苋陆夬夬，中行无咎',interpretation:'坚决果断，守中道无咎'},{text:'无号，终有凶',interpretation:'失去警觉，终至凶险'}],
            44:[{text:'系于金柅，贞吉',interpretation:'坚守原则，勿被诱惑'},{text:'包有鱼，无咎，不利宾',interpretation:'内部资源，勿轻易外泄'},{text:'臀无肤，其行次且，厉',interpretation:'行进艰难，虽险无大害'},{text:'包无鱼，起凶',interpretation:'失去根基，危机四起'},{text:'以杞包瓜，含章，有陨自天',interpretation:'韬光养晦，天降福泽'},{text:'姤其角，吝，无咎',interpretation:'强势相遇，虽有遗憾无咎'}],
            45:[{text:'有孚不终，乃乱乃萃',interpretation:'聚合有变，坦诚沟通化解'},{text:'引吉，无咎，孚乃利用禴',interpretation:'引导聚合，诚信获吉'},{text:'萃如嗟如，无攸利',interpretation:'聚而生怨，需调和众心'},{text:'大吉，无咎',interpretation:'大规模聚合，吉无咎'},{text:'萃有位，无咎，匪孚',interpretation:'以位聚众，需以德服人'},{text:'赍咨涕洟，无咎',interpretation:'聚散由心，悲喜无咎'}],
            46:[{text:'允升，大吉',interpretation:'顺势上升，大吉大利'},{text:'孚乃利用禴，无咎',interpretation:'以诚晋升，简朴为贵'},{text:'升虚邑',interpretation:'顺势而升，轻松推进'},{text:'王用亨于岐山，吉，无咎',interpretation:'得时得地，晋升无阻'},{text:'贞吉，升阶',interpretation:'守正稳升，步步登高'},{text:'冥升，利于不息之贞',interpretation:'不懈努力，终达巅峰'}],
            47:[{text:'臀困于株木，入于幽谷',interpretation:'陷入困顿，久不见光'},{text:'困于酒食，朱绂方来',interpretation:'困于享乐，守静为宜'},{text:'困于石，据于蒺藜',interpretation:'困境加深，失所依靠'},{text:'来徐徐，困于金车，吝，有终',interpretation:'脱困缓慢，终有转机'},{text:'劓刖，困于赤绂，乃徐有说',interpretation:'身处屈辱，静待解脱'},{text:'困于葛藟，于臲卼',interpretation:'困至极点，反而得生'}],
            48:[{text:'井泥不食，旧井无禽',interpretation:'井水混浊，无人取用'},{text:'井谷射鲋，瓮敝漏',interpretation:'井底陈旧，器具破损'},{text:'井渫不食，为我心恻',interpretation:'清理之井无人用，可惜'},{text:'井甃，无咎',interpretation:'修缮水井，保障供给'},{text:'井冽，寒泉食',interpretation:'井水清冽，可供饮用'},{text:'井收勿幕，有孚元吉',interpretation:'井水开放共享，大吉'}],
            49:[{text:'巩用黄牛之革',interpretation:'时机未到，暂缓变革'},{text:'已日乃革之，征吉，无咎',interpretation:'择日变革，可获吉祥'},{text:'征凶，贞厉，革言三就，有孚',interpretation:'反复酝酿，方可革新'},{text:'悔亡，有孚改命，吉',interpretation:'革新有据，顺应天命'},{text:'大人虎变，未占有孚',interpretation:'彻底蜕变，众人信服'},{text:'君子豹变，小人革面',interpretation:'渐进改变，守正为宜'}],
            50:[{text:'鼎颠趾，利出否',interpretation:'革故鼎新，去旧迎新'},{text:'鼎有实，我仇有疾，不我能即，吉',interpretation:'内有充实，外难侵扰'},{text:'鼎耳革，其行塞',interpretation:'暂遇阻碍，耐心待时'},{text:'鼎折足，覆公餗，其形渥，凶',interpretation:'承载不力，倾覆责任'},{text:'鼎黄耳金铉，利贞',interpretation:'稳固平衡，守正得利'},{text:'鼎玉铉，大吉，无不利',interpretation:'至高品质，万事大吉'}],
            51:[{text:'震来虩虩，后笑言哑哑，吉',interpretation:'震惊过后，反思得吉'},{text:'震来厉，亿丧贝，跻于九陵',interpretation:'震动失财，守静可复'},{text:'震苏苏，震行无眚',interpretation:'震中保持清醒，可免灾'},{text:'震遂泥',interpretation:'震后陷入泥沼，难行'},{text:'震往来厉，亿无丧，有事',interpretation:'震荡反复，守住根本'},{text:'震索索，视矍矍，征凶',interpretation:'过度惊恐，需调整心态'}],
            52:[{text:'艮其趾，无咎，利永贞',interpretation:'及时止步，长久守正'},{text:'艮其腓，不拯其随',interpretation:'想止不能，内心纠结'},{text:'艮其限，列其夤，厉熏心',interpretation:'强行止步，内心煎熬'},{text:'艮其身，无咎',interpretation:'反求诸己，可得无咎'},{text:'艮其辅，言有序，悔亡',interpretation:'慎言守序，悔恨消散'},{text:'敦艮，吉',interpretation:'笃定止步，吉祥如意'}],
            53:[{text:'鸿渐于干，小子厉，有言，无咎',interpretation:'起步艰难，虽有非议无妨'},{text:'鸿渐于磐，饮食衎衎，吉',interpretation:'稳步推进，安乐自得'},{text:'鸿渐于陆，夫征不复',interpretation:'进退失据，需防外患'},{text:'鸿渐于木，或得其桷，无咎',interpretation:'寻得栖息，暂获安稳'},{text:'鸿渐于陵，妇三岁不孕，终莫之胜，吉',interpretation:'虽经磨难，终获圆满'},{text:'鸿渐于陆，其羽可用为仪，吉',interpretation:'渐进至极，德行圆满'}],
            54:[{text:'归妹以娣，跛能履，征吉',interpretation:'以次位前行，可获吉祥'},{text:'眇能视，利幽人之贞',interpretation:'虽有不足，守静为利'},{text:'归妹以须，反归以娣',interpretation:'期望过高，需调整定位'},{text:'归妹愆期，迟归有时',interpretation:'静待时机，勿急于求成'},{text:'帝乙归妹，其君之袂不如其娣之袂良',interpretation:'内涵胜于华丽，可得吉'},{text:'女承筐无实，士刲羊无血',interpretation:'徒有形式，缺乏真心'}],
            55:[{text:'遇其配主，虽旬无咎，往有尚',interpretation:'遇到同道，共创丰盛'},{text:'丰其蔀，日中见斗',interpretation:'虽有阻碍，诚心化解'},{text:'丰其沛，日中见沬',interpretation:'丰盛过度，受损无咎'},{text:'丰其蔀，日中见斗，遇其夷主，吉',interpretation:'困难中遇贵人相助'},{text:'来章，有庆誉，吉',interpretation:'美好显现，获得赞誉'},{text:'丰其屋，蔀其家',interpretation:'丰盛中孤立，终至凶险'}],
            56:[{text:'旅琐琐，斯其所取灾',interpretation:'旅途琐碎，自招烦扰'},{text:'旅即次，怀其资，得童仆贞',interpretation:'旅中有所，稳步前行'},{text:'旅焚其次，丧其童仆，贞厉',interpretation:'旅途失所，危险加剧'},{text:'旅于处，得其资斧',interpretation:'暂有安顿，内心不安'},{text:'射雉一矢亡，终以誉命',interpretation:'舍小获大，终得美誉'},{text:'鸟焚其巢，旅人先笑后号咷',interpretation:'乐极生悲，终至凶险'}],
            57:[{text:'进退，利武人之贞',interpretation:'进退审慎，坚定为宜'},{text:'巽在床下，用史巫纷若，吉',interpretation:'谦卑请教，可获指引'},{text:'频巽，吝',interpretation:'过度柔顺，失去主见'},{text:'悔亡，田获三品',interpretation:'悔恨消散，收获丰厚'},{text:'贞吉，悔亡，无不利',interpretation:'谨慎变通，终获圆满'},{text:'巽在床下，丧其资斧，贞凶',interpretation:'过度谦卑，失去根本'}],
            58:[{text:'和兑，吉',interpretation:'和悦交流，吉祥如意'},{text:'孚兑，吉，悔亡',interpretation:'以诚相待，悔恨消散'},{text:'来兑，凶',interpretation:'强求欢悦，反致凶险'},{text:'商兑未宁，介疾有喜',interpretation:'商议和悦，化解病患'},{text:'孚于剥，有厉',interpretation:'信任剥蚀者，有危险'},{text:'引兑',interpretation:'引导和悦，顺势而为'}],
            59:[{text:'用拯马壮，吉',interpretation:'借力突破，及时分散'},{text:'涣奔其机，悔亡',interpretation:'奔向根本，悔恨消散'},{text:'涣其躬，无悔',interpretation:'放下执着，无怨无悔'},{text:'涣其群，元吉',interpretation:'打破藩篱，成就大业'},{text:'涣汗其大号，涣王居，无咎',interpretation:'发布号令，统合涣散'},{text:'涣其血，去逖出，无咎',interpretation:'远离伤害，涣散而出'}],
            60:[{text:'不出户庭，无咎',interpretation:'知晓限度，守住本分'},{text:'不出门庭，凶',interpretation:'过度自限，失去机会'},{text:'不节若，则嗟若，无咎',interpretation:'不知节制，悔之晚矣'},{text:'安节，亨',interpretation:'安于节制，通达顺畅'},{text:'甘节，吉，往有尚',interpretation:'乐于节制，可成大事'},{text:'苦节，贞凶，悔亡',interpretation:'节制过苦，需调和适度'}],
            61:[{text:'虞吉，有它不燕',interpretation:'诚信为本，方得安宁'},{text:'鸣鹤在阴，其子和之',interpretation:'内心呼应，诚意相通'},{text:'得敌，或鼓或罢，或泣或歌',interpretation:'真诚相待，喜忧与共'},{text:'月几望，马匹亡，无咎',interpretation:'近乎圆满，舍小保大'},{text:'有孚挛如，无咎',interpretation:'至诚凝聚，无咎无忧'},{text:'翰音登于天，贞凶',interpretation:'空言无实，终至凶险'}],
            62:[{text:'飞鸟以凶',interpretation:'过度小心，反致凶险'},{text:'过其祖，遇其妣',interpretation:'恰当越级，把握分寸'},{text:'弗过防之，从或戕之，凶',interpretation:'防范不足，遭受伤害'},{text:'无咎，弗过遇之，往厉必戒',interpretation:'适度而行，勿固守不变'},{text:'密云不雨，自我西郊',interpretation:'小有积蓄，终有收获'},{text:'弗遇过之，飞鸟离之，凶',interpretation:'过犹不及，招致灾祸'}],
            63:[{text:'曳其轮，濡其尾，无咎',interpretation:'已成之初，谨慎保持'},{text:'妇丧其茀，勿逐，七日得',interpretation:'小有损失，静待自复'},{text:'高宗伐鬼方，三年克之',interpretation:'成后图远，需贤能之士'},{text:'繻有衣袽，终日戒',interpretation:'盛中防衰，时刻警觉'},{text:'东邻杀牛，不如西邻之禴祭',interpretation:'真诚胜奢华，可获福'},{text:'濡其首，厉',interpretation:'沉溺成就，危机暗涌'}],
            64:[{text:'濡其尾，吝',interpretation:'即将成功，勿急躁冒进'},{text:'曳其轮，贞吉',interpretation:'稳步推进，守正得吉'},{text:'未济，征凶，利涉大川',interpretation:'未竟之时，积极筹划'},{text:'贞吉，悔亡，震用伐鬼方',interpretation:'坚持努力，终获嘉奖'},{text:'贞吉，无悔，君子之光，有孚',interpretation:'光明磊落，诚信得吉'},{text:'有孚于饮酒，无咎',interpretation:'庆祝勿过，守住诚信'}]
        };
    }

    // Deterministic hash: simple LCG-style mixing
    _hash(values) {
        let h = 2166136261;
        for (let i = 0; i < values.length; i++) {
            h ^= values[i];
            h = Math.imul(h, 16777619);
            h = h >>> 0; // Keep unsigned 32-bit
        }
        return h;
    }

    // Cast hexagram from bazi + test results (deterministic)
    castHexagram(bazi, testResults) {
        // Build input seed array (20 values)
        const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
        const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

        const values = [
            stems.indexOf(bazi.year.stem),
            branches.indexOf(bazi.year.branch),
            stems.indexOf(bazi.month.stem),
            branches.indexOf(bazi.month.branch),
            stems.indexOf(bazi.day.stem),
            branches.indexOf(bazi.day.branch),
            stems.indexOf(bazi.hour.stem),
            branches.indexOf(bazi.hour.branch),
            // Test results
            Math.round(testResults.mbti.dimensions.ei),
            Math.round(testResults.mbti.dimensions.sn),
            Math.round(testResults.mbti.dimensions.tf),
            Math.round(testResults.mbti.dimensions.jp),
            Math.round(testResults.big5.percentages.o),
            Math.round(testResults.big5.percentages.c),
            Math.round(testResults.big5.percentages.ex),
            Math.round(testResults.big5.percentages.a),
            Math.round(testResults.big5.percentages.n),
            testResults.enneagram.type,
            testResults.enneagram.wing,
            // Extra seed for variety
            stems.indexOf(bazi.day.stem) * 12 + branches.indexOf(bazi.day.branch)
        ];

        // Generate 6 yao values (6-9) using base hash + xorshift PRNG
        // Previous approach had bias: FNV low bits correlate across similar seeds
        const baseHash = this._hash(values);
        const yaoValues = [];
        let state = baseHash || 1; // Avoid zero state
        for (let i = 0; i < 6; i++) {
            // xorshift32 — good independence between iterations
            state ^= state << 13;
            state ^= state >>> 17;
            state ^= state << 5;
            state = state >>> 0;
            // Extract from middle bits (>>> 8) to avoid low-bit bias
            yaoValues.push(6 + ((state >>> 8) % 4)); // 6=old yin, 7=young yang, 8=young yin, 9=old yang
        }

        // Build primary hexagram lines (6=yin, 7=yang, 8=yin, 9=yang)
        const primaryLines = yaoValues.map(v => (v === 7 || v === 9) ? 1 : 0);

        // Find changing lines (old yin=6 or old yang=9)
        const changingLines = [];
        yaoValues.forEach((v, i) => {
            if (v === 6 || v === 9) changingLines.push(i);
        });

        // Build transformed hexagram (flip changing lines)
        const transformedLines = [...primaryLines];
        changingLines.forEach(i => {
            transformedLines[i] = transformedLines[i] === 1 ? 0 : 1;
        });

        // Look up trigrams and hexagrams
        const primaryLower = this._trigramByLines[primaryLines.slice(0, 3).join('')];
        const primaryUpper = this._trigramByLines[primaryLines.slice(3, 6).join('')];
        const primary = this._findHexagram(primaryUpper, primaryLower);

        let transformed = null;
        if (changingLines.length > 0) {
            const transLower = this._trigramByLines[transformedLines.slice(0, 3).join('')];
            const transUpper = this._trigramByLines[transformedLines.slice(3, 6).join('')];
            transformed = this._findHexagram(transUpper, transLower);
        }

        const interpretation = this.interpretHexagram(primary, changingLines, transformed);
        const cosmicAdvice = this._generateCosmicAdvice(primary, transformed, changingLines);

        return {
            primary,
            changingLines,
            transformed,
            yaoValues,
            primaryLines,
            interpretation,
            cosmicAdvice
        };
    }

    _findHexagram(upper, lower) {
        const key = upper + '_' + lower;
        const idx = this._hexagramMap[key];
        if (idx !== undefined) return this.hexagrams[idx];

        // Fallback: search linearly
        return this.hexagrams.find(h => h.upper === upper && h.lower === lower) || this.hexagrams[0];
    }

    // Get a single line text for any hexagram + yao position
    getLineText(hexNum, lineIndex) {
        const hexTexts = this.lineTexts[hexNum];
        if (!hexTexts || !hexTexts[lineIndex]) return { text: '', interpretation: '' };
        return hexTexts[lineIndex];
    }

    // Get line texts for a specific hexagram's changing lines
    getChangingLineTexts(hexNum, changingLines) {
        const lines = this.lineTexts[hexNum];
        if (!lines || changingLines.length === 0) return [];
        return changingLines.map(i => ({
            position: this.yaoNames[i],
            ...lines[i]
        }));
    }

    // Interpret the hexagram combination
    interpretHexagram(primary, changingLines, transformed) {
        let text = `${primary.name}卦，${primary.nature}。${primary.image}。\n\n`;
        text += `${primary.cosmicDesc}\n\n`;

        if (changingLines.length > 0) {
            const lineData = this.getChangingLineTexts(primary.num, changingLines);
            text += `变爻在${changingLines.map(i => this.yaoNames[i]).join('、')}。`;
            lineData.forEach(ld => {
                text += `${ld.position}动：「${ld.text}」——${ld.interpretation}。`;
            });
            text += '\n\n';
        }

        if (transformed) {
            text += `本卦${primary.name}化为${transformed.name}，由「${primary.nature}」转向「${transformed.nature}」。`;
            text += `${transformed.image}。未来的走向蕴含着${transformed.nature}的能量。`;
        } else {
            text += `六爻安定，无变爻动。当前状态稳固，宜守正持中。`;
        }

        return text;
    }

    // Generate cosmic advice
    _generateCosmicAdvice(primary, transformed, changingLines) {
        const advices = [];

        // Based on primary hexagram nature
        if (primary.nature.includes('刚') || primary.nature.includes('壮')) {
            advices.push('以刚健之力开拓前行，但谨防过刚则折。');
        } else if (primary.nature.includes('柔') || primary.nature.includes('顺')) {
            advices.push('以柔顺之道处世，顺势而为方得圆融。');
        } else if (primary.nature.includes('明') || primary.nature.includes('光')) {
            advices.push('你的光芒正在显现，以正道引导这份光明。');
        } else if (primary.nature.includes('险') || primary.nature.includes('困')) {
            advices.push('暂时的困境是成长的催化剂，守住信念。');
        } else {
            advices.push('顺应宇宙的节奏，在变化中保持本心。');
        }

        // Based on changing lines count
        if (changingLines.length === 0) {
            advices.push('当前能量平稳，宜保持现状精进不懈。');
        } else if (changingLines.length <= 2) {
            advices.push('小幅调整即将到来，灵活应变是你的星际法宝。');
        } else {
            advices.push('重大变化正在酝酿，做好迎接新篇章的准备。');
        }

        // Based on transformation
        if (transformed) {
            const fromEl = this.trigrams[primary.upper]?.element || '金';
            const toEl = this.trigrams[transformed.upper]?.element || '金';
            if (fromEl !== toEl) {
                advices.push(`能量从${fromEl}向${toEl}转化，拥抱这份蜕变。`);
            }
        }

        return advices.join('');
    }
}
