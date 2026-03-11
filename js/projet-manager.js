document.addEventListener('DOMContentLoaded', () => {
    // --- 1. RÉCUPÉRATION DES DONNÉES DU PROJET ---
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    const currentFilter = params.get('filter') || 'all';

    const projectIndex = PROJECTS_DATA.findIndex(p => p.id === projectId);
    const currentProject = PROJECTS_DATA[projectIndex];

    if (!currentProject) return;

    // --- 2. MISE À JOUR DU CONTENU ---
    const nameEl = document.querySelector('.name-project');
    const catEl = document.querySelector('.projet-category');
    const descEl = document.querySelector('.description-text p');
    const detailsContainer = document.querySelector('.project-details');

    if (nameEl) nameEl.innerHTML = currentProject.title.toUpperCase();
    if (catEl) catEl.innerHTML = `${currentProject.displayCategory} <div class="divider-line3"></div>`;
    if (descEl) descEl.textContent = currentProject.description;

    if (detailsContainer) {
        detailsContainer.innerHTML = `
            <span class="meta-label">Year</span><span class="meta-value">${currentProject.year}</span>
            <span class="meta-label">Type</span><span class="meta-value">${currentProject.type}</span>
            <span class="meta-label">Discipline</span><span class="meta-value">${currentProject.discipline}</span>
        `;
    }

    // --- 3. GALERIE ---
    const galleryGrid = document.querySelector('.project-grid');
    if (galleryGrid && currentProject.gallery) {
        galleryGrid.innerHTML = '';
        currentProject.gallery.forEach(imgData => {
            const item = document.createElement('div');
            item.className = `reveal-mask project-item ${imgData.layout || ''}`; 
            item.innerHTML = `<img src="${imgData.src}" loading="lazy" alt="${currentProject.title}">`;
            galleryGrid.appendChild(item);
        });
    }

    // --- 4. NAVIGATION SUIVANT ---
    const nextLink = document.querySelector('.next-project-link');
    const nextTitle = document.querySelector('.next-title');
    const nextImg = document.querySelector('.next-preview-img');

    let filteredList = PROJECTS_DATA;
    if (currentFilter !== 'all') {
        filteredList = PROJECTS_DATA.filter(p => p.category === currentFilter);
    }

    const filteredIndex = filteredList.findIndex(p => p.id === projectId);

    if (filteredIndex !== -1 && filteredList.length > 1) {
        const nextProject = filteredList[(filteredIndex + 1) % filteredList.length];
        if (nextLink) nextLink.setAttribute('href', `projet-page.html?id=${nextProject.id}&filter=${currentFilter}`);
        if (nextTitle) nextTitle.textContent = nextProject.title.toUpperCase();
        if (nextImg) nextImg.src = nextProject.imageHero;
    }

    // --- 5. GESTION DU BOUTON RETOUR ---
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    // --- 6. INTERSECTION OBSERVER ---
    const observerOptions = { threshold: 0.1 };
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observation des éléments de la galerie
    document.querySelectorAll('.project-grid .reveal-mask').forEach(el => revealObserver.observe(el));
    
    // Observation du footer de navigation
    const footerNav = document.querySelector('.project-footer-nav');
    if (footerNav) revealObserver.observe(footerNav);

});