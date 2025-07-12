import { apiClient } from './api_client.js';
import { debounce, formatNumberWithCommas, formatDateForInput } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (!projectId) {
        document.body.innerHTML = "프로젝트 ID가 필요합니다.";
        return;
    }

    const loadingIndicator = document.getElementById('loading-indicator');
    const projectContent = document.getElementById('project-content');
    const projectNameHeader = document.getElementById('project-name-header');
    
    const projectForm = document.getElementById('project-form');
    const contractForm = document.getElementById('contract-form');
    const revisionsList = document.getElementById('revisions-list');

    let currentProjectData = {};

    // 폼에 데이터를 채우는 함수
    const populateForm = (form, data) => {
        if (!data) return;
        for (const key in data) {
            const element = form.elements[key];
            if (element) {
                if (element.type === 'date') {
                    element.value = formatDateForInput(data[key]);
                } else if (['totalAmount', 'totalEquityAmount', 'supplyAmount', 'vatAmount'].includes(key)) {
                    element.value = formatNumberWithCommas(data[key]);
                } else {
                    element.value = data[key] || '';
                }
            }
        }
    };

    // 변경 이력 목록을 렌더링하는 함수
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
                    <th class="p-2">차수</th>
                    <th class="p-2">변경계약일</th>
                    <th class="p-2">변경 총 계약금액</th>
                    <th class="p-2">변경 총 지분금액</th>
                    <th class="p-2">사유</th>
                </tr>
            </thead>
            <tbody>
            ${revisions.map(rev => `
                <tr class="border-t border-gray-200 dark:border-gray-700">
                    <td class="p-2">${rev.revisionNumber}차</td>
                    <td class="p-2">${rev.revisionDate}</td>
                    <td class="p-2 text-right">${formatNumberWithCommas(rev.revisedTotalAmount)}</td>
                    <td class="p-2 text-right">${formatNumberWithCommas(rev.revisedTotalEquityAmount)}</td>
                    <td class="p-2 truncate" title="${rev.changeReason}">${rev.changeReason}</td>
                </tr>
            `).join('')}
            </tbody>
        `;
        revisionsList.appendChild(table);
    };

    // 초기 데이터 로드
    const loadInitialData = async () => {
        try {
            currentProjectData = await apiClient.getProjectById(projectId);
            
            // 헤더 제목 업데이트
            projectNameHeader.textContent = currentProjectData.projectName;

            // 폼 데이터 채우기
            populateForm(projectForm, currentProjectData);
            populateForm(contractForm, currentProjectData.contract);

            // 변경 이력 렌더링
            renderRevisions(currentProjectData.revisions);
            
            loadingIndicator.classList.add('hidden');
            projectContent.classList.remove('hidden');

        } catch (error) {
            console.error('Failed to load project data:', error);
            loadingIndicator.textContent = '데이터 로딩에 실패했습니다.';
        }
    };
    
    // 자동 저장 로직 (Debounce 적용)
    const handleAutoSave = debounce((form) => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log('자동 저장될 데이터:', data);
        // 여기에 실제 apiClient.update... 로직이 들어갑니다.
        // 지금은 콘솔에 로그만 출력하여 기능 구현을 확인합니다.
    }, 1500);

    projectForm.addEventListener('input', () => handleAutoSave(projectForm));
    contractForm.addEventListener('input', () => handleAutoSave(contractForm));


    loadInitialData();
});
