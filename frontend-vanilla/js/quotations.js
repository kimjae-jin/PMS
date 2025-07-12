import { apiClient } from './api_client.js';
import { formatNumberWithCommas } from './utils.js';

// --- Modal Helper ---
// 이 페이지에서도 모달을 사용하기 위해 동일한 헬퍼 객체를 참조합니다.
// 향후 이 코드는 별도의 공통 파일(e.g., 'ui.js')로 분리하여 재사용성을 높일 수 있습니다.
const Modal = {
    container: document.getElementById('modal-container'),
    title: document.getElementById('modal-title'),
    body: document.getElementById('modal-body'),
    footer: document.getElementById('modal-footer'),
    primaryBtn: document.getElementById('modal-primary-btn'),
    secondaryBtn: document.getElementById('modal-secondary-btn'),
    closeBtn: document.getElementById('modal-close'),

    open(config) {
        if (!this.container) return;
        this.title.innerHTML = config.title;
        this.body.innerHTML = config.body;
        
        if (config.footer) {
            this.primaryBtn.textContent = config.footer.primary.text;
            this.primaryBtn.onclick = config.footer.primary.action;
            this.secondaryBtn.textContent = config.footer.secondary.text;
            this.secondaryBtn.onclick = config.footer.secondary.action;
            this.footer.classList.remove('hidden');
        } else {
            this.footer.classList.add('hidden');
        }

        this.container.classList.remove('hidden');
        this.container.addEventListener('click', this.handleBackdropClick);
        this.closeBtn.addEventListener('click', this.close);
    },

    close() {
        if (!Modal.container) return;
        Modal.container.classList.add('hidden');
        Modal.container.removeEventListener('click', Modal.handleBackdropClick);
        Modal.closeBtn.removeEventListener('click', Modal.close);
    },
    
    handleBackdropClick(event) {
        if (event.target === Modal.container) Modal.close();
    }
};

// --- Page Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // quotations.html에 해당하는 로직을 실행합니다.
    if (document.querySelector('header h2.text-xl').textContent.includes('견적')) {
        initQuotationPage();
    }
});


function initQuotationPage() {
    const quotationContentArea = document.querySelector('main > .card > div');
    const newQuotationBtn = document.querySelector('header .btn-primary');
    let quotationsData = [];

    // --- Data Rendering ---
    const renderQuotations = (quotations) => {
        quotationContentArea.innerHTML = '';
        if (!quotations || quotations.length === 0) {
            quotationContentArea.innerHTML = `<p class="subtle-text">등록된 견적이 없습니다.</p>`;
            return;
        }

        const table = document.createElement('table');
        table.className = 'min-w-full text-sm';
        table.innerHTML = `
            <thead class="text-left subtle-text">
                <tr>
                    <th class="p-4 font-semibold">견적번호</th>
                    <th class="p-4 font-semibold">가계약명</th>
                    <th class="p-4 font-semibold">수신처</th>
                    <th class="p-4 font-semibold text-right">견적금액</th>
                    <th class="p-4 font-semibold">액션</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        quotations.forEach(quote => {
            const row = document.createElement('tr');
            row.className = 'border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50';
            row.innerHTML = `
                <td class="p-4">${quote.quotationNumber}</td>
                <td class="p-4">${quote.provisionalContractName}</td>
                <td class="p-4">${quote.recipientName}</td>
                <td class="p-4 text-right">${formatNumberWithCommas(quote.quotationAmount)} 원</td>
                <td class="p-4 space-x-4">
                    <button data-id="${quote.id}" class="edit-btn text-green-500 hover:underline text-xs font-semibold">수정</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        quotationContentArea.appendChild(table);
        attachEventListeners();
    };

    // --- Modal Forms ---
    const getQuotationFormHTML = (quote = {}) => {
        return `
            <form id="quotation-form" class="space-y-4">
                <input type="hidden" name="id" value="${quote.id || ''}">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label>견적번호</label><input type="text" name="quotationNumber" class="form-input" value="${quote.quotationNumber || ''}"></div>
                    <div><label>가계약명</label><input type="text" name="provisionalContractName" class="form-input" value="${quote.provisionalContractName || ''}" required></div>
                    <div class="md:col-span-2"><label>견적내용</label><input type="text" name="quotationContent" class="form-input" value="${quote.quotationContent || ''}"></div>
                    <div><label>견적금액</label><input type="number" name="quotationAmount" class="form-input" value="${quote.quotationAmount || ''}" required></div>
                    <div><label>수신처명</label><input type="text" name="recipientName" class="form-input" value="${quote.recipientName || ''}"></div>
                    <div><label>수신처 연락처</label><input type="text" name="recipientContact" class="form-input" value="${quote.recipientContact || ''}"></div>
                    <div><label>수신처 이메일</label><input type="email" name="recipientEmail" class="form-input" value="${quote.recipientEmail || ''}"></div>
                    <div class="md:col-span-2"><label>비고</label><textarea name="remarks" class="form-input" rows="3">${quote.remarks || ''}</textarea></div>
                </div>
            </form>
        `;
    };

    // --- Event Handlers ---
    const handleNewQuotation = () => {
        Modal.open({
            title: '신규 견적 작성',
            body: getQuotationFormHTML(),
            footer: {
                primary: { text: '저장', action: handleSaveQuotation },
                secondary: { text: '취소', action: Modal.close }
            }
        });
    };

    const handleEditQuotation = (quoteId) => {
        const quote = quotationsData.find(q => q.id === quoteId);
        Modal.open({
            title: '견적 정보 수정',
            body: getQuotationFormHTML(quote),
            footer: {
                primary: { text: '수정 완료', action: handleSaveQuotation },
                secondary: { text: '취소', action: Modal.close }
            }
        });
    };

    const handleSaveQuotation = async () => {
        const form = document.getElementById('quotation-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const quoteId = data.id;

        // 금액은 숫자로 변환
        data.quotationAmount = parseInt(data.quotationAmount, 10);

        try {
            if (quoteId) {
                await apiClient.updateQuotation(quoteId, data);
            } else {
                await apiClient.createQuotation(data);
            }
            Modal.close();
            loadQuotations(); // 목록 새로고침
        } catch (error) {
            alert('저장에 실패했습니다: ' + error.message);
        }
    };
    
    // --- Main Logic ---
    const loadQuotations = async () => {
        try {
            quotationsData = await apiClient.getQuotations();
            renderQuotations(quotationsData);
        } catch (error) {
            console.error('Failed to load quotations:', error);
            quotationContentArea.innerHTML = `<p class="text-red-500">데이터를 불러오는데 실패했습니다.</p>`;
        }
    };
    
    const attachEventListeners = () => {
        newQuotationBtn.onclick = handleNewQuotation;
        document.querySelectorAll('.edit-btn').forEach(btn => btn.onclick = () => handleEditQuotation(parseInt(btn.dataset.id)));
    };

    loadQuotations();
}
