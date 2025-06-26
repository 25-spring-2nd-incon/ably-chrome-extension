//332
// const SERVER_URL = 'http://localhost:8000'; 
const SERVER_URL = 'http://163.239.77.62:80';

// -------------------------------------------------------
// Color assets

const COLOR_POSITIVE = getComputedStyle(document.documentElement).getPropertyValue('--color-positive').trim();
const COLOR_NEUTRAL = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral').trim();
const COLOR_NEGATIVE = getComputedStyle(document.documentElement).getPropertyValue('--color-negative').trim();

// -------------------------------------------------------

console.log("[EXTENSION] run content_script.js");

let currentUrl = window.location.href;

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
        const opinionElement = document.getElementById('opinion');

        if (!opinionElement) {
            reject("Opinion element not found");
            return;
        }

        if (urlMatch) {
            const goodsId = urlMatch[1];

            fetch(`${SERVER_URL}/opinion/${goodsId}`)
                .then(res => res.json())
                .then(data => {

                    opinionElement.textContent = data.opinions || "Opinion not found";
                    // opinionElement.textContent = data.product_ID || "Opinion not found";
                    
                    updateDashboard(goodsId, data.opinion_count || 0, data.opinions || []);
                    resolve(data);
                })
                .catch(err => {
                    console.error(err);
                    opinionElement.textContent = "Error fetching opinion";
                    updateDashboard(goodsId, 0, []);
                    reject(err);
                });
        } else {
            opinionElement.textContent = "Invalid URL";
            reject("Invalid URL structure");
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
        <div id="service-title-container">
            감정적 정서 관계
            <br>
            <h1 id="service-title">감. 정. 관.</h1>
        </div>
    `;


    const style = document.createElement('style');
    style.textContent = `
        #service-title-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 150px;
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
        <h3 style="padding:10px;">📈 Dashboard</h3>
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
        </div>

        <div><strong>상품 ID:</strong> <span id="product-id">-</span></div>
        <div><strong>의견 개수:</strong> <span id="opinions-count">-</span></div> 
        <div id="details-container">-</div> <br>
    `;

    document.body.appendChild(panel);
}

// 대시보드 정보 갱신
function updateDashboard(productId, reviewCount, opinions = []) {
    const idEl = document.getElementById('product-id');
    const reviewEl = document.getElementById('opinions-count');
    const detailsContainer = document.getElementById('details-container');

    if (idEl) idEl.textContent = productId;
    if (reviewEl) reviewEl.textContent = reviewCount;

    // 기존 내용 제거
    detailsContainer.innerHTML = '';

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
        section.style.marginBottom = '15px';
        section.style.padding = '10px';
        section.style.border = '1px solid #ccc';
        section.style.borderRadius = '5px';
        section.style.backgroundColor = '#fff';

        const title = document.createElement('h4');
        title.textContent = `# ${category}`;
        title.style.marginBottom = '10px';
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
    waitForTarget().then(target => {
        console.log("handlePageChange: Successfully found target, load data");
        createContainer(target);
        loadData();
        createLeftPanel();
        createRightPanel();
    }).catch(err => {
        console.warn(err);
    });
}
// function handlePageChange() {
//     const target = findTarget();
//     createContainer(target);
//     loadData();
//     createLeftPanel();
//     createRightPanel();
// }

// URL 변화 및 DOM 렌더링 감지
// function observePage() {
    
//     const observer = new MutationObserver(() => {
//         if (window.location.href !== currentUrl) {
//             console.log("URL 변경 감지");
//             currentUrl = window.location.href;
//             handlePageChange();
//         }

//         // 타겟 요소가 아직 없으면 재시도
//         const target = findTarget();
//         if (target && !document.getElementById('opinion-container')) {
//             console.log("Find target element, insert UI");
//             createContainer(target);
//             loadData();
//         }
//     });

//     observer.observe(document.body, { childList: true, subtree: true, attributes: false });
// }
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


// 최초 실행
// window.addEventListener('load', () => {
//     createLeftPanel();
//     createRightPanel();
//     observePage();
//     handlePageChange();
// });
window.addEventListener('load', () => {
    createLeftPanel();
    createRightPanel();
    observePage();
    handlePageChange();

    hookUrlChange(() => {
        console.log("hookUrlChange: URL change detected");
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            handlePageChange();
        }
    });
});