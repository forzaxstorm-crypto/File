const revealElements = document.querySelectorAll(
        '.menu, .about, .contact, .footer, .menu-card, .contact-card'
    );

    if (typeof IntersectionObserver === 'function') {
        revealElements.forEach(element => {
            element.classList.add('reveal');
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15
        });

        revealElements.forEach(element => {
            observer.observe(element);
        });
    }
