import { apiClient } from './api_client.js';

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const projectListContainer = document.getElementById('project-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const sortOrder = document.getElementById('sort-order');

    let allProjects = [];

    const statusMap = {
        IN_PROGRESS: { text: '진행중', color: 'yellow' },
        ON_HOLD: { text: '중지중', color: 'red' },
        COMPLETED: { text: '완료', color: 'green' }
    };

    const renderProjects = (projects) => {
        projectListContainer.innerHTML = '';
        if (projects.length === 0) {
            projectListContainer.innerHTML = `<p class="text-gray-400 md:col-span-2 lg:col-span-3 text-center">표시할 프로젝트가 없습니다.</p>`;
            return;
        }

        projects.forEach(project => {
            const statusInfo = statusMap[project.status] || { text: project.status, color: 'gray' };
            const isStopped = project.status === 'ON_HOLD';

            const card = `
                <a href="project_detail.html?id=${project.projectId}" class="block bg-gray-800/60 p-6 rounded-lg border border-gray-700/80 hover:border-blue-500 hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1 group">
                    <div class="flex justify-between items-start">
                        <h3 class="text-lg font-bold text-white mb-2 ${isStopped ? 'text-red-400 italic' : ''}">${project.name}</h3>
                        <span class="status-badge bg-${statusInfo.color}-200">${statusInfo.text}</span>
                    </div>
                    <p class="text-sm text-gray-400 mb-4">${project.projectId}</p>
                    <div class="space-y-3 text-sm">
                        <div class="flex items-center text-gray-300">
                            <i data-lucide="user-circle" class="w-4 h-4 mr-2 text-gray-500"></i>
                            <span>클라이언트: ${project.clientName || '미지정'}</span>
                        </div>
                        <div class="flex items-center text-gray-300">
                            <i data-lucide="calendar" class="w-4 h-4 mr-2 text-gray-500"></i>
                            <span>업데이트: ${new Date(project.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-700 flex justify-end">
                         <i data-lucide="arrow-right" class="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors"></i>
                    </div>
                </a>
            `;
            projectListContainer.insertAdjacentHTML('beforeend', card);
        });
        lucide.createIcons();
    };

    const filterAndSortProjects = () => {
        let filtered = [...allProjects];

        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
        }

        const status = statusFilter.value;
        if (status !== 'ALL') {
            filtered = filtered.filter(p => p.status === status);
        }

        const [key, order] = sortOrder.value.split('_');
        filtered.sort((a, b) => {
            let valA, valB;
            if (key === 'name') {
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
            } else { // date
                valA = new Date(a[key]);
                valB = new Date(b[key]);
            }

            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        });

        renderProjects(filtered);
    };
    
    const loadProjects = async () => {
        try {
            allProjects = await apiClient.getProjects();
            filterAndSortProjects();
        } catch (error) {
            console.error('Failed to load projects:', error);
            projectListContainer.innerHTML = '<p class="text-red-400 md:col-span-2 lg:col-span-3 text-center">프로젝트를 불러오는데 실패했습니다.</p>';
        } finally {
            loadingIndicator.style.display = 'none';
        }
    };
    
    searchInput.addEventListener('input', filterAndSortProjects);
    statusFilter.addEventListener('change', filterAndSortProjects);
    sortOrder.addEventListener('change', filterAndSortProjects);

    document.getElementById('new-project-btn').addEventListener('click', () => {
        alert("신규 프로젝트 생성 기능은 아직 구현되지 않았습니다.");
    });

    loadProjects();
});
