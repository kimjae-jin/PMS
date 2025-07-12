import { apiClient } from './api_client.js';

// --- Modal Helper ---
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
    if (document.querySelector('#client-list-body')) {
        initListPage();
    }
});

function initListPage() {
    const clientListBody = document.getElementById('client-list-body');
    const loadingIndicator = document.getElementById('loading-indicator');
    const newClientBtn = document.querySelector('header .btn-primary');
    let clientsData = [];

    // --- Data Rendering ---
    const renderClients = (clients) => {
        clientListBody.innerHTML = ''; 
        if (!clients || clients.length === 0) {
            clientListBody.innerHTML = `<tr><td colspan="3" class="text-center py-10 subtle-text">등록된 관계사가 없습니다.</td></tr>`;
            return;
        }
        clients.forEach(client => {
            const row = document.createElement('tr');
            row.className = 'border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50';
            row.innerHTML = `
                <td class="p-4">${client.clientName}</td>
                <td class="p-4">${client.businessRegistrationNumber || '-'}</td>
                <td class="p-4 space-x-4">
                    <button data-id="${client.id}" class="details-btn text-blue-500 hover:underline text-xs font-semibold">상세보기</button>
                    <button data-id="${client.id}" class="edit-btn text-green-500 hover:underline text-xs font-semibold">수정</button>
                </td>
            `;
            clientListBody.appendChild(row);
        });
        attachEventListeners();
    };

    // --- Modal Forms ---
    const getClientFormHTML = (client = {}) => {
        return `
            <form id="client-form" class="space-y-4">
                <input type="hidden" name="id" value="${client.id || ''}">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label for="clientName">상호명</label><input type="text" name="clientName" class="form-input" value="${client.clientName || ''}" required></div>
                    <div><label for="businessRegistrationNumber">사업자번호</label><input type="text" name="businessRegistrationNumber" class="form-input" value="${client.businessRegistrationNumber || ''}"></div>
                    <div><label for="corporateRegistrationNumber">법인번호</label><input type="text" name="corporateRegistrationNumber" class="form-input" value="${client.corporateRegistrationNumber || ''}"></div>
                    <div><label for="contactNumber">대표 연락처</label><input type="text" name="contactNumber" class="form-input" value="${client.contactNumber || ''}"></div>
                    <div class="md:col-span-2"><label for="address">소재지</label><input type="text" name="address" class="form-input" value="${client.address || ''}"></div>
                </div>
                <div class="border-t border-gray-600 pt-4">
                    <h4 class="font-bold mb-2">업무 담당자</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label for="businessContactName">이름</label><input type="text" name="businessContactName" class="form-input" value="${client.businessContactName || ''}"></div>
                        <div><label for="businessContactEmail">이메일</label><input type="email" name="businessContactEmail" class="form-input" value="${client.businessContactEmail || ''}"></div>
                        <div><label for="businessContactPhone">연락처</label><input type="text" name="businessContactPhone" class="form-input" value="${client.businessContactPhone || ''}"></div>
                    </div>
                </div>
                <div class="border-t border-gray-600 pt-4">
                    <h4 class="font-bold mb-2">회계 담당자</h4>
                     <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label for="accountingContactName">이름</label><input type="text" name="accountingContactName" class="form-input" value="${client.accountingContactName || ''}"></div>
                        <div><label for="accountingContactEmail">이메일</label><input type="email" name="accountingContactEmail" class="form-input" value="${client.accountingContactEmail || ''}"></div>
                        <div><label for="accountingContactPhone">연락처</label><input type="text" name="accountingContactPhone" class="form-input" value="${client.accountingContactPhone || ''}"></div>
                    </div>
                </div>
                <div class="border-t border-gray-600 pt-4">
                    <label for="remarks">비고</label>
                    <textarea name="remarks" class="form-input" rows="3">${client.remarks || ''}</textarea>
                </div>
            </form>
        `;
    };

    // --- Event Handlers ---
    const handleNewClient = () => {
        Modal.open({
            title: '신규 관계사 등록',
            body: getClientFormHTML(),
            footer: {
                primary: { text: '저장', action: handleSaveClient },
                secondary: { text: '취소', action: Modal.close }
            }
        });
    };

    const handleViewDetails = (clientId) => {
        const client = clientsData.find(c => c.id === clientId);
        if (!client) return;
        const body = Object.entries(client).map(([key, value]) => `<p><strong>${key}:</strong> ${value || '-'}</p>`).join('');
        Modal.open({ title: `${client.clientName} 상세 정보`, body });
    };

    const handleEditClient = (clientId) => {
        const client = clientsData.find(c => c.id === clientId);
        Modal.open({
            title: '관계사 정보 수정',
            body: getClientFormHTML(client),
            footer: {
                primary: { text: '수정 완료', action: handleSaveClient },
                secondary: { text: '취소', action: Modal.close }
            }
        });
    };

    const handleSaveClient = async () => {
        const form = document.getElementById('client-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const clientId = data.id;

        try {
            if (clientId) {
                await apiClient.updateClient(clientId, data);
            } else {
                await apiClient.createClient(data);
            }
            Modal.close();
            loadClients(); // 목록 새로고침
        } catch (error) {
            alert('저장에 실패했습니다: ' + error.message);
        }
    };

    // --- Main Logic ---
    const loadClients = async () => {
        try {
            clientsData = await apiClient.getClients();
            renderClients(clientsData);
        } catch (error) {
            console.error('Failed to load clients:', error);
            clientListBody.innerHTML = `<tr><td colspan="3" class="text-center py-10 text-red-500">데이터를 불러오는데 실패했습니다.</td></tr>`;
        } finally {
            if(loadingIndicator) loadingIndicator.style.display = 'none';
        }
    };
    
    const attachEventListeners = () => {
        newClientBtn.onclick = handleNewClient;
        document.querySelectorAll('.details-btn').forEach(btn => btn.onclick = () => handleViewDetails(parseInt(btn.dataset.id)));
        document.querySelectorAll('.edit-btn').forEach(btn => btn.onclick = () => handleEditClient(parseInt(btn.dataset.id)));
    };

    loadClients();
}
