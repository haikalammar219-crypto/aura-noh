window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
});

function setupCardFlips() {
    document.querySelectorAll('.card').forEach(card => {
        if (card.querySelector('.card-inner')) return;
        const inner = document.createElement('div');
        inner.className = 'card-inner';
        const front = document.createElement('div');
        front.className = 'card-face card-front';
        const back = document.createElement('div');
        back.className = 'card-face card-back';
        const logo = document.createElement('img');
        logo.src = 'aura-logo.png';
        logo.alt = 'AURA ENTERPRISE logo';
        front.replaceChildren(...Array.from(card.childNodes));
        back.append(logo);
        inner.append(front, back);
        card.append(inner);
        const playFlip = () => {
            card.classList.remove('is-flipping');
            void card.offsetWidth;
            card.classList.add('is-flipping');
        };
        card.addEventListener('pointerenter', playFlip);
        card.addEventListener('focusin', playFlip);
        card.addEventListener('animationend', event => {
            if (event.animationName === 'card-full-flip') card.classList.remove('is-flipping');
        });
    });
}

function setupScrollReveal() {
    const revealTargets = document.querySelectorAll(
        '.section-title p:not(#reviews .section-title p), .section-title h1:not(#reviews .section-title h1), .section-title h2:not(#reviews .section-title h2), .contact-info h3, .contact-info > p'
    );
    revealTargets.forEach((element, index) => {
        element.classList.add('reveal-on-scroll');
        element.style.animationDelay = `${Math.min(index % 3, 2) * 100}ms`;
    });

    if (!('IntersectionObserver' in window)) {
        revealTargets.forEach(element => element.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach(element => observer.observe(element));
}

function setupBounceCards() {
    const container = document.getElementById('bounce-cards');
    if (!container) return;
    const cards = [...container.querySelectorAll('.bounce-card')];
    cards.forEach((card, hoveredIndex) => {
        card.addEventListener('mouseenter', () => {
            cards.forEach((sibling, index) => {
                sibling.classList.toggle('is-hovered', index === hoveredIndex);
                const baseTransform = getComputedStyle(sibling).getPropertyValue('--bounce-base').trim();
                if (index === hoveredIndex) {
                    sibling.style.transform = `${baseTransform.replace(/rotate\([^)]*\)/, 'rotate(0deg)')} translateY(-18px) scale(1.06)`;
                } else {
                    const direction = index < hoveredIndex ? -1 : 1;
                    sibling.style.transform = `${baseTransform} translateX(${direction * 26}px)`;
                }
            });
        });
        card.addEventListener('mouseleave', () => {
            cards.forEach((sibling, index) => {
                sibling.classList.remove('is-hovered');
                sibling.style.transform = '';
            });
        });
    });

    if (!('IntersectionObserver' in window)) {
        container.classList.add('is-visible');
        return;
    }
    const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
            container.classList.add('is-visible');
            observer.disconnect();
        }
    }, { threshold: 0.2 });
    observer.observe(container);
}

function setupWarpText() {
    document.querySelectorAll('.warp-text').forEach(element => {
        if (element.dataset.warpReady === 'true') return;
        const text = element.textContent.trim();
        element.dataset.warpReady = 'true';
        element.setAttribute('aria-label', text);
        const textNodes = [];
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) textNodes.push(walker.currentNode);
        let characterIndex = 0;
        textNodes.forEach(node => {
            const fragment = document.createDocumentFragment();
            node.nodeValue.split(/(\s+)/).forEach(part => {
                if (!part) return;
                if (/\s+/.test(part)) {
                    fragment.appendChild(document.createTextNode(part));
                    return;
                }
                const span = document.createElement('span');
                span.className = 'warp-word';
                span.textContent = part;
                span.style.setProperty('--warp-index', characterIndex++);
                fragment.appendChild(span);
            });
            node.replaceWith(fragment);
        });

        let frame = 0;
        let pointerX = 0.5;
        let pointerY = 0.5;
        const update = () => {
            frame = 0;
            const rect = element.getBoundingClientRect();
            const center = rect.left + rect.width * pointerX;
            element.querySelectorAll('.warp-word').forEach(word => {
                const distance = (word.offsetLeft + word.offsetWidth / 2 - center) / Math.max(rect.width, 1);
                const influence = Math.max(0, 1 - Math.abs(distance) * 4);
                word.style.setProperty('--warp-y', `${-influence * (8 + pointerY * 8)}px`);
                word.style.setProperty('--warp-rotate', `${distance * influence * -12}deg`);
                word.style.setProperty('--warp-scale', `${1 + influence * 0.08}`);
            });
        };
        element.addEventListener('pointermove', event => {
            if (event.pointerType === 'touch') return;
            const rect = element.getBoundingClientRect();
            pointerX = (event.clientX - rect.left) / Math.max(rect.width, 1);
            pointerY = (event.clientY - rect.top) / Math.max(rect.height, 1);
            if (!frame) frame = requestAnimationFrame(update);
        });
        element.addEventListener('pointerleave', () => {
            element.querySelectorAll('.warp-word').forEach(word => {
                word.style.setProperty('--warp-y', '0px');
                word.style.setProperty('--warp-rotate', '0deg');
                word.style.setProperty('--warp-scale', '1');
            });
        });
    });
}

setupCardFlips();
setupScrollReveal();
setupBounceCards();

const translations = {
    'عن الشركة': 'About the Company', 'مجالات العمل': 'Fields of Work', 'التواصل': 'Contact',
    'تواصل معنا': 'Contact Us', 'استكشف خدماتنا': 'Explore Our Services', 'تعرّف علينا': 'About Us',
    'آراء العملاء': 'Testimonials',
    'تجارب تُلهم ثقة جديدة': 'Experiences That Inspire New Confidence',
    'نحن بانتظار أولى تجاربكم معنا.': 'We are waiting to hear about your first experience with us.',
    'شاركنا رأيك': 'Share Your Experience',
    'رأيك يساعدنا على تقديم تجربة أفضل.': 'Your feedback helps us create a better experience.',
    'من نحن': 'About Us', 'مجالات التميز': 'Areas of Excellence', 'مباشرة التواصل': 'Get in Touch',
    'رؤيتنا': 'Our Vision', 'مهمتنا': 'Our Mission', 'قيمنا': 'Our Values',
        'خدماتنا الاستراتيجية': 'Our Strategic Services', 'التجارة والاستثمار والوساطة التجارية': 'Trade, Investment & Commercial Brokerage',
        'الاستيراد والتصدير والتجارة العامة': 'Import, Export & General Trading', 'التسويق الإلكتروني': 'Digital Marketing Agency',
    'تواصل مع فريقنا': 'Contact Our Team', 'معلومات الاتصال الرسمية': 'Official Contact Information',
    'تعرّف على AURA ENTERPRISE FZE LLC ورؤيتها ومهمتها وقيمها في تقديم حلول الأعمال والتجارة والاستشارات.': 'Learn about AURA ENTERPRISE FZE LLC, its vision, mission, and values in delivering business, trading, and consulting solutions.',
    'يسعدنا الإجابة على جميع استفساراتكم وبناء شراكات جديدة.': 'We are pleased to answer your questions and build new partnerships.',
    'البريد الإلكتروني': 'Email', 'رقم الهاتف (الإمارات)': 'Phone Number (UAE)',
    'المقر الرئيسي': 'Headquarters',
    'سجل الشركة': 'Company Registration', 'معلومات الترخيص الرسمي للشركة:': 'Official company licensing information:',
    'الاسم المسجل': 'Registered Name', 'الحالة القانونية': 'Legal Status',
    'جميع الحقوق محفوظة.': 'All rights reserved.',
    '© 2026 AURA ENTERPRISE FZE LLC. جميع الحقوق محفوظة.': '© 2026 AURA ENTERPRISE FZE LLC. All rights reserved.',
    'حلول إستراتيجية وتجارية متكاملة بأسلوب': 'Integrated strategic and commercial solutions in a',
    'عصري وفاخر': 'modern and luxurious style',
    'نحن شركة رائدة مسجلة في دولة الإمارات العربية المتحدة، نكرّس خبراتنا لمساعدة الأعمال والشركات على النمو والتوسّع وفق أحدث المعايير العالمية.': 'We are a leading company registered in the UAE, dedicated to helping businesses grow and expand according to the latest global standards.',
    'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط والعالم.': 'To be the preferred partner for regional and international companies and institutions seeking excellence and innovation in the UAE, the Middle East, and the world.',
    'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط.': 'To be the preferred partner for regional and international companies and institutions seeking excellence and innovation in the UAE and Middle East markets.',
    'تقديم خدمات وحلول عالمية المستوى تضمن لشركائنا تحقيق أعلى مستويات الأداء والاستدامة والربحية.': 'To provide world-class services and solutions that help our partners achieve the highest levels of performance, sustainability, and profitability.',
    'الشفافية، الجودة الشاملة، الالتزام بالتميز، وبناء علاقات طويلة الأمد مع عملائنا وشركائنا.': 'Transparency, total quality, commitment to excellence, and building long-term relationships with our clients and partners.',
    'شبكة أعمالنا': 'Our Business Network',
    'حضور تجاري يتجاوز الحدود': 'A Business Presence Beyond Borders',
    'شراكة': 'Partnership',
    'عالمية المستوى': 'World-Class',
    'تجارة': 'Commerce',
    'لوجستيات': 'Logistics',
    'استيراد وتصدير': 'Import & Export'
        , 'ربط الشركات بالفرص والشركاء المناسبين، وتسهيل الصفقات التجارية والاستثمارية الموثوقة.': 'Connecting companies with the right opportunities and partners while facilitating trusted commercial and investment deals.',
        'إدارة عمليات الاستيراد والتصدير والتجارة العامة عبر أسواق الإمارات والأسواق العالمية.': 'Managing import, export, and general trading operations across the UAE and global markets.',
        'حلول تسويقية رقمية للأفراد والشركات لبناء حضور أقوى والوصول إلى العملاء المناسبين.': 'Digital marketing solutions for individuals and companies to build a stronger presence and reach the right customers.',
        'التقييمات ستظهر هنا قريبًا.': 'Reviews will appear here soon.',
        'جارٍ إرسال تقييمك...': 'Submitting your review...',
        'شكرًا لك. تم استلام تقييمك وسيظهر بعد المراجعة.': 'Thank you. Your review was received and will appear after approval.',
        'حدث خطأ، حاول مرة أخرى.': 'Something went wrong. Please try again.',
    'الاسم': 'Name', 'اكتب اسمك': 'Enter your name', 'التقييم': 'Rating', 'اختر تقييمك': 'Choose your rating',
    'رسالتك': 'Your message', 'كيف كانت تجربتك معنا؟': 'How was your experience with us?',
    'إرسال التقييم': 'Submit Review', 'التقييمات ستظهر هنا قريبًا.': 'Reviews will appear here soon.',
    'جارٍ إرسال تقييمك...': 'Submitting your review...',
    'شكرًا لك. تم استلام تقييمك وسيظهر بعد المراجعة.': 'Thank you. Your review was received and will appear after approval.',
    'حدث خطأ، حاول مرة أخرى.': 'Something went wrong. Please try again.'
};

const reverseTranslations = Object.fromEntries(Object.entries(translations).map(([arabic, english]) => [english, arabic]));

function translateText(language) {
    const dictionary = language === 'ar'
        ? reverseTranslations
        : language === 'en'
            ? translations
            : { ...translations, ...(localLanguagePacks[language] || {}) };
    const translateValue = value => dictionary[value] || value;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => {
        const value = node.nodeValue;
        const trimmed = value.trim();
        if (dictionary[trimmed]) node.nodeValue = value.replace(trimmed, translateValue(trimmed));
    });
    document.querySelectorAll('[placeholder], [aria-label], [title], img[alt], meta[name="description"]').forEach(element => {
        ['placeholder', 'aria-label', 'title', 'alt', 'content'].forEach(attribute => {
            if (element.hasAttribute(attribute)) {
                const value = element.getAttribute(attribute);
                element.setAttribute(attribute, translateValue(value));
            }
        });
    });
    document.documentElement.lang = language;
    document.documentElement.dir = ['ar', 'ur', 'fa'].includes(language) ? 'rtl' : 'ltr';
    const pageTitles = {
        'Main-v6.html': ['AURA ENTERPRISE FZE LLC | الموقع الرسمي', 'AURA ENTERPRISE FZE LLC | Official Website'],
        'about.html': ['عن الشركة | AURA ENTERPRISE FZE LLC', 'About the Company | AURA ENTERPRISE FZE LLC'],
        'about': ['عن الشركة | AURA ENTERPRISE FZE LLC', 'About the Company | AURA ENTERPRISE FZE LLC'],
        'services.html': ['مجالات العمل | AURA ENTERPRISE FZE LLC', 'Fields of Work | AURA ENTERPRISE FZE LLC'],
        'services': ['مجالات العمل | AURA ENTERPRISE FZE LLC', 'Fields of Work | AURA ENTERPRISE FZE LLC'],
        'contact.html': ['التواصل | AURA ENTERPRISE FZE LLC', 'Contact | AURA ENTERPRISE FZE LLC'],
        'contact': ['التواصل | AURA ENTERPRISE FZE LLC', 'Contact | AURA ENTERPRISE FZE LLC']
    };
    const currentPage = window.location.pathname.split('/').pop() || 'Main-v6.html';
    if (pageTitles[currentPage]) document.title = pageTitles[currentPage][language === 'en' ? 1 : 0];
    const toggle = document.getElementById('language-toggle');
    if (toggle) {
        const label = languageOptions?.find(([code]) => code === language)?.[1] || (language === 'ar' ? 'العربية' : 'English');
        const labelElement = toggle.querySelector('span');
        if (labelElement) labelElement.textContent = label;
        toggle.setAttribute('aria-label', 'Choose language');
    }
    updateReviewLanguage(language);
}

const reviewCopy = {
    ar: {
        namePlaceholder: 'اكتب اسمك',
        commentPlaceholder: 'كيف كانت تجربتك معنا؟',
        ratingLabel: 'اختر تقييمك',
        stars: ['نجمة واحدة', 'نجمتان', '3 نجوم', '4 نجوم', '5 نجوم'],
        empty: 'التقييمات ستظهر هنا قريبًا.',
        loading: 'جارٍ إرسال تقييمك...',
        success: 'شكرًا لك. تم استلام تقييمك وسيظهر بعد المراجعة.',
        error: 'حدث خطأ، حاول مرة أخرى.'
    },
    en: {
        namePlaceholder: 'Enter your name',
        commentPlaceholder: 'How was your experience with us?',
        ratingLabel: 'Choose your rating',
        stars: ['One star', 'Two stars', '3 stars', '4 stars', '5 stars'],
        empty: 'Reviews will appear here soon.',
        loading: 'Submitting your review...',
        success: 'Thank you. Your review was received and will appear after approval.',
        error: 'Something went wrong. Please try again.'
    }
};

function updateReviewLanguage(language) {
    const copy = reviewCopy[language];
    const nameInput = document.getElementById('review-name');
    const commentInput = document.getElementById('review-comment');
    const ratingPicker = document.querySelector('.peek-rating');
    if (nameInput) nameInput.placeholder = copy.namePlaceholder;
    if (commentInput) commentInput.placeholder = copy.commentPlaceholder;
    if (ratingPicker) ratingPicker.setAttribute('aria-label', copy.ratingLabel);
    document.querySelectorAll('.peek-rating__star').forEach(star => {
        star.setAttribute('aria-label', copy.stars[Number(star.dataset.rating) - 1]);
    });
}

const languageOptions = [
    ['ar', 'العربية'], ['en', 'English'], ['es', 'Español'], ['ur', 'اردو'], ['fa', 'فارسی'], ['zh-CN', '中文'],
    ['fr', 'Français'], ['de', 'Deutsch'], ['hi', 'हिन्दी'], ['pt', 'Português'], ['tr', 'Türkçe']
];

const localLanguagePacks = {
    es: {
        'عن الشركة': 'Acerca de la empresa', 'مجالات العمل': 'Áreas de trabajo', 'التواصل': 'Contacto', 'تواصل معنا': 'Contáctanos', 'آراء العملاء': 'Opiniones de los clientes',
        'من نحن': 'Quiénes somos', 'رؤيتنا': 'Nuestra visión', 'مهمتنا': 'Nuestra misión', 'قيمنا': 'Nuestros valores', 'مجالات التميز': 'Áreas de excelencia', 'مباشرة التواصل': 'Ponte en contacto',
        'خدماتنا الاستراتيجية': 'Nuestros servicios estratégicos', 'التجارة والاستثمار والوساطة التجارية': 'Comercio, inversión y corretaje comercial', 'الاستيراد والتصدير والتجارة العامة': 'Importación, exportación y comercio general', 'التسويق الإلكتروني': 'Agencia de marketing digital',
        'شبكة أعمالنا': 'Nuestra red empresarial', 'حضور تجاري يتجاوز الحدود': 'Presencia comercial sin fronteras', 'شراكة': 'Asociación', 'عالمية المستوى': 'Nivel mundial', 'استيراد وتصدير': 'Importación y exportación', 'لوجستيات': 'Logística', 'تجارة': 'Comercio',
        'تواصل مع فريقنا': 'Contacta con nuestro equipo', 'شاركنا رأيك': 'Comparte tu experiencia', 'الاسم': 'Nombre', 'التقييم': 'Valoración', 'رسالتك': 'Tu mensaje', 'إرسال التقييم': 'Enviar opinión'
    },
    fr: {
        'عن الشركة': "À propos de l'entreprise", 'مجالات العمل': "Domaines d'activité", 'التواصل': 'Contact', 'تواصل معنا': 'Contactez-nous', 'آراء العملاء': 'Avis clients',
        'من نحن': 'Qui sommes-nous', 'رؤيتنا': 'Notre vision', 'مهمتنا': 'Notre mission', 'قيمنا': 'Nos valeurs', 'مجالات التميز': "Domaines d'excellence", 'مباشرة التواصل': 'Contactez-nous',
        'خدماتنا الاستراتيجية': 'Nos services stratégiques', 'التجارة والاستثمار والوساطة التجارية': 'Commerce, investissement et courtage commercial', 'الاستيراد والتصدير والتجارة العامة': 'Importation, exportation et commerce général', 'التسويق الإلكتروني': 'Agence de marketing digital',
        'شبكة أعمالنا': 'Notre réseau commercial', 'حضور تجاري يتجاوز الحدود': 'Une présence commerciale sans frontières', 'شراكة': 'Partenariat', 'عالمية المستوى': 'De niveau mondial', 'استيراد وتصدير': 'Import-export', 'لوجستيات': 'Logistique', 'تجارة': 'Commerce',
        'تواصل مع فريقنا': 'Contactez notre équipe', 'شاركنا رأيك': 'Partagez votre expérience', 'الاسم': 'Nom', 'التقييم': 'Évaluation', 'رسالتك': 'Votre message', 'إرسال التقييم': 'Envoyer l’avis'
    },
    de: {
        'عن الشركة': 'Über das Unternehmen', 'مجالات العمل': 'Arbeitsbereiche', 'التواصل': 'Kontakt', 'تواصل معنا': 'Kontaktieren Sie uns', 'آراء العملاء': 'Kundenbewertungen',
        'من نحن': 'Wer sind wir', 'رؤيتنا': 'Unsere Vision', 'مهمتنا': 'Unsere Mission', 'قيمنا': 'Unsere Werte', 'مجالات التميز': 'Kompetenzbereiche', 'مباشرة التواصل': 'Kontakt aufnehmen',
        'خدماتنا الاستراتيجية': 'Unsere strategischen Dienstleistungen', 'التجارة والاستثمار والوساطة التجارية': 'Handel, Investitionen und Handelsvermittlung', 'الاستيراد والتصدير والتجارة العامة': 'Import, Export und allgemeiner Handel', 'التسويق الإلكتروني': 'Digitalmarketing-Agentur',
        'شبكة أعمالنا': 'Unser Geschäftsnetzwerk', 'حضور تجاري يتجاوز الحدود': 'Geschäftspräsenz ohne Grenzen', 'شراكة': 'Partnerschaft', 'عالمية المستوى': 'Weltklasse', 'استيراد وتصدير': 'Import und Export', 'لوجستيات': 'Logistik', 'تجارة': 'Handel',
        'تواصل مع فريقنا': 'Kontaktieren Sie unser Team', 'شاركنا رأيك': 'Teilen Sie Ihre Erfahrung', 'الاسم': 'Name', 'التقييم': 'Bewertung', 'رسالتك': 'Ihre Nachricht', 'إرسال التقييم': 'Bewertung senden'
    },
    'zh-CN': {
        'عن الشركة': '关于公司', 'مجالات العمل': '业务领域', 'التواصل': '联系我们', 'تواصل معنا': '联系我们', 'آراء العملاء': '客户评价', 'من نحن': '关于我们', 'رؤيتنا': '我们的愿景', 'مهمتنا': '我们的使命', 'قيمنا': '我们的价值观',
        'مجالات التميز': '优势领域', 'مباشرة التواصل': '立即联系', 'خدماتنا الاستراتيجية': '我们的战略服务', 'التجارة والاستثمار والوساطة التجارية': '贸易、投资与商业经纪', 'الاستيراد والتصدير والتجارة العامة': '进出口与一般贸易', 'التسويق الإلكتروني': '数字营销机构',
        'شبكة أعمالنا': '我们的商业网络', 'حضور تجاري يتجاوز الحدود': '跨越边界的商业影响力', 'شراكة': '合作伙伴关系', 'عالمية المستوى': '世界级', 'استيراد وتصدير': '进出口', 'لوجستيات': '物流', 'تجارة': '贸易', 'تواصل مع فريقنا': '联系我们的团队', 'شاركنا رأيك': '分享您的体验', 'الاسم': '姓名', 'التقييم': '评价', 'رسالتك': '您的留言', 'إرسال التقييم': '提交评价'
    },
    ur: {
        'عن الشركة': 'کمپنی کا تعارف', 'مجالات العمل': 'کام کے شعبے', 'التواصل': 'رابطہ', 'تواصل معنا': 'ہم سے رابطہ کریں', 'آراء العملاء': 'صارفین کی آراء', 'من نحن': 'ہم کون ہیں', 'رؤيتنا': 'ہماری بصیرت', 'مهمتنا': 'ہمارا مشن', 'قيمنا': 'ہماری اقدار',
        'مجالات التميز': 'نمایاں شعبے', 'مباشرة التواصل': 'رابطہ کریں', 'خدماتنا الاستراتيجية': 'ہماری اسٹریٹجک خدمات', 'التجارة والاستثمار والوساطة التجارية': 'تجارت، سرمایہ کاری اور تجارتی بروکریج', 'الاستيراد والتصدير والتجارة العامة': 'درآمد، برآمد اور عمومی تجارت', 'التسويق الإلكتروني': 'ڈیجیٹل مارکیٹنگ ایجنسی',
        'شبكة أعمالنا': 'ہمارا کاروباری نیٹ ورک', 'حضور تجاري يتجاوز الحدود': 'سرحدوں سے آگے کاروباری موجودگی', 'شراكة': 'شراکت داری', 'عالمية المستوى': 'عالمی معیار', 'استيراد وتصدير': 'درآمد و برآمد', 'لوجستيات': 'لاجسٹکس', 'تجارة': 'تجارت', 'تواصل مع فريقنا': 'ہماری ٹیم سے رابطہ کریں', 'شاركنا رأيك': 'اپنا تجربہ شیئر کریں', 'الاسم': 'نام', 'التقييم': 'درجہ بندی', 'رسالتك': 'آپ کا پیغام', 'إرسال التقييم': 'جائزہ بھیجیں'
    },
    fa: {
        'عن الشركة': 'درباره شرکت', 'مجالات العمل': 'حوزه‌های فعالیت', 'التواصل': 'تماس با ما', 'تواصل معنا': 'با ما تماس بگیرید', 'آراء العملاء': 'نظرات مشتریان', 'من نحن': 'درباره ما', 'رؤيتنا': 'چشم‌انداز ما', 'مهمتنا': 'ماموریت ما', 'قيمنا': 'ارزش‌های ما',
        'مجالات التميز': 'حوزه‌های برتری', 'مباشرة التواصل': 'تماس مستقیم', 'خدماتنا الاستراتيجية': 'خدمات راهبردی ما', 'التجارة والاستثمار والوساطة التجارية': 'تجارت، سرمایه‌گذاری و کارگزاری تجاری', 'الاستيراد والتصدير والتجارة العامة': 'واردات، صادرات و تجارت عمومی', 'التسويق الإلكتروني': 'آژانس بازاریابی دیجیتال',
        'شبكة أعمالنا': 'شبکه تجاری ما', 'حضور تجاري يتجاوز الحدود': 'حضور تجاری فراتر از مرزها', 'شراكة': 'مشارکت', 'عالمية المستوى': 'در سطح جهانی', 'استيراد وتصدير': 'واردات و صادرات', 'لوجستيات': 'لجستیک', 'تجارة': 'تجارت', 'تواصل مع فريقنا': 'با تیم ما تماس بگیرید', 'شاركنا رأيك': 'تجربه خود را به اشتراک بگذارید', 'الاسم': 'نام', 'التقييم': 'امتیازدهی', 'رسالتك': 'پیام شما', 'إرسال التقييم': 'ارسال نظر'
    }
};

function setupLanguageMenu() {
    const menu = document.getElementById('language-menu');
    const toggle = document.getElementById('language-toggle');
    const options = menu?.querySelector('.language-options');
    if (!menu || !toggle || !options) return;
    const current = localStorage.getItem('aura-language') || 'ar';
    const currentLabel = languageOptions.find(([code]) => code === current)?.[1] || 'العربية';
    toggle.querySelector('span').textContent = currentLabel;
    options.replaceChildren(...languageOptions.map(([code, label]) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'language-option';
        option.dataset.language = code;
        option.textContent = label;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', String(code === current));
        option.addEventListener('click', () => {
            menu.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            localStorage.setItem('aura-language', code);
            window.location.reload();
        });
        return option;
    }));
    toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', event => {
        if (!menu.contains(event.target)) {
            menu.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

}

setupLanguageMenu();
const savedLanguage = localStorage.getItem('aura-language') || 'ar';
if (savedLanguage === 'ar' || savedLanguage === 'en') translateText(savedLanguage);
else {
    document.documentElement.lang = savedLanguage;
    document.documentElement.dir = ['ur', 'fa'].includes(savedLanguage) ? 'rtl' : 'ltr';
}
setupWarpText();

const currentPage = window.location.pathname.split('/').pop() || 'Main-v6.html';
document.querySelectorAll('nav a[href]').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
});

const reviewsList = document.getElementById('reviews-list');
const reviewForm = document.getElementById('review-form');
const reviewStatus = document.getElementById('review-status');
const ratingPicker = document.getElementById('rating-picker');
const ratingValue = document.getElementById('rating-value');
const ratingTip = document.getElementById('rating-tip');
const ratingLabels = { ar: ['ضعيف', 'مقبول', 'جيد', 'رائع', 'ممتاز'], en: ['Poor', 'Fair', 'Good', 'Great', 'Superb'] };

function paintRating(value, preview = false) {
    const stars = ratingPicker?.querySelectorAll('.peek-rating__star') || [];
    stars.forEach(star => {
        const starValue = Number(star.dataset.rating);
        const glyph = star.querySelector('.peek-rating__glyph');
        const lift = star.querySelector('.peek-rating__lift');
        glyph.getAnimations?.().forEach(animation => animation.cancel());
        glyph.dataset.lit = String(starValue <= value);
        lift.style.transform = preview && starValue <= value
            ? `translateY(-8px) scale(${starValue === value ? 1.15 : 1})`
            : 'translateY(0) scale(1)';
        star.setAttribute('aria-checked', String(!preview && starValue === value));
        star.tabIndex = !preview && starValue === value ? 0 : (!value && starValue === 1 ? 0 : -1);
    });
}

function setRating(value, animate = true) {
    const next = Math.max(0, Math.min(5, Number(value) || 0));
    if (ratingValue) ratingValue.value = String(next);
    paintRating(next);
    if (ratingTip) {
        const language = document.documentElement.lang === 'en' ? 'en' : 'ar';
        ratingTip.textContent = next ? ratingLabels[language][next - 1] : '';
        ratingTip.dataset.show = String(next > 0);
    }
}

if (ratingPicker) {
    const stars = [...ratingPicker.querySelectorAll('.peek-rating__star')];
    let draggingRating = false;
    let suppressNextClick = false;

    const ratingAtPoint = (clientX, clientY) => {
        const target = document.elementFromPoint(clientX, clientY)?.closest('.peek-rating__star');
        return target && ratingPicker.contains(target) ? Number(target.dataset.rating) : null;
    };

    const previewRating = value => {
        if (!value) return;
        paintRating(value, true);
        const language = document.documentElement.lang === 'en' ? 'en' : 'ar';
        ratingTip.textContent = ratingLabels[language][value - 1];
        const star = ratingPicker.querySelector(`[data-rating="${value}"]`);
        ratingTip.style.left = `${star.offsetLeft + star.offsetWidth / 2}px`;
        ratingTip.dataset.show = 'true';
    };

    ratingPicker.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        const value = ratingAtPoint(event.clientX, event.clientY);
        if (!value) return;
        draggingRating = true;
        suppressNextClick = true;
        ratingPicker.setPointerCapture?.(event.pointerId);
        event.preventDefault();
        previewRating(value);
    });

    ratingPicker.addEventListener('pointermove', event => {
        if (!draggingRating) return;
        event.preventDefault();
        previewRating(ratingAtPoint(event.clientX, event.clientY));
    });

    const finishDrag = event => {
        if (!draggingRating) return;
        const value = ratingAtPoint(event.clientX, event.clientY);
        draggingRating = false;
        ratingPicker.releasePointerCapture?.(event.pointerId);
        if (value) setRating(value);
        else paintRating(Number(ratingValue.value));
        ratingTip.dataset.show = 'false';
        window.setTimeout(() => {
            suppressNextClick = false;
        }, 0);
    };

    ratingPicker.addEventListener('pointerup', finishDrag);
    ratingPicker.addEventListener('pointercancel', finishDrag);

    stars.forEach(star => {
        const value = Number(star.dataset.rating);
        star.addEventListener('pointerenter', () => {
            paintRating(value, true);
            ratingTip.textContent = ratingLabels[document.documentElement.lang === 'en' ? 'en' : 'ar'][value - 1];
            ratingTip.style.left = `${star.offsetLeft + star.offsetWidth / 2}px`;
            ratingTip.dataset.show = 'true';
        });
        star.addEventListener('pointerleave', () => {
            if (draggingRating) return;
            paintRating(Number(ratingValue.value));
            ratingTip.dataset.show = 'false';
        });
        star.addEventListener('focus', () => paintRating(value, true));
        star.addEventListener('blur', () => paintRating(Number(ratingValue.value)));
        star.addEventListener('click', () => {
            if (suppressNextClick) return;
            setRating(value === Number(ratingValue.value) ? 0 : value);
        });
        star.addEventListener('keydown', event => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
                event.preventDefault();
                stars[Math.min(stars.length - 1, value)].focus();
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
                event.preventDefault();
                stars[Math.max(0, value - 2)].focus();
            } else if (event.key === 'Delete' || event.key === 'Backspace') {
                setRating(0, false);
            }
        });
    });
    setRating(0, false);
}

function renderReviews(reviews) {
    if (!reviewsList || !reviews.length) return;
    reviewsList.replaceChildren(...reviews.map(review => {
        const article = document.createElement('article');
        article.className = 'review-card';

        const header = document.createElement('div');
        header.className = 'review-card-header';
        const name = document.createElement('h3');
        name.textContent = review.name;
        const rating = Math.max(1, Math.min(5, Number.parseInt(review.rating, 10) || 1));
        const stars = document.createElement('span');
        stars.className = 'review-stars';
        stars.textContent = `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;
        header.append(name, stars);

        const comment = document.createElement('p');
        comment.textContent = review.comment;
        article.append(header, comment);
        return article;
    }));
}

async function loadReviews() {
    if (!reviewsList) return;
    try {
        const response = await fetch('/api/reviews');
        if (!response.ok) throw new Error('Reviews unavailable');
        const data = await response.json();
        renderReviews(data.reviews || []);
    } catch {
        reviewsList.textContent = reviewCopy[document.documentElement.lang].empty;
        reviewsList.className = 'reviews-list reviews-empty';
    }
}

if (reviewForm) {
    reviewForm.addEventListener('submit', async event => {
        event.preventDefault();
        const submitButton = reviewForm.querySelector('button[type="submit"]');
        const formData = new FormData(reviewForm);
        const rating = Number.parseInt(formData.get('rating'), 10);
        if (!rating) {
            reviewStatus.textContent = document.documentElement.lang === 'en' ? 'Please choose a rating.' : 'اختَر تقييمك أولًا.';
            return;
        }
        submitButton.disabled = true;
        reviewStatus.textContent = reviewCopy[document.documentElement.lang].loading;

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    rating,
                    comment: formData.get('comment'),
                    website: formData.get('website')
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'حدث خطأ، حاول مرة أخرى.');
            reviewForm.reset();
            setRating(0, false);
            reviewStatus.textContent = reviewCopy[document.documentElement.lang].success;
        } catch (error) {
            reviewStatus.textContent = error.message || reviewCopy[document.documentElement.lang].error;
        } finally {
            submitButton.disabled = false;
        }
    });
    loadReviews();
}
