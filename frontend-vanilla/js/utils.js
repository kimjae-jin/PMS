export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function formatNumberWithCommas(number) {
    if (number === null || number === undefined) return '';
    const numStr = number.toString().replace(/,/g, '');
    if (isNaN(parseFloat(numStr))) return number.toString();
    return Number(numStr).toLocaleString('ko-KR');
}

export function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return 'N/A';
    }
}
