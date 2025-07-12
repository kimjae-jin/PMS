/**
 * 지정된 시간(wait) 동안 호출되지 않으면 함수를 실행하는 Debounce 함수
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (밀리초)
 * @returns {Function} - Debounced 함수
 */
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

/**
 * 숫자를 세 자리마다 콤마가 있는 문자열로 변환합니다.
 * @param {number | string} number - 변환할 숫자
 * @returns {string} - 콤마가 포함된 숫자 문자열
 */
export function formatNumberWithCommas(number) {
    if (number === null || number === undefined) return '';
    const numStr = number.toString().replace(/,/g, '');
    if (isNaN(parseFloat(numStr))) return number.toString();
    return Number(numStr).toLocaleString('ko-KR');
}

/**
 * 날짜 문자열 또는 Date 객체를 YYYY-MM-DD 형식으로 변환합니다.
 * HTML <input type="date">에 사용하기에 적합합니다.
 * @param {string | Date} dateString - 변환할 날짜
 * @returns {string} - 'YYYY-MM-DD' 형식의 날짜 문자열
 */
export function formatDateForInput(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    } catch (e) {
        return '';
    }
}
