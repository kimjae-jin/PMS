import { apiClient } from './api_client.js';

document.addEventListener('DOMContentLoaded', () => {
    const projectForm = document.getElementById('project-form');
    if (!projectForm) return;

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(projectForm);
        const data = Object.fromEntries(formData.entries());

        const submitButton = projectForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = '생성 중...';

        try {
            await apiClient.createProject(data);
            alert('프로젝트가 성공적으로 생성되었습니다.');
            window.location.href = 'projects.html'; // 생성 후 목록 페이지로 이동
        } catch (error) {
            console.error('Failed to create project:', error);
            alert('프로젝트 생성에 실패했습니다: ' + error.message);
            submitButton.disabled = false;
            submitButton.innerHTML = '<span>프로젝트 생성</span>';
        }
    });
});
