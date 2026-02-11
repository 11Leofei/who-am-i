// 星尘·身份 — 数据分析 + 错误监控
// Umami 事件追踪 + Sentry 异常捕获

const StardustAnalytics = {
    // ==================== Umami 事件追踪 ====================
    // 文档: https://umami.is/docs/tracker-functions

    track(eventName, data) {
        // Umami 全局函数（由 script 标签注入）
        if (typeof umami !== 'undefined') {
            try {
                umami.track(eventName, data || {});
            } catch { /* 静默失败 */ }
        }
    },

    // 预定义事件
    testStarted(mode) {
        this.track('test_started', { mode }); // quick / deep
    },

    testCompleted(mode, mbtiType, ennType) {
        this.track('test_completed', { mode, mbti: mbtiType, enneagram: ennType });
    },

    aiInsightRequested() {
        this.track('ai_insight_requested');
    },

    aiInsightCompleted() {
        this.track('ai_insight_completed');
    },

    aiChatSent() {
        this.track('ai_chat_sent');
    },

    shareTextCopied(mbtiType) {
        this.track('share_text_copied', { mbti: mbtiType });
    },

    shareCardSaved(type) {
        this.track('share_card_saved', { type }); // personality / identity / dual / wallpaper
    },

    dualModeStarted() {
        this.track('dual_mode_started');
    },

    remoteModeStarted() {
        this.track('remote_mode_started');
    },

    archiveViewed() {
        this.track('archive_viewed');
    },

    ratingSubmitted(stars) {
        this.track('rating_submitted', { stars });
    },

    // ==================== Sentry 错误监控 ====================

    captureError(error, context) {
        // Sentry 全局函数（由 SDK 注入）
        if (typeof Sentry !== 'undefined') {
            try {
                Sentry.captureException(error, {
                    extra: context || {}
                });
            } catch { /* 静默失败 */ }
        }
        // 同时保留控制台输出用于调试
        console.error('[StardustError]', error, context);
    },

    captureMessage(msg, level) {
        if (typeof Sentry !== 'undefined') {
            try {
                Sentry.captureMessage(msg, level || 'info');
            } catch { /* 静默失败 */ }
        }
    }
};
