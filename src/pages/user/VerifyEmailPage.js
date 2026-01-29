import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import apiService from '../../api/apiService';
import './VerifyEmailPage.css';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');
    const [errorDetails, setErrorDetails] = useState('');
    const [countdown, setCountdown] = useState(5);

    const verifyEmail = useCallback(async (token) => {
        try {
            setStatus('loading');
            setMessage('Đang xác thực email của bạn...');

            const response = await apiService.get(`/auth/email/verify?token=${token}`);
            
            // Axios trả về response.data chứa ApiResponse từ backend
            const data = response?.data || response;

            if (data?.success || data?.code === 200 || response?.status === 200) {
                setStatus('success');
                setMessage(data?.message || data?.data || 'Email đã được xác thực thành công!');
            } else {
                setStatus('error');
                setMessage(data?.message || 'Không thể xác thực email');
                setErrorDetails(data?.error || '');
            }
        } catch (error) {
            console.error('Verify email error:', error);
            setStatus('error');
            
            const errorData = error?.response?.data;
            
            // Xử lý các loại lỗi cụ thể
            if (errorData?.message) {
                // Kiểm tra nếu email đã được xác thực trước đó
                if (errorData.message.includes('đã được xác thực')) {
                    setStatus('already-verified');
                    setMessage('Email này đã được xác thực trước đó!');
                } else if (errorData.message.includes('hết hạn') || errorData.message.includes('expired')) {
                    setMessage('Token đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực.');
                } else {
                    setMessage(errorData.message);
                }
            } else if (error?.message?.includes('Token')) {
                setMessage('Token không hợp lệ hoặc đã hết hạn');
            } else {
                setMessage('Đã xảy ra lỗi khi xác thực email. Vui lòng thử lại sau.');
            }
            setErrorDetails(errorData?.error || error?.message || '');
        }
    }, []);

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Token xác thực không hợp lệ');
            setErrorDetails('Không tìm thấy token trong URL');
            return;
        }

        verifyEmail(token);
    }, [searchParams, verifyEmail]);

    // Countdown và chuyển hướng sau khi xác thực thành công
    useEffect(() => {
        if (status === 'success' || status === 'already-verified') {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        navigate('/login');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [status, navigate]);

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="verify-email-content">
                        <div className="verify-email-icon loading">
                            <div className="spinner"></div>
                        </div>
                        <h2 className="verify-email-title">Đang xác thực...</h2>
                        <p className="verify-email-message">{message}</p>
                    </div>
                );

            case 'success':
                return (
                    <div className="verify-email-content">
                        <div className="verify-email-icon success">
                            <svg viewBox="0 0 52 52" className="checkmark">
                                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                                <path className="checkmark-check" fill="none" d="m14.1 27.2 7.1 7.2 16.7-16.8"/>
                            </svg>
                        </div>
                        <h2 className="verify-email-title success">Xác thực thành công! 🎉</h2>
                        <p className="verify-email-message">{message}</p>
                        <p className="verify-email-redirect">
                            Bạn sẽ được chuyển đến trang đăng nhập sau <strong>{countdown}</strong> giây...
                        </p>
                        <Link to="/login" className="verify-email-btn primary">
                            Đăng nhập ngay
                        </Link>
                    </div>
                );

            case 'already-verified':
                return (
                    <div className="verify-email-content">
                        <div className="verify-email-icon info">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                            </svg>
                        </div>
                        <h2 className="verify-email-title info">Email đã xác thực!</h2>
                        <p className="verify-email-message">{message}</p>
                        <p className="verify-email-redirect">
                            Chuyển hướng sau <strong>{countdown}</strong> giây...
                        </p>
                        <Link to="/login" className="verify-email-btn primary">
                            Đăng nhập
                        </Link>
                    </div>
                );

            case 'error':
            default:
                return (
                    <div className="verify-email-content">
                        <div className="verify-email-icon error">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                            </svg>
                        </div>
                        <h2 className="verify-email-title error">Xác thực thất bại</h2>
                        <p className="verify-email-message">{message}</p>
                        {errorDetails && (
                            <p className="verify-email-error-details">{errorDetails}</p>
                        )}
                        <div className="verify-email-actions">
                            <Link to="/login" className="verify-email-btn secondary">
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="verify-email-btn primary">
                                Đăng ký lại
                            </Link>
                        </div>
                        <p className="verify-email-help">
                            Nếu bạn cần hỗ trợ, vui lòng <Link to="/contact">liên hệ chúng tôi</Link>
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="verify-email-page">
            <div className="verify-email-container">
                <div className="verify-email-header">
                    <Link to="/" className="verify-email-logo">
                        <span className="logo-icon">🌸</span>
                        <span className="logo-text">FlowerCorner</span>
                    </Link>
                </div>

                <div className="verify-email-card">
                    {renderContent()}
                </div>

                <div className="verify-email-footer">
                    <p>&copy; 2024 FlowerCorner. Tất cả quyền được bảo lưu.</p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
