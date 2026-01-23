# FRONTEND ADMIN UI - TIN TUC

## CAU TRUC FILE

```
src/
├── api/
│   └── articleApi.js              # API calls for articles
├── pages/
│   ├── admin/
│   │   └── article/
│   │       ├── index.js           # Export all components
│   │       ├── ArticleList.js     # Danh sach bai viet
│   │       ├── ArticleForm.js     # Tao/Sua bai viet
│   │       └── ArticleAIGenerate.js # Tao bai viet bang AI
│   ├── NewsPage.js                # Trang tin tuc public
│   └── NewsDetailPage.js          # Chi tiet bai viet public
├── components/
│   └── admin/
│       └── Sidebar.js             # Da them menu Tin tuc
└── App.js                         # Da them routes
```

## ROUTES

### Admin Routes (can ROLE_ADMIN)

| Route                         | Component         | Mo ta                |
| ----------------------------- | ----------------- | -------------------- |
| `/admin/articles`             | ArticleList       | Danh sach bai viet   |
| `/admin/articles/create`      | ArticleForm       | Tao bai viet moi     |
| `/admin/articles/edit/:id`    | ArticleForm       | Chinh sua bai viet   |
| `/admin/articles/ai-generate` | ArticleAIGenerate | Tao bai viet bang AI |

### Public Routes

| Route         | Component      | Mo ta             |
| ------------- | -------------- | ----------------- |
| `/news`       | NewsPage       | Danh sach tin tuc |
| `/news/:slug` | NewsDetailPage | Chi tiet bai viet |

## CHUC NANG

### 1. ArticleList

- Hien thi danh sach bai viet
- Filter theo status (DRAFT/SCHEDULED/PUBLISHED/ARCHIVED)
- Tim kiem theo tieu de
- Phan trang
- Quick actions: Publish, Archive, Edit, Delete

### 2. ArticleForm

- Tao bai viet moi hoac chinh sua
- Fields: Title, Summary, Content (HTML), Thumbnail URL, Tags, Author
- Actions:
  - **Luu nhap (Save Draft)**: Luu voi status = DRAFT
  - **Dat lich (Schedule)**: Mo modal chon thoi gian
  - **Dang ngay (Publish Now)**: Publish lien tuc

### 3. ArticleAIGenerate

- Nhap chu de, giong van, tu khoa SEO
- Chon do dai: ngan/vua/dai
- Tuy chon CTA
- Nhan "Tao bai viet" de AI generate
- Preview noi dung
- Chinh sua hoac Publish ngay

### 4. NewsPage (Public)

- Grid hien thi bai viet da PUBLISHED
- Tim kiem theo tieu de
- Filter theo tag
- Phan trang

### 5. NewsDetailPage (Public)

- Hien thi chi tiet bai viet
- Tags clickable
- Back to news link

## API ENDPOINTS USED

```javascript
// Public
articleApi.getPublicArticles(page, size, q, tag);
articleApi.getBySlug(slug);

// Admin
articleApi.getAdminArticles(page, size, status, q);
articleApi.getById(id);
articleApi.create(data);
articleApi.update(id, data);
articleApi.delete(id);
articleApi.updateStatus(id, { status, scheduledAt });
articleApi.publish(id);
articleApi.schedule(id, scheduledAt);
articleApi.archive(id);
articleApi.toDraft(id);
articleApi.generateWithAI(data);
```

## CHAY FRONTEND

```bash
cd flower-shop-frontend
npm start
```

Truy cap:

- Admin: http://localhost:3000/admin/articles
- Public: http://localhost:3000/news
