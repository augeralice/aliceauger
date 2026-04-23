document.addEventListener('DOMContentLoaded', () => {
    // --- 1. RÉCUPÉRATION DES DONNÉES DU PROJET ---
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    const currentFilter = params.get('filter') || 'all';

    const projectIndex = PROJECTS_DATA.findIndex(p => p.id === projectId);
    const currentProject = PROJECTS_DATA[projectIndex];

    if (!currentProject) return;

    // --- 2. MISE À JOUR DU CONTENU TEXTUEL ---
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

    // --- 3. GALERIE (Ordre Logique + Vidéo Mobile-Ready) ---
    const galleryGrid = document.querySelector('.project-grid');

    if (galleryGrid && currentProject.gallery) {
        galleryGrid.innerHTML = '';

        const isDesktop = window.innerWidth > 768;
        let images = [...currentProject.gallery];

        // SI DESKTOP : Réorganisation pour column-count (G-D-G-D)
        if (isDesktop) {
            const leftCol = [];
            const rightCol = [];
            images.forEach((img, index) => {
                if (index % 2 === 0) leftCol.push(img);
                else rightCol.push(img);
            });
            images = [...leftCol, ...rightCol];
        }

        images.forEach(imgData => {
            const item = document.createElement('div');
            item.className = `reveal-mask project-item ${imgData.layout || ''}`; 
            
            const isVideo = imgData.src.toLowerCase().endsWith('.mp4');
            if (isVideo) {
                // AJOUT de autoplay, playsinline et webkit-playsinline pour Mobile
                item.innerHTML = `
                    <video 
                        src="${imgData.src}" 
                        class="video-gallery" 
                        autoplay 
                        muted 
                        loop 
                        playsinline 
                        webkit-playsinline
                        preload="auto"
                        style="cursor:pointer;">
                    </video>`;
            } else {
                item.innerHTML = `<img src="${imgData.src}" loading="lazy" alt="${currentProject.title}">`;
            }
            galleryGrid.appendChild(item);
        });
    }

    // --- 4. NAVIGATION SUIVANT (Filtrée) ---
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

    // --- 5. BOUTON RETOUR ---
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    // --- 6. INTERSECTION OBSERVER (Reveal + Play Vidéos) ---
    const observerOptions = { threshold: 0.1 };
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                const video = entry.target.querySelector('video.video-gallery');
                if (video) {
                    video.muted = true;
                    video.play().catch(() => { /* Autoplay prévenu par navigateur */ });

                    video.onclick = function() {
                        this.muted = !this.muted;
                        if (!this.muted) this.classList.add('sound-on');
                        else this.classList.remove('sound-on');
                    };
                }
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // On lance l'observation sur tous les éléments générés
    document.querySelectorAll('.reveal-mask').forEach(el => revealObserver.observe(el));
    const footerNav = document.querySelector('.project-footer-nav');
    if (footerNav) revealObserver.observe(footerNav);

    // --- 7. STYLE .ACTIVE FOOTER ---
    const updateFooterActiveState = () => {
        const filterLinks = document.querySelectorAll('.index-links a');
        const activeCategory = currentFilter || 'all';

        filterLinks.forEach(link => {
            const linkUrl = new URL(link.href, window.location.origin);
            const linkFilterValue = linkUrl.searchParams.get('filter') || 'all';
            if (linkFilterValue === activeCategory) link.classList.add('active');
            else link.classList.remove('active');
        });
    };
    updateFooterActiveState();

    // --- 8. FIX MOBILE : Force le play au premier toucher ---
    document.body.addEventListener('touchstart', () => {
        document.querySelectorAll('video').forEach(v => {
            if (v.paused) v.play();
        });
    }, { once: true });
});
