import { apiClient } from './api_client.js';
import { formatDate } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const path = window.location.pathname;

    if (path.includes('clients.html')) {
        initListPage();
    } else if (path.includes('client_detail.html')) {
        initDetailPage();
    }
});

function initListPage() {
    const clientListContainer = document.getElementById('client-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    const searchInput = document.getElementById('search-input');
    let allClients = [];

    const renderClients = (clients) => {
        clientListContainer.innerHTML = '';
        if (clients.length === 0) {
            clientListContainer.innerHTML = `<tr><td colspan="6" class="text-center text-gray-400 py-10">거래처가 없습니다.</td></tr>`;
            return;
        }

        clients.forEach(client => {
            const row = `
                <tr class="border-b border-gray-700 hover:bg-gray-800/50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">${client.clientName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${client.businessRegistrationNumber || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${client.businessContactName || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${client.contactNumber || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${formatDate(client.createdAt)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="client_detail.html?id=${client.id}" class="text-blue-400 hover:text-blue-300">상세보기</a>
                    </td>
                </tr>
            `;
            clientListContainer.insertAdjacentHTML('beforeend', row);
        });
    };

    const filterClients = () => {
        const searchTerm = searchInput.value.toLowerCase();
        if (!searchTerm) {
            renderClients(allClients);
            return;
        }
        const filtered = allClients.filter(c => 
            c.clientName.toLowerCase().includes(searchTerm) ||
            (c.businessContactName && c.businessContactName.toLowerCase().includes(searchTerm)) ||
            (c.contactNumber && c.contactNumber.includes(searchTerm))
        );
        renderClients(filtered);
    };

    const loadClients = async () => {
        try {
            allClients = await apiClient.getClients();
            renderClients(allClients);
        } catch (error) {
            console.error('Failed to load clients:', error);
            clientListContainer.innerHTML = `<tr><td colspan="6" class="text-center text-red-400 py-10">거래처를 불러오는데 실패했습니다.</td></tr>`;
        } finally {
            loadingIndicator.style.display = 'none';
        }
    };

    searchInput.addEventListener('input', filterClients);
    loadClients();
}

function initDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('id');
    const isNew = !clientId;

    const loadingIndicator = document.getElementById('loading-indicator');
    const clientForm = document.getElementById('client-form');
    const pageTitle = document.getElementById('page-title');
    const deleteBtn = document.getElementById('delete-btn');
    
    const populateForm = (client) => {
        for (const key in client) {
            if (clientForm.elements[key]) {
                clientForm.elements[key].value = client[key] || '';
            }
        }
    };

    const loadClient = async () => {
        if (isNew) {
            pageTitle.textContent = '신규 거래처 등록';
            loadingIndicator.style.display = 'none';
            clientForm.classList.remove('hidden');
        } else {
            try {
                const client = await apiClient.getClientById(clientId);
                if (client) {
                    populateForm(client);
                    pageTitle.textContent = `거래처 정보 수정: ${client.clientName}`;
                    deleteBtn.classList.remove('hidden');
                } else {
                    throw new Error('Client not found');
                }
            } catch (error) {
                console.error('Failed to load client:', error);
                clientForm.innerHTML = `<p class="text-red-400 text-center">거래처 정보를 불러오는데 실패했습니다.</p>`;
            } finally {
                loadingIndicator.style.display = 'none';
                clientForm.classList.remove('hidden');
            }
        }
    };

    clientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(clientForm);
        const data = Object.fromEntries(formData.entries());
        
        try {
            if (isNew) {
                await apiClient.createClient(data);
                alert('거래처가 성공적으로 등록되었습니다.');
            } else {
                await apiClient.updateClient(clientId, data);
                alert('거래처 정보가 성공적으로 수정되었습니다.');
            }
            window.location.href = 'clients.html';
        } catch(error) {
            console.error('Save failed:', error);
            alert('저장에 실패했습니다.');
        }
    });
    
    deleteBtn.addEventListener('click', async () => {
        if(confirm('정말로 이 거래처를 삭제하시겠습니까? 연결된 프로젝트가 있을 경우 문제가 발생할 수 있습니다.')) {
            try {
                await apiClient.deleteClient(clientId);
                alert('거래처가 삭제되었습니다.');
                window.location.href = 'clients.html';
            } catch(error) {
                console.error('Delete failed:', error);
                alert('삭제에 실패했습니다.');
            }
        }
    });

    loadClient();
}
