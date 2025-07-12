document.addEventListener('DOMContentLoaded', () => {
    // --- Interactive Sidebar Logic ---
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        // 데스크탑 뷰에서만 마우스 호버 기능 적용
        const applyMouseEvents = () => {
            if (window.innerWidth > 768) {
                sidebar.addEventListener('mouseenter', expandSidebar);
                sidebar.addEventListener('mouseleave', collapseSidebar);
                // 초기 로드 시 축소
                collapseSidebar();
            } else {
                sidebar.removeEventListener('mouseenter', expandSidebar);
                sidebar.removeEventListener('mouseleave', collapseSidebar);
                // 모바일 뷰에서는 항상 확장
                expandSidebar();
            }
        };

        const expandSidebar = () => {
            sidebar.classList.remove('collapsed');
            sidebar.style.width = '16rem'; // 256px
        };
        const collapseSidebar = () => {
            sidebar.classList.add('collapsed');
            sidebar.style.width = '5.5rem'; // 88px
        };
        
        // 창 크기 변경 시 이벤트 리스너 재설정
        window.addEventListener('resize', applyMouseEvents);
        // 초기 실행
        applyMouseEvents();
    }

    // --- Dynamic Active Menu Logic ---
    const currentFilename = window.location.pathname.split('/').pop();
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    sidebarLinks.forEach(link => {
        const linkFilename = link.getAttribute('href');
        link.classList.remove('active'); // 모든 링크에서 active 클래스 초기화

        if (linkFilename === currentFilename) {
            link.classList.add('active');
        }
        // 루트 경로일 때 '종합 상황판' 활성화 (index.html)
        if (currentFilename === '' && linkFilename === 'index.html') {
            link.classList.add('active');
        }
    });
    
    // --- Sidebar Logo Link Logic ---
    const logoContainer = document.getElementById('logo-container');
    if(logoContainer) {
        logoContainer.addEventListener('click', (e) => {
            e.preventDefault(); // a 태그의 기본 동작을 막고
            window.location.href = 'index.html'; // 스크립트로 이동
        });
        logoContainer.style.cursor = 'pointer';
    }
});
