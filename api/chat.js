// Vercel Serverless Function — AI API 代理
// 隐藏通义千问 API 密钥 + IP 限流

const DASHSCOPE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

// 简易内存限流（冷启动重置，生产环境建议用 Vercel KV / Redis）
const rateMap = new Map();
const RATE_LIMIT = 20;        // 每 IP 每窗口最大请求数
const RATE_WINDOW = 3600000;  // 1 小时窗口

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = rateMap.get(ip);
    if (!entry || now - entry.start > RATE_WINDOW) {
        rateMap.set(ip, { start: now, count: 1 });
        return true;
    }
    entry.count++;
    return entry.count <= RATE_LIMIT;
}

// 定期清理过期条目（防内存泄漏）
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateMap) {
        if (now - entry.start > RATE_WINDOW) rateMap.delete(ip);
    }
}, 600000); // 每 10 分钟清理一次

export default async function handler(req, res) {
    // CORS 预检
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // API 密钥检查
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    // IP 限流
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.headers['x-real-ip']
        || req.socket?.remoteAddress
        || 'unknown';

    if (!checkRateLimit(ip)) {
        return res.status(429).json({
            error: '请求过于频繁，请稍后再试',
            retryAfter: RATE_WINDOW / 1000
        });
    }

    // 验证请求体
    const { messages, model, temperature, max_tokens, stream } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Invalid messages' });
    }

    // 限制参数范围（防滥用）
    const safeModel = ['qwen-turbo', 'qwen-plus', 'qwen-max'].includes(model) ? model : 'qwen-turbo';
    const safeMaxTokens = Math.min(Math.max(parseInt(max_tokens) || 1024, 64), 4096);
    const safeTemp = Math.min(Math.max(parseFloat(temperature) || 0.8, 0), 1.5);

    try {
        const apiRes = await fetch(DASHSCOPE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: safeModel,
                messages,
                temperature: safeTemp,
                max_tokens: safeMaxTokens,
                stream: !!stream
            })
        });

        if (!apiRes.ok) {
            const errText = await apiRes.text().catch(() => '');
            return res.status(apiRes.status).json({
                error: `Upstream API error: ${apiRes.status}`,
                detail: errText.slice(0, 200)
            });
        }

        // 流式响应：透传 SSE
        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const reader = apiRes.body.getReader();
            const decoder = new TextDecoder();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    res.write(decoder.decode(value, { stream: true }));
                }
            } catch {
                // Client disconnected
            } finally {
                res.end();
            }
            return;
        }

        // 非流式响应
        const data = await apiRes.json();
        return res.status(200).json(data);

    } catch (err) {
        return res.status(502).json({ error: 'Failed to reach AI service', detail: err.message });
    }
}
