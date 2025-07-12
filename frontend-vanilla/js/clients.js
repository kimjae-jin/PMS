import { apiClient } from './api_client.js';

// --- Modal Helper Functions ---
// 모달을 제어하는 전역 헬퍼 객체를 정의합니다.
const Modal = {
    container: document.getElementById('modal-container'),
    card: document.getElementById('modal-card'),
    title: document.getElementById('modal-title'),
    body: document.getElementById('modal-body'),
    footer: document.getElementById('modal-footer'),
    closeBtn: document.getElementById('modal-close'),

    open(titleContent, bodyContent) {
        this.title.innerHTML = titleContent;
        this.body.innerHTML = bodyContent;
        this.container.classList.remove('hidden');
        // 모달이 열릴 때 바깥 영역 클릭 시 닫히도록 이벤트 리스너 추가
        this.container.addEventListener('click', this.handleBackdropClick);
        this.closeBtn.addEventListener('click', this.close);
    },

    close() {
        Modal.container.classList.add('hidden');
        Modal.title.innerHTML = '';
        Modal.body.innerHTML = '';
        // 닫힐 때 이벤트 리스너 제거
        Modal.container.removeEventListener('click', Modal.handleBackdropClick);
        Modal.closeBtn.removeEventListener('click', Modal.close);
    },
    
    // 모달 카드 바깥(배경)을 클릭했을 때만 닫히도록 하는 핸들러
    handleBackdropClick(event) {
        if (event.target === Modal.container) {
            Modal.close();
        }
    }
};


// --- Page Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // 페이지 경로와 상관없이 clients.html 이면 목록 페이지 로직을 실행합니다.
    if (document.querySelector('#client-list-body')) {
        initListPage();
    }
});


function initListPage() {
    const clientListBody = document.getElementById('client-list-body');
    const loadingIndicator = document.getElementById('loading-indicator');
    let clientsData = []; // API로부터 받은 데이터를 저장할 배열

    // 상세 정보 모달을 띄우는 함수
    const showClientDetails = (clientId) => {
        const client = clientsData.find(c => c.id === clientId);
        if (!client) return;

        const title = `<i data-lucide="building-2" class="w-5 h-5 mr-2"></i> ${client.clientName}`;
        const body = `
            <div class="space-y-4">
                <div>
                    <label class="text-sm subtle-text">상호명</label>
                    <p>${client.clientName}</p>
                </div>
                <div>
                    <label class="text-sm subtle-text">사업자번호</label>
                    <p>${client.businessRegistrationNumber || '-'}</p>
                </div>
            </div>
        `;
        Modal.open(title, body);
        lucide.createIcons(); // 모달 내부에 새로 생긴 아이콘을 렌더링
    };


    const renderClients = (clients) => {
        clientListBody.innerHTML = ''; 
        if (!clients || clients.length === 0) {
            clientListBody.innerHTML = `<tr><td colspan="3" class="text-center py-10 subtle-text">등록된 관계사가 없습니다.</td></tr>`;
            return;
        }

        clients.forEach(client => {
            const row = document.createElement('tr');
            row.className = 'border-t border-gray-200 dark:border-gray-700';
            row.innerHTML = `
                <td class="p-4">${client.clientName}</td>
                <td class="p-4">${client.businessRegistrationNumber || '-'}</td>
                <td class="p-4">
                    <button data-id="${client.id}" class="details-btn text-blue-500 hover:underline text-xs font-semibold">상세보기</button>
                </td>
            `;
            clientListBody.appendChild(row);
        });
        
        // '상세보기' 버튼에 이벤트 리스너 추가
        document.querySelectorAll('.details-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const clientId = parseInt(event.currentTarget.dataset.id, 10);
                showClientDetails(clientId);
            });
        });
    };

    const loadClients = async () => {
        try {
            clientsData = await apiClient.getClients(); // 데이터를 전역 변수에 저장
            renderClients(clientsData);
        } catch (error) {
            console.error('Failed to load clients:', error);
            clientListBody.innerHTML = `<tr><td colspan="3" class="text-center py-10 text-red-500">데이터를 불러오는데 실패했습니다.</td></tr>`;
        } finally {
            loadingIndicator.style.display = 'none';
        }
    };

    loadClients();
}
