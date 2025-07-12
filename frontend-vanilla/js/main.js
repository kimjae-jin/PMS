import { apiClient } from './api_client.js';

document.addEventListener('DOMContentLoaded', () => {
    const projectListContainer = document.getElementById('project-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const sortOrder = document.getElementById('sort-order');

    let allProjects = [];

    const statusMap = {
        '진행중': { text: '진행중', color: 'yellow' },
        '중지중': { text: '중지중', color: 'red' },
        '완료': { text: '완료', color: 'green' }
    };

    const renderProjects = (projects) => {
        projectListContainer.innerHTML = '';
        if (projects.length === 0) {
            projectListContainer.innerHTML = `<p class="subtle-text md:col-span-2 xl:col-span-3 text-center">표시할 프로젝트가 없습니다.</p>`;
            return;
        }

        projects.forEach(project => {
            const statusInfo = statusMap[project.status] || { text: project.status, color: 'gray' };
            const isStopped = project.status === '중지중';

            const card = document.createElement('a');
            card.href = `project_detail.html?id=${project.projectId}`;
            card.className = 'block card p-5 hover:border-blue-500 transition-all duration-200 transform hover:-translate-y-1';
            
            card.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold pr-4 ${isStopped ? 'text-red-400 italic' : ''}">${project.projectName}</h3>
                    <span class="status-badge bg-${statusInfo.color}-200 flex-shrink-0">${statusInfo.text}</span>
                </div>
                <p class="text-sm subtle-text mb-4">${project.projectId}</p>
                <div class="space-y-2 text-sm">
                    <div class="flex items-center subtle-text">
                        <i data-lucide="user-circle" class="w-4 h-4 mr-2"></i>
                        <span>PM: ${project.pmName || '미지정'}</span>
                    </div>
                    <div class="flex items-center subtle-text">
                        <i data-lucide="calendar" class="w-4 h-4 mr-2"></i>
                        <span>최근 업데이트: ${new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                     <i data-lucide="arrow-right" class="w-5 h-5 subtle-text"></i>
                </div>
            `;
            projectListContainer.appendChild(card);
        });
        lucide.createIcons();
    };

    const filterAndSortProjects = () => {
        let filtered = [...allProjects];

        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(p => p.projectName.toLowerCase().includes(searchTerm));
        }

        const status = statusFilter.value;
        if (status !== 'ALL') {
            filtered = filtered.filter(p => p.status === status);
        }

        const [key, order] = sortOrder.value.split('_');
        filtered.sort((a, b) => {
            let valA, valB;
            if (key === 'name') {
                valA = a.projectName.toLowerCase();
                valB = b.projectName.toLowerCase();
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
            projectListContainer.innerHTML = '<p class="text-red-400 md:col-span-2 xl:col-span-3 text-center">프로젝트를 불러오는데 실패했습니다.</p>';
        } finally {
            loadingIndicator.style.display = 'none';
        }
    };
    
    searchInput.addEventListener('input', filterAndSortProjects);
    statusFilter.addEventListener('change', filterAndSortProjects);
    sortOrder.addEventListener('change', filterAndSortProjects);

    loadProjects();
});
