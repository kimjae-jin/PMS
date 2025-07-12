/**
 * 지정된 시간(wait) 동안 호출되지 않으면 함수를 실행하는 Debounce 함수
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
 */
export function formatNumberWithCommas(number) {
    if (number === null || number === undefined || number === '') return '';
    const numStr = String(number).replace(/,/g, '');
    if (isNaN(parseFloat(numStr))) return String(number);
    return Number(numStr).toLocaleString('ko-KR');
}

/**
 * 입력 필드에 숫자 천 단위 콤마를 자동으로 적용합니다.
 * @param {HTMLInputElement} inputElement 
 */
export function formatNumberOnInput(inputElement) {
    inputElement.addEventListener('input', (e) => {
        const value = e.target.value;
        const formattedValue = formatNumberWithCommas(value);
        e.target.value = formattedValue;
    });
}


/**
 * 날짜 문자열 또는 Date 객체를 YYYY-MM-DD 형식으로 변환합니다.
 */
export function formatDateForInput(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
}

/**
 * 날짜 입력 필드에 'yymmdd' 입력을 'yyyy-mm-dd'로 자동 변환합니다.
 * @param {HTMLInputElement} inputElement 
 */
export function formatDateOnInput(inputElement) {
    inputElement.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');

        if (value.length === 6) {
            let year = value.substring(0, 2);
            const month = value.substring(2, 4);
            const day = value.substring(4, 6);
            
            // 2000년대를 기준으로 변환 (필요 시 수정 가능)
            year = parseInt(year, 10) < 50 ? '20' + year : '19' + year;
            
            e.target.value = `${year}-${month}-${day}`;
        }
    });
}
