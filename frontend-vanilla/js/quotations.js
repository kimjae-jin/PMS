import { apiClient } from './api_client.js';
import { formatDate, formatNumberWithCommas } from './utils.js';
import { generateQuotationPDF } from './pdf_generator.js';


document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const path = window.location.pathname;

    if (path.includes('quotations.html')) {
        initListPage();
    } else if (path.includes('quotation_detail.html')) {
        initDetailPage();
    }
});

function initListPage() {
    const quotationListContainer = document.getElementById('quotation-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    const searchInput = document.getElementById('search-input');
    let allQuotations = [];

    const renderQuotations = (quotations) => {
        quotationListContainer.innerHTML = '';
        if (quotations.length === 0) {
            quotationListContainer.innerHTML = `<tr><td colspan="6" class="text-center text-gray-400 py-10">견적이 없습니다.</td></tr>`;
            return;
        }

        quotations.forEach(quote => {
            const row = `
                <tr class="border-b border-gray-700 hover:bg-gray-800/50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">${quote.quotationNumber}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${quote.provisionalContractName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${quote.recipientName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">${formatNumberWithCommas(quote.quotationAmount)} 원</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${formatDate(quote.createdAt)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="quotation_detail.html?id=${quote.id}" class="text-blue-400 hover:text-blue-300">상세보기</a>
                    </td>
                </tr>
            `;
            quotationListContainer.insertAdjacentHTML('beforeend', row);
        });
    };

    const filterQuotations = () => {
        const searchTerm = searchInput.value.toLowerCase();
        if (!searchTerm) {
            renderQuotations(allQuotations);
            return;
        }
        const filtered = allQuotations.filter(q => 
            q.provisionalContractName.toLowerCase().includes(searchTerm) ||
            q.recipientName.toLowerCase().includes(searchTerm)
        );
        renderQuotations(filtered);
    };

    const loadQuotations = async () => {
        try {
            allQuotations = await apiClient.getQuotations();
            renderQuotations(allQuotations);
        } catch (error) {
            console.error('Failed to load quotations:', error);
            quotationListContainer.innerHTML = `<tr><td colspan="6" class="text-center text-red-400 py-10">견적을 불러오는데 실패했습니다.</td></tr>`;
        } finally {
            loadingIndicator.style.display = 'none';
        }
    };

    searchInput.addEventListener('input', filterQuotations);
    loadQuotations();
}

function initDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const quotationId = urlParams.get('id');
    const isNew = !quotationId;
    let currentQuotation = {};

    const loadingIndicator = document.getElementById('loading-indicator');
    const quotationForm = document.getElementById('quotation-form');
    const pageTitle = document.getElementById('page-title');
    const deleteBtn = document.getElementById('delete-btn');
    const printPdfBtn = document.getElementById('print-pdf-btn');
    const quotationNumberDisplay = document.getElementById('quotation-number-display');
    
    const populateForm = (quote) => {
        for (const key in quote) {
            if (quotationForm.elements[key]) {
                 if (quotationForm.elements[key].type === 'date') {
                    quotationForm.elements[key].value = quote[key] ? new Date(quote[key]).toISOString().split('T')[0] : '';
                 } else if (key === 'quotationAmount') {
                     quotationForm.elements[key].value = formatNumberWithCommas(quote[key]);
                 }
                 else {
                    quotationForm.elements[key].value = quote[key] || '';
                 }
            }
        }
    };
    
    const amountInput = document.getElementById('quotationAmount');
    amountInput.addEventListener('input', (e) => {
        const value = e.target.value.replace(/,/g, '');
        if (!isNaN(value) && value.length > 0) {
            e.target.value = formatNumberWithCommas(value);
        }
    });

    const loadQuotation = async () => {
        if (isNew) {
            pageTitle.textContent = '신규 견적 작성';
            quotationForm.elements.createdAt.value = new Date().toISOString().split('T')[0];
        } else {
            try {
                const quote = await apiClient.getQuotationById(quotationId);
                if (quote) {
                    currentQuotation = quote;
                    populateForm(quote);
                    pageTitle.textContent = `견적 정보 수정`;
                    quotationNumberDisplay.textContent = quote.quotationNumber;
                    deleteBtn.classList.remove('hidden');
                    printPdfBtn.classList.remove('hidden');
                } else {
                    throw new Error('Quotation not found');
                }
            } catch (error) {
                console.error('Failed to load quotation:', error);
                quotationForm.innerHTML = `<p class="text-red-400 text-center">견적 정보를 불러오는데 실패했습니다.</p>`;
            }
        }
        loadingIndicator.style.display = 'none';
        quotationForm.classList.remove('hidden');
    };

    quotationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(quotationForm);
        const data = Object.fromEntries(formData.entries());
        data.quotationAmount = data.quotationAmount.replace(/,/g, '');
        
        try {
            if (isNew) {
                await apiClient.createQuotation(data);
                alert('견적이 성공적으로 등록되었습니다.');
            } else {
                await apiClient.updateQuotation(quotationId, data);
                alert('견적 정보가 성공적으로 수정되었습니다.');
            }
            window.location.href = 'quotations.html';
        } catch(error) {
            console.error('Save failed:', error);
            alert('저장에 실패했습니다.');
        }
    });
    
    deleteBtn.addEventListener('click', async () => {
        if(confirm('정말로 이 견적을 삭제하시겠습니까?')) {
            try {
                await apiClient.deleteQuotation(quotationId);
                alert('견적이 삭제되었습니다.');
                window.location.href = 'quotations.html';
            } catch(error) {
                console.error('Delete failed:', error);
                alert('삭제에 실패했습니다.');
            }
        }
    });

    printPdfBtn.addEventListener('click', () => {
        if(currentQuotation) {
            generateQuotationPDF(currentQuotation);
        }
    });

    loadQuotation();
}
