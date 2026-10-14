let generatedPages = [];
let inputs = {};
let uploadedImageData = null; // 存储上传的图片数据
let coverImageData = null; // 存储封面插图数据
let imageStore = {}; // 存储图片引用，key为图片ID，value为Base64数据
let imageCounter = 0; // 图片计数器，用于生成唯一ID
let updatePreviewTimer = null; // 防抖计时器
let currentPageIndex = 0; // 当前显示的页码索引

// ==================== 防抖函数 ====================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 创建防抖版本的更新预览函数（300ms 延迟）
const debouncedUpdatePreview = debounce(() => {
    updatePreview();
}, 300);

// ==================== 配置 Marked 和代码高亮 ====================
function initializeMarkedAndHighlight() {
    // 配置 marked 使用 highlight.js 进行代码高亮
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            highlight: function(code, lang) {
                if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (e) {
                        console.warn('代码高亮失败:', e);
                    }
                }
                // 如果没有指定语言或语言不支持，尝试自动检测
                if (typeof hljs !== 'undefined') {
                    try {
                        return hljs.highlightAuto(code).value;
                    } catch (e) {
                        console.warn('自动代码高亮失败:', e);
                    }
                }
                return code;
            },
            langPrefix: 'hljs language-',
            breaks: false,
            gfm: true
        });
    }
}

// ==================== 图片引用系统 ====================
// 生成新的图片ID
function generateImageId() {
    imageCounter++;
    return `img_${Date.now()}_${imageCounter}`;
}

// 存储图片并返回引用标记
function storeImageAndGetReference(imageData, altText) {
    const imageId = generateImageId();
    imageStore[imageId] = {
        data: imageData,
        alt: altText || '图片'
    };
    return `{{img:${imageId}}}`;
}

// 将图片引用替换为实际的 Markdown 图片语法
function replaceImageReferences(text) {
    return text.replace(/\{\{img:([^}]+)\}\}/g, (match, imageId) => {
        const imageInfo = imageStore[imageId];
        if (imageInfo) {
            return `![${imageInfo.alt}](${imageInfo.data})`;
        }
        return match; // 如果找不到图片，保持原样
    });
}

// ==================== 保护公式不被 Markdown 解析破坏 ====================
function protectMathFormulas(text) {
    const mathPlaceholders = [];
    let placeholderIndex = 0;
    
    // 保护块级公式 $$...$$
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
        const placeholder = `%%MATH_BLOCK_${placeholderIndex}%%`;
        mathPlaceholders.push({ placeholder, content: `$$${formula}$$`, isBlock: true });
        placeholderIndex++;
        return placeholder;
    });
    
    // 保护行内公式 $...$（但不匹配 $$）
    text = text.replace(/(?<!\$)\$(?!\$)((?:[^$\\]|\\.)+?)\$(?!\$)/g, (match, formula) => {
        const placeholder = `%%MATH_INLINE_${placeholderIndex}%%`;
        mathPlaceholders.push({ placeholder, content: `$${formula}$`, isBlock: false });
        placeholderIndex++;
        return placeholder;
    });
    
    return { text, mathPlaceholders };
}

// ==================== 恢复公式 ====================
function restoreMathFormulas(html, mathPlaceholders) {
    mathPlaceholders.forEach(item => {
        // 对于块级公式，确保它独立成段
        if (item.isBlock) {
            html = html.replace(
                new RegExp(`<p>\\s*${item.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*</p>`, 'g'),
                `<div class="math-block">${item.content}</div>`
            );
            html = html.replace(
                new RegExp(item.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                item.content
            );
        } else {
            html = html.replace(
                new RegExp(item.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                `<span class="math-inline">${item.content}</span>`
            );
        }
    });
    return html;
}

// ==================== 解析 Markdown 并保护公式 ====================
function parseMarkdownWithMath(content) {
    // 0. 先替换图片引用为实际 Markdown 图片语法
    let processedContent = replaceImageReferences(content);
    
    // 1. 保护公式
    const { text: protectedText, mathPlaceholders } = protectMathFormulas(processedContent);
    
    // 2. 使用 marked 解析
    let html = marked.parse(protectedText);
    
    // 3. 恢复公式
    html = restoreMathFormulas(html, mathPlaceholders);
    
    return html;
}

// ==================== 渲染数学公式 ====================
function renderMathFormulas(element) {
    // 检查 KaTeX auto-render 是否可用
    if (typeof window.renderMathInElement === 'function' && typeof katex !== 'undefined') {
        try {
            // 使用 KaTeX auto-render
            window.renderMathInElement(element, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\[', right: '\\]', display: true},
                    {left: '\\(', right: '\\)', display: false}
                ],
                throwOnError: false,
                errorColor: '#cc0000',
                strict: false,
                trust: true
            });
        } catch (e) {
            console.warn('KaTeX 渲染失败:', e);
        }
    } else {
        console.warn('KaTeX auto-render 不可用');
    }
}

// ==================== 处理代码块语言标签 ====================
function processCodeBlocks(element) {
    const codeBlocks = element.querySelectorAll('pre code');
    codeBlocks.forEach(codeBlock => {
        const pre = codeBlock.parentElement;
        
        // 获取语言类名
        const classList = codeBlock.className.split(' ');
        let language = '';
        
        for (const cls of classList) {
            if (cls.startsWith('language-') || cls.startsWith('hljs-language-')) {
                language = cls.replace('language-', '').replace('hljs-', '');
                break;
            }
        }
        
        // 语言名称映射（显示更友好的名称）
        const languageNames = {
            'js': 'JavaScript',
            'javascript': 'JavaScript',
            'ts': 'TypeScript',
            'typescript': 'TypeScript',
            'py': 'Python',
            'python': 'Python',
            'java': 'Java',
            'cpp': 'C++',
            'c': 'C',
            'cs': 'C#',
            'csharp': 'C#',
            'css': 'CSS',
            'html': 'HTML',
            'xml': 'XML',
            'sql': 'SQL',
            'bash': 'Bash',
            'shell': 'Shell',
            'sh': 'Shell',
            'json': 'JSON',
            'r': 'R',
            'latex': 'LaTeX',
            'tex': 'LaTeX',
            'go': 'Go',
            'rust': 'Rust',
            'ruby': 'Ruby',
            'php': 'PHP',
            'swift': 'Swift',
            'kotlin': 'Kotlin',
            'scala': 'Scala',
            'matlab': 'MATLAB'
        };
        
        const displayName = languageNames[language.toLowerCase()] || language.toUpperCase() || 'CODE';
        pre.setAttribute('data-language', displayName);
        
        // 如果 highlight.js 可用但还没高亮，尝试高亮
        if (typeof hljs !== 'undefined' && !codeBlock.classList.contains('hljs')) {
            hljs.highlightElement(codeBlock);
        }
    });
}

// ==================== 后处理渲染内容（公式+代码高亮）====================
function postProcessContent(element) {
    // 1. 处理代码块语言标签和语法高亮
    processCodeBlocks(element);
    
    // 2. 渲染数学公式
    renderMathFormulas(element);
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('应用初始化开始...');
    
    // 初始化 Marked 和代码高亮配置
    initializeMarkedAndHighlight();
    
    // 获取DOM元素
    inputs = {
        category: document.getElementById('input-category'),
        difficulty: document.getElementById('input-difficulty'),
        customName: document.getElementById('input-custom-name'),
        title: document.getElementById('input-title'),
        titleFontSize: document.getElementById('input-title-font-size'),
        subtitle: document.getElementById('input-subtitle'),
        subtitleFontSize: document.getElementById('input-subtitle-font-size'),
        author: document.getElementById('input-author'),
        summary: document.getElementById('input-summary'),
        introduction: document.getElementById('input-introduction'),
        content: document.getElementById('input-content'),
        contentMode: document.getElementById('input-content-mode'),
        references: document.getElementById('input-references'),
        coverImagePosition: document.getElementById('cover-image-position'),
        fontSize: document.getElementById('input-font-size'),
    };
    
    // 监听栏目选择变化，显示/隐藏自定义名称输入框
    inputs.category.addEventListener('change', () => {
        const customNameGroup = document.getElementById('custom-name-group');
        const isCustom = inputs.category.value.startsWith('custom');
        customNameGroup.style.display = isCustom ? 'block' : 'none';
        updatePreview();
    });
    
    // 监听封面图片位置变化
    inputs.coverImagePosition.addEventListener('change', updatePreview);
    
    // 监听字号变化
    inputs.fontSize.addEventListener('change', updatePreview);
    
    // 监听主标题字号变化
    inputs.titleFontSize.addEventListener('change', updatePreview);
    
    // 监听副标题字号变化
    inputs.subtitleFontSize.addEventListener('change', updatePreview);
    
    // 监听排版模式变化
    inputs.contentMode.addEventListener('change', () => {
        const mode = inputs.contentMode.value;
        const hintLabel = document.getElementById('content-mode-hint');
        const htmlTips = document.getElementById('html-mode-tips');
        const articleTips = document.getElementById('article-mode-tips');
        const markdownTips = document.getElementById('markdown-mode-tips');
        
        // 隐藏所有提示
        if (htmlTips) htmlTips.style.display = 'none';
        if (articleTips) articleTips.style.display = 'none';
        if (markdownTips) markdownTips.style.display = 'none';
        
        const currentContent = inputs.content.value.trim();
        
        if (mode === 'html') {
            hintLabel.textContent = '直接输入 HTML 代码，使用 <section> 标签分页';
            if (htmlTips) htmlTips.style.display = 'block';
            // 如果当前内容是默认Markdown内容或为空，填充HTML示例
            if (currentContent.startsWith('### 1. 大教堂模式') || currentContent.startsWith('# ') || currentContent === '') {
                inputs.content.value = getHtmlTemplateExample();
            }
        } else if (mode === 'article') {
            hintLabel.textContent = '支持 Markdown 语法，使用 # ## ### 创建层级标题（连续排版，自动分页）';
            if (articleTips) articleTips.style.display = 'block';
            // 如果当前内容是默认Markdown或HTML内容，切换到长文示例
            if (currentContent.startsWith('### 1. 大教堂模式') || currentContent.startsWith('<section>') || currentContent === '') {
                inputs.content.value = getArticleTemplateExample();
            }
        } else {
            hintLabel.textContent = '支持 Markdown 语法，使用 ### 创建小标题（每个小标题自动分页）';
            if (markdownTips) markdownTips.style.display = 'block';
            // 如果当前是HTML或长文示例内容，切换回Markdown示例
            if (currentContent.startsWith('<section>') || currentContent.startsWith('# ')) {
                inputs.content.value = getMarkdownTemplateExample();
            }
        }
        updatePreview();
    });
    
    const previewContainer = document.getElementById('preview-container');
    const downloadBtn = document.getElementById('download-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    
    // 监听输入变化（文本输入使用防抖，下拉选择立即更新）
    Object.values(inputs).forEach(input => {
        if (input.tagName === 'SELECT') {
            // 下拉选择立即更新
            input.addEventListener('change', updatePreview);
        } else {
            // 文本输入使用防抖，减少频繁刷新
            input.addEventListener('input', debouncedUpdatePreview);
        }
    });
    
    // 下载按钮
    downloadBtn.addEventListener('click', downloadAsZip);
    downloadPdfBtn.addEventListener('click', downloadAsPdf);
    
    // 图片上传和插入功能
    const imageUpload = document.getElementById('image-upload');
    const imageUrl = document.getElementById('image-url');
    const imageAlt = document.getElementById('image-alt');
    const insertImageBtn = document.getElementById('insert-image-btn');
    
    // 监听图片上传
    imageUpload.addEventListener('change', handleImageUpload);
    
    // 监听插入按钮
    insertImageBtn.addEventListener('click', insertImageToContent);
    
    // 封面插图功能
    const coverImageUpload = document.getElementById('cover-image-upload');
    const coverImageUrl = document.getElementById('cover-image-url');
    
    // 监听封面图片上传
    coverImageUpload.addEventListener('change', handleCoverImageUpload);
    
    // 监听封面图片URL变化（使用防抖）
    coverImageUrl.addEventListener('input', () => {
        coverImageData = null; // 清空上传的图片
        debouncedUpdatePreview();
    });
    
    // ========== Ribbon选项卡切换逻辑 ==========
    initRibbonTabs();
    
    // 分页导航按钮事件
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', goToPrevPage);
    }
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', goToNextPage);
    }
    
    // 键盘快捷键支持（左右方向键翻页）
    document.addEventListener('keydown', (e) => {
        // 如果焦点在输入框中，不处理
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }
        if (e.key === 'ArrowLeft') {
            goToPrevPage();
        } else if (e.key === 'ArrowRight') {
            goToNextPage();
        }
    });
    
    // 窗口大小改变时重新计算缩放
    window.addEventListener('resize', debounce(() => {
        applyAutoScale();
    }, 150));
    
    // 初始化预览
    updatePreview();
    
    console.log('应用初始化完成');
});

// ==================== Ribbon选项卡初始化 ====================
function initRibbonTabs() {
    const tabs = document.querySelectorAll('.ribbon-tab');
    const panels = document.querySelectorAll('.tab-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // 移除所有活动状态
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            // 设置当前选项卡为活动状态
            tab.classList.add('active');
            const targetPanel = document.getElementById(`tab-${targetTab}`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// ==================== 更新预览 ====================
function updatePreview() {
    console.log('开始更新预览...');
    const previewContainer = document.getElementById('preview-container');
    
    // 保存当前页码索引
    const previousPageIndex = currentPageIndex;
    
    previewContainer.innerHTML = '';
    generatedPages = [];
    
    try {
            // 1. 创建封面页
            const coverPage = createCoverPage();
            previewContainer.appendChild(coverPage);
            generatedPages.push(coverPage);
            console.log('封面页创建完成');

            // 2. 创建导言页（如果有内容）
            const introText = inputs.introduction.value.trim();
            if (introText) {
                const introPage = createIntroductionPage();
                previewContainer.appendChild(introPage);
                generatedPages.push(introPage);
                console.log('导言页创建完成');
            }

            // 3. 解析Markdown，按小标题分组
            const rawContent = inputs.content.value;
            const sections = parseContentBySections(rawContent);
            console.log('解析到的sections:', sections);
        
        // 3. 为每个section创建页面
        sections.forEach((section, index) => {
            console.log(`处理section ${index + 1}:`, section.title);
            const pages = createPagesForSection(section);
            console.log(`Section ${index + 1} 创建了 ${pages.length} 页`);
            pages.forEach(page => {
                previewContainer.appendChild(page);
                generatedPages.push(page);
            });
        });
        
        // 4. 创建参考资料页（如果有内容）
        const referencesText = inputs.references.value.trim();
        if (referencesText) {
            const refPage = createReferencePage();
            previewContainer.appendChild(refPage);
            generatedPages.push(refPage);
            console.log('参考资料页创建完成');
        }
        
        // 5. 更新页码
        updatePageNumbers();
        console.log(`总共生成了 ${generatedPages.length} 页`);
        
        // 6. 恢复到之前查看的页面位置，并更新分页导航
        requestAnimationFrame(() => {
            // 确保索引在有效范围内
            currentPageIndex = Math.min(previousPageIndex, generatedPages.length - 1);
            currentPageIndex = Math.max(0, currentPageIndex);
            // 显示当前页并更新分页导航
            showPage(currentPageIndex);
        });
    } catch (error) {
        console.error('预览更新出错:', error);
        previewContainer.innerHTML = `<div style="color: red; padding: 20px;">生成预览时出错: ${error.message}</div>`;
    }
}

// ==================== 分页导航函数 ====================
function showPage(index) {
    if (generatedPages.length === 0) return;
    
    // 确保索引在有效范围内
    index = Math.max(0, Math.min(index, generatedPages.length - 1));
    currentPageIndex = index;
    
    // 隐藏所有页面，只显示当前页
    generatedPages.forEach((page, i) => {
        if (i === index) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });
    
    // 自适应缩放
    applyAutoScale();
    
    // 更新分页导航UI
    updatePaginationUI();
}

function applyAutoScale() {
    const previewContainer = document.getElementById('preview-container');
    if (!previewContainer || generatedPages.length === 0) return;
    
    previewContainer.classList.add('auto-scale');
    
    // 获取容器可用空间
    const containerRect = previewContainer.getBoundingClientRect();
    const availableHeight = containerRect.height - 20; // 留一点边距
    const availableWidth = containerRect.width - 20;
    
    // 获取海报原始尺寸
    const posterWidth = 540; // 固定宽度
    const posterHeight = getComputedPosterHeight();
    
    // 计算缩放比例（取宽高中较小的缩放比）
    const scaleX = availableWidth / posterWidth;
    const scaleY = availableHeight / posterHeight;
    const scale = Math.min(scaleX, scaleY, 1); // 不放大，最大100%
    
    // 应用缩放到当前活动页面
    generatedPages.forEach((page, i) => {
        if (i === currentPageIndex) {
            page.style.transform = `scale(${scale})`;
        } else {
            page.style.transform = '';
        }
    });
}

function updatePaginationUI() {
    const totalPages = generatedPages.length;
    const currentPage = currentPageIndex + 1;
    
    // 更新页码信息
    const paginationInfo = document.getElementById('pagination-info');
    if (paginationInfo) {
        paginationInfo.textContent = `${currentPage} / ${totalPages}`;
    }
    
    // 更新按钮状态
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    if (prevBtn) {
        prevBtn.disabled = currentPageIndex === 0;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPageIndex >= totalPages - 1;
    }
    
    // 更新页码指示点
    const dotsContainer = document.getElementById('pagination-dots');
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        
        // 如果页数太多，只显示部分点
        const maxDots = 7;
        let startDot = 0;
        let endDot = totalPages;
        
        if (totalPages > maxDots) {
            // 计算显示哪些点
            const halfRange = Math.floor(maxDots / 2);
            startDot = Math.max(0, currentPageIndex - halfRange);
            endDot = Math.min(totalPages, startDot + maxDots);
            if (endDot - startDot < maxDots) {
                startDot = Math.max(0, endDot - maxDots);
            }
        }
        
        for (let i = startDot; i < endDot; i++) {
            const dot = document.createElement('div');
            dot.className = 'pagination-dot' + (i === currentPageIndex ? ' active' : '');
            dot.addEventListener('click', () => showPage(i));
            dot.title = `第 ${i + 1} 页`;
            dotsContainer.appendChild(dot);
        }
    }
}

function goToPrevPage() {
    if (currentPageIndex > 0) {
        showPage(currentPageIndex - 1);
    }
}

function goToNextPage() {
    if (currentPageIndex < generatedPages.length - 1) {
        showPage(currentPageIndex + 1);
    }
}

// ==================== 解析内容为sections ====================
function parseContentBySections(content) {
    const contentMode = inputs.contentMode.value;
    
    // HTML模式：使用 <section> 标签分页
    if (contentMode === 'html') {
        return parseHtmlContentBySections(content);
    }
    
    // 长文模式：返回整体内容，由 createArticlePages 处理分页
    if (contentMode === 'article') {
        return parseArticleContent(content);
    }
    
    // Markdown模式：使用 ### 分页（现有逻辑）
    const lines = content.split('\n');
    const sections = [];
    let currentSection = { title: '', content: [], isHtml: false };
    
    lines.forEach(line => {
        if (line.trim().startsWith('###')) {
            // 遇到新的小标题，保存上一个section
            if (currentSection.title || currentSection.content.length > 0) {
                sections.push(currentSection);
            }
            // 开始新section
            currentSection = {
                title: line.replace(/^###\s*/, '').trim(),
                content: [],
                isHtml: false
            };
        } else {
            currentSection.content.push(line);
        }
    });
    
    // 添加最后一个section
    if (currentSection.title || currentSection.content.length > 0) {
        sections.push(currentSection);
    }
    
    return sections;
}

// ==================== 解析长文模式内容 ====================
function parseArticleContent(content) {
    // 长文模式使用手动分页标记
    // --- 或 <!-- 分页 --> 表示接续分页（下一页不缩进）
    // === 或 <!-- 新段落分页 --> 表示新段落分页（下一页缩进）
    
    const sections = [];
    
    // 使用正则表达式按分页标记拆分
    // 分页标记：^---$, ^===$, <!-- 分页 -->, <!-- 新段落分页 -->
    const pageBreakPattern = /^(---|===|<!--\s*分页\s*-->|<!--\s*新段落分页\s*-->)\s*$/gm;
    
    let lastIndex = 0;
    let match;
    let isFirstSection = true;
    
    // 找到所有分页标记
    const matches = [...content.matchAll(pageBreakPattern)];
    
    if (matches.length === 0) {
        // 没有分页标记，整个内容作为一页
        sections.push({
            title: '',
            content: [content],
            isHtml: false,
            isArticle: true,
            continueFromPrevious: false
        });
    } else {
        for (const match of matches) {
            const breakerType = match[1].trim();
            const sectionContent = content.substring(lastIndex, match.index).trim();
            
            if (sectionContent || isFirstSection) {
                sections.push({
                    title: '',
                    content: [sectionContent],
                    isHtml: false,
                    isArticle: true,
                    continueFromPrevious: !isFirstSection && (breakerType === '---' || breakerType === '<!-- 分页 -->')
                });
            }
            
            lastIndex = match.index + match[0].length;
            isFirstSection = false;
        }
        
        // 处理最后一个分页标记后的内容
        const lastContent = content.substring(lastIndex).trim();
        if (lastContent) {
            const lastMatch = matches[matches.length - 1];
            const lastBreakerType = lastMatch[1].trim();
            sections.push({
                title: '',
                content: [lastContent],
                isHtml: false,
                isArticle: true,
                continueFromPrevious: lastBreakerType === '---' || lastBreakerType === '<!-- 分页 -->'
            });
        }
    }
    
    return sections;
}

// ==================== 解析HTML内容为sections ====================
function parseHtmlContentBySections(content) {
    const sections = [];
    
    // 创建临时容器解析HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // 查找所有 <section> 标签
    const sectionElements = tempDiv.querySelectorAll('section');
    
    if (sectionElements.length > 0) {
        // 如果有 <section> 标签，每个 section 是一页
        sectionElements.forEach(sectionEl => {
            // 尝试从 section 中提取标题
            const titleEl = sectionEl.querySelector('h1, h2, h3');
            let title = '';
            if (titleEl) {
                title = titleEl.textContent.trim();
                // 不移除标题元素，让用户自己控制布局
            }
            
            sections.push({
                title: '', // HTML模式下标题由用户自己控制
                content: [sectionEl.innerHTML],
                isHtml: true
            });
        });
    } else {
        // 如果没有 <section> 标签，整个内容作为一页
        if (content.trim()) {
            sections.push({
                title: '',
                content: [content],
                isHtml: true
            });
        }
    }
    
    return sections;
}

// ==================== 为section创建页面 ====================
function createPagesForSection(section) {
    const pages = [];
    
    // 获取内容
    const sectionContent = section.content.join('\n').trim();
    if (!sectionContent && !section.title) {
        return pages;
    }
    
    // 长文模式：使用手动分页逻辑
    if (section.isArticle) {
        return createArticlePage(sectionContent, section.continueFromPrevious);
    }
    
    // HTML模式：不自动分页
    if (section.isHtml) {
        const page = createNewContentPage();
        const pageTextContainer = page.querySelector('.poster-text');
        pageTextContainer.innerHTML = sectionContent;
        pageTextContainer.classList.add('html-mode');
        postProcessContent(pageTextContainer);
        pages.push(page);
        return pages;
    }
    
    // Markdown模式：支持内容溢出时自动分页和段落拆分
    return createMarkdownPagesForSection(section);
}

// ==================== Markdown模式：为section创建页面（支持自动分页）====================
function createMarkdownPagesForSection(section) {
    const pages = [];
    const category = inputs.category.value;
    const fontSize = inputs.fontSize.value;
    const sectionContent = section.content.join('\n').trim();
    
    // 解析Markdown内容
    const contentHTML = sectionContent ? parseMarkdownWithMath(sectionContent) : '';
    
    // 创建临时容器提取元素
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = contentHTML;
    const contentElements = Array.from(tempContainer.children);
    
    // 构建元素队列：标题 + 内容元素
    let elementQueue = [];
    
    if (section.title) {
        const titleElement = document.createElement('h2');
        titleElement.className = 'poster-section-title';
        titleElement.textContent = section.title;
        elementQueue.push(titleElement);
    }
    
    elementQueue = elementQueue.concat(contentElements);
    
    if (elementQueue.length === 0) {
        return pages;
    }
    
    // 计算可用高度
    const posterHeight = getComputedPosterHeight();
    const availableHeight = posterHeight - 115; // 留空间给padding和footer
    
    const previewContainer = document.getElementById('preview-container');
    
    // 辅助函数
    function preparePageForMeasurement(page, container) {
        container.style.maxHeight = 'none';
        container.style.overflow = 'visible';
        page.style.visibility = 'hidden';
        page.style.position = 'absolute';
        if (!page.parentNode) {
            previewContainer.appendChild(page);
        }
    }
    
    function finalizePage(page, container) {
        if (page.parentNode) {
            previewContainer.removeChild(page);
        }
        page.style.visibility = '';
        page.style.position = '';
        container.style.maxHeight = '';
        container.style.overflow = '';
    }
    
    function isSplittable(element) {
        const tag = element.tagName.toLowerCase();
        return tag === 'p' || tag === 'li';
    }
    
    function splitParagraph(element, container, availHeight) {
        const fullText = element.innerHTML;
        const tag = element.tagName.toLowerCase();
        
        const heightBefore = container.offsetHeight;
        const remainingHeight = availHeight - heightBefore;
        
        if (remainingHeight < 30) {
            return null;
        }
        
        const testElement = document.createElement(tag);
        testElement.className = element.className;
        testElement.style.cssText = element.style.cssText;
        container.appendChild(testElement);
        
        let low = 0;
        let high = fullText.length;
        let bestSplit = 0;
        
        while (low < high) {
            const mid = Math.floor((low + high + 1) / 2);
            let splitPoint = mid;
            
            const breakChars = ['。', '，', '；', '、', '！', '？', '.', ',', ';', '!', '?', ' ', '　'];
            for (let i = mid; i > Math.max(0, mid - 20); i--) {
                if (breakChars.includes(fullText[i])) {
                    splitPoint = i + 1;
                    break;
                }
            }
            
            testElement.innerHTML = fullText.substring(0, splitPoint);
            void container.offsetHeight;
            
            if (container.offsetHeight <= availHeight) {
                bestSplit = splitPoint;
                low = mid;
            } else {
                high = mid - 1;
            }
        }
        
        container.removeChild(testElement);
        
        if (bestSplit < 10) {
            return null;
        }
        
        let finalSplit = bestSplit;
        const breakChars = ['。', '，', '；', '、', '！', '？', '.', ',', ';', '!', '?', ' ', '　'];
        for (let i = bestSplit; i > Math.max(0, bestSplit - 30); i--) {
            if (breakChars.includes(fullText[i])) {
                finalSplit = i + 1;
                break;
            }
        }
        
        const firstPart = document.createElement(tag);
        firstPart.className = element.className;
        firstPart.innerHTML = fullText.substring(0, finalSplit);
        
        const secondPart = document.createElement(tag);
        secondPart.className = element.className;
        secondPart.innerHTML = fullText.substring(finalSplit);
        
        return { firstPart, secondPart };
    }
    
    // 创建第一页
    let currentPage = createNewContentPage();
    let currentTextContainer = currentPage.querySelector('.poster-text');
    currentTextContainer.style.fontSize = `${fontSize}px`;
    preparePageForMeasurement(currentPage, currentTextContainer);
    
    // 处理元素队列
    while (elementQueue.length > 0) {
        const element = elementQueue.shift();
        const clonedElement = element.cloneNode(true);
        currentTextContainer.appendChild(clonedElement);
        postProcessContent(clonedElement);
        
        void currentTextContainer.offsetHeight;
        const contentHeight = currentTextContainer.offsetHeight;
        
        if (contentHeight > availableHeight) {
            currentTextContainer.removeChild(clonedElement);
            
            if (currentTextContainer.children.length > 0 && isSplittable(element)) {
                const splitResult = splitParagraph(element, currentTextContainer, availableHeight);
                
                if (splitResult) {
                    currentTextContainer.appendChild(splitResult.firstPart);
                    postProcessContent(splitResult.firstPart);
                    elementQueue.unshift(splitResult.secondPart);
                } else {
                    elementQueue.unshift(element);
                }
            } else if (currentTextContainer.children.length === 0) {
                currentTextContainer.appendChild(clonedElement);
                console.warn('Markdown模式：元素本身超出页面高度，强制添加');
            } else {
                elementQueue.unshift(element);
            }
            
            finalizePage(currentPage, currentTextContainer);
            if (currentTextContainer.children.length > 0) {
                pages.push(currentPage);
            }
            
            currentPage = createNewContentPage();
            currentTextContainer = currentPage.querySelector('.poster-text');
            currentTextContainer.style.fontSize = `${fontSize}px`;
            preparePageForMeasurement(currentPage, currentTextContainer);
        }
    }
    
    finalizePage(currentPage, currentTextContainer);
    if (currentTextContainer.children.length > 0) {
        pages.push(currentPage);
    }
    
    return pages;
}

// ==================== 长文模式：创建单个文章页面（手动分页）====================
function createArticlePage(content, continueFromPrevious = false) {
    const pages = [];
    const category = inputs.category.value;
    const fontSize = inputs.fontSize.value;
    
    if (!content.trim()) {
        return pages;
    }
    
    // 使用带公式保护的解析
    const contentHTML = parseMarkdownWithMath(content);
    
    // 创建页面
    const page = createNewArticlePageElement(category, fontSize, continueFromPrevious);
    const textContainer = page.querySelector('.article-text');
    
    textContainer.innerHTML = contentHTML;
    
    // 后处理：渲染公式和代码高亮
    postProcessContent(textContainer);
    
    pages.push(page);
    console.log(`长文模式：创建了一页（${continueFromPrevious ? '接续' : '新段落'}）`);
    
    return pages;
}

// ==================== 创建长文模式页面 ====================
function createNewArticlePageElement(category, fontSize, continueFromPrevious = false) {
    const page = document.createElement('div');
    page.className = `poster-page poster-article-page theme-${category}`;
    
    // 添加接续分页或新段落分页的类
    if (continueFromPrevious) {
        page.classList.add('continue-page');
    } else {
        page.classList.add('new-paragraph-page');
    }
    
    const textDiv = document.createElement('div');
    textDiv.className = 'article-text';
    textDiv.style.fontSize = `${fontSize}px`;
    page.appendChild(textDiv);
    
    const footer = document.createElement('div');
    footer.className = 'page-footer';
    footer.innerHTML = `
        <div class="author-info">${escapeHtml(inputs.author.value)}</div>
        <div class="page-number"></div>
    `;
    page.appendChild(footer);
    
    return page;
}

// ==================== 获取元素的margin高度 ====================
function getMarginHeight(element) {
    const style = window.getComputedStyle(element);
    return parseInt(style.marginTop) + parseInt(style.marginBottom);
}

// ==================== 获取计算后的海报高度 ====================
function getComputedPosterHeight() {
    // 根据当前比例返回高度
    const aspectRatio = document.getElementById('input-aspect-ratio').value;
    switch(aspectRatio) {
        case '3-4': return 720;
        case '9-16': return 960;
        default: return 675; // 4-5
    }
}

// ==================== 创建封面页 ====================
function createCoverPage() {
    const page = document.createElement('div');
    const category = inputs.category.value;
    const difficulty = inputs.difficulty.value || 'intermediate';
    const categoryNames = {
        paper: '论文分享',
        theory: '理论分享',
        method: '方法学习',
        tool: '工具分享',
        thinking: '思考随笔',
        reading: '阅读笔记',
        custom1: '自定义1',
        custom2: '自定义2',
        custom3: '自定义3'
    };
    const difficultyLabels = {
        beginner: '阅读难度 · 入门',
        intermediate: '阅读难度 · 适中',
        advanced: '阅读难度 · 较难'
    };
    
    // 如果是自定义栏目且填写了名称，使用自定义名称
    let displayName = categoryNames[category] || '科研分享';
    if (category.startsWith('custom') && inputs.customName.value.trim()) {
        displayName = inputs.customName.value.trim();
    }
    
    // 获取主标题字号
    const titleFontSize = inputs.titleFontSize.value || '42';
    
    // 获取副标题字号
    const subtitleFontSize = inputs.subtitleFontSize.value || '19';
    
    // 副标题HTML（如果有的话）
    const subtitle = inputs.subtitle.value.trim();
    const subtitleHtml = subtitle ? `<div class="cover-subtitle" style="font-size: ${subtitleFontSize}px;">${escapeHtml(subtitle)}</div>` : '';
    
    // 获取封面插图
    const coverImageUrlInput = document.getElementById('cover-image-url');
    const coverImageSrc = coverImageData || coverImageUrlInput.value.trim();
    const coverImageHtml = coverImageSrc ? `<div class="cover-image"><img src="${coverImageSrc}" alt="封面插图"></div>` : '';
    
    // 计算字数和阅读时间
    const stats = calculateReadingStats();
    
    // 获取图片位置
    const imagePosition = inputs.coverImagePosition.value;
    
    // 如果有封面图片，添加特殊class
    const hasCoverImageClass = coverImageSrc ? ' has-cover-image' : '';
    const imagePositionClass = coverImageSrc ? ` image-${imagePosition}` : '';
    page.className = `poster-page poster-cover-page theme-${category}${hasCoverImageClass}${imagePositionClass}`;
    
    // 根据图片位置决定HTML结构
    if (imagePosition === 'top' && coverImageSrc) {
        page.innerHTML = `
            ${coverImageHtml}
            <div class="cover-content">
                <div class="cover-badges">
                    <div class="category-badge">${displayName}</div>
                    <div class="difficulty-badge">${difficultyLabels[difficulty] || difficultyLabels.intermediate}</div>
                </div>
                <div class="cover-title" style="font-size: ${titleFontSize}px;">${escapeHtml(inputs.title.value).replace(/\n/g, '<br>')}</div>
                ${subtitleHtml}
                <div class="cover-summary">${escapeHtml(inputs.summary.value).replace(/\n/g, '<br>')}</div>
                <div class="cover-meta-row">
                    <div class="cover-stats">全文约 ${stats.wordCount} 字 / 预计阅读 ${stats.readingTime} 分钟</div>
                    <div class="cover-author">${escapeHtml(inputs.author.value)}</div>
                </div>
            </div>
            <div class="page-footer">
                <div class="author-info">${escapeHtml(inputs.author.value)}</div>
                <div class="page-number"></div>
            </div>
        `;
    } else {
        page.innerHTML = `
            <div class="cover-content">
                <div class="cover-badges">
                    <div class="category-badge">${displayName}</div>
                    <div class="difficulty-badge">${difficultyLabels[difficulty] || difficultyLabels.intermediate}</div>
                </div>
                <div class="cover-title" style="font-size: ${titleFontSize}px;">${escapeHtml(inputs.title.value).replace(/\n/g, '<br>')}</div>
                ${subtitleHtml}
                <div class="cover-summary">${escapeHtml(inputs.summary.value).replace(/\n/g, '<br>')}</div>
                <div class="cover-meta-row">
                    <div class="cover-stats">全文约 ${stats.wordCount} 字 / 预计阅读 ${stats.readingTime} 分钟</div>
                    <div class="cover-author">${escapeHtml(inputs.author.value)}</div>
                </div>
            </div>
            ${coverImageHtml}
            <div class="page-footer">
                <div class="author-info">${escapeHtml(inputs.author.value)}</div>
                <div class="page-number"></div>
            </div>
        `;
    }
    
    return page;
}

// ==================== 创建导言页 ====================
function createIntroductionPage() {
    const page = document.createElement('div');
    const category = inputs.category.value;
    page.className = `poster-page poster-introduction-page theme-${category}`;
    
    const textDiv = document.createElement('div');
    textDiv.className = 'introduction-content';
    
    // 添加导言标题
    const titleElement = document.createElement('h2');
    titleElement.className = 'introduction-title';
    titleElement.textContent = '导言';
    textDiv.appendChild(titleElement);
    
    // 获取用户选择的字号
    const fontSize = inputs.fontSize.value;
    
    // 添加导言文本（支持公式和基本 Markdown）
    const introText = inputs.introduction.value.trim();
    // 使用 parseMarkdownWithMath 解析整个导言内容
    const introHTML = parseMarkdownWithMath(introText);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'introduction-text';
    contentDiv.style.fontSize = `${fontSize}px`;
    contentDiv.innerHTML = introHTML;
    textDiv.appendChild(contentDiv);
    
    page.appendChild(textDiv);
    
    // 后处理：渲染公式和代码高亮
    postProcessContent(contentDiv);
    
    const footer = document.createElement('div');
    footer.className = 'page-footer';
    footer.innerHTML = `
        <div class="author-info">${escapeHtml(inputs.author.value)}</div>
        <div class="page-number"></div>
    `;
    page.appendChild(footer);
    
    return page;
}

// ==================== 创建参考资料页 ====================
function createReferencePage() {
    const page = document.createElement('div');
    const category = inputs.category.value;
    page.className = `poster-page poster-reference-page theme-${category}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'reference-content';
    
    // 添加标题
    const titleElement = document.createElement('h2');
    titleElement.className = 'reference-title';
    titleElement.textContent = 'References';
    contentDiv.appendChild(titleElement);
    
    // 解析参考资料（每行一条）
    const referencesText = inputs.references.value.trim();
    const references = referencesText.split('\n').filter(ref => ref.trim());
    
    // 创建列表
    const listElement = document.createElement('ul');
    listElement.className = 'reference-list';
    
    references.forEach((reference, index) => {
        const itemElement = document.createElement('li');
        itemElement.className = 'reference-item';
        itemElement.innerHTML = `
            <div class="reference-number">${index + 1}</div>
            <div class="reference-text">${escapeHtml(reference.trim())}</div>
        `;
        listElement.appendChild(itemElement);
    });
    
    contentDiv.appendChild(listElement);
    page.appendChild(contentDiv);
    
    const footer = document.createElement('div');
    footer.className = 'page-footer';
    footer.innerHTML = `
        <div class="author-info">${escapeHtml(inputs.author.value)}</div>
        <div class="page-number"></div>
    `;
    page.appendChild(footer);
    
    return page;
}

// ==================== 创建内容页 ====================
function createNewContentPage() {
    const page = document.createElement('div');
    const category = inputs.category.value;
    page.className = `poster-page poster-content-page theme-${category}`;
    
    const textDiv = document.createElement('div');
    textDiv.className = 'poster-text';
    // 应用用户选择的字号
    const fontSize = inputs.fontSize.value;
    textDiv.style.fontSize = `${fontSize}px`;
    page.appendChild(textDiv);
    
    const footer = document.createElement('div');
    footer.className = 'page-footer';
    footer.innerHTML = `
        <div class="author-info">${escapeHtml(inputs.author.value)}</div>
        <div class="page-number"></div>
    `;
    page.appendChild(footer);
    
    return page;
}

// ==================== 更新页码 ====================
function updatePageNumbers() {
    // 识别不同类型的页面
    const coverPages = generatedPages.filter(page => page.classList.contains('poster-cover-page'));
    const introPages = generatedPages.filter(page => page.classList.contains('poster-introduction-page'));
    const contentPages = generatedPages.filter(page => page.classList.contains('poster-content-page'));
    const articlePages = generatedPages.filter(page => page.classList.contains('poster-article-page'));
    const referencePages = generatedPages.filter(page => page.classList.contains('poster-reference-page'));
    
    // 封面页不显示页码
    coverPages.forEach(page => {
        const pageNumElement = page.querySelector('.page-number');
        if (pageNumElement) {
            pageNumElement.textContent = '';
        }
    });
    
    // 导言页单独计算页码（罗马数字）
    if (introPages.length > 0) {
        introPages.forEach((page, index) => {
            const pageNumElement = page.querySelector('.page-number');
            if (pageNumElement) {
                const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
                const pageNum = romanNumerals[index] || `i${index + 1}`;
                pageNumElement.textContent = pageNum;
            }
        });
    }
    
    // 正文页从1开始计算
    if (contentPages.length > 0) {
        contentPages.forEach((page, index) => {
            const pageNumElement = page.querySelector('.page-number');
            if (pageNumElement) {
                pageNumElement.textContent = `${index + 1}/${contentPages.length}`;
            }
        });
    }
    
    // 长文模式页面从1开始计算
    if (articlePages.length > 0) {
        articlePages.forEach((page, index) => {
            const pageNumElement = page.querySelector('.page-number');
            if (pageNumElement) {
                pageNumElement.textContent = `${index + 1}/${articlePages.length}`;
            }
        });
    }
    
    // 参考文献页单独计算
    if (referencePages.length > 0) {
        referencePages.forEach((page, index) => {
            const pageNumElement = page.querySelector('.page-number');
            if (pageNumElement) {
                pageNumElement.textContent = `Ref. ${index + 1}/${referencePages.length}`;
            }
        });
    }
}

// ==================== HTML转义 ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== 将远程图片转换为Base64 ====================
async function convertImageToBase64(imgElement) {
    const src = imgElement.src;
    
    // 如果已经是Base64或本地图片，直接返回
    if (src.startsWith('data:') || src.startsWith('blob:')) {
        return src;
    }
    
    try {
        // 使用代理服务器或直接fetch（需要CORS支持）
        const response = await fetch(src);
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn('无法转换图片为Base64:', src, error);
        // 尝试使用canvas转换（需要CORS支持）
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                try {
                    resolve(canvas.toDataURL('image/png'));
                } catch (e) {
                    console.error('Canvas转换失败:', e);
                    resolve(src); // 失败时返回原始URL
                }
            };
            img.onerror = () => {
                console.error('图片加载失败:', src);
                resolve(src); // 失败时返回原始URL
            };
            img.src = src;
        });
    }
}

// ==================== 预处理页面图片 ====================
async function preprocessPageImages(pageElement) {
    const images = pageElement.querySelectorAll('img');
    const imageConversions = [];
    
    for (const img of images) {
        if (img.src && !img.src.startsWith('data:')) {
            imageConversions.push(
                convertImageToBase64(img).then(base64 => {
                    img.setAttribute('data-original-src', img.src);
                    img.src = base64;
                })
            );
        }
    }
    
    await Promise.all(imageConversions);
}

// ==================== 恢复页面图片URL ====================
function restorePageImages(pageElement) {
    const images = pageElement.querySelectorAll('img[data-original-src]');
    images.forEach(img => {
        img.src = img.getAttribute('data-original-src');
        img.removeAttribute('data-original-src');
    });
}

// ==================== 下载为ZIP ====================
async function downloadAsZip() {
    if (generatedPages.length === 0) {
        alert('没有可下载的内容，请先生成海报');
        return;
    }
    
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.disabled = true;
    downloadBtn.textContent = '准备生成...';
    
    try {
        const zip = new JSZip();
        
        // 生成每一页的图片
        for (let i = 0; i < generatedPages.length; i++) {
            downloadBtn.textContent = `正在生成 ${i + 1}/${generatedPages.length}...`;
            
            const pageElement = generatedPages[i];
            
            try {
                // 预处理：将所有远程图片转换为Base64
                await preprocessPageImages(pageElement);
                
                // 暂存原始样式
                const originalDisplay = pageElement.style.display;
                const originalBorderRadius = pageElement.style.borderRadius;
                const originalBoxShadow = pageElement.style.boxShadow;
                const originalTransform = pageElement.style.transform;
                const originalPosition = pageElement.style.position;
                
                // 临时强制显示页面（关键修复：非活动页面默认隐藏导致渲染空白）
                pageElement.style.display = 'flex';
                pageElement.style.position = 'absolute';
                pageElement.style.transform = 'none';
                pageElement.style.borderRadius = '0';
                pageElement.style.boxShadow = 'none';
                
                // 等待样式应用
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // 使用html2canvas渲染（使用更大的windowWidth避免触发小屏幕媒体查询）
                const canvas = await html2canvas(pageElement, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    width: 540,
                    height: 675,
                    windowWidth: 1200,
                    windowHeight: 1500,
                    x: 0,
                    y: 0
                });
                
                // 恢复原始样式和图片URL
                pageElement.style.display = originalDisplay;
                pageElement.style.position = originalPosition;
                pageElement.style.transform = originalTransform;
                pageElement.style.borderRadius = originalBorderRadius;
                pageElement.style.boxShadow = originalBoxShadow;
                restorePageImages(pageElement);
                
                console.log(`页面 ${i + 1} 渲染完成，尺寸: ${canvas.width}x${canvas.height}`);
                
                // 转换为blob并添加到zip
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
                zip.file(`poster_page_${String(i + 1).padStart(2, '0')}.png`, blob);
            } catch (error) {
                console.error('生成第', i + 1, '页时出错:', error);
                // 确保恢复页面样式和图片URL
                pageElement.style.display = '';
                pageElement.style.position = '';
                pageElement.style.transform = '';
                pageElement.style.borderRadius = '';
                pageElement.style.boxShadow = '';
                restorePageImages(pageElement);
                alert(`生成第 ${i + 1} 页时出错: ${error.message}`);
            }
            
            // 添加延迟，避免浏览器卡顿
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // 生成并下载ZIP文件
        downloadBtn.textContent = '📦 正在压缩...';
        const zipBlob = await zip.generateAsync({ type: "blob" });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        const timestamp = new Date().toISOString().split('T')[0];
        link.download = `科研学习分享_${timestamp}.zip`;
        link.click();
        
        URL.revokeObjectURL(link.href);
        
        downloadBtn.textContent = '✅ 下载完成！';
        setTimeout(() => {
            downloadBtn.textContent = '生成并下载海报 (ZIP)';
        }, 2000);
    } catch (error) {
        console.error('下载过程出错:', error);
        alert('下载过程出错: ' + error.message);
    } finally {
        downloadBtn.disabled = false;
    }
}

// ==================== 计算字数和阅读时间 ====================
function calculateReadingStats() {
    // 获取正文和导言内容
    const content = inputs.content.value || '';
    const introduction = inputs.introduction.value || '';
    const fullText = content + introduction;
    
    // 移除Markdown语法标记
    let plainText = fullText
        .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
        .replace(/\[.*?\]\(.*?\)/g, '') // 移除链接
        .replace(/#{1,6}\s/g, '') // 移除标题标记
        .replace(/[*_`]/g, '') // 移除粗体、斜体、代码标记
        .replace(/>/g, '') // 移除引用标记
        .replace(/[-*+]\s/g, ''); // 移除列表标记
    
    // 统计中文字符、英文单词和数字
    const chineseChars = plainText.match(/[\u4e00-\u9fa5]/g) || [];
    const englishWords = plainText.match(/[a-zA-Z]+/g) || [];
    const numbers = plainText.match(/\d+/g) || [];
    
    // 计算总字数（中文按字符，英文按单词）
    const wordCount = chineseChars.length + englishWords.length + numbers.length;
    
    // 估算阅读时间（中文500字/分钟，英文400词/分钟）
    const readingTimeMinutes = Math.ceil((chineseChars.length / 500) + (englishWords.length / 400));
    const readingTime = readingTimeMinutes < 1 ? 1 : readingTimeMinutes;
    
    return {
        wordCount: wordCount,
        readingTime: readingTime
    };
}

// ==================== 压缩图片 ====================
function compressImage(file, maxWidth = 1200, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                // 计算压缩后的尺寸
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                // 创建canvas进行压缩
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                
                // 如果是PNG，需要处理透明背景
                if (file.type === 'image/png') {
                    // PNG保留透明度
                    ctx.drawImage(img, 0, 0, width, height);
                } else {
                    // 其他格式填充白色背景
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                }
                
                // 根据原图格式选择输出格式
                let outputFormat = 'image/jpeg';
                let outputQuality = quality;
                
                // PNG图片如果压缩后反而更大，保持PNG格式
                if (file.type === 'image/png') {
                    const jpegData = canvas.toDataURL('image/jpeg', quality);
                    const pngData = canvas.toDataURL('image/png');
                    
                    // 如果PNG比JPEG小，或者相差不大，使用PNG保留质量
                    if (pngData.length < jpegData.length * 1.3) {
                        outputFormat = 'image/png';
                        outputQuality = 1.0;
                    }
                }
                
                // 转换为Base64
                const compressedBase64 = canvas.toDataURL(outputFormat, outputQuality);
                
                // 计算压缩率
                const originalSize = e.target.result.length;
                const compressedSize = compressedBase64.length;
                const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
                
                console.log(`图片压缩完成：${file.type} → ${outputFormat}`);
                console.log(`原始 ${(originalSize / 1024).toFixed(1)}KB → 压缩后 ${(compressedSize / 1024).toFixed(1)}KB（${compressionRatio > 0 ? '减少' : '增加'}${Math.abs(compressionRatio)}%）`);
                
                resolve(compressedBase64);
            };
            
            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = e.target.result;
        };
        
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsDataURL(file);
    });
}

// ==================== 图片上传处理 ====================
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }
    
    // 检查文件大小（警告超过5MB的文件）
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
        const shouldContinue = confirm(`图片文件较大（${fileSizeMB.toFixed(1)}MB），建议压缩后再上传。\n是否继续上传？（系统会自动压缩）`);
        if (!shouldContinue) {
            event.target.value = ''; // 清空选择
            return;
        }
    }
    
    try {
        // 显示加载提示
        console.log('正在处理图片...');
        
        // 压缩图片
        uploadedImageData = await compressImage(file);
        
        // 清空URL输入框
        document.getElementById('image-url').value = '';
        console.log('图片上传成功，已优化并转换为Base64');
    } catch (error) {
        console.error('图片处理失败:', error);
        alert('图片处理失败，请尝试其他图片或使用更小的文件');
        event.target.value = ''; // 清空选择
    }
}

// ==================== 封面图片上传处理 ====================
async function handleCoverImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }
    
    // 检查文件大小（警告超过5MB的文件）
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
        const shouldContinue = confirm(`图片文件较大（${fileSizeMB.toFixed(1)}MB），建议压缩后再上传。\n是否继续上传？（系统会自动压缩）`);
        if (!shouldContinue) {
            event.target.value = ''; // 清空选择
            return;
        }
    }
    
    try {
        // 显示加载提示
        console.log('正在处理封面图片...');
        
        // 压缩图片（封面图片使用较小的最大宽度）
        coverImageData = await compressImage(file, 800, 0.85);
        
        // 清空URL输入框
        document.getElementById('cover-image-url').value = '';
        console.log('封面图片上传成功，已优化并转换为Base64');
        updatePreview();
    } catch (error) {
        console.error('封面图片处理失败:', error);
        alert('图片处理失败，请尝试其他图片或使用更小的文件');
        event.target.value = ''; // 清空选择
    }
}

// ==================== 导出为PDF ====================
async function downloadAsPdf() {
    if (generatedPages.length === 0) {
        alert('没有可下载的内容，请先生成海报');
        return;
    }
    
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    downloadPdfBtn.disabled = true;
    downloadPdfBtn.textContent = '准备生成PDF...';
    
    try {
        // 初始化jsPDF（使用自定义尺寸，保持4:5比例）
        // 540x675px -> 150x187.5mm (更好的打印质量)
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [150, 187.5]
        });
        
        let isFirstPage = true;
        
        // 生成每一页的图片并添加到PDF
        for (let i = 0; i < generatedPages.length; i++) {
            downloadPdfBtn.textContent = `正在生成PDF ${i + 1}/${generatedPages.length}...`;
            
            const pageElement = generatedPages[i];
            
            try {
                // 预处理：将所有远程图片转换为Base64
                await preprocessPageImages(pageElement);
                
                // 暂存原始样式
                const originalDisplay = pageElement.style.display;
                const originalBorderRadius = pageElement.style.borderRadius;
                const originalBoxShadow = pageElement.style.boxShadow;
                const originalTransform = pageElement.style.transform;
                const originalPosition = pageElement.style.position;
                
                // 临时强制显示页面（关键修复：非活动页面默认隐藏导致渲染空白）
                pageElement.style.display = 'flex';
                pageElement.style.position = 'absolute';
                pageElement.style.transform = 'none';
                pageElement.style.borderRadius = '0';
                pageElement.style.boxShadow = 'none';
                
                // 等待样式应用
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // 使用html2canvas渲染
                const canvas = await html2canvas(pageElement, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    width: 540,
                    height: 675,
                    windowWidth: 1200,
                    windowHeight: 1500,
                    x: 0,
                    y: 0
                });
                
                // 恢复原始样式和图片URL
                pageElement.style.display = originalDisplay;
                pageElement.style.position = originalPosition;
                pageElement.style.transform = originalTransform;
                pageElement.style.borderRadius = originalBorderRadius;
                pageElement.style.boxShadow = originalBoxShadow;
                restorePageImages(pageElement);
                
                // 转换canvas为图片数据
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                
                // 如果不是第一页，添加新页面
                if (!isFirstPage) {
                    pdf.addPage([150, 187.5], 'portrait');
                }
                isFirstPage = false;
                
                // 将图片添加到PDF (覆盖整个页面)
                pdf.addImage(imgData, 'JPEG', 0, 0, 150, 187.5);
                
                console.log(`PDF页面 ${i + 1} 添加完成`);
            } catch (error) {
                console.error('生成第', i + 1, '页时出错:', error);
                // 确保恢复页面样式和图片URL
                pageElement.style.display = '';
                pageElement.style.position = '';
                pageElement.style.transform = '';
                pageElement.style.borderRadius = '';
                pageElement.style.boxShadow = '';
                restorePageImages(pageElement);
                alert(`生成第 ${i + 1} 页时出错: ${error.message}`);
                downloadPdfBtn.disabled = false;
                downloadPdfBtn.textContent = '导出为PDF';
                return;
            }
            
            // 添加延迟，避免浏览器卡顿
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // 保存PDF
        downloadPdfBtn.textContent = '💾 正在保存PDF...';
        const timestamp = new Date().toISOString().split('T')[0];
        pdf.save(`科研学习分享_${timestamp}.pdf`);
        
        downloadPdfBtn.textContent = '✅ PDF导出完成！';
        setTimeout(() => {
            downloadPdfBtn.textContent = '导出为PDF';
        }, 2000);
    } catch (error) {
        console.error('PDF导出过程出错:', error);
        alert('PDF导出过程出错: ' + error.message);
    } finally {
        downloadPdfBtn.disabled = false;
    }
}

// ==================== HTML模式示例模板 ====================
function getHtmlTemplateExample() {
    return `<section>
  <h2 class="section-title">核心数据</h2>
  <p class="section-subtitle">Key Metrics</p>
  
  <div class="data-grid data-grid-3" style="margin: 28px 0;">
    <div style="text-align: center; padding: 20px 12px;">
      <div class="big-number-gradient" style="font-size: 48px;">1,247</div>
      <div class="number-label">分析项目</div>
    </div>
    <div style="text-align: center; padding: 20px 12px;">
      <div class="big-number-gradient" style="font-size: 48px;">89%</div>
      <div class="number-label">模型准确率</div>
    </div>
    <div style="text-align: center; padding: 20px 12px;">
      <div class="big-number-gradient" style="font-size: 48px;">3.2x</div>
      <div class="number-label">协作效率</div>
    </div>
  </div>
  
  <div class="accent-block">
    <p>基于 GitHub 2015-2024 年间活跃度最高的开源项目数据</p>
  </div>
</section>

<section>
  <h2 class="section-title">模式对比</h2>
  <p class="section-subtitle">Cathedral vs Bazaar</p>
  
  <div class="data-grid data-grid-2" style="gap: 16px; margin: 24px 0;">
    <div class="data-card">
      <p class="text-overline" style="margin-bottom: 14px;">Cathedral</p>
      <p class="text-title" style="margin-bottom: 10px;">中心化治理</p>
      <p class="text-caption">核心团队主导<br>发布周期长<br>强调质量控制</p>
    </div>
    <div class="data-card">
      <p class="text-overline" style="margin-bottom: 14px;">Bazaar</p>
      <p class="text-title" style="margin-bottom: 10px;">去中心化协作</p>
      <p class="text-caption">开放参与<br>快速迭代<br>群体智慧</p>
    </div>
  </div>
  
  <blockquote class="pullquote">
    <p>"Given enough eyeballs, all bugs are shallow."</p>
    <cite>Linus Torvalds</cite>
  </blockquote>
</section>

<section>
  <h2 class="section-title">研究进度</h2>
  <p class="section-subtitle">Progress</p>
  
  <div class="space-y-3" style="margin-top: 24px;">
    <div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 15px; font-weight: 500;">文献综述</span>
        <span style="font-size: 15px; font-weight: 600; color: #10b981;">100%</span>
      </div>
      <div class="progress-bar" style="height: 10px;"><div class="progress-fill" style="width: 100%;"></div></div>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 15px; font-weight: 500;">数据采集</span>
        <span style="font-size: 15px; font-weight: 600;">85%</span>
      </div>
      <div class="progress-bar" style="height: 10px;"><div class="progress-fill" style="width: 85%;"></div></div>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 15px; font-weight: 500;">模型训练</span>
        <span style="font-size: 15px; font-weight: 600;">60%</span>
      </div>
      <div class="progress-bar" style="height: 10px;"><div class="progress-fill" style="width: 60%;"></div></div>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 15px; font-weight: 500;">论文撰写</span>
        <span style="font-size: 15px; font-weight: 600;">30%</span>
      </div>
      <div class="progress-bar" style="height: 10px;"><div class="progress-fill" style="width: 30%;"></div></div>
    </div>
  </div>
</section>

<section>
  <h2 class="section-title">关键发现</h2>
  <p class="section-subtitle">Findings</p>
  
  <div class="phase-list" style="margin-top: 24px;">
    <div class="phase-item">
      <div class="phase-label">No.1</div>
      <div class="phase-content">
        <div class="phase-title">治理模式影响活跃度</div>
        <p style="font-size: 14px;">开放度高的项目贡献者数量 ↑ 2.4x</p>
      </div>
    </div>
    <div class="phase-item">
      <div class="phase-label">No.2</div>
      <div class="phase-content">
        <div class="phase-title">混合模式效果最佳</div>
        <p style="font-size: 14px;">成功项目灵活调整治理策略</p>
      </div>
    </div>
    <div class="phase-item">
      <div class="phase-label">No.3</div>
      <div class="phase-content">
        <div class="phase-title">文档质量是关键</div>
        <p style="font-size: 14px;">清晰指南降低参与门槛 67%</p>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="full-center" style="padding: 20px;">
    <div class="ring-accent" style="width: 150px; height: 150px; border-width: 12px; margin-bottom: 24px;">
      <span class="big-number-gradient" style="font-size: 40px;">87</span>
      <span class="number-unit" style="font-size: 18px;">%</span>
    </div>
    <p class="text-headline" style="margin-bottom: 10px;">整体完成度</p>
    <p class="text-caption" style="font-size: 14px;">预计 2025 Q1 完成</p>
  </div>
</section>`;
}

// ==================== Markdown模式示例模板 ====================
function getMarkdownTemplateExample() {
    return `### 1. 大教堂模式 (The Cathedral)

这是一种 **中心化、自上而下** 的治理模式。

**核心特征**：
- 由一小群核心开发者或权威人物主导
- 软件发布周期长，版本经过精心策划
- 代码在大部分开发时间内对公众不可见

**典型案例**：
- GNU Emacs 项目早期
- 许多由单一公司主导的开源项目

### 2. 集市模式 (The Bazaar)

与大教堂相反，集市模式是 **去中心化、自下而上** 的。

**核心特征**：
- "Given enough eyeballs, all bugs are shallow."
- 开发过程完全公开，任何人都可以参与
- 快速迭代，频繁发布
- 拥抱混乱，相信群体智慧

**典型案例**：
- **Linux 内核** 是集市模式最成功的典范
- Apache 软件基金会旗下的大多数项目

### 3. 数学公式示例

爱因斯坦质能方程：$E = mc^2$

二次方程求根公式：

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

高斯积分：

$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

### 4. 代码示例

Python 快速排序实现：

\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
\`\`\`

### 5. 关键启示

**对研究者的启示**：
- 治理模式应与项目阶段、社区文化相匹配
- 开放性与控制权的平衡是关键
- 没有绝对的好坏，只有是否适合

**对实践者的建议**：
- 了解你的社区文化和发展阶段
- 灵活调整治理策略
- 保持开放心态，持续学习`;
}

// ==================== 长文模式示例模板 ====================
function getArticleTemplateExample() {
    return `# 开源社区的治理模式研究

开源软件已经成为现代软件开发的重要基石。从操作系统到编程语言，从数据库到人工智能框架，开源项目无处不在。本文将深入探讨开源社区的两种经典治理模式，并分析其对现代软件开发的影响。

## 一、大教堂模式

大教堂模式是一种**中心化、自上而下**的治理模式，其名称来源于中世纪欧洲大教堂的建造方式——由少数专家精心设计，经过漫长的时间才能完工。

这种模式的核心特征包括：项目由一小群核心开发者或权威人物主导，软件发布周期长，版本经过精心策划，代码在大部分开发时间内对公众不可见。

===

### 1.1 典型案例分析

GNU Emacs 项目早期是大教堂模式的典型代表。Richard Stallman 作为项目的核心人物，对代码有着严格的控制。每个版本的发布都经过深思熟虑，确保软件的稳定性和一致性。

> 在大教堂模式下，软件开发如同精雕细琢的艺术品，每一行代码都经过反复推敲。

### 1.2 优势与局限

大教堂模式的优势在于：

- 代码质量高，架构设计统一
- 版本稳定，适合企业级应用
- 决策效率高，方向明确

然而，这种模式也存在明显的局限性。封闭的开发过程限制了外部贡献者的参与，可能导致

---

创新速度放缓。

===

## 二、集市模式

与大教堂模式形成鲜明对比的是集市模式。这种**去中心化、自下而上**的治理方式，如同热闹的集市一般，人们自由地交换想法和代码。

Linus Torvalds 在开发 Linux 内核时采用的正是这种模式。他的名言很好地总结了这种方法的核心理念：

> "Given enough eyeballs, all bugs are shallow."（只要有足够多的眼睛，所有的 bug 都是浅显的。）

### 2.1 核心原则

集市模式遵循以下核心原则：

1. **开放性**：开发过程完全公开，任何人都可以参与
2. **快速迭代**：频繁发布，小步快跑
3. **群体智慧**：相信社区的力量，拥抱多样性

===

## 三、关键启示

通过对这两种治理模式的分析，我们可以得出以下启示：

**对研究者而言**，治理模式的选择应当与项目的阶段和社区文化相匹配。没有绝对的好坏之分，只有是否适合特定的情境。

**对实践者而言**，应当深入了解所在社区的文化和发展阶段，灵活调整参与策略。保持开放的心态，持续学习和适应，是在开源世界中取得成功的关键。`;
}

// ==================== 插入图片到正文 ====================
function insertImageToContent() {
    const imageUrlInput = document.getElementById('image-url');
    const imageAltInput = document.getElementById('image-alt');
    
    let imageSource = uploadedImageData || imageUrlInput.value.trim();
    
    if (!imageSource) {
        alert('请先上传图片或输入图片URL！');
        return;
    }
    
    const altText = imageAltInput.value.trim() || '图片';
    
    let markdownImage;
    
    // 如果是 Base64 数据（上传的图片），使用图片引用系统
    if (imageSource.startsWith('data:')) {
        const imageRef = storeImageAndGetReference(imageSource, altText);
        markdownImage = `\n${imageRef}\n`;
    } else {
        // 如果是 URL，直接使用 Markdown 语法
        markdownImage = `\n![${altText}](${imageSource})\n`;
    }
    
    // 获取当前光标位置
    const contentTextarea = inputs.content;
    const cursorPos = contentTextarea.selectionStart;
    const textBefore = contentTextarea.value.substring(0, cursorPos);
    const textAfter = contentTextarea.value.substring(cursorPos);
    
    // 插入图片引用
    contentTextarea.value = textBefore + markdownImage + textAfter;
    
    // 设置光标位置到插入内容之后
    const newCursorPos = cursorPos + markdownImage.length;
    contentTextarea.setSelectionRange(newCursorPos, newCursorPos);
    contentTextarea.focus();
    
    // 清空输入框
    document.getElementById('image-upload').value = '';
    imageUrlInput.value = '';
    imageAltInput.value = '';
    uploadedImageData = null;
    
    // 更新预览
    updatePreview();
    
    console.log('图片已插入到正文（使用图片引用系统）');
}