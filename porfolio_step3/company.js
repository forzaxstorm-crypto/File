document.addEventListener("DOMContentLoaded", function () {

    // 1. АНИМАЦИЯ ПОЯВЛЕНИЯ БЛОКОВ

    const animatedElements = document.querySelectorAll(
        ".hero-content, .about-content, .services-heading, " +
        ".service-card, .projects-heading, .project-card, " +
        ".contact-content, .footer-content"
    );

    animatedElements.forEach(function (element) {
        element.classList.add("reveal");
    });

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            function (entries, observerInstance) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observerInstance.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.15
            }
        );

        animatedElements.forEach(function (element) {
            observer.observe(element);
        });
    } else {
        animatedElements.forEach(function (element) {
            element.classList.add("visible");
        });
    }


    // 2. КОНТАКТНАЯ ФОРМА

    const contactForm = document.querySelector(".contact-form");

    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            let status = contactForm.querySelector(".form-status");

            if (!status) {
                status = document.createElement("p");
                status.className = "form-status";
                status.setAttribute("role", "status");
                status.setAttribute("aria-live", "polite");
                contactForm.appendChild(status);
            }

            status.textContent =
                "Это демонстрационная форма. Отправка данных пока недоступна.";
        });
    }

});
