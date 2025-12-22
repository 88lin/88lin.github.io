// 全局变量
    let currentPage = 1;
    let totalPages = 1;
    let currentDrama = null;
    let currentEpisodeIndex = 0;
    let videoList = [];
    let currentQuality = '1080p'; // 默认清晰度
    const HISTORY_KEY = 'drama_watch_history';
    const MAX_HISTORY_ITEMS = 12; // 最多存储12条历史记录
    const PAGE_SIZE = 6; // 每页显示条数

    // DOM元素
    const searchPage = document.getElementById('searchPage');
    const playerPage = document.getElementById('playerPage');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const pagination = document.getElementById('pagination');
    const searchLoading = document.getElementById('searchLoading');
    const searchError = document.getElementById('searchError');
    const errorText = document.getElementById('errorText');
    const backToDetail = document.getElementById('backToDetail');
    const videoPlayer = document.getElementById('video-player');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const qualitySelect = document.getElementById('qualitySelect');
    const currentEpisodeTitle = document.getElementById('currentEpisodeTitle');
    const episodeQuality = document.getElementById('episodeQuality');
    const episodeDuration = document.getElementById('episodeDuration');
    const episodeSize = document.getElementById('episodeSize');
    const episodeDesc = document.getElementById('episodeDesc');
    const episodesGrid = document.getElementById('episodesGrid');
    const currentQualityIndicator = document.getElementById('currentQuality');
    const historyContainer = document.getElementById('historyContainer');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    // 统一滚动到播放器
    function scrollToPlayer() {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const target = document.getElementById('video-player');
    if (!target) return;
    requestAnimationFrame(() => {
        setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    });
    }

    // 初始化
    document.addEventListener('DOMContentLoaded', () => {
        // 绑定事件
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keydown', (e) => {
            if (!e.isComposing && e.key === 'Enter') performSearch();
        });

        backToDetail.addEventListener('click', () => {
            // 修复播放界面未完全关闭的问题
            videoPlayer.pause();
            videoPlayer.src = '';

            playerPage.style.display = 'none';
            searchPage.style.display = 'block';

            // 显示历史记录
            renderHistory();
        });

        prevBtn.addEventListener('click', playPreviousEpisode);
        nextBtn.addEventListener('click', playNextEpisode);
        fullscreenBtn.addEventListener('click', toggleFullscreen);

        // 清晰度切换事件
        qualitySelect.addEventListener('change', () => {
            currentQuality = qualitySelect.value;
            updateQualityIndicator();
            scrollToPlayer();
            playEpisode(currentEpisodeIndex);
        });

        // 监听视频结束事件
        videoPlayer.addEventListener('ended', () => {
            if (currentEpisodeIndex < videoList.length - 1) {
                playNextEpisode();
            }
        });

        // 清空历史记录按钮事件
        clearHistoryBtn.addEventListener('click', clearHistory);

        // 初始化时渲染历史记录
        renderHistory();
    });

    // 执行搜索
    function performSearch() {
        const keyword = searchInput.value.trim();
        if (keyword) {
            currentPage = 1;
            searchDrama(keyword, currentPage, false);
        }
    }

    // 搜索短剧
    async function searchDrama(keyword, page, isDefault) {
        showLoading(true);
        hideError();
        try {
            const url = `https://api.xingzhige.com/API/playlet/?keyword=${encodeURIComponent(keyword)}&page=${page}`;
            const response = await fetch(url, { referrerPolicy: 'no-referrer' });

            if (!response.ok) {
                throw new Error(`HTTP错误! 状态: ${response.status}`);
            }

            const data = await response.json();

            if (data.code === 0) {
                displayResults(data.data, isDefault);
                if (!isDefault) {
                    const isLastPage = data.data.length < PAGE_SIZE;
                    setupPaginationWindow(page, isLastPage); 
                }
            } else {
                showError(`搜索失败: ${data.msg}`);
            }
        } catch (error) {
            console.error('搜索出错:', error);
            showError(`请求出错: ${error.message}`);
        } finally {
            showLoading(false);
        }
    }

    function escapeHTML(s) {
    return s ? s.replace(/[&<>\"']/g, c => (
        {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]
    )) : '';
    }

    // 显示搜索结果
    function displayResults(results, isDefault) {
        resultsContainer.innerHTML = '';

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                        <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                            <i class="fas fa-film" style="font-size: 3rem; margin-bottom: 20px; color: var(--gray);"></i>
                            <h3>未找到相关短剧</h3>
                            <p>请尝试其他关键词搜索</p>
                        </div>
                    `;
            return;
        }
        if (!isDefault) results = results.slice(0, PAGE_SIZE);
        results.forEach(drama => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                        <img src="${escapeHTML(drama.cover)}" alt="${escapeHTML(drama.title)}" class="card-img"
                            onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                        <div class="card-content">
                            <h3 class="card-title">${escapeHTML(drama.title)}</h3>
                            <div class="card-info"><i class="fas fa-user"></i> ${escapeHTML(drama.author)}</div>
                            <div class="card-info"><i class="fas fa-tags"></i> ${escapeHTML(drama.type)}</div>
                            <p class="card-desc">${escapeHTML(drama.desc || '暂无简介')}</p>
                        </div>`;

            card.addEventListener('click', () => {
                getDramaDetail(drama.book_id);
            });

            resultsContainer.appendChild(card);
        });
    }

    // 设置分页
    function setupPaginationWindow(pageNum, isLastPage) {
    currentPage = pageNum;
    pagination.innerHTML = '';

    // 上一页
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
        const kw = searchInput.value.trim();
        const target = currentPage - 1;
        currentPage = target;
        searchDrama(kw, target, false);
        }
    });
    pagination.appendChild(prevBtn);

    // 计算数字页范围
    const start = Math.max(1, currentPage - 2);
    const end   = isLastPage ? currentPage : currentPage + 2;

    if (start > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'page-btn';
        firstBtn.innerHTML = '<span>1</span>';
        firstBtn.dataset.page = '1';
        firstBtn.addEventListener('click', onPageClick);
        pagination.appendChild(firstBtn);

        if (start > 2) {
        const leftDots = document.createElement('button');
        leftDots.className = 'page-btn dots';
        leftDots.disabled = true;
        leftDots.innerHTML = '<span>…</span>';
        pagination.appendChild(leftDots);
        }
    }

    // 数字页
    for (let i = start; i <= end; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.innerHTML = `<span>${i}</span>`;
        pageBtn.dataset.page = String(i);
        pageBtn.addEventListener('click', onPageClick);
        pagination.appendChild(pageBtn);
    }

    if (!isLastPage) {
        const rightDots = document.createElement('button');
        rightDots.className = 'page-btn dots';
        rightDots.disabled = true;
        rightDots.innerHTML = '<span>…</span>';
        pagination.appendChild(rightDots);
    }

    // 下一页
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = isLastPage;
    nextBtn.addEventListener('click', () => {
        if (!isLastPage) {
        const kw = searchInput.value.trim();
        const target = currentPage + 1;
        currentPage = target;
        searchDrama(kw, target, false);
        }
    });
    pagination.appendChild(nextBtn);

    function onPageClick(e) {
        const target = Number(e.currentTarget.dataset.page);
        if (!Number.isFinite(target) || target === currentPage) return;
        const kw = searchInput.value.trim();
        currentPage = target;
        searchDrama(kw, target, false);
    }
    }

    // 获取短剧详情
    async function getDramaDetail(bookId) {
        showLoading(true);
        hideError();

        try {
            const url = `https://api.xingzhige.com/API/playlet/?book_id=${bookId}`;
            const response = await fetch(url, { referrerPolicy: 'no-referrer' });

            if (!response.ok) {
                throw new Error(`HTTP错误! 状态: ${response.status}`);
            }

            const data = await response.json();

            if (data.code === 0) {
                currentDrama = data.data.detail;
                videoList = data.data.video_list;

                // 关键优化：检查该剧是否有历史记录
                const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
                const historyItem = history.find(item => item.bookId === bookId);

                // 重置当前剧集索引
                if (historyItem) {
                    // 使用历史记录中的集数索引，但要确保在范围内
                    currentEpisodeIndex = Math.min(Math.max(0, historyItem.episodeIndex), videoList.length - 1);
                } else {
                    // 没有历史记录，从第一集开始
                    currentEpisodeIndex = 0;
                }

                showPlayerPage();
            } else {
                showError(`获取详情失败: ${data.msg}`);
            }
        } catch (error) {
            console.error('获取详情出错:', error);
            showError(`请求出错: ${error.message}`);
        } finally {
            showLoading(false);
        }
    }

    // 显示播放页面
    function showPlayerPage() {
        searchPage.style.display = 'none';
        playerPage.style.display = 'block';
        scrollToPlayer();

        // 更新剧集信息
        currentEpisodeTitle.textContent = currentDrama.title;
        episodeDesc.textContent = currentDrama.desc || '暂无简介';

        // 重置清晰度选择器
        currentQuality = '1080p';
        qualitySelect.value = currentQuality;
        updateQualityIndicator();

        // 渲染剧集列表
        renderEpisodeList();

        // 播放当前剧集
        if (videoList.length > 0) {
            playEpisode(currentEpisodeIndex);
        }
    }

    // 更新清晰度指示器
    function updateQualityIndicator() {
        // 更新当前清晰度指示器
        const qualityClass = `quality-${currentQuality.replace('p', '')}`;
        currentQualityIndicator.className = `quality-indicator ${qualityClass}`;
        currentQualityIndicator.innerHTML = `<span class="dot"></span> 当前清晰度: ${currentQuality}`;

        // 更新视频信息区域的清晰度指示器
        episodeQuality.className = `quality-indicator ${qualityClass}`;
        episodeQuality.innerHTML = `<span class="dot"></span> ${currentQuality}`;
    }

    // 渲染剧集列表
    function renderEpisodeList() {
        episodesGrid.innerHTML = '';

        videoList.forEach((episode, index) => {
            const episodeItem = document.createElement('div');
            episodeItem.className = `episode-item ${index === currentEpisodeIndex ? 'active' : ''}`;
            episodeItem.textContent = episode.title;

            episodeItem.addEventListener('click', () => {
                currentEpisodeIndex = index;
                scrollToPlayer();
                playEpisode(currentEpisodeIndex);
                updateEpisodeListSelection();
            });

            episodesGrid.appendChild(episodeItem);
        });
    }

    // 更新剧集列表选择状态
    function updateEpisodeListSelection() {
        const items = episodesGrid.querySelectorAll('.episode-item');
        items.forEach((item, index) => {
            item.classList.toggle('active', index === currentEpisodeIndex);
        });
    }

    // 播放指定剧集
    async function playEpisode(index) {
        if (index < 0 || index >= videoList.length) return;

        const videoId = videoList[index].video_id;
        try {
            const url = `https://api.xingzhige.com/API/playlet/?video_id=${videoId}&quality=${currentQuality}`;
            const response = await fetch(url, { referrerPolicy: 'no-referrer' });

            if (!response.ok) {
                throw new Error(`HTTP错误! 状态: ${response.status}`);
            }

            const data = await response.json();

            if (data.code === 0) {
                const videoData = data.data.video;

                // 设置视频源
                videoPlayer.setAttribute('referrerpolicy', 'no-referrer');
                videoPlayer.src = videoData.url;
                videoPlayer.load();

                // 更新剧集信息
                currentEpisodeTitle.textContent = `${currentDrama.title} - ${videoList[index].title}`;

                // 更新清晰度指示器
                updateQualityIndicator();

                // 更新视频信息
                episodeDuration.textContent = `时长: ${Math.round(videoData.duration)}秒`;
                episodeSize.textContent = `大小: ${videoData.size_str || '未知'}`;

                // 更新剧集选择状态
                updateEpisodeListSelection();

                // 添加观看历史
                addToHistory(currentDrama.book_id, currentDrama.title, currentDrama.cover, index);

                const onCanPlay = () => {
                    videoPlayer.play().catch(e => console.log('自动播放失败:', e));
                    videoPlayer.removeEventListener('canplay', onCanPlay);
                    };
                    videoPlayer.addEventListener('canplay', onCanPlay);
            } else {
                showError(`获取视频失败: ${data.msg}`);
            }
        } catch (error) {
            console.error('播放剧集出错:', error);
            showError(`请求出错: ${error.message}`);
        }
    }

    // 播放上一集
    function playPreviousEpisode() {
        if (currentEpisodeIndex > 0) {
            currentEpisodeIndex--;
            scrollToPlayer();
            playEpisode(currentEpisodeIndex);
        }
    }

    // 播放下一集
    function playNextEpisode() {
        if (currentEpisodeIndex < videoList.length - 1) {
            currentEpisodeIndex++;
            scrollToPlayer();
            playEpisode(currentEpisodeIndex);
        }
    }

    // 切换全屏
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (videoPlayer.requestFullscreen) {
                videoPlayer.requestFullscreen();
            } else if (videoPlayer.mozRequestFullScreen) {
                videoPlayer.mozRequestFullScreen();
            } else if (videoPlayer.webkitRequestFullscreen) {
                videoPlayer.webkitRequestFullscreen();
            } else if (videoPlayer.msRequestFullscreen) {
                videoPlayer.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    // 添加观看历史
    function addToHistory(bookId, title, cover, episodeIndex) {
        // 获取现有历史记录
        let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

        // 检查是否已存在相同bookId的记录
        const existingIndex = history.findIndex(item => item.bookId === bookId);

        // 创建新历史记录项
        const historyItem = {
            bookId,
            title,
            cover,
            episodeIndex,
            timestamp: new Date().toISOString()
        };

        if (existingIndex !== -1) {
            // 更新现有记录
            history[existingIndex] = historyItem;
        } else {
            // 添加新记录
            history.unshift(historyItem);

            // 限制历史记录数量
            if (history.length > MAX_HISTORY_ITEMS) {
                history = history.slice(0, MAX_HISTORY_ITEMS);
            }
        }

        // 保存到本地存储
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

        // 渲染历史记录
        renderHistory();
    }

    // 渲染历史记录
    function renderHistory() {
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

        if (history.length === 0) {
            historyContainer.style.display = 'none';
            return;
        }

        historyContainer.style.display = 'block';
        historyList.innerHTML = '';

        history.forEach(item => {
            const historyCard = document.createElement('div');
            historyCard.className = 'history-card';
            historyCard.innerHTML = `
                    <img src="${escapeHTML(item.cover)}" alt="${escapeHTML(item.title)}" class="history-img"
                        onerror="this.src='https://via.placeholder.com/100x150?text=No+Image'">
                    <div class="history-content">
                        <h3 class="history-title-text">${escapeHTML(item.title)}</h3>
                        <div class="history-episode">播放至: 第${item.episodeIndex + 1}集</div>
                        <div class="history-time">${formatDate(item.timestamp)}</div>
                    </div>`;

            historyCard.addEventListener('click', () => {
                // 从历史记录播放
                playFromHistory(item.bookId, item.episodeIndex);
            });

            historyList.appendChild(historyCard);
        });
    }

    // 从历史记录播放
    function playFromHistory(bookId, episodeIndex) {
        // 设置当前播放集数
        currentEpisodeIndex = episodeIndex;

        // 获取短剧详情
        getDramaDetail(bookId);
    }

    // 清空历史记录
    function clearHistory() {
        if (confirm('确定要清空所有观看历史吗？')) {
            localStorage.removeItem(HISTORY_KEY);
            historyContainer.style.display = 'none';
        }
    }

    // 格式化日期
    function formatDate(isoString) {
        const date = new Date(isoString);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    // 显示加载状态
    function showLoading(show) {
        searchLoading.style.display = show ? 'block' : 'none';
    }

    // 显示错误信息
    function showError(message) {
        errorText.textContent = message;
        searchError.style.display = 'block';
    }

    // 隐藏错误信息
    function hideError() {
        searchError.style.display = 'none';
    }