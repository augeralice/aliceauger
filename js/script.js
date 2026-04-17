

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. BARRE DE PROGRESSION ---
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const pixels = window.pageYOffset || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - window.innerHeight;
            const percentage = (pixels / height) * 100;
            progressBar.style.width = percentage + '%';
        });
    }

    // --- 2. RÉCUPÉRATION DES ÉLÉMENTS ---
    const projects = document.querySelectorAll('.grid-item');
    const filters = document.querySelectorAll('.filter-btn');
    const filterNav = document.querySelector('.filter-nav');
    const itemsToReveal = document.querySelectorAll('.grid-item, .reveal-mask, .reveal-right');

    // --- 3. LOGIQUE DU REVEAL AU SCROLL ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    itemsToReveal.forEach(item => revealObserver.observe(item));
    if (filterNav) revealObserver.observe(filterNav);

    // Initialise les liens par défaut
    projects.forEach(project => {
        const link = project.querySelector('a');
        if (link && !link.getAttribute('href').includes('&filter=')) {
            link.setAttribute('href', `${link.getAttribute('href')}&filter=all`);
        }
    });

    // --- 4. FONCTION DE FILTRAGE (Version Grid-Safe) ---
    const applyFilter = (filterValue, clickedButton) => {
        // 1. Gestion des boutons
        filters.forEach(btn => btn.classList.remove('active'));
        if (clickedButton) clickedButton.classList.add('active');

        // 2. Gestion des projets
        projects.forEach(project => {
            const isMatch = filterValue === 'all' || project.classList.contains(filterValue);

            if (isMatch) {
                // ÉTAPE A : On le remet dans la grille (supprime display: none)
                project.classList.remove('filtering-out');

                // ÉTAPE B : Petit délai pour que l'animation puisse se déclencher
                requestAnimationFrame(() => {
                    project.classList.add('is-visible');
                    // On nettoie les styles inline que le JS aurait pu mettre avant
                    project.style.opacity = "";
                    project.style.transform = "";
                    project.style.display = "";
                });
            } else {
                // ÉTAPE A : On lance l'animation de disparition
                project.classList.remove('is-visible');

                // ÉTAPE B : On attend la fin de l'anim (600ms) pour le retirer de la grille
                setTimeout(() => {
                    if (!project.classList.contains('is-visible')) {
                        project.classList.add('filtering-out');
                    }
                }, 600);
            }
        });
    };
// --- 5. ÉCOUTEURS DE CLIC (Version ultra-stable) ---
filters.forEach(filter => {
    filter.addEventListener('click', function (e) {
        // Empêche toute action résiduelle
        e.preventDefault();
        
        const filterValue = this.getAttribute('data-filter');
        
        // On applique le filtre visuel
        applyFilter(filterValue, this);

        // On change l'URL de manière "silencieuse" 
        // Si ça rafraîchit encore, commente les 2 lignes ci-dessous pour tester
        const newUrl = filterValue !== 'all' ? `?filter=${filterValue}` : window.location.pathname;
        window.history.replaceState({ path: newUrl }, '', newUrl);
    });
});

    // --- 6. GESTION DU FILTRE VIA URL AU CHARGEMENT ---
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get('filter');

    if (filterParam) {
        const targetFilter = document.querySelector(`.filter-btn[data-filter="${filterParam}"]`);
        if (targetFilter) {
            // On applique le filtre de l'URL après un léger délai pour l'animation
            setTimeout(() => {
                applyFilter(filterParam, targetFilter);
            }, 200);
        }
    }



});
// --- 7. LOGIQUE D'AFFICHAGE DES MÉDIAS (IMG VS VIDEO) ---
const renderMedia = (item) => {
    const isVideo = item.src.endsWith('.mp4');

    if (isVideo) {
        // On ajoute 'gallery-item' pour le style CSS 
        // et 'video-gallery' pour le script JS de lecture au scroll
        return `
            <div class="grid-item ${item.layout || ''}">
                <video 
                    src="${item.src}" 
                    class="video-gallery"
                    loop 
                    muted 
                    playsinline 
                    style="width:100%; height:100%; object-fit:cover; display:block; cursor:pointer;">
                </video>
            </div>`;
    } else {
        return `
            <div class="grid-item ${item.layout || ''}">
                <img src="${item.src}" alt="Projet" style="width:100%; height:100%; object-fit:cover; display:block;">
            </div>`;
    }
};