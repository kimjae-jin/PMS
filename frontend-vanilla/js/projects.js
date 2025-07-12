import { apiClient } from './api_client.js';
import { Modal } from './app.js';
import { formatNumberOnInput, formatDateOnInput, formatNumberWithCommas } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#project-list-body')) {
        initProjectListPage();
    }
});

function initProjectListPage() {
    const projectListBody = document.getElementById('project-list-body');
    const loadingIndicator = document.getElementById('loading-indicator');
    const newProjectBtn = document.querySelector('#new-project-btn');
    let projectsData = [];
    let clientsData = [];
    let employeesData = [];

    // --- Data Rendering ---
    const renderProjects = (projects) => {
        projectListBody.innerHTML = '';
        if (!projects || projects.length === 0) {
            projectListBody.innerHTML = `<tr><td colspan="5" class="text-center py-10 subtle-text">등록된 프로젝트가 없습니다.</td></tr>`;
            return;
        }
        projects.forEach(project => {
            const row = document.createElement('tr');
            row.className = 'border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50';
            row.innerHTML = `
                <td class="p-4"><a href="#" data-id="${project.id}" class="edit-btn font-bold hover:underline">${project.projectName}</a><p class="text-xs subtle-text">${project.projectId}</p></td>
                <td class="p-4">${project.pmName || '-'}</td>
                <td class="p-4"><span class="status-badge status-${project.status}">${project.status}</span></td>
                <td class="p-4">${new Date(project.updatedAt).toLocaleDateString()}</td>
                <td class="p-4"><button data-id="${project.id}" class="edit-btn text-green-500 hover:underline text-xs font-semibold">관리</button></td>
            `;
            projectListBody.appendChild(row);
        });
        attachEventListeners();
    };

    // --- Modal Forms & Logic ---
    const getProjectFormHTML = (project = {}, contract = {}, participants = []) => {
        const clientOptions = clientsData.map(c => `<option value="${c.id}" ${project.clientId == c.id ? 'selected' : ''}>${c.clientName}</option>`).join('');
        const categoryOptions = ['PQ', '공공', '공공(하)', '민간'].map(c => `<option value="${c}" ${project.projectCategory == c ? 'selected' : ''}>${c}</option>`).join('');
        const statusOptions = ['진행중', '중지중', '보류중', '완료'].map(s => `<option value="${s}" ${project.status == s ? 'selected' : ''}>${s}</option>`).join('');
        
        return `
            <form id="project-form" class="space-y-8">
                <input type="hidden" name="id" value="${project.id || ''}">
                <section>
                    <h3 class="text-lg font-semibold mb-4 border-b border-gray-600 pb-2">기본 정보</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                        <div><label>관계사</label><div class="flex gap-2"><select name="clientId" class="form-select flex-grow" required>${clientOptions}</select><button type="button" class="btn-primary text-sm px-3">[+]</button></div></div>
                        <div><label>구분</label><select name="projectCategory" class="form-select">${categoryOptions}</select></div>
                        <div class="md:col-span-2"><label>계약명</label><input type="text" name="projectName" class="form-input" value="${project.projectName || ''}" required></div>
                        <div><label>PM 담당자명</label><input type="text" name="pmName" class="form-input" value="${project.pmName || ''}"></div>
                        <div class="md:col-span-2"><label>과업 위치</label><input type="text" name="projectLocation" class="form-input" value="${project.projectLocation || ''}"></div>
                        <div><label>시설물 종류</label><input type="text" name="facilityType" class="form-input" value="${project.facilityType || ''}"></div>
                        <div><label>과업 상태</label><select name="status" class="form-select">${statusOptions}</select></div>
                        <div class="md:col-span-3"><label>요약 개요</label><input type="text" name="summary" class="form-input" value="${project.summary || ''}"></div>
                    </div>
                </section>
                <section>
                    <h3 class="text-lg font-semibold mb-4 border-b border-gray-600 pb-2">최초 계약 정보</h3>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">
                        <div><label>계약번호</label><input type="text" name="contractId" class="form-input" value="${contract.contractId || ''}"></div>
                        <div><label>계약일</label><input type="text" name="contractDate" class="form-input date-input" value="${contract.contractDate || ''}" placeholder="yymmdd"></div>
                        <div><label>착수일</label><input type="text" name="startDate" class="form-input date-input" value="${contract.startDate || ''}" placeholder="yymmdd"></div>
                        <div><label>종료 예정일</label><input type="text" name="endDate" class="form-input date-input" value="${contract.endDate || ''}" placeholder="yymmdd"></div>
                        <div class="md:col-span-2"><label>총 계약금액</label><input type="text" name="totalAmount" class="form-input text-right number-input" value="${contract.totalAmount || ''}"></div>
                        <div class="md:col-span-2"><label>총 지분금액</label><input type="text" name="totalEquityAmount" class="form-input text-right number-input" value="${contract.totalEquityAmount || ''}"></div>
                    </div>
                </section>
                <section>
                    <div class="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                        <h3 class="text-lg font-semibold">참여 기술인</h3>
                        <button type="button" id="add-participant-btn" class="btn-primary text-sm px-3 py-1">[+ 기술인 추가]</button>
                    </div>
                    <div id="participant-list" class="space-y-2"></div>
                </section>
            </form>
        `;
    };
    
    // --- Event Handlers & Main Logic ---
    const handleNewProject = () => {
        Modal.open({
            title: '신규 프로젝트 등록',
            body: getProjectFormHTML(),
            footer: {
                primary: { text: '저장', action: handleSaveProject },
                secondary: { text: '취소', action: Modal.close }
            }
        });
        attachFormInputListeners();
    };
    
    const handleEditProject = (projectId) => {
        const project = projectsData.find(p => p.id === projectId);
        Modal.open({
            title: '프로젝트 정보 수정',
            body: getProjectFormHTML(project),
            footer: {
                primary: { text: '수정 완료', action: handleSaveProject },
                secondary: { text: '취소', action: Modal.close }
            }
        });
        attachFormInputListeners();
    };

    const handleSaveProject = async () => {
        const form = document.getElementById('project-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const projectId = data.id;

        try {
            if (projectId) {
                await apiClient.updateProject(projectId, data);
            } else {
                await apiClient.createProject(data);
            }
            Modal.close();
            loadData();
        } catch (error) {
            alert('저장에 실패했습니다: ' + error.message);
        }
    };

    const loadData = async () => {
        try {
            const [projects, clients, employees] = await Promise.all([
                apiClient.getProjects(), 
                apiClient.getClients(),
                apiClient.getEmployees()
            ]);
            projectsData = projects;
            clientsData = clients;
            employeesData = employees.filter(e => e.status === '재직중');
            renderProjects(projectsData);
        } catch (error) {
            console.error('Failed to load data:', error);
            projectListBody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-red-500">데이터를 불러오는데 실패했습니다.</td></tr>`;
        } finally {
            if(loadingIndicator) loadingIndicator.style.display = 'none';
        }
    };
    
    const attachEventListeners = () => {
        newProjectBtn.onclick = handleNewProject;
        document.querySelectorAll('.edit-btn').forEach(btn => btn.onclick = () => handleEditProject(parseInt(btn.dataset.id)));
    };

    const attachFormInputListeners = () => {
        document.querySelectorAll('.number-input').forEach(formatNumberOnInput);
        document.querySelectorAll('.date-input').forEach(formatDateOnInput);
    };

    loadData();
}
