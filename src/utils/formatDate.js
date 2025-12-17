/**
 * Format date to Vietnamese format
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type: 'full', 'date', 'time', 'relative'
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'full') => {
    if (!date) return '';

    const d = new Date(date);

    if (isNaN(d.getTime())) return '';

    switch (format) {
        case 'full':
            return new Intl.DateTimeFormat('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            }).format(d);

        case 'date':
            return new Intl.DateTimeFormat('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }).format(d);

        case 'time':
            return new Intl.DateTimeFormat('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }).format(d);

        case 'relative':
            return formatRelativeTime(d);

        default:
            return d.toLocaleDateString('vi-VN');
    }
};

/**
 * Format date to relative time (e.g., "5 phút trước")
 * @param {Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (seconds < 60) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 30) return `${days} ngày trước`;
    if (months < 12) return `${months} tháng trước`;
    return `${years} năm trước`;
};

export default formatDate;
