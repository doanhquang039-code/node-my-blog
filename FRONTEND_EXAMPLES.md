<!-- Frontend Integration Guide -->

# Frontend Implementation Examples

Dưới đây là các ví dụ HTML/JavaScript để tích hợp các tính năng mới vào giao diện web.

---

## 1. 🔍 Search Page

```html
<!DOCTYPE html>
<html>
<head>
    <title>Blog Search</title>
    <style>
        .search-box { margin: 20px 0; }
        .filter-section { margin: 15px 0; }
        .results { display: grid; gap: 15px; }
        .post-card { 
            border: 1px solid #ddd; 
            padding: 15px; 
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="search-box">
        <input type="text" id="searchInput" placeholder="Tìm kiếm bài viết...">
        <button onclick="search()">Tìm kiếm</button>
    </div>

    <div class="filter-section">
        <select id="categoryFilter">
            <option value="">Tất cả danh mục</option>
            <option value="1">Công nghệ</option>
            <option value="2">Sách</option>
        </select>

        <select id="sortBy">
            <option value="latest">Mới nhất</option>
            <option value="popular">Phổ biến</option>
            <option value="trending">Xu hướng</option>
        </select>
    </div>

    <div class="results" id="results"></div>

    <script>
        async function search() {
            const q = document.getElementById('searchInput').value;
            const category = document.getElementById('categoryFilter').value;
            const sort = document.getElementById('sortBy').value;

            const params = new URLSearchParams({
                q, category, sort, limit: 10
            });

            const response = await fetch(`/api/search?${params}`);
            const data = await response.json();

            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = data.posts.map(post => `
                <div class="post-card">
                    <h3><a href="/posts/${post.slug}">${post.title}</a></h3>
                    <p>${post.content.substring(0, 150)}...</p>
                    <small>👤 ${post.author.name} | 👁️ ${post.stats?.view_count || 0} lượt xem</small>
                </div>
            `).join('');
        }

        // Search on Enter key
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') search();
        });
    </script>
</body>
</html>
```

---

## 2. 📖 Post Detail Page with Related Posts

```html
<div class="post-content">
    <h1 id="title"></h1>
    <div id="postContent"></div>
    
    <!-- Reading Time -->
    <div class="reading-time">
        <span id="readingTime"></span>
    </div>

    <!-- SEO Info -->
    <div class="seo-info" style="background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px;">
        <strong>SEO Score: <span id="seoScore"></span>/100</strong>
        <ul id="seoIssues"></ul>
    </div>

    <!-- Comment Section -->
    <div class="comments-section">
        <h3>Bình luận</h3>
        <div id="commentsList"></div>
    </div>

    <!-- Related Posts -->
    <div class="related-posts">
        <h3>Bài viết liên quan</h3>
        <div id="relatedList" style="display: grid; gap: 10px;"></div>
    </div>
</div>

<script>
    const postId = new URLSearchParams(location.search).get('id') || 1;

    // Load post
    async function loadPost() {
        const response = await fetch(`/api/posts/${postId}`);
        const post = await response.json();
        
        document.getElementById('title').innerText = post.title;
        document.getElementById('postContent').innerHTML = post.content;
    }

    // Load reading time
    async function loadReadingTime() {
        const response = await fetch(`/api/seo/reading-time/${postId}`);
        const data = await response.json();
        document.getElementById('readingTime').innerText = 
            `⏱️ Thời gian đọc: ${data.readingTime} phút`;
    }

    // Load SEO info
    async function loadSEO() {
        const response = await fetch(`/api/seo/check/${postId}`);
        const data = await response.json();
        
        document.getElementById('seoScore').innerText = data.score;
        document.getElementById('seoIssues').innerHTML = 
            data.issues.map(issue => `<li>${issue}</li>`).join('');
    }

    // Load related posts
    async function loadRelatedPosts() {
        const response = await fetch(`/api/related-posts/post/${postId}?limit=5`);
        const posts = await response.json();
        
        document.getElementById('relatedList').innerHTML = 
            posts.map(post => `
                <div class="post-card">
                    <h4><a href="?id=${post.id}">${post.title}</a></h4>
                    <small>${post.createdAt}</small>
                </div>
            `).join('');
    }

    // Load comments with ratings
    async function loadComments() {
        // Get post and its comments
        const response = await fetch(`/api/posts/${postId}`);
        const post = await response.json();
        
        const commentsList = document.getElementById('commentsList');
        commentsList.innerHTML = (post.comments || []).map(comment => `
            <div class="comment" style="border-left: 3px solid #ddd; padding: 10px; margin: 10px 0;">
                <strong>${comment.author.name}</strong>
                <p>${comment.content}</p>
                <div class="comment-rating">
                    <button onclick="rateComment(${comment.id}, 'helpful')">👍 Hữu ích</button>
                    <button onclick="rateComment(${comment.id}, 'unhelpful')">👎 Không hữu ích</button>
                    <span id="rating-${comment.id}"></span>
                </div>
            </div>
        `).join('');

        // Load comment ratings
        post.comments?.forEach(async (comment) => {
            const response = await fetch(`/api/comment-ratings/${comment.id}/ratings`);
            const ratings = await response.json();
            document.getElementById(`rating-${comment.id}`).innerText = 
                `(${ratings.helpful}/${ratings.total})`;
        });
    }

    // Rate comment
    async function rateComment(commentId, rating) {
        const token = localStorage.getItem('token');
        
        await fetch(`/api/comment-ratings/${commentId}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rating })
        });

        // Refresh ratings
        const response = await fetch(`/api/comment-ratings/${commentId}/ratings`);
        const ratings = await response.json();
        document.getElementById(`rating-${commentId}`).innerText = 
            `(${ratings.helpful}/${ratings.total})`;
    }

    // Log view activity
    async function logView() {
        const token = localStorage.getItem('token');
        if (!token) return;

        await fetch('/api/activity/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                activityType: 'view_post',
                postId: postId,
                details: { source: 'direct' }
            })
        });
    }

    // Initialize
    loadPost();
    loadReadingTime();
    loadSEO();
    loadRelatedPosts();
    loadComments();
    logView();
</script>
```

---

## 3. 📊 Analytics Dashboard

```html
<!DOCTYPE html>
<html>
<head>
    <title>Analytics Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
        .metric { font-size: 2em; font-weight: bold; color: #0066cc; }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="card">
            <h3>Tổng bài viết</h3>
            <div class="metric" id="totalPosts">0</div>
        </div>
        <div class="card">
            <h3>Tổng lượt xem</h3>
            <div class="metric" id="totalViews">0</div>
        </div>
        <div class="card">
            <h3>Tổng bình luận</h3>
            <div class="metric" id="totalComments">0</div>
        </div>
        <div class="card">
            <h3>Tổng lượt like</h3>
            <div class="metric" id="totalLikes">0</div>
        </div>
    </div>

    <div style="margin-top: 30px;">
        <canvas id="activityChart"></canvas>
    </div>

    <script>
        async function loadDashboard() {
            const response = await fetch('/api/analytics/dashboard');
            const data = await response.json();

            document.getElementById('totalPosts').innerText = data.overview.totalPosts;
            document.getElementById('totalViews').innerText = 
                data.overview.totalViews.toLocaleString();
            document.getElementById('totalComments').innerText = 
                data.overview.totalComments;
            document.getElementById('totalLikes').innerText = 
                data.overview.totalLikes;

            // Chart
            const ctx = document.getElementById('activityChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.monthlyData.map(m => m.month),
                    datasets: [
                        {
                            label: 'Bài viết',
                            data: data.monthlyData.map(m => m.posts),
                            borderColor: '#0066cc'
                        },
                        {
                            label: 'Bình luận',
                            data: data.monthlyData.map(m => m.comments),
                            borderColor: '#ff6600'
                        }
                    ]
                }
            });
        }

        loadDashboard();
    </script>
</body>
</html>
```

---

## 4. ⏰ Schedule Post Form

```html
<form id="scheduleForm">
    <h3>Lên lịch bài viết</h3>
    
    <label>Chọn bài viết:</label>
    <select id="postSelect" required>
        <option value="">-- Chọn bài viết --</option>
    </select>

    <label>Thời gian xuất bản:</label>
    <input type="datetime-local" id="scheduledAt" required>

    <button type="submit">Lên lịch</button>
</form>

<div id="scheduledList"></div>

<script>
    // Load all posts
    async function loadPosts() {
        const response = await fetch('/api/posts');
        const posts = await response.json();
        
        const select = document.getElementById('postSelect');
        select.innerHTML += posts.map(p => 
            `<option value="${p.id}">${p.title}</option>`
        ).join('');
    }

    // Load scheduled posts
    async function loadScheduledPosts() {
        const response = await fetch('/api/schedule');
        const scheduled = await response.json();
        
        document.getElementById('scheduledList').innerHTML = `
            <h4>Bài viết lên lịch</h4>
            ${scheduled.map(s => `
                <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
                    <strong>${s.Post.title}</strong>
                    <p>Xuất bản: ${new Date(s.scheduled_at).toLocaleString()}</p>
                    <button onclick="cancelSchedule(${s.id})">Hủy</button>
                </div>
            `).join('')}
        `;
    }

    // Schedule post
    document.getElementById('scheduleForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const postId = document.getElementById('postSelect').value;
        const scheduledAt = document.getElementById('scheduledAt').value;

        const response = await fetch('/api/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                postId: parseInt(postId),
                scheduledAt: new Date(scheduledAt).toISOString()
            })
        });

        if (response.ok) {
            alert('Đã lên lịch bài viết!');
            loadScheduledPosts();
        }
    });

    // Cancel schedule
    async function cancelSchedule(scheduleId) {
        await fetch(`/api/schedule/${scheduleId}`, { method: 'DELETE' });
        loadScheduledPosts();
    }

    loadPosts();
    loadScheduledPosts();
</script>
```

---

## 5. 📮 Newsletter Subscription

```html
<div class="newsletter-box" style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
    <h3>Đăng ký nhận tin tức</h3>
    <p>Nhận những bài viết mới nhất trực tiếp trong hộp thư của bạn</p>
    
    <form id="newsletterForm" style="display: flex; gap: 10px;">
        <input 
            type="email" 
            id="newsletterEmail" 
            placeholder="Nhập email của bạn..." 
            required
        >
        <button type="submit">Đăng ký</button>
    </form>
    
    <div id="newsletterMessage"></div>
</div>

<script>
    document.getElementById('newsletterForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('newsletterEmail').value;
        
        const response = await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const msgDiv = document.getElementById('newsletterMessage');
        
        if (response.ok) {
            msgDiv.innerHTML = '<p style="color: green;">✅ Cảm ơn bạn đã đăng ký!</p>';
            document.getElementById('newsletterEmail').value = '';
        } else {
            msgDiv.innerHTML = '<p style="color: red;">❌ Đã xảy ra lỗi</p>';
        }
    });
</script>
```

---

## 6. 👤 User Activity Page

```html
<div class="activity-section">
    <h3>Hoạt động của bạn</h3>
    
    <div id="activityStats"></div>
    <div id="activityHistory"></div>
</div>

<script>
    const userId = getCurrentUserId(); // Get from auth

    async function loadActivityStats() {
        const response = await fetch(`/api/activity/user/${userId}/stats?days=30`);
        const stats = await response.json();
        
        document.getElementById('activityStats').innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                <div><strong>Xem bài:</strong> ${stats.byType.view_post || 0}</div>
                <div><strong>Like:</strong> ${stats.byType.like_post || 0}</div>
                <div><strong>Bình luận:</strong> ${stats.byType.comment || 0}</div>
                <div><strong>Bài viết:</strong> ${stats.byType.create_post || 0}</div>
            </div>
        `;
    }

    async function loadActivityHistory() {
        const response = await fetch(`/api/activity/user/${userId}/history?limit=20`);
        const history = await response.json();
        
        const typeLabels = {
            'view_post': '👁️ Xem bài',
            'like_post': '👍 Thích bài',
            'comment': '💬 Bình luận',
            'create_post': '✍️ Viết bài',
            'login': '🔓 Đăng nhập'
        };

        document.getElementById('activityHistory').innerHTML = `
            <h4>Lịch sử gần đây</h4>
            ${history.map(activity => `
                <div style="padding: 10px; border-bottom: 1px solid #ddd;">
                    <strong>${typeLabels[activity.activity_type]}</strong>
                    <small>${new Date(activity.createdAt).toLocaleString()}</small>
                </div>
            `).join('')}
        `;
    }

    loadActivityStats();
    loadActivityHistory();
</script>
```

---

## 💡 Tips & Best Practices

1. **Caching Search Results**
```javascript
const cache = new Map();

async function cachedSearch(query) {
    if (cache.has(query)) return cache.get(query);
    
    const data = await fetch(`/api/search?q=${query}`).then(r => r.json());
    cache.set(query, data);
    return data;
}
```

2. **Error Handling**
```javascript
async function fetchAPI(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}
```

3. **Loading States**
```javascript
async function loadWithSpinner(url, elementId) {
    const el = document.getElementById(elementId);
    el.innerHTML = '⏳ Đang tải...';
    
    const data = await fetch(url).then(r => r.json());
    el.innerHTML = ''; // Update with data
}
```

---

**Happy frontend integration! 🎉**
