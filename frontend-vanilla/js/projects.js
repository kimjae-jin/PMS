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
    // projects.html에 해당하는 로직을 실행
    if (document.querySelector('#project-list-body')) {
        initProjectListPage();
    }
});


function initProjectListPage() {
    const projectListBody = document.getElementById('project-list-body');
    const loadingIndicator = document.getElementById('loading-indicator');
    const newProjectBtn = document.querySelector('header .btn-primary');
    let projectsData = [];

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
                <td class="p-4">
                    <a href="project_detail.html?id=${project.projectId}" class="font-bold hover:underline">${project.projectName}</a>
                    <p class="text-xs subtle-text">${project.projectId}</p>
                </td>
                <td class="p-4">${project.pmName || '-'}</td>
                <td class="p-4">
                    <span class="status-badge bg-${project.status === '진행중' ? 'yellow' : project.status === '완료' ? 'green' : 'red'}-200">${project.status}</span>
                </td>
                <td class="p-4">${new Date(project.updatedAt).toLocaleDateString()}</td>
                <td class="p-4 space-x-4">
                    <button data-id="${project.id}" class="edit-btn text-green-500 hover:underline text-xs font-semibold">수정</button>
                </td>
            `;
            projectListBody.appendChild(row);
        });
        attachEventListeners();
    };

    // --- Event Handlers ---
    const handleNewProject = () => {
        // 이 기능은 별도의 project_form.html 에서 처리하기로 했으므로, 해당 페이지로 이동시킵니다.
        // 현재는 project_form.html이 없으므로 alert으로 대체합니다.
        alert('신규 프로젝트 등록 페이지로 이동합니다. (현재는 구현되지 않음)');
        // window.location.href = 'project_form.html';
    };

    const handleEditProject = (projectId) => {
        const project = projectsData.find(p => p.id === projectId);
        if(project) {
            window.location.href = `project_detail.html?id=${project.projectId}`;
        }
    };
    
    // --- Main Logic ---
    const loadProjects = async () => {
        try {
            projectsData = await apiClient.getProjects();
            renderProjects(projectsData);
        } catch (error) {
            console.error('Failed to load projects:', error);
            projectListBody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-red-500">데이터를 불러오는데 실패했습니다.</td></tr>`;
        } finally {
            if(loadingIndicator) loadingIndicator.style.display = 'none';
        }
    };
    
    const attachEventListeners = () => {
        if(newProjectBtn) newProjectBtn.onclick = handleNewProject;
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = () => handleEditProject(parseInt(btn.dataset.id));
        });
    };

    loadProjects();
}
