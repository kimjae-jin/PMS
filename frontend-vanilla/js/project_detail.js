import { apiClient } from './api_client.js';
import { debounce, formatNumberWithCommas, formatDate } from './utils.js';
import { generateContractPDF, generateStartCertPDF, generateCompleteCertPDF, generateInvoicePDF } from './pdf_generator.js';

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    const loadingIndicator = document.getElementById('loading-indicator');
    const projectContent = document.getElementById('project-content');
    const saveStatus = document.getElementById('save-status');
    
    const projectForm = document.getElementById('project-form');
    const contractForm = document.getElementById('contract-form');
    const clientSelect = document.getElementById('clientId');

    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalCloseBtn = document.getElementById('modal-close');

    let currentProjectData = {};
    let currentContract = {};
    let allClients = [];

    if (!projectId) {
        projectContent.innerHTML = '<p class="text-red-400 text-center">프로젝트 ID가 필요합니다.</p>';
        loadingIndicator.style.display = 'none';
        projectContent.style.display = 'block';
        return;
    }

    const setSaveStatus = (status) => {
        const icon = saveStatus.querySelector('i');
        const text = saveStatus.querySelector('span');
        const statusClasses = {
            saving: { icon: 'upload-cloud', text: '저장 중...' },
            saved: { icon: 'check-check', text: '모든 변경사항이 저장되었습니다.' },
            error: { icon: 'alert-circle', text: '저장 실패.' },
            default: { icon: 'cloud', text: '자동 저장 활성화' }
        };
        const currentStatus = statusClasses[status] || statusClasses.default;
        icon.setAttribute('data-lucide', currentStatus.icon);
        text.textContent = currentStatus.text;
        lucide.createIcons();
    };

    const populateForm = (form, data) => {
        for (const key in data) {
            const element = form.elements[key];
            if (element) {
                if (element.type === 'date') {
                    element.value = data[key] ? new Date(data[key]).toISOString().split('T')[0] : '';
                } else if (element.tagName === 'SELECT' && key === 'clientId'){
                     element.value = data.client?.id || '';
                } else {
                    element.value = data[key] || '';
                }
            }
        }
    };
    
    const loadInitialData = async () => {
        try {
            const [project, clients] = await Promise.all([
                apiClient.getProjectById(projectId),
                apiClient.getClients()
            ]);

            currentProjectData = project;
            allClients = clients;
            
            populateClientDropdown();

            currentContract = await apiClient.getActiveContractForProject(projectId) || {};
            
            document.getElementById('project-name-header').textContent = project.name;
            document.getElementById('project-id-header').textContent = project.projectId;

            populateForm(projectForm, project);
            populateForm(contractForm, project);

            if (currentContract.id) {
                const [invoices, participants] = await Promise.all([
                    apiClient.getInvoicesForContract(currentContract.id),
                    apiClient.getParticipantsForProject(projectId)
                ]);
                renderInvoices(invoices);
                renderParticipants(participants);
            } else {
                 renderInvoices([]);
                 renderParticipants([]);
                 document.getElementById('add-invoice-btn').disabled = true;
            }

            loadingIndicator.style.display = 'none';
            projectContent.classList.remove('hidden');
        } catch (error) {
            console.error('Failed to load project data:', error);
            loadingIndicator.innerHTML = '<p class="text-red-400 text-center">데이터 로딩에 실패했습니다.</p>';
        }
    };

    const populateClientDropdown = () => {
        clientSelect.innerHTML = '<option value="">거래처 선택</option>';
        allClients.forEach(c => {
            const option = new Option(c.clientName, c.id);
            clientSelect.add(option);
        });
    };

    const handleFormChange = debounce(async (form) => {
        setSaveStatus('saving');
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            await apiClient.updateProject(projectId, data);
            setSaveStatus('saved');
        } catch (error) {
            console.error("Auto-save failed:", error);
            setSaveStatus('error');
        }
    }, 1500);

    projectForm.addEventListener('input', () => handleFormChange(projectForm));
    contractForm.addEventListener('input', () => handleFormChange(projectForm));

    const openModal = () => {
        modalBackdrop.classList.remove('hidden');
        modalContainer.classList.remove('hidden');
    };

    const closeModal = () => {
        modalBackdrop.classList.add('hidden');
        modalContainer.classList.add('hidden');
        modalBody.innerHTML = '';
    };

    modalCloseBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    const renderInvoices = (invoices) => {
        const container = document.getElementById('invoice-list');
        container.innerHTML = '';
        if (invoices.length === 0) {
            container.innerHTML = `<p class="text-gray-400 text-center py-4">등록된 청구 내역이 없습니다.</p>`;
            return;
        }
        invoices.forEach(invoice => {
            const el = document.createElement('div');
            el.className = 'p-4 bg-gray-700/50 rounded-lg border border-gray-600/50 flex justify-between items-center';
            el.innerHTML = `
                <div>
                    <p class="font-semibold text-white">${invoice.invoiceType} - ${invoice.invoiceContent}</p>
                    <p class="text-sm text-gray-300">청구일: ${formatDate(invoice.invoiceDate)} | 금액: ${formatNumberWithCommas(invoice.invoiceAmount)}원</p>
                    <p class="text-xs text-gray-400">${invoice.paymentDate ? `입금 완료 (${formatDate(invoice.paymentDate)})` : '입금 대기'}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button class="edit-invoice-btn p-2 hover:bg-gray-600 rounded-md" data-id="${invoice.id}"><i data-lucide="edit" class="w-4 h-4"></i></button>
                    <button class="delete-invoice-btn p-2 hover:bg-gray-600 rounded-md" data-id="${invoice.id}"><i data-lucide="trash-2" class="w-4 h-4 text-red-400"></i></button>
                </div>
            `;
            container.appendChild(el);
        });
        lucide.createIcons();
    };

    const renderParticipants = (participants) => {
        const container = document.getElementById('participant-list');
        container.innerHTML = '';
        if (participants.length === 0) {
            container.innerHTML = `<p class="text-gray-400 text-center py-4">등록된 참여자가 없습니다.</p>`;
            return;
        }
        participants.forEach(p => {
            const el = document.createElement('div');
            el.className = 'p-3 bg-gray-700/50 rounded-lg border border-gray-600/50 flex justify-between items-center';
            el.innerHTML = `
                <div>
                    <p class="font-semibold text-white">${p.employeeId} <span class="text-sm font-normal text-gray-400">(${p.position})</span></p>
                    <p class="text-xs text-gray-300">${p.responsibilityLevel} - ${p.jobField}</p>
                </div>
                 <div class="flex items-center gap-2">
                    <button class="edit-participant-btn p-2 hover:bg-gray-600 rounded-md" data-id="${p.id}"><i data-lucide="edit" class="w-4 h-4"></i></button>
                    <button class="delete-participant-btn p-2 hover:bg-gray-600 rounded-md" data-id="${p.id}"><i data-lucide="trash-2" class="w-4 h-4 text-red-400"></i></button>
                </div>
            `;
            container.appendChild(el);
        });
        lucide.createIcons();
    };

    const showInvoiceForm = (invoice = {}) => {
        modalTitle.textContent = invoice.id ? '청구 내역 수정' : '신규 청구 등록';
        modalBody.innerHTML = `
            <form id="modal-form" class="space-y-4">
                <input type="hidden" name="id" value="${invoice.id || ''}">
                <div>
                    <label for="invoiceType">청구 구분</label>
                    <select id="invoiceType" name="invoiceType" class="form-select">
                        <option>선금 신청</option><option>선금 청구</option><option>기성 신청</option><option>기성 청구</option><option>완료금 청구</option>
                    </select>
                </div>
                <div><label for="invoiceContent">청구 내용</label><input type="text" id="invoiceContent" name="invoiceContent" class="form-input" required></div>
                <div><label for="invoiceAmount">청구액</label><input type="number" id="invoiceAmount" name="invoiceAmount" class="form-input" required></div>
                <div><label for="invoiceDate">청구일</label><input type="date" id="invoiceDate" name="invoiceDate" class="form-input" required></div>
                <div class="flex justify-end pt-4"><button type="submit" class="btn-primary">저장</button></div>
            </form>
        `;
        const form = document.getElementById('modal-form');
        populateForm(form, invoice);
        form.elements.invoiceType.value = invoice.invoiceType || '기성 청구';
        openModal();

        form.addEventListener('submit', async e => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            if (data.id) {
                await apiClient.updateInvoice(data.id, data);
            } else {
                await apiClient.createInvoice(currentContract.id, data);
            }
            const updatedInvoices = await apiClient.getInvoicesForContract(currentContract.id);
            renderInvoices(updatedInvoices);
            closeModal();
        });
    };
    
    const showParticipantForm = (p = {}) => {
        modalTitle.textContent = p.id ? '참여자 정보 수정' : '신규 참여자 등록';
        modalBody.innerHTML = `
            <form id="modal-form" class="space-y-4">
                <input type="hidden" name="id" value="${p.id || ''}">
                <div><label for="employeeId">이름/ID</label><input type="text" id="employeeId" name="employeeId" class="form-input" required></div>
                <div><label for="position">직책</label><input type="text" id="position" name="position" class="form-input" required></div>
                <div><label for="jobField">직무 분야</label><input type="text" id="jobField" name="jobField" class="form-input"></div>
                <div><label for="responsibilityLevel">책임 정도</label><input type="text" id="responsibilityLevel" name="responsibilityLevel" class="form-input"></div>
                <div><label for="responsibilities">담당 업무</label><textarea id="responsibilities" name="responsibilities" rows="2" class="form-textarea"></textarea></div>
                <div class="flex justify-end pt-4"><button type="submit" class="btn-primary">저장</button></div>
            </form>
        `;
        const form = document.getElementById('modal-form');
        populateForm(form, p);
        openModal();
        
        form.addEventListener('submit', async e => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            if (data.id) {
                await apiClient.updateParticipant(data.id, data);
            } else {
                await apiClient.createParticipant(projectId, data);
            }
            const updatedParticipants = await apiClient.getParticipantsForProject(projectId);
            renderParticipants(updatedParticipants);
            closeModal();
        });
    };
    
    document.getElementById('add-invoice-btn').addEventListener('click', () => showInvoiceForm());
    document.getElementById('add-participant-btn').addEventListener('click', () => showParticipantForm());

    document.getElementById('invoice-list').addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.edit-invoice-btn');
        const deleteBtn = e.target.closest('.delete-invoice-btn');

        if (editBtn) {
            const invoices = await apiClient.getInvoicesForContract(currentContract.id);
            const invoice = invoices.find(i => i.id == editBtn.dataset.id);
            showInvoiceForm(invoice);
        }
        if (deleteBtn) {
            if (confirm('정말로 이 청구 내역을 삭제하시겠습니까?')) {
                await apiClient.deleteInvoice(deleteBtn.dataset.id);
                const updatedInvoices = await apiClient.getInvoicesForContract(currentContract.id);
                renderInvoices(updatedInvoices);
            }
        }
    });
    
    document.getElementById('participant-list').addEventListener('click', async (e) => {
        const editBtn = e.target.closest('.edit-participant-btn');
        const deleteBtn = e.target.closest('.delete-participant-btn');
        if (editBtn) {
            const participants = await apiClient.getParticipantsForProject(projectId);
            const p = participants.find(i => i.id == editBtn.dataset.id);
            showParticipantForm(p);
        }
        if (deleteBtn) {
            if (confirm('정말로 이 참여자를 제외하시겠습니까?')) {
                await apiClient.deleteParticipant(deleteBtn.dataset.id);
                const updatedParticipants = await apiClient.getParticipantsForProject(projectId);
                renderParticipants(updatedParticipants);
            }
        }
    });

    document.getElementById('print-contract-btn').addEventListener('click', () => generateContractPDF({ ...currentProjectData, clientName: currentProjectData.client.clientName }));
    document.getElementById('print-start-cert-btn').addEventListener('click', () => generateStartCertPDF({ ...currentProjectData, clientName: currentProjectData.client.clientName }));
    document.getElementById('print-complete-cert-btn').addEventListener('click', () => generateCompleteCertPDF({ ...currentProjectData, clientName: currentProjectData.client.clientName }));

    loadInitialData();
});
