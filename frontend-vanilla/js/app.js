// =================================================================================
// 전역 UI 컨트롤러 (Global UI Controller)
// 이 파일은 모든 페이지에 공통으로 적용되는 UI 로직을 관리합니다.
// (사이드바, 테마, 모달 등)
// =================================================================================

// --- Modal Helper ---
export const Modal = {
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


// --- 페이지 로드 시 공통 UI 초기화 ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Lucide 아이콘 렌더링
    lucide.createIcons();
    
    // 2. 테마 초기화
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
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

        const savedTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(savedTheme);

        themeToggleBtn.addEventListener('click', () => {
            const newTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }


    // 3. 사이드바 초기화
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        const applyMouseEvents = () => {
            if (window.innerWidth > 768) { // 데스크탑 뷰
                sidebar.addEventListener('mouseenter', () => sidebar.classList.remove('collapsed'));
                sidebar.addEventListener('mouseleave', () => sidebar.classList.add('collapsed'));
                sidebar.classList.add('collapsed');
            } else { // 모바일 뷰
                sidebar.removeEventListener('mouseenter', () => sidebar.classList.remove('collapsed'));
                sidebar.removeEventListener('mouseleave', () => sidebar.classList.add('collapsed'));
                sidebar.classList.remove('collapsed');
            }
        };
        window.addEventListener('resize', applyMouseEvents);
        applyMouseEvents();
    }

    // 4. 동적 메뉴 활성화 로직
    const currentFilename = window.location.pathname.split('/').pop();
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        const linkFilename = link.getAttribute('href');
        link.classList.remove('active');
        if (linkFilename === currentFilename || (currentFilename === '' && linkFilename === 'index.html')) {
            link.classList.add('active');
        }
    });

    // 5. 로고 홈 링크 기능
    const logoContainer = document.getElementById('logo-container');
    if(logoContainer) {
        logoContainer.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
        logoContainer.style.cursor = 'pointer';
    }
});
