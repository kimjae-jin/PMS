import { apiClient } from './api_client.js';
import { formatNumberWithCommas, formatDateForInput } from './utils.js';
import { Modal } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    const loadingIndicator = document.getElementById('loading-indicator');
    const projectContent = document.getElementById('project-content');
    const projectNameHeader = document.getElementById('project-name-header');
    
    const projectForm = document.getElementById('project-form');
    const contractForm = document.getElementById('contract-form');
    const revisionsList = document.getElementById('revisions-list');
    
    if (!projectId) {
        document.body.innerHTML = `<div class="p-10 text-center text-red-400">오류: 프로젝트 ID가 URL에 포함되어야 합니다. (예: project_detail.html?id=P2025-001)</div>`;
        return;
    }

    const populateForm = (form, data) => {
        if (!data || !form) return;
        for (const key in data) {
            const element = form.elements[key];
            if (element) {
                if (element.type === 'date') {
                    element.value = formatDateForInput(data[key]);
                } else if (typeof data[key] === 'number' && !element.name.toLowerCase().includes('id')) {
                    element.value = formatNumberWithCommas(data[key]);
                } else {
                    element.value = data[key] || '';
                }
            }
        }
    };

    const renderRevisions = (revisions) => {
        revisionsList.innerHTML = '';
        if (!revisions || revisions.length === 0) {
            revisionsList.innerHTML = `<p class="text-center py-4 subtle-text">변경 이력이 없습니다.</p>`;
            return;
        }

        const table = document.createElement('table');
        table.className = 'min-w-full text-sm';
        table.innerHTML = `
            <thead class="text-left subtle-text">
                <tr>
                    <th class="p-2 font-semibold">차수</th>
                    <th class="p-2 font-semibold">변경계약일</th>
                    <th class="p-2 font-semibold text-right">변경 총 계약금액</th>
                    <th class="p-2 font-semibold text-right">변경 총 지분금액</th>
                    <th class="p-2 font-semibold">사유</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');
        revisions.forEach(rev => {
            const row = document.createElement('tr');
            row.className = 'border-t border-gray-200 dark:border-gray-700';
            row.innerHTML = `
                <td class="p-2">${rev.revisionNumber}차</td>
                <td class="p-2">${rev.revisionDate}</td>
                <td class="p-2 text-right">${formatNumberWithCommas(rev.revisedTotalAmount)}</td>
                <td class="p-2 text-right">${formatNumberWithCommas(rev.revisedTotalEquityAmount)}</td>
                <td class="p-2 truncate" title="${rev.changeReason}">${rev.changeReason}</td>
            `;
            tbody.appendChild(row);
        });
        revisionsList.appendChild(table);
    };

    const loadInitialData = async () => {
        try {
            const projectData = await apiClient.getProjectById(projectId);
            
            projectNameHeader.textContent = projectData.projectName;

            populateForm(projectForm, projectData);
            populateForm(contractForm, projectData.contract);

            renderRevisions(projectData.revisions);
            
            loadingIndicator.classList.add('hidden');
            projectContent.classList.remove('hidden');

        } catch (error) {
            console.error('Failed to load project data:', error);
            const errorContainer = loadingIndicator.querySelector('p') || loadingIndicator;
            errorContainer.innerHTML = `프로젝트 데이터를 불러오는데 실패했습니다: <br> ${error.message}`;
            errorContainer.classList.add('text-red-400');
        }
    };

    loadInitialData();
});
