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

// --- 3. GALERIE (Version Ordre Logique) ---
const galleryGrid = document.querySelector('.project-grid');

if (galleryGrid && currentProject.gallery) {
    galleryGrid.innerHTML = '';

    const isDesktop = window.innerWidth > 768;
    let images = currentProject.gallery;

    // SI DESKTOP : On réorganise le tableau pour que l'ordre column-count 
    // (haut en bas) corresponde à l'ordre visuel (gauche à droite)
    if (isDesktop) {
        const leftCol = [];
        const rightCol = [];
        images.forEach((img, index) => {
            if (index % 2 === 0) leftCol.push(img); // Image 1, 3, 5...
            else rightCol.push(img);               // Image 2, 4, 6...
        });
        images = [...leftCol, ...rightCol]; // On met toutes les gauches puis toutes les droites
    }

    images.forEach(imgData => {
        const item = document.createElement('div');
        item.className = `reveal-mask project-item ${imgData.layout || ''}`; 
        
        const isVideo = imgData.src.toLowerCase().endsWith('.mp4');
        if (isVideo) {
            item.innerHTML = `<video src="${imgData.src}" class="video-gallery" loop muted playsinline style="cursor:pointer;"></video>`;
        } else {
            item.innerHTML = `<img src="${imgData.src}" loading="lazy" alt="${currentProject.title}">`;
        }
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
// --- 6. INTERSECTION OBSERVER (Reveal + Play Vidéos) ---
const observerOptions = { threshold: 0.1 };

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            
            // On cherche la vidéo à l'intérieur de l'élément qui vient d'apparaître
            const video = entry.target.querySelector('video.video-gallery');
            
            if (video) {
                // 1. On lance la vidéo (toujours en muet au début)
                video.muted = true;
                video.play().catch(err => console.log("Autoplay bloqué, attend le clic."));

                // 2. On gère le clic pour le SON et l'ICÔNE (on le met ici pour être sûr que la vidéo existe)
                // On utilise 'onclick' pour éviter les doublons d'écouteurs
                video.onclick = function() {
                    this.muted = !this.muted;
                    console.log("Son : " + (this.muted ? "OFF" : "ON"));
                    
                    if (!this.muted) {
                        this.classList.add('sound-on');
                    } else {
                        this.classList.remove('sound-on');
                    }
                };
            }
            // On arrête d'observer cet item une fois qu'il est visible
            revealObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// CRUCIAL : On lance l'observation sur les éléments qu'on vient de créer dans la Partie 3
document.querySelectorAll('.project-grid .reveal-mask').forEach(el => {
    revealObserver.observe(el);
});

    // Observation des éléments de la galerie
    document.querySelectorAll('.project-grid .reveal-mask').forEach(el => revealObserver.observe(el));
    
    // Observation du footer de navigation
    const footerNav = document.querySelector('.project-footer-nav');
    if (footerNav) revealObserver.observe(footerNav);

// --- 7. GESTION DU STYLE .ACTIVE DANS LE FOOTER ---
const updateFooterActiveState = () => {
    const filterLinks = document.querySelectorAll('.index-links a');
    
    // On utilise la variable currentFilter que tu as déjà définie en haut de ton fichier
    // On s'assure qu'elle vaut 'all' par défaut si elle est vide
    const activeCategory = currentFilter || 'all';

    filterLinks.forEach(link => {
        // On crée un objet URL pour extraire proprement le paramètre 'filter' du href
        const linkUrl = new URL(link.href, window.location.origin);
        const linkFilterValue = linkUrl.searchParams.get('filter') || 'all';

        // Si la valeur du lien correspond au filtre actif de la page, on allume !
        if (linkFilterValue === activeCategory) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
};

// On appelle la fonction pour l'activer
updateFooterActiveState();
});
