const currentUrlPattern = {
    productPage: /^https:\/\/m\.a-bly\.com\/goods\/\d+$/,
    sitePage: /^https:\/\/m\.a-bly\.com\//
};

console.log("[EXTENSION] run content_script.js");

let currentUrl = window.location.href;

function removeLeftPanel() {
    const panel = document.getElementById('left-dashboard');
    if (panel) panel.remove();
}
function removeRightPanel() {
    const panel = document.getElementById('right-dashboard');
    if (panel) panel.remove();
}
function removeOpinionContainer() {
    const container = document.getElementById('opinion-container');
    if (container) container.remove();
}

// 대상 요소 동적 탐색
function findTarget() {
    return document.querySelector("#stack\\#-1 > div > div.sc-d8a0b042-0.eVmIiV.sc-71ea066e-0.ewDZDP");
}

// 인라인 컨테이너 생성
function createContainer(target) {
    if (!target) return;

    const old = document.getElementById('opinion-container');
    if (old) old.remove();

    const container = document.createElement('div');
    container.id = 'opinion-container';
    container.style.width = '100%';
    container.style.backgroundColor = 'transparent';
    container.style.borderBottom = '1px solid #ccc';
    container.style.padding = '10px';
    container.style.zIndex = '9999';
    container.style.textAlign = 'left';
    container.style.fontFamily = 'Arial, sans-serif';

    container.innerHTML = `
        <h2 style="margin: 0; font-size: 18px;">🪄 Goods Opinion</h2>
        <div id="opinion">Loading...</div>
    `;

    target.insertBefore(container, target.firstChild);
}

function loadData() {
    return new Promise((resolve, reject) => {
        const urlMatch = window.location.href.match(/goods\/(\d+)/);

        if (urlMatch) {
            const goodsId = urlMatch[1];

            fetch(`${SERVER_URL}/opinion/${goodsId}`)
                .then(res => res.json())
                .then(data => {
                    updateDashboard(goodsId, data.opinion_count || 0, data.opinions || []);
                    resolve(data);
                })
                .catch(err => {
                    console.error(err);
                    updateDashboard(goodsId, 0, []);
                    reject(err);
                });
        } else {
            reject("⚠️ Invalid URL structure");
        }
    });
}

// 좌측 패널 생성
function createLeftPanel() {
    const old = document.getElementById('left-dashboard');
    if (old) old.remove();

    const panel = document.createElement('div');
    panel.id = 'left-dashboard';
    panel.style.position = 'fixed';
    panel.style.top = '0';
    panel.style.left = '0';
    panel.style.height = '100%';
    panel.style.background = '#f9f9f9';
    panel.style.zIndex = '9999';
    panel.style.borderLeft = '1px solid #ddd';
    panel.style.padding = '10px';
    panel.style.overflowY = 'auto';

    panel.style.display = 'flex';
    panel.style.justifyContent = 'center';
    panel.style.alignItems = 'center';
    panel.style.flexDirection = 'column';

    // 너비 계산
    function adjustWidth() {
        const windowWidth = window.innerWidth;
        const calculatedWidth = (windowWidth - 300) / 2;
        const width = Math.max(100, calculatedWidth); 
        panel.style.width = `${width}px`;
    }

    window.addEventListener('resize', adjustWidth);
    adjustWidth();

    panel.innerHTML = `
        <div id="service-title-container">
            ABLY Review Analyzer
            <br>
            <h1 id="service-title">리뷰삼총사</h1>
        </div>
    `;


    const style = document.createElement('style');
    style.textContent = `
        #service-title-container {
            text-align: center;
        }
        #service-title {
            font-size: 28px;
            font-weight: bold;
            font-family: 'Roboto', sans-serif;
            margin: 0;
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(panel);
}

function createEmptyRightPanel() {
    const old = document.getElementById('right-dashboard');
    if (old) old.remove();

    const panel = document.createElement('div');
    panel.id = 'right-dashboard';
    panel.style.position = 'fixed';
    panel.style.top = '0';
    panel.style.right = '0';
    panel.style.height = '100%';
    panel.style.background = '#f9f9f9';
    panel.style.zIndex = '9999';
    panel.style.borderLeft = '1px solid #ddd';
    panel.style.padding = '10px';
    panel.style.overflowY = 'auto';

    // 너비 계산
    function adjustWidth() {
        const windowWidth = window.innerWidth;
        const calculatedWidth = (windowWidth - 300) / 2;
        const width = Math.max(100, calculatedWidth); 
        panel.style.width = `${width}px`;
    }

    window.addEventListener('resize', adjustWidth);
    adjustWidth();

    // 내용 컨테이너 (중앙 메시지 삽입 위치)
    const detailsContainer = document.createElement('div');
    detailsContainer.id = 'details-container';
    detailsContainer.style.display = 'flex';
    detailsContainer.style.justifyContent = 'center';
    detailsContainer.style.alignItems = 'center';
    detailsContainer.style.height = '100%';
    detailsContainer.style.textAlign = 'center';
    detailsContainer.style.fontFamily = 'Arial, sans-serif';
    detailsContainer.style.fontSize = '16px';
    detailsContainer.style.color = '#333';

    panel.appendChild(detailsContainer);
    document.body.appendChild(panel);
}

// 우측 패널 생성
function createRightPanel() {
    const old = document.getElementById('right-dashboard');
    if (old) old.remove();

    const panel = document.createElement('div');
    panel.id = 'right-dashboard';
    panel.style.position = 'fixed';
    panel.style.top = '0';
    panel.style.right = '0';
    panel.style.height = '100%';
    panel.style.background = '#f9f9f9';
    panel.style.zIndex = '9999';
    panel.style.borderLeft = '1px solid #ddd';
    panel.style.padding = '10px';
    panel.style.overflowY = 'auto';

    // 너비 계산
    function adjustWidth() {
        const windowWidth = window.innerWidth;
        const calculatedWidth = (windowWidth - 300) / 2;

        // 최소값 제한
        const width = Math.max(100, calculatedWidth); 
        panel.style.width = `${width}px`;
    }

    window.addEventListener('resize', adjustWidth);
    adjustWidth();

    panel.innerHTML = `
        <h3 style="padding:10px;">📈 Review Dashboard</h3>
        <div id="legend-container" style="margin-bottom: 10px;">
            <span class="legend-item">
                <span class="legend-dot sentiment-pos-background"></span> 긍정
            </span>
            <span class="legend-item">
                <span class="legend-dot sentiment-neu-background"></span> 중립
            </span>
            <span class="legend-item">
                <span class="legend-dot sentiment-neg-background"></span> 부정
            </span>
        </div> <br>
        <div id="opinions-count"></div>
        <div id="details-container">-</div>
    `;

    document.body.appendChild(panel);
}

// 대시보드 정보 갱신
function updateDashboard(productId, reviewCount, opinions = []) {
    const idEl = document.getElementById('product-id');
    const reviewEl = document.getElementById('opinions-count');
    const detailsContainer = document.getElementById('details-container');

    if (idEl) idEl.textContent = productId;
    // if (reviewEl) reviewEl.textContent = reviewCount;

    // 기존 내용 제거
    detailsContainer.innerHTML = '';

    if (reviewCount == 0) {
        reviewEl.textContent = "🔍 아직 등록된 리뷰 의견이 없습니다.";
        reviewEl.style.color = "#9E9E9E";
    }

    // 카테고리별 그룹화
    const grouped = {};
    opinions.forEach(row => {
        if (!grouped[row.category]) {
            grouped[row.category] = [];
        }
        grouped[row.category].push(row);
    })

    for (const category in grouped) {
        const section = document.createElement('div');
        section.classList.add('review-section');

        const title = document.createElement('h4');
        title.textContent = `# ${category}`;
        section.appendChild(title);

        // 의견 정렬
        const sentimentOrder = { 'POS': 0, 'NEU': 1, 'NEG': 2 };
        grouped[category].sort((a, b) => sentimentOrder[a.sentiment] - sentimentOrder[b.sentiment]);

        grouped[category].forEach(row => {
            const pill = document.createElement('span');
            pill.classList.add('opinion-pill');

            if (row.sentiment === 'POS') pill.classList.add('sentiment-pos');
            else if (row.sentiment === 'NEU') pill.classList.add('sentiment-neu');
            else if (row.sentiment === 'NEG') pill.classList.add('sentiment-neg');

            pill.textContent = `${row.aspect_span}/${row.cleaned_opinion_span}`;

            section.appendChild(pill);
        });

        detailsContainer.appendChild(section);
    }
}

function waitForTarget(retry = 20, interval = 500) {
    return new Promise((resolve, reject) => {
        let attempts = 0;

        const check = () => {
            const target = findTarget();
            if (target) {
                resolve(target);
            } else if (attempts < retry) {
                attempts++;
                setTimeout(check, interval);
            } else {
                reject("waitForTarget: Failed to find target");
            }
        };

        check();
    });
}

function handlePageChange() {
    const isProductPage = currentUrlPattern.productPage.test(window.location.href);
    const isSitePage = currentUrlPattern.sitePage.test(window.location.href);

    // 항상 LeftPanel 유지
    if (!document.getElementById('left-dashboard') && isSitePage) {
        createLeftPanel();
    } else if (!isSitePage) {
        removeLeftPanel();
    }

    // RightPanel: 상품 상세 페이지일 경우에만 로드
    if (isProductPage) {
        waitForTarget().then(target => {
            loadData();
            if (!document.getElementById('right-dashboard')) {
                createRightPanel();
            }
        }).catch(err => console.warn(err));
    } else {
        removeRightPanel();
        removeOpinionContainer();
    }
}

function observePage() {
    const observer = new MutationObserver(() => {
        if (window.location.href !== currentUrl) {
            console.log("MutationObserver: URL change detected");
            currentUrl = window.location.href;
            handlePageChange();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: false });
}


function hookUrlChange(callback) {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
        originalPushState.apply(this, args);
        callback();
    };
    history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        callback();
    };

    window.addEventListener('popstate', callback);
}

window.addEventListener('load', () => {
    handlePageChange();
    observePage();
    hookUrlChange(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            handlePageChange();
        }
    });
});