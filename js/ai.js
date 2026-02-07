// CosmicAI — 通义千问 AI 深度解读引擎
// 使用阿里云百炼 API 为人格测试结果生成个性化深度分析

class CosmicAI {
    constructor() {
        this.apiKey = localStorage.getItem('cosmic_ai_key') || 'sk-5e952d8898d8439bb61c3a356f0c55d1';
        this.model = 'qwen-turbo';
        this.endpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
        this.timeout = 30000;
    }

    get hasKey() {
        return this.apiKey.length > 0;
    }

    setKey(key) {
        this.apiKey = key.trim();
        localStorage.setItem('cosmic_ai_key', this.apiKey);
    }

    clearKey() {
        this.apiKey = '';
        localStorage.removeItem('cosmic_ai_key');
    }

    // ==================== 缓存层 ====================

    _getCacheKey(results) {
        const m = results.mbti;
        const e = results.enneagram;
        const d = m.dimensions;
        return `ai_p_${m.type}_${e.type}w${e.wing}_${d.ei}_${d.sn}_${d.tf}_${d.jp}`;
    }

    _getMatchCacheKey(resultsA, resultsB, compatibility) {
        const dA = resultsA.mbti.dimensions;
        const dB = resultsB.mbti.dimensions;
        return `ai_m_${resultsA.mbti.type}_${resultsB.mbti.type}_${resultsA.enneagram.type}_${resultsB.enneagram.type}_${dA.ei}_${dA.sn}_${dB.ei}_${dB.sn}_${compatibility.score}`;
    }

    _getCache(key) {
        try { return sessionStorage.getItem(key); } catch { return null; }
    }

    _setCache(key, value) {
        try { sessionStorage.setItem(key, value); } catch {}
    }

    // ==================== 个人结果 AI 增强 ====================

    async enhancePersonalityResults(results, onChunk) {
        const cacheKey = this._getCacheKey(results);
        const cached = this._getCache(cacheKey);
        if (cached) {
            onChunk(cached);
            return cached;
        }
        const prompt = this._buildPersonalityPrompt(results);
        const fullText = await this._streamGenerate(prompt, onChunk);
        this._setCache(cacheKey, fullText);
        return fullText;
    }

    // ==================== 匹配结果 AI 增强 ====================

    async enhanceMatchResults(resultsA, resultsB, compatibility, names, onChunk) {
        const cacheKey = this._getMatchCacheKey(resultsA, resultsB, compatibility);
        const cached = this._getCache(cacheKey);
        if (cached) {
            onChunk(cached);
            return cached;
        }
        const prompt = this._buildMatchPrompt(resultsA, resultsB, compatibility, names);
        const fullText = await this._streamGenerate(prompt, onChunk);
        this._setCache(cacheKey, fullText);
        return fullText;
    }

    // ==================== Prompt 构建 ====================

    _buildPersonalityPrompt(results) {
        const mbti = results.mbti;
        const b5 = results.big5;
        const enn = results.enneagram;
        const dims = mbti.dimensions;
        const pcts = b5.percentages;

        return `你是「星尘·身份」的灵魂解读师，精通 MBTI、大五人格和九型人格。
根据以下测试数据，写一篇深度灵魂解读。

## 测试数据
- MBTI: ${mbti.type}「${mbti.cosmic}」
  E/I=${dims.ei}%, S/N=${dims.sn}%, T/F=${dims.tf}%, J/P=${dims.jp}%
- 大五: 开放性=${pcts.o}%, 尽责性=${pcts.c}%, 外向性=${pcts.ex}%, 宜人性=${pcts.a}%, 情绪性=${pcts.n}%
- 九型: Type ${enn.type} w${enn.wing}「${enn.cosmic}」（${enn.name}）

## 输出要求
写一篇流畅的综合灵魂解读，不使用标题或分隔符。涵盖：
1. 你是谁——三系统交汇的核心人格画像
2. 你如何思考和决策——认知模式与行为风格
3. 你如何连接他人——关系模式与情感表达
4. 你的成长方向——具体且有建设性的建议

语言风格：有洞察力、温暖、适度融入宇宙/星辰意象但不过度。
以鼓励和深度洞察结尾。

注意：
- 直接输出内容，不要加任何 markdown 标记（不要 #、*、** 等）
- 不要使用 === 分隔符或标题
- 每段之间用空行分隔
- 总字数控制在 600-900 字`;
    }

    _buildMatchPrompt(resultsA, resultsB, compatibility, names) {
        const mA = resultsA.mbti, mB = resultsB.mbti;
        const eA = resultsA.enneagram, eB = resultsB.enneagram;
        const dA = mA.dimensions, dB = mB.dimensions;

        return `你是「星尘·身份」的灵魂解读师。根据两位旅者的数据，分析灵魂契合度。

## 旅者数据
旅者A「${names[0]}」: ${mA.type}「${mA.cosmic}」, 九型 Type ${eA.type}「${eA.cosmic}」
  维度: E/I=${dA.ei}%, S/N=${dA.sn}%, T/F=${dA.tf}%, J/P=${dA.jp}%
旅者B「${names[1]}」: ${mB.type}「${mB.cosmic}」, 九型 Type ${eB.type}「${eB.cosmic}」
  维度: E/I=${dB.ei}%, S/N=${dB.sn}%, T/F=${dB.tf}%, J/P=${dB.jp}%
共振指数: ${compatibility.score}/100「${compatibility.level}」

## 输出要求
3-4段，分析：两人性格化学反应、携手优势、互补空间、宇宙寄语。
保持宇宙/星辰意象，温暖有洞察。

注意：
- 直接输出内容，不要加任何 markdown 标记（不要 #、*、** 等）
- 每段之间用空行分隔
- 总字数控制在 400-600 字`;
    }

    // ==================== 追问对话 ====================

    buildChatSystemPrompt(results) {
        const mbti = results.mbti;
        const b5 = results.big5;
        const enn = results.enneagram;
        const dims = mbti.dimensions;
        const pcts = b5.percentages;

        return `你是「星尘·身份」的灵魂解读师，正在与一位完成了人格测试的旅者对话。
保持宇宙/星辰意象风格，回答温暖而有洞察力。

旅者的测试数据：
- MBTI: ${mbti.type}「${mbti.cosmic}」, E/I=${dims.ei}%, S/N=${dims.sn}%, T/F=${dims.tf}%, J/P=${dims.jp}%
- 大五: 开放性=${pcts.o}%, 尽责性=${pcts.c}%, 外向性=${pcts.ex}%, 宜人性=${pcts.a}%, 情绪性=${pcts.n}%
- 九型: Type ${enn.type} w${enn.wing}「${enn.cosmic}」（${enn.name}）

请根据旅者的数据回答问题，每次回复控制在 150-300 字。不要使用 markdown 标记。`;
    }

    async chat(messages, onChunk) {
        return this._streamChat(messages, onChunk);
    }

    async _streamChat(messages, onChunk) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const res = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: 0.8,
                    max_tokens: 1024,
                    stream: true
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                const errBody = await res.text().catch(() => '');
                throw new Error(`API ${res.status}: ${errBody.slice(0, 200)}`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.slice(6).trim();
                        if (!jsonStr || jsonStr === '[DONE]') continue;
                        try {
                            const json = JSON.parse(jsonStr);
                            const delta = json.choices?.[0]?.delta?.content || '';
                            if (delta) {
                                fullText += delta;
                                onChunk(fullText);
                            }
                        } catch {}
                    }
                }
            }

            return fullText;
        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') throw new Error('AI 请求超时');
            throw err;
        }
    }

    // ==================== 流式调用百炼 ====================

    async _streamGenerate(prompt, onChunk) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const res = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.8,
                    max_tokens: 2048,
                    stream: true
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                const errBody = await res.text().catch(() => '');
                throw new Error(`API ${res.status}: ${errBody.slice(0, 200)}`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.slice(6).trim();
                        if (!jsonStr || jsonStr === '[DONE]') continue;
                        try {
                            const json = JSON.parse(jsonStr);
                            const delta = json.choices?.[0]?.delta?.content || '';
                            if (delta) {
                                fullText += delta;
                                onChunk(fullText);
                            }
                        } catch {
                            // Skip malformed JSON chunks
                        }
                    }
                }
            }

            return fullText;
        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                throw new Error('AI 请求超时');
            }
            throw err;
        }
    }
}
