// グローバル変数
let filteredCourses = [...golfCourses];
let currentSort = 'name';

// DOM要素の取得
const searchInput = document.getElementById('searchInput');
const prefectureFilter = document.getElementById('prefectureFilter');
const sortSelect = document.getElementById('sortSelect');
const resetFiltersBtn = document.getElementById('resetFilters');
const coursesGrid = document.getElementById('coursesGrid');
const resultsCount = document.getElementById('resultsCount');

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    renderCourses(filteredCourses);
    setupEventListeners();
});

// イベントリスナーの設定
function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    prefectureFilter.addEventListener('change', handleFilter);
    sortSelect.addEventListener('change', handleSort);
    resetFiltersBtn.addEventListener('click', resetFilters);
}

// 検索処理
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    applyFilters(searchTerm);
}

// フィルター処理
function handleFilter() {
    applyFilters(searchInput.value.toLowerCase().trim());
}

// ソート処理
function handleSort() {
    currentSort = sortSelect.value;
    sortCourses();
    renderCourses(filteredCourses);
}

// フィルター適用
function applyFilters(searchTerm) {
    const selectedPrefecture = prefectureFilter.value;
    
    filteredCourses = golfCourses.filter(course => {
        // 都道府県フィルター
        const matchesPrefecture = selectedPrefecture === 'すべて' || course.prefecture === selectedPrefecture;
        
        // 検索フィルター
        const matchesSearch = !searchTerm || 
            course.name.toLowerCase().includes(searchTerm) ||
            course.prefecture.toLowerCase().includes(searchTerm) ||
            course.city.toLowerCase().includes(searchTerm) ||
            course.address.toLowerCase().includes(searchTerm) ||
            course.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            course.description.toLowerCase().includes(searchTerm);
        
        return matchesPrefecture && matchesSearch;
    });
    
    sortCourses();
    renderCourses(filteredCourses);
}

// ソート処理
function sortCourses() {
    switch(currentSort) {
        case 'name':
            filteredCourses.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
            break;
        case 'price-low':
            filteredCourses.sort((a, b) => {
                const priceA = parseInt(a.juniorPrice.replace(/[^0-9]/g, ''));
                const priceB = parseInt(b.juniorPrice.replace(/[^0-9]/g, ''));
                return priceA - priceB;
            });
            break;
        case 'price-high':
            filteredCourses.sort((a, b) => {
                const priceA = parseInt(a.juniorPrice.replace(/[^0-9]/g, ''));
                const priceB = parseInt(b.juniorPrice.replace(/[^0-9]/g, ''));
                return priceB - priceA;
            });
            break;
        case 'rating':
            filteredCourses.sort((a, b) => b.rating - a.rating);
            break;
        case 'prefecture':
            filteredCourses.sort((a, b) => {
                const prefectureCompare = a.prefecture.localeCompare(b.prefecture, 'ja');
                if (prefectureCompare !== 0) return prefectureCompare;
                return a.name.localeCompare(b.name, 'ja');
            });
            break;
        default:
            break;
    }
}

// コースカードのレンダリング
function renderCourses(courses) {
    if (courses.length === 0) {
        coursesGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <h3>ゴルフ場が見つかりませんでした</h3>
                <p>検索条件を変更してお試しください</p>
            </div>
        `;
        resultsCount.textContent = '0件のゴルフ場が見つかりました';
        return;
    }
    
    coursesGrid.innerHTML = courses.map(course => createCourseCard(course)).join('');
    resultsCount.textContent = `${courses.length}件のゴルフ場が見つかりました`;
    
    // カードクリックイベントを追加
    document.querySelectorAll('.course-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            window.location.href = `course.html?id=${courses[index].id}`;
        });
    });
}

// コースカードのHTML生成
function createCourseCard(course) {
    const stars = '★'.repeat(Math.floor(course.rating)) + '☆'.repeat(5 - Math.floor(course.rating));
    
    return `
        <div class="course-card">
            <img src="${course.image}" alt="${course.name}" class="course-image" onerror="this.style.display='none'">
            <div class="course-content">
                <div class="course-header">
                    <h2 class="course-name">${course.name}</h2>
                    <div class="course-location">
                        <span>📍</span>
                        <span>${course.prefecture} ${course.city}</span>
                    </div>
                </div>
                
                <div class="course-info">
                    <div class="info-item">
                        <span class="info-label">ジュニア料金</span>
                        <span class="info-value">${course.juniorPrice}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">通常料金</span>
                        <span class="info-value">${course.regularPrice}</span>
                    </div>
                </div>
                
                <p class="course-description">${course.description}</p>
                
                <div class="course-tags">
                    ${course.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                
                <div class="course-rating">
                    <span class="stars">${stars}</span>
                    <span>${course.rating}</span>
                </div>
                
                <div class="course-actions">
                    <a href="course.html?id=${course.id}" class="btn btn-primary">詳細を見る</a>
                    <a href="${course.rakutenLink}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" onclick="event.stopPropagation()">楽天ゴルフ</a>
                </div>
            </div>
        </div>
    `;
}

// フィルターリセット
function resetFilters() {
    searchInput.value = '';
    prefectureFilter.value = 'すべて';
    sortSelect.value = 'name';
    currentSort = 'name';
    filteredCourses = [...golfCourses];
    sortCourses();
    renderCourses(filteredCourses);
}

