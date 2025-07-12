document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    const sunIcon = document.getElementById('theme-toggle-sun');
    const moonIcon = document.getElementById('theme-toggle-moon');

    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            sunIcon?.classList.remove('hidden');
            moonIcon?.classList.add('hidden');
        } else {
            document.body.classList.remove('light-mode');
            sunIcon?.classList.add('hidden');
            moonIcon?.classList.remove('hidden');
        }
    };

    // 페이지 로드 시 저장된 테마 적용
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light-mode');
        const newTheme = isLight ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
});
