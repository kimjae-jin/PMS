import { apiClient } from './api_client.js';

document.addEventListener('DOMContentLoaded', async () => {
    const clientSelect = document.getElementById('clientId');
    const form = document.getElementById('new-project-form');

    try {
        const clients = await apiClient.getClients();
        clientSelect.innerHTML = '<option value="">거래처를 선택하세요</option>';
        clients.forEach(c => {
            const option = new Option(c.clientName, c.id);
            clientSelect.add(option);
        });
    } catch (error) {
        console.error('Failed to load clients:', error);
        clientSelect.innerHTML = '<option value="">거래처 로딩 실패</option>';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const projectData = Object.fromEntries(formData.entries());
        
        // 여기에 실제 생성 로직 추가
        try {
            await apiClient.createProject(projectData);
            alert('신규 프로젝트가 성공적으로 생성되었습니다!');
            window.location.href = 'index.html';
        } catch (error) {
            alert('프로젝트 생성에 실패했습니다: ' + error.message);
        }
    });
});
