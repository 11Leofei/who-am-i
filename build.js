#!/usr/bin/env node
// 构建脚本：压缩 JS/CSS → dist/
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

const SRC = __dirname;
const DIST = path.join(__dirname, 'dist');

// 要复制的静态文件/目录
const COPY_ITEMS = [
    'index.html',
    'manifest.json',
    'sw.js',
    'assets',
];

// JS 文件列表
const JS_FILES = [
    'js/app.js',
    'js/ai.js',
    'js/analytics.js',
    'js/audio.js',
    'js/bazi.js',
    'js/iching.js',
    'js/personality.js',
    'js/stars.js',
];

// CSS 文件
const CSS_FILES = [
    'styles/main.css',
];

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        ensureDir(dest);
        for (const item of fs.readdirSync(src)) {
            copyRecursive(path.join(src, item), path.join(dest, item));
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}

async function build() {
    const startTime = Date.now();
    console.log('🔨 Building stardust-identity...\n');

    // Clean dist
    if (fs.existsSync(DIST)) {
        fs.rmSync(DIST, { recursive: true });
    }
    ensureDir(DIST);

    // Copy static files
    for (const item of COPY_ITEMS) {
        const src = path.join(SRC, item);
        const dest = path.join(DIST, item);
        if (fs.existsSync(src)) {
            copyRecursive(src, dest);
            console.log(`  📋 ${item}`);
        }
    }

    // Minify JS
    ensureDir(path.join(DIST, 'js'));
    let totalJsOrig = 0, totalJsMin = 0;

    for (const file of JS_FILES) {
        const src = path.join(SRC, file);
        const dest = path.join(DIST, file);
        const code = fs.readFileSync(src, 'utf8');
        totalJsOrig += code.length;

        const result = await minify(code, {
            compress: { drop_console: false, passes: 2 },
            mangle: { toplevel: false },
            format: { comments: false }
        });

        if (result.error) {
            console.error(`  ❌ ${file}: ${result.error}`);
            fs.writeFileSync(dest, code); // fallback to unminified
        } else {
            fs.writeFileSync(dest, result.code);
            totalJsMin += result.code.length;
            const pct = ((1 - result.code.length / code.length) * 100).toFixed(1);
            console.log(`  ✅ ${file}: ${(code.length/1024).toFixed(1)}KB → ${(result.code.length/1024).toFixed(1)}KB (-${pct}%)`);
        }
    }

    // Minify CSS
    ensureDir(path.join(DIST, 'styles'));
    let totalCssOrig = 0, totalCssMin = 0;

    for (const file of CSS_FILES) {
        const src = path.join(SRC, file);
        const dest = path.join(DIST, file);
        const code = fs.readFileSync(src, 'utf8');
        totalCssOrig += code.length;

        const result = new CleanCSS({ level: 2 }).minify(code);

        if (result.errors.length > 0) {
            console.error(`  ❌ ${file}: ${result.errors.join(', ')}`);
            fs.writeFileSync(dest, code);
        } else {
            fs.writeFileSync(dest, result.styles);
            totalCssMin += result.styles.length;
            const pct = ((1 - result.styles.length / code.length) * 100).toFixed(1);
            console.log(`  ✅ ${file}: ${(code.length/1024).toFixed(1)}KB → ${(result.styles.length/1024).toFixed(1)}KB (-${pct}%)`);
        }
    }

    // Also minify sw.js in dist
    const swSrc = path.join(DIST, 'sw.js');
    if (fs.existsSync(swSrc)) {
        const swCode = fs.readFileSync(swSrc, 'utf8');
        const swResult = await minify(swCode, { compress: { passes: 1 }, mangle: true });
        if (!swResult.error) {
            fs.writeFileSync(swSrc, swResult.code);
        }
    }

    const totalOrig = totalJsOrig + totalCssOrig;
    const totalMin = totalJsMin + totalCssMin;
    const elapsed = Date.now() - startTime;

    console.log(`\n📊 Total: ${(totalOrig/1024).toFixed(0)}KB → ${(totalMin/1024).toFixed(0)}KB (-${((1-totalMin/totalOrig)*100).toFixed(1)}%)`);
    console.log(`⏱  Done in ${elapsed}ms`);
    console.log(`📁 Output: ${DIST}`);
}

build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
