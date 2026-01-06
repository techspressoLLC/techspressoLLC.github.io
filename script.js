function navigateTo(pageId) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) mobileMenu.classList.remove('active');
    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo(0, 0);
    }
}

window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 80) {
        header.classList.add('py-2'); header.classList.remove('py-4');
    } else {
        header.classList.add('py-4'); header.classList.remove('py-2');
    }
});

const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });
}

window.onload = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
};
