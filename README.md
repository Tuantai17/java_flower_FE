# 🌸 Flower Shop Frontend

<div align="center">

![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-blue?style=for-the-badge&logo=tailwindcss)
![Axios](https://img.shields.io/badge/Axios-1.13-purple?style=for-the-badge)

**Frontend React cho FlowerCorner E-Commerce Platform**

</div>

---

## 🚀 Quick Start

### **Option 1: Với Docker (Khuyến nghị)**

Xem hướng dẫn đầy đủ tại [infra-docker/production-ish.md](../infra-docker/production-ish.md)

### **Option 2: Chạy Local Development**

```bash
# 1. Clone và vào thư mục
cd flower-shop-frontend

# 2. Install dependencies
npm install

# 3. Cấu hình environment
cp .env.example .env
# Edit .env nếu cần

# 4. Chạy development server
npm start
```

**Frontend sẽ chạy tại:** http://localhost:3000

---

## 📋 Tech Stack

| Technology      | Version | Description         |
| --------------- | ------- | ------------------- |
| React           | 19.x    | UI Framework        |
| React Router    | 7.x     | Client-side Routing |
| TailwindCSS     | 3.4     | Utility-first CSS   |
| Axios           | 1.13    | HTTP Client         |
| STOMP/WebSocket | -       | Real-time Updates   |
| React Toastify  | 11.x    | Toast Notifications |
| Recharts        | 3.x     | Charts & Analytics  |
| Leaflet         | 1.9     | Maps Integration    |

---

## 🔧 Cấu hình

### **Environment Variables (.env)**

```properties
# API Configuration
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_UPLOAD_URL=http://localhost:8080/api/upload

# App Configuration
REACT_APP_NAME=FlowerCorner
REACT_APP_HOTLINE=1900 633 045

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

---

## 📁 Project Structure

```
src/
├── components/           # Reusable Components
│   ├── Header/
│   ├── Footer/
│   ├── ProductCard/
│   ├── Cart/
│   └── common/          # Shared components
├── pages/               # Page Components
│   ├── HomePage.js
│   ├── ProductPage.js
│   ├── CartPage.js
│   ├── CheckoutPage.js
│   └── admin/           # Admin pages
├── services/            # API Services
│   ├── api.js           # Axios instance
│   ├── authService.js
│   ├── productService.js
│   └── webSocketService.js
├── contexts/            # React Contexts
│   ├── AuthContext.js
│   └── CartContext.js
├── hooks/               # Custom Hooks
├── utils/               # Utility Functions
├── App.js
└── index.js
```

---

## 🎨 Styling

### **TailwindCSS**

Configuration: `tailwind.config.js`

```javascript
// Custom theme extensions
theme: {
  extend: {
    colors: {
      primary: {...},
      secondary: {...}
    }
  }
}
```

### **Custom CSS**

Global styles: `src/index.css`

---

## 📱 Features

### **User Features**

- 🛍️ Browse products by category
- 🔍 Search products
- 🛒 Shopping cart
- 💳 Checkout with multiple payment methods
- 👤 User profile management
- 📦 Order tracking
- ⭐ Product reviews
- 💬 Live chat support

### **Admin Features**

- 📊 Dashboard analytics
- 📦 Product management
- 👥 User management
- 📋 Order management
- 🎫 Voucher management
- 💬 Customer chat

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watchAll
```

---

## 🚀 Build for Production

```bash
# Create optimized production build
npm run build

# Serve production build locally
npx serve -s build
```

Build output: `build/` folder

---

## 🐳 Docker

### **Build Docker Image**

```bash
docker build -t flower-shop-frontend \
  --build-arg REACT_APP_API_URL=http://localhost:8080/api \
  --build-arg REACT_APP_GOOGLE_CLIENT_ID=your_client_id \
  .
```

### **Run Container**

```bash
docker run -d --name flower-frontend -p 3000:80 flower-shop-frontend
```

---

## 🔧 Available Scripts

| Script          | Description                      |
| --------------- | -------------------------------- |
| `npm start`     | Run development server           |
| `npm test`      | Run tests                        |
| `npm run build` | Create production build          |
| `npm run eject` | Eject from CRA (⚠️ irreversible) |

---

## 🔍 Browser Support

| Browser | Support   |
| ------- | --------- |
| Chrome  | ✅ Latest |
| Firefox | ✅ Latest |
| Safari  | ✅ Latest |
| Edge    | ✅ Latest |

---

## 📝 Development Notes

### **API Proxy (Development)**

In development, requests to `/api` are proxied to backend.

Add to `package.json`:

```json
"proxy": "http://localhost:8080"
```

### **Hot Reload**

Development server auto-refreshes on file changes.

### **ESLint**

Linting rules in `eslintConfig` (package.json)

---

## 📄 License

MIT License
