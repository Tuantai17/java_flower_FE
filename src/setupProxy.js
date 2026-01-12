/**
 * Setup Proxy cho React Dev Server
 * 
 * Thêm các headers cần thiết để Google Sign-In popup
 * có thể giao tiếp với cửa sổ chính qua postMessage
 * 
 * File này được tự động load bởi react-scripts khi chạy npm start
 */

module.exports = function(app) {
  // Middleware để thêm COOP/COEP headers cho tất cả responses
  app.use((req, res, next) => {
    // Cho phép popup (Google Sign-In) giao tiếp với cửa sổ cha
    // same-origin-allow-popups: cho phép postMessage từ popup Google
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    
    // Cho phép load resources từ Google APIs
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    
    // Cho phép cross-origin resource sharing
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    next();
  });
};
