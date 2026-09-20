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
    'حدث خطأ، حاول مرة أخرى.': 'Something went wrong. Please try again.',
    'اطلب استشارة مجانية': 'Request a Free Consultation',
    'استشارة مجانية': 'Free Consultation', 'اطلب استشارتك المجانية': 'Request Your Free Consultation',
    'دعنا نتواصل معك': 'Let us contact you', 'أرسل بياناتك وسيتواصل معك فريق AURA لمناقشة احتياجك وتقديم التوجيه المناسب.': 'Send your details and the AURA team will contact you to discuss your needs and provide suitable guidance.',
    'مفتاح الدولة': 'Country code', 'رقم الهاتف': 'Phone number', 'نوع الاستشارة': 'Consultation type', 'اختر نوع الاستشارة': 'Choose a consultation type',
    'استشارة عامة': 'General consultation', 'أوافق على التواصل معي بخصوص طلب الاستشارة.': 'I agree to be contacted about my consultation request.',
    'إرسال طلب الاستشارة': 'Send consultation request'
};

const reverseTranslations = Object.fromEntries(Object.entries(translations).map(([arabic, english]) => [english, arabic]));

function translateText(language) {
    const dictionary = language === 'ar'
        ? reverseTranslations
        : language === 'en'
            ? translations
            : { ...translations, ...(localLanguagePacks[language] || {}) };
    const translateValue = value => dictionary[value] || translations[value] || value;
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
    const localizedPageNames = {
        ar: ['الموقع الرسمي', 'عن الشركة', 'مجالات العمل', 'التواصل'],
        en: ['Official Website', 'About the Company', 'Fields of Work', 'Contact'],
        es: ['Sitio web oficial', 'Acerca de la empresa', 'Áreas de trabajo', 'Contacto'],
        fr: ['Site officiel', 'À propos de la société', 'Domaines d’activité', 'Contact'],
        de: ['Offizielle Website', 'Über das Unternehmen', 'Tätigkeitsbereiche', 'Kontakt'],
        'zh-CN': ['官方网站', '关于公司', '业务领域', '联系我们'],
        ur: ['سرکاری ویب سائٹ', 'کمپنی کا تعارف', 'کام کے شعبے', 'رابطہ'],
        fa: ['وب‌سایت رسمی', 'درباره شرکت', 'حوزه‌های فعالیت', 'تماس'],
        tr: ['Resmi web sitesi', 'Şirket hakkında', 'Çalışma alanları', 'İletişim'],
        pt: ['Site oficial', 'Sobre a empresa', 'Áreas de atuação', 'Contato'],
        hi: ['आधिकारिक वेबसाइट', 'कंपनी के बारे में', 'कार्य क्षेत्र', 'संपर्क']
    };
    const currentPage = window.location.pathname.split('/').pop() || 'Main-v6.html';
    if (pageTitles[currentPage]) {
        const pageIndex = currentPage.startsWith('about') || currentPage === 'about' ? 1 : currentPage.startsWith('services') || currentPage === 'services' ? 2 : currentPage.startsWith('contact') || currentPage === 'contact' ? 3 : 0;
        const pageName = localizedPageNames[language]?.[pageIndex] || localizedPageNames.en[pageIndex];
        document.title = `AURA ENTERPRISE FZE LLC | ${pageName}`;
    }
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
    },
    es: { namePlaceholder: 'Escribe tu nombre', commentPlaceholder: '¿Cómo fue tu experiencia?', ratingLabel: 'Elige tu valoración', stars: ['Una estrella', 'Dos estrellas', '3 estrellas', '4 estrellas', '5 estrellas'], empty: 'Pronto aparecerán las opiniones.', loading: 'Enviando tu opinión...', success: 'Gracias. Recibimos tu opinión y aparecerá después de su revisión.', error: 'Algo salió mal. Inténtalo de nuevo.' },
    fr: { namePlaceholder: 'Entrez votre nom', commentPlaceholder: 'Comment était votre expérience ?', ratingLabel: 'Choisissez votre évaluation', stars: ['Une étoile', 'Deux étoiles', '3 étoiles', '4 étoiles', '5 étoiles'], empty: 'Les avis apparaîtront bientôt.', loading: 'Envoi de votre avis...', success: 'Merci. Votre avis a été reçu et apparaîtra après validation.', error: 'Une erreur est survenue. Réessayez.' },
    de: { namePlaceholder: 'Geben Sie Ihren Namen ein', commentPlaceholder: 'Wie war Ihre Erfahrung?', ratingLabel: 'Bewertung auswählen', stars: ['Ein Stern', 'Zwei Sterne', '3 Sterne', '4 Sterne', '5 Sterne'], empty: 'Bewertungen werden bald angezeigt.', loading: 'Bewertung wird gesendet...', success: 'Vielen Dank. Ihre Bewertung wurde empfangen und erscheint nach der Prüfung.', error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.' },
    'zh-CN': { namePlaceholder: '请输入您的姓名', commentPlaceholder: '您的体验如何？', ratingLabel: '选择评分', stars: ['一颗星', '两颗星', '3颗星', '4颗星', '5颗星'], empty: '评价即将显示。', loading: '正在提交评价...', success: '谢谢。您的评价已收到，审核后将显示。', error: '出现问题，请重试。' },
    ur: { namePlaceholder: 'اپنا نام لکھیں', commentPlaceholder: 'آپ کا تجربہ کیسا رہا؟', ratingLabel: 'درجہ بندی منتخب کریں', stars: ['ایک ستارہ', 'دو ستارے', '3 ستارے', '4 ستارے', '5 ستارے'], empty: 'آراء جلد یہاں ظاہر ہوں گی۔', loading: 'آپ کی رائے بھیجی جا رہی ہے...', success: 'شکریہ۔ آپ کی رائے موصول ہو گئی ہے اور منظوری کے بعد ظاہر ہوگی۔', error: 'کچھ غلط ہو گیا، دوبارہ کوشش کریں۔' },
    fa: { namePlaceholder: 'نام خود را وارد کنید', commentPlaceholder: 'تجربه شما چگونه بود؟', ratingLabel: 'امتیاز خود را انتخاب کنید', stars: ['یک ستاره', 'دو ستاره', '۳ ستاره', '۴ ستاره', '۵ ستاره'], empty: 'نظرات به‌زودی نمایش داده می‌شوند.', loading: 'در حال ارسال نظر...', success: 'متشکریم. نظر شما دریافت شد و پس از بررسی نمایش داده می‌شود.', error: 'مشکلی پیش آمد. دوباره تلاش کنید.' },
    hi: { namePlaceholder: 'अपना नाम लिखें', commentPlaceholder: 'आपका अनुभव कैसा रहा?', ratingLabel: 'अपनी रेटिंग चुनें', stars: ['एक सितारा', 'दो सितारे', '3 सितारे', '4 सितारे', '5 सितारे'], empty: 'समीक्षाएं जल्द दिखाई देंगी।', loading: 'समीक्षा भेजी जा रही है...', success: 'धन्यवाद। आपकी समीक्षा प्राप्त हो गई है और स्वीकृति के बाद दिखाई देगी।', error: 'कुछ गलत हुआ। कृपया फिर प्रयास करें।' },
    pt: { namePlaceholder: 'Digite seu nome', commentPlaceholder: 'Como foi sua experiência?', ratingLabel: 'Escolha sua avaliação', stars: ['Uma estrela', 'Duas estrelas', '3 estrelas', '4 estrelas', '5 estrelas'], empty: 'As avaliações aparecerão em breve.', loading: 'Enviando sua avaliação...', success: 'Obrigado. Sua avaliação foi recebida e aparecerá após a análise.', error: 'Algo deu errado. Tente novamente.' },
    tr: { namePlaceholder: 'Adınızı yazın', commentPlaceholder: 'Deneyiminiz nasıldı?', ratingLabel: 'Puanınızı seçin', stars: ['Bir yıldız', 'İki yıldız', '3 yıldız', '4 yıldız', '5 yıldız'], empty: 'Yorumlar yakında görünecek.', loading: 'Yorumunuz gönderiliyor...', success: 'Teşekkürler. Yorumunuz alındı ve incelemeden sonra yayınlanacak.', error: 'Bir sorun oluştu. Lütfen tekrar deneyin.' }
};

function updateReviewLanguage(language) {
    const copy = reviewCopy[language] || reviewCopy.en;
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
        'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط.': 'Ser el socio preferido de empresas e instituciones regionales e internacionales que buscan excelencia e innovación en los mercados de los EAU y Oriente Medio.',
        '© 2026 AURA ENTERPRISE FZE LLC. جميع الحقوق محفوظة.': '© 2026 AURA ENTERPRISE FZE LLC. Todos los derechos reservados.',
        'عن الشركة': 'Acerca de la empresa', 'مجالات العمل': 'Áreas de trabajo', 'التواصل': 'Contacto', 'تواصل معنا': 'Contáctanos', 'آراء العملاء': 'Opiniones de los clientes',
        'من نحن': 'Quiénes somos', 'رؤيتنا': 'Nuestra visión', 'مهمتنا': 'Nuestra misión', 'قيمنا': 'Nuestros valores', 'مجالات التميز': 'Áreas de excelencia', 'مباشرة التواصل': 'Ponte en contacto',
        'خدماتنا الاستراتيجية': 'Nuestros servicios estratégicos', 'التجارة والاستثمار والوساطة التجارية': 'Comercio, inversión y corretaje comercial', 'الاستيراد والتصدير والتجارة العامة': 'Importación, exportación y comercio general', 'التسويق الإلكتروني': 'Agencia de marketing digital',
        'شبكة أعمالنا': 'Nuestra red empresarial', 'حضور تجاري يتجاوز الحدود': 'Presencia comercial sin fronteras', 'شراكة': 'Asociación', 'عالمية المستوى': 'Nivel mundial', 'استيراد وتصدير': 'Importación y exportación', 'لوجستيات': 'Logística', 'تجارة': 'Comercio',
        'تواصل مع فريقنا': 'Contacta con nuestro equipo', 'شاركنا رأيك': 'Comparte tu experiencia', 'الاسم': 'Nombre', 'التقييم': 'Valoración', 'رسالتك': 'Tu mensaje', 'إرسال التقييم': 'Enviar opinión'
    },
    fr: {
        'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط.': 'Être le partenaire privilégié des entreprises et institutions régionales et internationales à la recherche d’excellence et d’innovation aux Émirats et au Moyen-Orient.',
        '© 2026 AURA ENTERPRISE FZE LLC. جميع الحقوق محفوظة.': '© 2026 AURA ENTERPRISE FZE LLC. Tous droits réservés.',
        'عن الشركة': "À propos de l'entreprise", 'مجالات العمل': "Domaines d'activité", 'التواصل': 'Contact', 'تواصل معنا': 'Contactez-nous', 'آراء العملاء': 'Avis clients',
        'من نحن': 'Qui sommes-nous', 'رؤيتنا': 'Notre vision', 'مهمتنا': 'Notre mission', 'قيمنا': 'Nos valeurs', 'مجالات التميز': "Domaines d'excellence", 'مباشرة التواصل': 'Contactez-nous',
        'خدماتنا الاستراتيجية': 'Nos services stratégiques', 'التجارة والاستثمار والوساطة التجارية': 'Commerce, investissement et courtage commercial', 'الاستيراد والتصدير والتجارة العامة': 'Importation, exportation et commerce général', 'التسويق الإلكتروني': 'Agence de marketing digital',
        'شبكة أعمالنا': 'Notre réseau commercial', 'حضور تجاري يتجاوز الحدود': 'Une présence commerciale sans frontières', 'شراكة': 'Partenariat', 'عالمية المستوى': 'De niveau mondial', 'استيراد وتصدير': 'Import-export', 'لوجستيات': 'Logistique', 'تجارة': 'Commerce',
        'تواصل مع فريقنا': 'Contactez notre équipe', 'شاركنا رأيك': 'Partagez votre expérience', 'الاسم': 'Nom', 'التقييم': 'Évaluation', 'رسالتك': 'Votre message', 'إرسال التقييم': 'Envoyer l’avis'
    },
    de: {
        'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط.': 'Der bevorzugte Partner für regionale und internationale Unternehmen und Institutionen auf der Suche nach Exzellenz und Innovation in den VAE und im Nahen Osten.',
        '© 2026 AURA ENTERPRISE FZE LLC. جميع الحقوق محفوظة.': '© 2026 AURA ENTERPRISE FZE LLC. Alle Rechte vorbehalten.',
        'عن الشركة': 'Über das Unternehmen', 'مجالات العمل': 'Arbeitsbereiche', 'التواصل': 'Kontakt', 'تواصل معنا': 'Kontaktieren Sie uns', 'آراء العملاء': 'Kundenbewertungen',
        'من نحن': 'Wer sind wir', 'رؤيتنا': 'Unsere Vision', 'مهمتنا': 'Unsere Mission', 'قيمنا': 'Unsere Werte', 'مجالات التميز': 'Kompetenzbereiche', 'مباشرة التواصل': 'Kontakt aufnehmen',
        'خدماتنا الاستراتيجية': 'Unsere strategischen Dienstleistungen', 'التجارة والاستثمار والوساطة التجارية': 'Handel, Investitionen und Handelsvermittlung', 'الاستيراد والتصدير والتجارة العامة': 'Import, Export und allgemeiner Handel', 'التسويق الإلكتروني': 'Digitalmarketing-Agentur',
        'شبكة أعمالنا': 'Unser Geschäftsnetzwerk', 'حضور تجاري يتجاوز الحدود': 'Geschäftspräsenz ohne Grenzen', 'شراكة': 'Partnerschaft', 'عالمية المستوى': 'Weltklasse', 'استيراد وتصدير': 'Import und Export', 'لوجستيات': 'Logistik', 'تجارة': 'Handel',
        'تواصل مع فريقنا': 'Kontaktieren Sie unser Team', 'شاركنا رأيك': 'Teilen Sie Ihre Erfahrung', 'الاسم': 'Name', 'التقييم': 'Bewertung', 'رسالتك': 'Ihre Nachricht', 'إرسال التقييم': 'Bewertung senden'
    },
    'zh-CN': {
        'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط.': '成为地区和国际企业及机构在阿联酋和中东市场追求卓越与创新时的首选合作伙伴。',
        '© 2026 AURA ENTERPRISE FZE LLC. جميع الحقوق محفوظة.': '© 2026 AURA ENTERPRISE FZE LLC。版权所有。',
        'عن الشركة': '关于公司', 'مجالات العمل': '业务领域', 'التواصل': '联系我们', 'تواصل معنا': '联系我们', 'آراء العملاء': '客户评价', 'من نحن': '关于我们', 'رؤيتنا': '我们的愿景', 'مهمتنا': '我们的使命', 'قيمنا': '我们的价值观',
        'مجالات التميز': '优势领域', 'مباشرة التواصل': '立即联系', 'خدماتنا الاستراتيجية': '我们的战略服务', 'التجارة والاستثمار والوساطة التجارية': '贸易、投资与商业经纪', 'الاستيراد والتصدير والتجارة العامة': '进出口与一般贸易', 'التسويق الإلكتروني': '数字营销机构',
        'شبكة أعمالنا': '我们的商业网络', 'حضور تجاري يتجاوز الحدود': '跨越边界的商业影响力', 'شراكة': '合作伙伴关系', 'عالمية المستوى': '世界级', 'استيراد وتصدير': '进出口', 'لوجستيات': '物流', 'تجارة': '贸易', 'تواصل مع فريقنا': '联系我们的团队', 'شاركنا رأيك': '分享您的体验', 'الاسم': '姓名', 'التقييم': '评价', 'رسالتك': '您的留言', 'إرسال التقييم': '提交评价',
        'حلول إستراتيجية وتجارية متكاملة بأسلوب': '一体化的战略与商业解决方案，采用', 'عصري وفاخر': '现代而奢华的风格',
        'نحن شركة رائدة مسجلة في دولة الإمارات العربية المتحدة، نكرّس خبراتنا لمساعدة الأعمال والشركات على النمو والتوسّع وفق أحدث المعايير العالمية.': '我们是一家在阿联酋注册的领先企业，致力于帮助企业按照最新的全球标准实现增长与扩张。',
        'استكشف خدماتنا': '探索我们的服务', 'تعرّف علينا': '了解我们', 'معلومات الاتصال الرسمية': '官方联系信息', 'يسعدنا الإجابة على جميع استفساراتكم وبناء شراكات جديدة.': '我们乐意回答您的问题并建立新的合作伙伴关系。',
        'البريد الإلكتروني': '电子邮箱', 'رقم الهاتف (الإمارات)': '电话（阿联酋）', 'المقر الرئيسي': '总部', 'سجل الشركة': '公司注册信息', 'معلومات الترخيص الرسمي للشركة:': '官方公司许可信息', 'الاسم المسجل': '注册名称', 'الحالة القانونية': '法律状态',
        'التجارة والاستثمار والوساطة التجارية': '贸易、投资与商业经纪', 'الاستيراد والتصدير والتجارة العامة': '进出口与一般贸易', 'التسويق الإلكتروني': '数字营销机构',
        'ربط الشركات بالفرص والشركاء المناسبين، وتسهيل الصفقات التجارية والاستثمارية الموثوقة.': '为企业连接合适的机会与合作伙伴，促成可靠的商业与投资交易。', 'إدارة عمليات الاستيراد والتصدير والتجارة العامة عبر أسواق الإمارات والأسواق العالمية.': '管理阿联酋及全球市场的进出口和一般贸易业务。', 'حلول تسويقية رقمية للأفراد والشركات لبناء حضور أقوى والوصول إلى العملاء المناسبين.': '为个人和企业提供数字营销解决方案，打造更强的品牌影响力并触达合适客户。',
        'تجارب تُلهم ثقة جديدة': '激发全新信任的体验', 'نحن بانتظار أولى تجاربكم معنا.': '我们期待听到您与我们的第一次体验。', 'شاركنا رأيك': '分享您的体验', 'رأيك يساعدنا على تقديم تجربة أفضل.': '您的反馈帮助我们提供更好的体验。', 'اختر تقييمك': '选择您的评分', 'كيف كانت تجربتك معنا؟': '您的体验如何？', 'التقييمات ستظهر هنا قريبًا.': '评价即将显示。', 'جارٍ إرسال تقييمك...': '正在提交评价...', 'شكرًا لك. تم استلام تقييمك وسيظهر بعد المراجعة.': '谢谢。您的评价已收到，审核后将显示。', 'حدث خطأ، حاول مرة أخرى.': '出现问题，请重试。',
        'نجمة واحدة': '一颗星', 'نجمتان': '两颗星', '3 نجوم': '3颗星', '4 نجوم': '4颗星', '5 نجوم': '5颗星', 'جميع الحقوق محفوظة.': '版权所有。'
    },
    ur: {
        'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط.': 'متحدہ عرب امارات اور مشرق وسطیٰ کی منڈیوں میں عمدگی اور جدت کے خواہاں علاقائی و بین الاقوامی اداروں کے لیے پسندیدہ شراکت دار بننا۔',
        '© 2026 AURA ENTERPRISE FZE LLC. جميع الحقوق محفوظة.': '© 2026 AURA ENTERPRISE FZE LLC۔ جملہ حقوق محفوظ ہیں۔',
        'عن الشركة': 'کمپنی کا تعارف', 'مجالات العمل': 'کام کے شعبے', 'التواصل': 'رابطہ', 'تواصل معنا': 'ہم سے رابطہ کریں', 'آراء العملاء': 'صارفین کی آراء', 'من نحن': 'ہم کون ہیں', 'رؤيتنا': 'ہماری بصیرت', 'مهمتنا': 'ہمارا مشن', 'قيمنا': 'ہماری اقدار',
        'مجالات التميز': 'نمایاں شعبے', 'مباشرة التواصل': 'رابطہ کریں', 'خدماتنا الاستراتيجية': 'ہماری اسٹریٹجک خدمات', 'التجارة والاستثمار والوساطة التجارية': 'تجارت، سرمایہ کاری اور تجارتی بروکریج', 'الاستيراد والتصدير والتجارة العامة': 'درآمد، برآمد اور عمومی تجارت', 'التسويق الإلكتروني': 'ڈیجیٹل مارکیٹنگ ایجنسی',
        'شبكة أعمالنا': 'ہمارا کاروباری نیٹ ورک', 'حضور تجاري يتجاوز الحدود': 'سرحدوں سے آگے کاروباری موجودگی', 'شراكة': 'شراکت داری', 'عالمية المستوى': 'عالمی معیار', 'استيراد وتصدير': 'درآمد و برآمد', 'لوجستيات': 'لاجسٹکس', 'تجارة': 'تجارت', 'تواصل مع فريقنا': 'ہماری ٹیم سے رابطہ کریں', 'شاركنا رأيك': 'اپنا تجربہ شیئر کریں', 'الاسم': 'نام', 'التقييم': 'درجہ بندی', 'رسالتك': 'آپ کا پیغام', 'إرسال التقييم': 'جائزہ بھیجیں'
    },
    fa: {
        'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط.': 'شریک برگزیده شرکت‌ها و مؤسسات منطقه‌ای و بین‌المللی برای دستیابی به برتری و نوآوری در امارات و خاورمیانه باشیم.',
        '© 2026 AURA ENTERPRISE FZE LLC. جميع الحقوق محفوظة.': '© 2026 AURA ENTERPRISE FZE LLC. تمامی حقوق محفوظ است.',
        'عن الشركة': 'درباره شرکت', 'مجالات العمل': 'حوزه‌های فعالیت', 'التواصل': 'تماس با ما', 'تواصل معنا': 'با ما تماس بگیرید', 'آراء العملاء': 'نظرات مشتریان', 'من نحن': 'درباره ما', 'رؤيتنا': 'چشم‌انداز ما', 'مهمتنا': 'ماموریت ما', 'قيمنا': 'ارزش‌های ما',
        'مجالات التميز': 'حوزه‌های برتری', 'مباشرة التواصل': 'تماس مستقیم', 'خدماتنا الاستراتيجية': 'خدمات راهبردی ما', 'التجارة والاستثمار والوساطة التجارية': 'تجارت، سرمایه‌گذاری و کارگزاری تجاری', 'الاستيراد والتصدير والتجارة العامة': 'واردات، صادرات و تجارت عمومی', 'التسويق الإلكتروني': 'آژانس بازاریابی دیجیتال',
        'شبكة أعمالنا': 'شبکه تجاری ما', 'حضور تجاري يتجاوز الحدود': 'حضور تجاری فراتر از مرزها', 'شراكة': 'مشارکت', 'عالمية المستوى': 'در سطح جهانی', 'استيراد وتصدير': 'واردات و صادرات', 'لوجستيات': 'لجستیک', 'تجارة': 'تجارت', 'تواصل مع فريقنا': 'با تیم ما تماس بگیرید', 'شاركنا رأيك': 'تجربه خود را به اشتراک بگذارید', 'الاسم': 'نام', 'التقييم': 'امتیازدهی', 'رسالتك': 'پیام شما', 'إرسال التقييم': 'ارسال نظر'
    }
};

const sharedLocalCopy = {
    es: {
    'حلول إستراتيجية وتجارية متكاملة بأسلوب': 'Soluciones estratégicas y comerciales integradas con un estilo', 'عصري وفاخر': 'moderno y lujoso',
        'نحن شركة رائدة مسجلة في دولة الإمارات العربية المتحدة، نكرّس خبراتنا لمساعدة الأعمال والشركات على النمو والتوسّع وفق أحدث المعايير العالمية.': 'Somos una empresa líder registrada en los EAU, dedicada a ayudar a las empresas a crecer y expandirse según los estándares mundiales más recientes.',
        'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط والعالم.': 'Ser el socio preferido de empresas e instituciones regionales e internacionales que buscan excelencia e innovación en los mercados de los EAU, Oriente Medio y el mundo.',
        'تقديم خدمات وحلول عالمية المستوى تضمن لشركائنا تحقيق أعلى مستويات الأداء والاستدامة والربحية.': 'Ofrecer servicios y soluciones de nivel mundial que ayuden a nuestros socios a alcanzar el máximo rendimiento, sostenibilidad y rentabilidad.',
        'الشفافية، الجودة الشاملة، الالتزام بالتميز، وبناء علاقات طويلة الأمد مع عملائنا وشركائنا.': 'Transparencia, calidad total, compromiso con la excelencia y relaciones duraderas con nuestros clientes y socios.',
        'ربط الشركات بالفرص والشركاء المناسبين، وتسهيل الصفقات التجارية والاستثمارية الموثوقة.': 'Conectar empresas con las oportunidades y socios adecuados y facilitar acuerdos comerciales y de inversión confiables.',
        'إدارة عمليات الاستيراد والتصدير والتجارة العامة عبر أسواق الإمارات والأسواق العالمية.': 'Gestionar operaciones de importación, exportación y comercio general en los mercados de los EAU y del mundo.',
        'حلول تسويقية رقمية للأفراد والشركات لبناء حضور أقوى والوصول إلى العملاء المناسبين.': 'Soluciones de marketing digital para personas y empresas que buscan una presencia más sólida y clientes adecuados.'
    },
    fr: {
        'حلول إستراتيجية وتجارية متكاملة بأسلوب': 'Des solutions stratégiques et commerciales intégrées dans un style', 'عصري وفاخر': 'moderne et luxueux',
        'نحن شركة رائدة مسجلة في دولة الإمارات العربية المتحدة، نكرّس خبراتنا لمساعدة الأعمال والشركات على النمو والتوسّع وفق أحدث المعايير العالمية.': 'Nous sommes une entreprise leader enregistrée aux Émirats arabes unis, dédiée à la croissance et à l’expansion des entreprises selon les normes mondiales les plus récentes.',
        'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط والعالم.': 'Être le partenaire privilégié des entreprises et institutions régionales et internationales à la recherche d’excellence et d’innovation aux Émirats, au Moyen-Orient et dans le monde.',
        'تقديم خدمات وحلول عالمية المستوى تضمن لشركائنا تحقيق أعلى مستويات الأداء والاستدامة والربحية.': 'Fournir des services et solutions de niveau mondial permettant à nos partenaires d’atteindre les plus hauts niveaux de performance, de durabilité et de rentabilité.',
        'الشفافية، الجودة الشاملة، الالتزام بالتميز، وبناء علاقات طويلة الأمد مع عملائنا وشركائنا.': 'Transparence, qualité totale, engagement envers l’excellence et relations durables avec nos clients et partenaires.',
        'ربط الشركات بالفرص والشركاء المناسبين، وتسهيل الصفقات التجارية والاستثمارية الموثوقة.': 'Relier les entreprises aux bonnes opportunités et aux bons partenaires et faciliter des transactions commerciales et d’investissement fiables.',
        'إدارة عمليات الاستيراد والتصدير والتجارة العامة عبر أسواق الإمارات والأسواق العالمية.': 'Gérer les opérations d’importation, d’exportation et de commerce général aux Émirats et sur les marchés mondiaux.',
        'حلول تسويقية رقمية للأفراد والشركات لبناء حضور أقوى والوصول إلى العملاء المناسبين.': 'Des solutions de marketing numérique pour les particuliers et les entreprises afin de renforcer leur présence et d’atteindre les bons clients.'
    },
    'zh-CN': {
        'نحن شركة رائدة مسجلة في دولة الإمارات العربية المتحدة، نكرّس خبراتنا لمساعدة الأعمال والشركات على النمو والتوسّع وفق أحدث المعايير العالمية.': '我们是一家在阿联酋注册的领先企业，致力于帮助企业按照最新的全球标准实现增长与扩张。',
        'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط والعالم.': '成为地区和国际企业及机构的首选合作伙伴，助力其在阿联酋、中东及全球市场追求卓越与创新。',
        'تقديم خدمات وحلول عالمية المستوى تضمن لشركائنا تحقيق أعلى مستويات الأداء والاستدامة والربحية.': '提供世界一流的服务与解决方案，帮助合作伙伴实现最高水平的绩效、可持续发展与盈利能力。',
        'الشفافية، الجودة الشاملة، الالتزام بالتميز، وبناء علاقات طويلة الأمد مع عملائنا وشركائنا.': '透明、全面的质量、对卓越的承诺，以及与客户和合作伙伴建立长期关系。',
        'ربط الشركات بالفرص والشركاء المناسبين، وتسهيل الصفقات التجارية والاستثمارية الموثوقة.': '为企业连接合适的机会与合作伙伴，促成可靠的商业与投资交易。',
        'إدارة عمليات الاستيراد والتصدير والتجارة العامة عبر أسواق الإمارات والأسواق العالمية.': '管理阿联酋及全球市场的进出口和一般贸易业务。',
        'حلول تسويقية رقمية للأفراد والشركات لبناء حضور أقوى والوصول إلى العملاء المناسبين.': '为个人和企业提供数字营销解决方案，打造更强的品牌影响力并触达合适客户。'
    },
    ur: {
        'حلول إستراتيجية وتجارية متكاملة بأسلوب': 'جدید اور شاندار انداز میں', 'عصري وفاخر': 'مربوط اسٹریٹجک اور تجارتی حل',
        'نحن شركة رائدة مسجلة في دولة الإمارات العربية المتحدة، نكرّس خبراتنا لمساعدة الأعمال والشركات على النمو والتوسّع وفق أحدث المعايير العالمية.': 'ہم متحدہ عرب امارات میں رجسٹرڈ ایک معروف کمپنی ہیں جو جدید عالمی معیار کے مطابق کاروباروں کی ترقی اور توسیع میں مدد کرتی ہے۔',
        'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط والعالم.': 'متحدہ عرب امارات، مشرق وسطیٰ اور عالمی منڈیوں میں عمدگی اور جدت کے خواہاں اداروں کے لیے پسندیدہ شراکت دار بننا۔',
        'تقديم خدمات وحلول عالمية المستوى تضمن لشركائنا تحقيق أعلى مستويات الأداء والاستدامة والربحية.': 'عالمی معیار کی خدمات اور حل فراہم کرنا تاکہ ہمارے شراکت دار بہترین کارکردگی، پائیداری اور منافع حاصل کر سکیں۔',
        'الشفافية، الجودة الشاملة، الالتزام بالتميز، وبناء علاقات طويلة الأمد مع عملائنا وشركائنا.': 'شفافیت، مکمل معیار، عمدگی کا عزم اور اپنے صارفین و شراکت داروں کے ساتھ طویل مدتی تعلقات۔',
        'ربط الشركات بالفرص والشركاء المناسبين، وتسهيل الصفقات التجارية والاستثمارية الموثوقة.': 'کمپنیوں کو مناسب مواقع اور شراکت داروں سے جوڑنا اور قابل اعتماد تجارتی و سرمایہ کاری کے معاہدوں کو آسان بنانا۔',
        'إدارة عمليات الاستيراد والتصدير والتجارة العامة عبر أسواق الإمارات والأسواق العالمية.': 'متحدہ عرب امارات اور عالمی منڈیوں میں درآمد، برآمد اور عمومی تجارت کے امور کا انتظام۔',
        'حلول تسويقية رقمية للأفراد والشركات لبناء حضور أقوى والوصول إلى العملاء المناسبين.': 'افراد اور کمپنیوں کے لیے ڈیجیٹل مارکیٹنگ کے حل تاکہ مضبوط موجودگی اور مناسب صارفین تک رسائی حاصل ہو۔'
    },
    fa: {
        'حلول إستراتيجية وتجارية متكاملة بأسلوب': 'راهکارهای یکپارچه راهبردی و تجاری با سبکی', 'عصري وفاخر': 'مدرن و لوکس',
        'نحن شركة رائدة مسجلة في دولة الإمارات العربية المتحدة، نكرّس خبراتنا لمساعدة الأعمال والشركات على النمو والتوسّع وفق أحدث المعايير العالمية.': 'ما یک شرکت پیشرو ثبت‌شده در امارات متحده عربی هستیم و به رشد و توسعه کسب‌وکارها بر اساس جدیدترین استانداردهای جهانی کمک می‌کنیم.',
        'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط والعالم.': 'شریک برگزیده شرکت‌ها و مؤسسات منطقه‌ای و بین‌المللی برای دستیابی به برتری و نوآوری در امارات، خاورمیانه و جهان باشیم.',
        'تقديم خدمات وحلول عالمية المستوى تضمن لشركائنا تحقيق أعلى مستويات الأداء والاستدامة والربحية.': 'ارائه خدمات و راهکارهای جهانی برای دستیابی شرکای ما به بالاترین سطح عملکرد، پایداری و سودآوری.',
        'الشفافية، الجودة الشاملة، الالتزام بالتميز، وبناء علاقات طويلة الأمد مع عملائنا وشركائنا.': 'شفافیت، کیفیت جامع، تعهد به برتری و ایجاد روابط بلندمدت با مشتریان و شرکای ما.',
        'ربط الشركات بالفرص والشركاء المناسبين، وتسهيل الصفقات التجارية والاستثمارية الموثوقة.': 'ارتباط شرکت‌ها با فرصت‌ها و شرکای مناسب و تسهیل معاملات تجاری و سرمایه‌گذاری قابل اعتماد.',
        'إدارة عمليات الاستيراد والتصدير والتجارة العامة عبر أسواق الإمارات والأسواق العالمية.': 'مدیریت عملیات واردات، صادرات و تجارت عمومی در بازارهای امارات و جهان.',
        'حلول تسويقية رقمية للأفراد والشركات لبناء حضور أقوى والوصول إلى العملاء المناسبين.': 'راهکارهای بازاریابی دیجیتال برای افراد و شرکت‌ها جهت ایجاد حضور قوی‌تر و دسترسی به مشتریان مناسب.'
    },
    tr: {
        'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط.': 'BAE ve Orta Doğu pazarlarında mükemmellik ve yenilik arayan bölgesel ve uluslararası kurumların tercih ettiği ortak olmak.',
        '© 2026 AURA ENTERPRISE FZE LLC. جميع الحقوق محفوظة.': '© 2026 AURA ENTERPRISE FZE LLC. Tüm hakları saklıdır.',
        'نحن شركة رائدة مسجلة في دولة الإمارات العربية المتحدة، نكرّس خبراتنا لمساعدة الأعمال والشركات على النمو والتوسّع وفق أحدث المعايير العالمية.': 'Birleşik Arap Emirlikleri’nde kayıtlı lider bir şirket olarak işletmelerin küresel standartlara göre büyümesine ve genişlemesine yardımcı oluyoruz.',
        'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط والعالم.': 'BAE, Orta Doğu ve dünya pazarlarında mükemmellik ve yenilik arayan şirketlerin tercih ettiği ortak olmak.',
        'تقديم خدمات وحلول عالمية المستوى تضمن لشركائنا تحقيق أعلى مستويات الأداء والاستدامة والربحية.': 'Ortaklarımızın en yüksek performans, sürdürülebilirlik ve kârlılık seviyelerine ulaşmasını sağlayan dünya standartlarında hizmetler sunmak.',
        'الشفافية، الجودة الشاملة، الالتزام بالتميز، وبناء علاقات طويلة الأمد مع عملائنا وشركائنا.': 'Şeffaflık, toplam kalite, mükemmellik taahhüdü ve müşterilerimizle uzun vadeli ilişkiler kurmak.',
        'ربط الشركات بالفرص والشركاء المناسبين، وتسهيل الصفقات التجارية والاستثمارية الموثوقة.': 'Şirketleri doğru fırsat ve ortaklarla buluşturmak, güvenilir ticari ve yatırım anlaşmalarını kolaylaştırmak.',
        'إدارة عمليات الاستيراد والتصدير والتجارة العامة عبر أسواق الإمارات والأسواق العالمية.': 'BAE ve küresel pazarlarda ithalat, ihracat ve genel ticaret operasyonlarını yönetmek.',
        'حلول تسويقية رقمية للأفراد والشركات لبناء حضور أقوى والوصول إلى العملاء المناسبين.': 'Bireyler ve şirketler için daha güçlü bir çevrim içi varlık ve doğru müşterilere erişim sağlayan dijital pazarlama çözümleri.'
    }
};

Object.entries(sharedLocalCopy).forEach(([language, values]) => Object.assign(localLanguagePacks[language] || (localLanguagePacks[language] = {}), values));

Object.assign(localLanguagePacks.tr, {
    'الاسم': 'Ad', 'اكتب اسمك': 'Adınızı yazın', 'البريد الإلكتروني': 'E-posta',
    'عن الشركة': 'Şirket hakkında',
    'مجالات العمل': 'Çalışma alanları',
    'التواصل': 'İletişim',
    'تواصل معنا': 'Bize ulaşın',
    'آراء العملاء': 'Müşteri yorumları',
    'اللغة': 'Dil',
    'حلول إستراتيجية وتجارية متكاملة بأسلوب': 'Modern ve lüks bir tarzda',
    'عصري وفاخر': 'entegre stratejik ve ticari çözümler',
    'نحن شركة رائدة مسجلة في دولة الإمارات العربية المتحدة، نكرّس خبراتنا لمساعدة الأعمال والشركات على النمو والتوسّع وفق أحدث المعايير العالمية.': 'Birleşik Arap Emirlikleri’nde kayıtlı lider bir şirket olarak işletmelerin en yeni küresel standartlara göre büyümesine ve genişlemesine yardımcı oluyoruz.',
    'استكشف خدماتنا': 'Hizmetlerimizi keşfedin',
    'تعرّف علينا': 'Bizi tanıyın',
    'من نحن': 'Biz kimiz',
    'رؤيتنا': 'Vizyonumuz',
    'مهمتنا': 'Misyonumuz',
    'قيمنا': 'Değerlerimiz',
    'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط.': 'BAE ve Orta Doğu pazarlarında mükemmellik ve yenilik arayan bölgesel ve uluslararası kurumların tercih ettiği ortak olmak.',
    'تقديم خدمات وحلول عالمية المستوى تضمن لشركائنا تحقيق أعلى مستويات الأداء والاستدامة والربحية.': 'Ortaklarımızın en yüksek performans, sürdürülebilirlik ve kârlılık seviyelerine ulaşmasını sağlayan dünya standartlarında hizmetler sunmak.',
    'الشفافية، الجودة الشاملة، الالتزام بالتميز، وبناء علاقات طويلة الأمد مع عملائنا وشركائنا.': 'Şeffaflık, toplam kalite, mükemmellik taahhüdü ve müşterilerimizle uzun vadeli ilişkiler kurmak.',
    'مجالات التميز': 'Uzmanlık alanlarımız',
    'خدماتنا الاستراتيجية': 'Stratejik hizmetlerimiz',
    'التجارة والاستثمار والوساطة التجارية': 'Ticaret, yatırım ve ticari aracılık',
    'الاستيراد والتصدير والتجارة العامة': 'İthalat, ihracat ve genel ticaret',
    'التسويق الإلكتروني': 'Dijital pazarlama ajansı',
    'ربط الشركات بالفرص والشركاء المناسبين، وتسهيل الصفقات التجارية والاستثمارية الموثوقة.': 'Şirketleri doğru fırsat ve ortaklarla buluşturmak, güvenilir ticari ve yatırım anlaşmalarını kolaylaştırmak.',
    'إدارة عمليات الاستيراد والتصدير والتجارة العامة عبر أسواق الإمارات والأسواق العالمية.': 'BAE ve küresel pazarlarda ithalat, ihracat ve genel ticaret operasyonlarını yönetmek.',
    'حلول تسويقية رقمية للأفراد والشركات لبناء حضور أقوى والوصول إلى العملاء المناسبين.': 'Bireyler ve şirketler için daha güçlü bir çevrim içi varlık ve doğru müşterilere erişim sağlayan dijital pazarlama çözümleri.',
    'تواصل مع فريقنا': 'Ekibimizle iletişime geçin',
    'معلومات الاتصال الرسمية': 'Resmi iletişim bilgileri',
    'يسعدنا الإجابة على جميع استفساراتكم وبناء شراكات جديدة.': 'Sorularınızı yanıtlamaktan ve yeni ortaklıklar kurmaktan memnuniyet duyarız.',
    'البريد الإلكتروني': 'E-posta',
    'رقم الهاتف (الإمارات)': 'Telefon numarası (BAE)',
    'المقر الرئيسي': 'Merkez ofis',
    'سجل الشركة': 'Şirket kaydı',
    'معلومات الترخيص الرسمي للشركة:': 'Resmi şirket lisans bilgileri:',
    'الاسم المسجل': 'Kayıtlı ad',
    'الحالة القانونية': 'Yasal durum',
    'آراء العملاء': 'Müşteri yorumları',
    'تجارب تُلهم ثقة جديدة': 'Yeni bir güvene ilham veren deneyimler',
    'نحن بانتظار أولى تجاربكم معنا.': 'İlk deneyiminizi bizimle paylaşmanızı bekliyoruz.',
    'شاركنا رأيك': 'Deneyiminizi paylaşın',
    'رأيك يساعدنا على تقديم تجربة أفضل.': 'Geri bildiriminiz daha iyi bir deneyim sunmamıza yardımcı olur.',
    'جميع الحقوق محفوظة.': 'Tüm hakları saklıdır.'
});

Object.assign(localLanguagePacks.pt || (localLanguagePacks.pt = {}), {
    'عن الشركة': 'Sobre a empresa',
    'مجالات العمل': 'Áreas de atuação',
    'التواصل': 'Contato',
    'تواصل معنا': 'Fale conosco',
    'آراء العملاء': 'Depoimentos',
    'اللغة': 'Idioma',
    'حلول إستراتيجية وتجارية متكاملة بأسلوب': 'Soluções estratégicas e comerciais integradas em um estilo', 'عصري وفاخر': 'moderno e luxuoso',
    'نحن شركة رائدة مسجلة في دولة الإمارات العربية المتحدة، نكرّس خبراتنا لمساعدة الأعمال والشركات على النمو والتوسّع وفق أحدث المعايير العالمية.': 'Somos uma empresa líder registrada nos EAU, dedicada a ajudar negócios e empresas a crescer e expandir conforme os mais recentes padrões globais.', 'استكشف خدماتنا': 'Explore nossos serviços', 'تعرّف علينا': 'Sobre nós',
    'من نحن': 'Sobre nós', 'رؤيتنا': 'Nossa visão', 'مهمتنا': 'Nossa missão', 'قيمنا': 'Nossos valores', 'مجالات التميز': 'Áreas de excelência', 'خدماتنا الاستراتيجية': 'Nossos serviços estratégicos',
    'التجارة والاستثمار والوساطة التجارية': 'Comércio, investimento e corretagem comercial', 'الاستيراد والتصدير والتجارة العامة': 'Importação, exportação e comércio geral', 'التسويق الإلكتروني': 'Agência de marketing digital',
    'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط.': 'Ser o parceiro preferido de empresas e instituições que buscam excelência e inovação nos EAU e no Oriente Médio.',
    'تقديم خدمات وحلول عالمية المستوى تضمن لشركائنا تحقيق أعلى مستويات الأداء والاستدامة والربحية.': 'Oferecer serviços e soluções de nível mundial para ajudar nossos parceiros a alcançar desempenho, sustentabilidade e rentabilidade máximos.',
    'الشفافية، الجودة الشاملة، الالتزام بالتميز، وبناء علاقات طويلة الأمد مع عملائنا وشركائنا.': 'Transparência, qualidade total, compromisso com a excelência e relações duradouras com clientes e parceiros.',
    'ربط الشركات بالفرص والشركاء المناسبين، وتسهيل الصفقات التجارية والاستثمارية الموثوقة.': 'Conectar empresas às oportunidades e parceiros certos e facilitar negócios comerciais e de investimento confiáveis.', 'إدارة عمليات الاستيراد والتصدير والتجارة العامة عبر أسواق الإمارات والأسواق العالمية.': 'Gerir operações de importação, exportação e comércio geral nos mercados dos EAU e globais.', 'حلول تسويقية رقمية للأفراد والشركات لبناء حضور أقوى والوصول إلى العملاء المناسبين.': 'Soluções de marketing digital para pessoas e empresas construírem uma presença mais forte e alcançarem os clientes certos.',
    'تواصل مع فريقنا': 'Fale com nossa equipe', 'معلومات الاتصال الرسمية': 'Informações oficiais de contato', 'يسعدنا الإجابة على جميع استفساراتكم وبناء شراكات جديدة.': 'Teremos prazer em responder às suas perguntas e construir novas parcerias.', 'البريد الإلكتروني': 'E-mail', 'رقم الهاتف (الإمارات)': 'Telefone (EAU)', 'المقر الرئيسي': 'Sede', 'سجل الشركة': 'Registro da empresa', 'الاسم المسجل': 'Nome registrado', 'الحالة القانونية': 'Situação jurídica', 'جميع الحقوق محفوظة.': 'Todos os direitos reservados.'
});

Object.assign(localLanguagePacks.hi || (localLanguagePacks.hi = {}), {
    'عن الشركة': 'कंपनी के बारे में',
    'مجالات العمل': 'कार्य क्षेत्र',
    'التواصل': 'संपर्क',
    'تواصل معنا': 'हमसे संपर्क करें',
    'آراء العملاء': 'ग्राहकों की राय',
    'اللغة': 'भाषा',
    'حلول إستراتيجية وتجارية متكاملة بأسلوب': 'आधुनिक और शानदार शैली में', 'عصري وفاخر': 'एकीकृत रणनीतिक और वाणिज्यिक समाधान',
    'نحن شركة رائدة مسجلة في دولة الإمارات العربية المتحدة، نكرّس خبراتنا لمساعدة الأعمال والشركات على النمو والتوسّع وفق أحدث المعايير العالمية.': 'हम यूएई में पंजीकृत एक अग्रणी कंपनी हैं, जो नवीनतम वैश्विक मानकों के अनुसार व्यवसायों को बढ़ने और विस्तार करने में सहायता करती है।', 'استكشف خدماتنا': 'हमारी सेवाएं देखें', 'تعرّف علينا': 'हमारे बारे में',
    'من نحن': 'हमारे बारे में', 'رؤيتنا': 'हमारा विज़न', 'مهمتنا': 'हमारा मिशन', 'قيمنا': 'हमारे मूल्य', 'مجالات التميز': 'विशेषज्ञता के क्षेत्र', 'خدماتنا الاستراتيجية': 'हमारी रणनीतिक सेवाएं',
    'التجارة والاستثمار والوساطة التجارية': 'व्यापार, निवेश और वाणिज्यिक ब्रोकरेज', 'الاستيراد والتصدير والتجارة العامة': 'आयात, निर्यात और सामान्य व्यापार', 'التسويق الإلكتروني': 'डिजिटल मार्केटिंग एजेंसी',
    'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط.': 'यूएई और मध्य पूर्व में उत्कृष्टता और नवाचार की तलाश करने वाली कंपनियों और संस्थानों के पसंदीदा भागीदार बनना।',
    'تقديم خدمات وحلول عالمية المستوى تضمن لشركائنا تحقيق أعلى مستويات الأداء والاستدامة والربحية.': 'विश्व स्तरीय सेवाएं और समाधान प्रदान करना ताकि हमारे साझेदार बेहतर प्रदर्शन, स्थिरता और लाभप्रदता प्राप्त कर सकें।',
    'الشفافية، الجودة الشاملة، الالتزام بالتميز، وبناء علاقات طويلة الأمد مع عملائنا وشركائنا.': 'पारदर्शिता, पूर्ण गुणवत्ता, उत्कृष्टता के प्रति प्रतिबद्धता और ग्राहकों व साझेदारों के साथ दीर्घकालिक संबंध।',
    'ربط الشركات بالفرص والشركاء المناسبين، وتسهيل الصفقات التجارية والاستثمارية الموثوقة.': 'कंपनियों को सही अवसरों और साझेदारों से जोड़ना तथा विश्वसनीय व्यापार और निवेश सौदों को आसान बनाना।', 'إدارة عمليات الاستيراد والتصدير والتجارة العامة عبر أسواق الإمارات والأسواق العالمية.': 'यूएई और वैश्विक बाजारों में आयात, निर्यात और सामान्य व्यापार संचालन का प्रबंधन।', 'حلول تسويقية رقمية للأفراد والشركات لبناء حضور أقوى والوصول إلى العملاء المناسبين.': 'व्यक्तियों और कंपनियों के लिए डिजिटल मार्केटिंग समाधान ताकि मजबूत उपस्थिति और सही ग्राहकों तक पहुंच बनाई जा सके।',
    'تواصل مع فريقنا': 'हमारी टीम से संपर्क करें', 'معلومات الاتصال الرسمية': 'आधिकारिक संपर्क जानकारी', 'يسعدنا الإجابة على جميع استفساراتكم وبناء شراكات جديدة.': 'हम आपके प्रश्नों का उत्तर देने और नई साझेदारियां बनाने में प्रसन्न हैं।', 'البريد الإلكتروني': 'ईमेल', 'رقم الهاتف (الإمارات)': 'फोन नंबर (यूएई)', 'المقر الرئيسي': 'मुख्यालय', 'سجل الشركة': 'कंपनी पंजीकरण', 'الاسم المسجل': 'पंजीकृत नाम', 'الحالة القانونية': 'कानूनी स्थिति', 'جميع الحقوق محفوظة.': 'सर्वाधिकार सुरक्षित।'
});

Object.assign(localLanguagePacks.es, {
    'حلول إستراتيجية وتجارية متكاملة بأسلوب': 'Soluciones estratégicas y comerciales integradas con un estilo', 'عصري وفاخر': 'moderno y lujoso', 'استكشف خدماتنا': 'Explora nuestros servicios', 'تعرّف علينا': 'Sobre nosotros',
    'تواصل مع فريقنا': 'Contacta con nuestro equipo', 'معلومات الاتصال الرسمية': 'Información oficial de contacto', 'يسعدنا الإجابة على جميع استفساراتكم وبناء شراكات جديدة.': 'Nos complace responder a sus preguntas y construir nuevas alianzas.',
    'سجل الشركة': 'Registro de la empresa', 'معلومات الترخيص الرسمي للشركة:': 'Información oficial de la licencia de la empresa', 'الاسم المسجل': 'Nombre registrado', 'الحالة القانونية': 'Situación legal', 'البريد الإلكتروني': 'Correo electrónico', 'رقم الهاتف (الإمارات)': 'Teléfono (EAU)', 'المقر الرئيسي': 'Sede central'
});

Object.assign(localLanguagePacks.ur, {
    'حلول إستراتيجية وتجارية متكاملة بأسلوب': 'جدید اور شاندار انداز میں', 'عصري وفاخر': 'مربوط اسٹریٹجک اور تجارتی حل', 'استكشف خدماتنا': 'ہماری خدمات دیکھیں', 'تعرّف علينا': 'ہمارے بارے میں',
    'تواصل مع فريقنا': 'ہماری ٹیم سے رابطہ کریں', 'معلومات الاتصال الرسمية': 'سرکاری رابطے کی معلومات', 'يسعدنا الإجابة على جميع استفساراتكم وبناء شراكات جديدة.': 'ہم آپ کے سوالات کے جواب دینے اور نئی شراکت داریاں بنانے میں خوش ہیں۔',
    'سجل الشركة': 'کمپنی کا اندراج', 'معلومات الترخيص الرسمي للشركة:': 'کمپنی کے سرکاری لائسنس کی معلومات', 'الاسم المسجل': 'رجسٹرڈ نام', 'الحالة القانونية': 'قانونی حیثیت', 'البريد الإلكتروني': 'ای میل', 'رقم الهاتف (الإمارات)': 'فون نمبر (متحدہ عرب امارات)', 'المقر الرئيسي': 'مرکزی دفتر'
});

Object.assign(localLanguagePacks.fa, {
    'حلول إستراتيجية وتجارية متكاملة بأسلوب': 'راهکارهای یکپارچه راهبردی و تجاری با سبکی', 'عصري وفاخر': 'مدرن و لوکس', 'استكشف خدماتنا': 'خدمات ما را ببینید', 'تعرّف علينا': 'درباره ما',
    'تواصل مع فريقنا': 'با تیم ما تماس بگیرید', 'معلومات الاتصال الرسمية': 'اطلاعات رسمی تماس', 'يسعدنا الإجابة على جميع استفساراتكم وبناء شراكات جديدة.': 'خوشحالیم که به پرسش‌های شما پاسخ دهیم و همکاری‌های جدید بسازیم.',
    'سجل الشركة': 'ثبت شرکت', 'معلومات الترخيص الرسمي للشركة:': 'اطلاعات رسمی مجوز شرکت', 'الاسم المسجل': 'نام ثبت‌شده', 'الحالة القانونية': 'وضعیت حقوقی', 'البريد الإلكتروني': 'ایمیل', 'رقم الهاتف (الإمارات)': 'شماره تلفن (امارات)', 'المقر الرئيسي': 'دفتر مرکزی'
});

const remainingPageCopy = {
    de: {
        'حلول إستراتيجية وتجارية متكاملة بأسلوب': 'Integrierte strategische und kommerzielle Lösungen in einem', 'عصري وفاخر': 'modernen und luxuriösen Stil', 'استكشف خدماتنا': 'Unsere Dienstleistungen entdecken', 'تعرّف علينا': 'Über uns', 'نحن شركة رائدة مسجلة في دولة الإمارات العربية المتحدة، نكرّس خبراتنا لمساعدة الأعمال والشركات على النمو والتوسّع وفق أحدث المعايير العالمية.': 'Wir sind ein führendes Unternehmen in den VAE und unterstützen Unternehmen bei Wachstum und Expansion nach den neuesten globalen Standards.', 'تجارب تُلهم ثقة جديدة': 'Erfahrungen, die neues Vertrauen schaffen', 'نحن بانتظار أولى تجاربكم معنا.': 'Wir freuen uns auf Ihre erste Erfahrung mit uns.', 'شاركنا رأيك': 'Teilen Sie Ihre Erfahrung', 'رأيك يساعدنا على تقديم تجربة أفضل.': 'Ihr Feedback hilft uns, ein besseres Erlebnis zu schaffen.', 'معلومات الاتصال الرسمية': 'Offizielle Kontaktinformationen', 'يسعدنا الإجابة على جميع استفساراتكم وبناء شراكات جديدة.': 'Wir beantworten gerne Ihre Fragen und bauen neue Partnerschaften auf.', 'البريد الإلكتروني': 'E-Mail', 'رقم الهاتف (الإمارات)': 'Telefon (VAE)', 'المقر الرئيسي': 'Hauptsitz', 'سجل الشركة': 'Unternehmensregister', 'معلومات الترخيص الرسمي للشركة:': 'Offizielle Lizenzinformationen des Unternehmens', 'الاسم المسجل': 'Eingetragener Name', 'الحالة القانونية': 'Rechtsstatus', 'جميع الحقوق محفوظة.': 'Alle Rechte vorbehalten.', 'التقييمات ستظهر هنا قريبًا.': 'Bewertungen werden bald angezeigt.', 'إرسال التقييم': 'Bewertung senden', 'اختر تقييمك': 'Bewertung auswählen', 'كيف كانت تجربتك معنا؟': 'Wie war Ihre Erfahrung mit uns?'
    },
    pt: {
        'حلول إستراتيجية وتجارية متكاملة بأسلوب': 'Soluções estratégicas e comerciais integradas em um estilo', 'عصري وفاخر': 'moderno e luxuoso', 'استكشف خدماتنا': 'Explore nossos serviços', 'تعرّف علينا': 'Sobre nós', 'نحن شركة رائدة مسجلة في دولة الإمارات العربية المتحدة، نكرّس خبراتنا لمساعدة الأعمال والشركات على النمو والتوسّع وفق أحدث المعايير العالمية.': 'Somos uma empresa líder registrada nos EAU, dedicada a ajudar empresas a crescer e expandir conforme os mais recentes padrões globais.', 'تجارب تُلهم ثقة جديدة': 'Experiências que inspiram uma nova confiança', 'نحن بانتظار أولى تجاربكم معنا.': 'Aguardamos sua primeira experiência conosco.', 'شاركنا رأيك': 'Compartilhe sua experiência', 'رأيك يساعدنا على تقديم تجربة أفضل.': 'Seu feedback nos ajuda a oferecer uma experiência melhor.', 'معلومات الاتصال الرسمية': 'Informações oficiais de contato', 'يسعدنا الإجابة على جميع استفساراتكم وبناء شراكات جديدة.': 'Teremos prazer em responder às suas perguntas e construir novas parcerias.', 'البريد الإلكتروني': 'E-mail', 'رقم الهاتف (الإمارات)': 'Telefone (EAU)', 'المقر الرئيسي': 'Sede', 'سجل الشركة': 'Registro da empresa', 'معلومات الترخيص الرسمي للشركة:': 'Informações oficiais de licença da empresa', 'الاسم المسجل': 'Nome registrado', 'الحالة القانونية': 'Situação jurídica', 'جميع الحقوق محفوظة.': 'Todos os direitos reservados.', 'التقييمات ستظهر هنا قريبًا.': 'As avaliações aparecerão em breve.', 'إرسال التقييم': 'Enviar avaliação', 'اختر تقييمك': 'Escolha sua avaliação', 'كيف كانت تجربتك معنا؟': 'Como foi sua experiência conosco?'
    },
    hi: {
        'حلول إستراتيجية وتجارية متكاملة بأسلوب': 'आधुनिक और शानदार शैली में', 'عصري وفاخر': 'एकीकृत रणनीतिक और वाणिज्यिक समाधान', 'استكشف خدماتنا': 'हमारी सेवाएं देखें', 'تعرّف علينا': 'हमारे बारे में', 'نحن شركة رائدة مسجلة في دولة الإمارات العربية المتحدة، نكرّس خبراتنا لمساعدة الأعمال والشركات على النمو والتوسّع وفق أحدث المعايير العالمية.': 'हम यूएई में पंजीकृत एक अग्रणी कंपनी हैं और नवीनतम वैश्विक मानकों के अनुसार व्यवसायों को बढ़ने में मदद करते हैं।', 'تجارب تُلهم ثقة جديدة': 'नए विश्वास को प्रेरित करने वाले अनुभव', 'نحن بانتظار أولى تجاربكم معنا.': 'हम आपके पहले अनुभव के बारे में सुनने की प्रतीक्षा कर रहे हैं।', 'شاركنا رأيك': 'अपना अनुभव साझा करें', 'رأيك يساعدنا على تقديم تجربة أفضل.': 'आपकी प्रतिक्रिया हमें बेहतर अनुभव देने में मदद करती है।', 'معلومات الاتصال الرسمية': 'आधिकारिक संपर्क जानकारी', 'يسعدنا الإجابة على جميع استفساراتكم وبناء شراكات جديدة.': 'हमें आपके प्रश्नों का उत्तर देने और नई साझेदारी बनाने में खुशी होगी।', 'البريد الإلكتروني': 'ईमेल', 'رقم الهاتف (الإمارات)': 'फोन नंबर (यूएई)', 'المقر الرئيسي': 'मुख्यालय', 'سجل الشركة': 'कंपनी पंजीकरण', 'معلومات الترخيص الرسمي للشركة:': 'आधिकारिक कंपनी लाइसेंस जानकारी', 'الاسم المسجل': 'पंजीकृत नाम', 'الحالة القانونية': 'कानूनी स्थिति', 'جميع الحقوق محفوظة.': 'सर्वाधिकार सुरक्षित।', 'التقييمات ستظهر هنا قريبًا.': 'समीक्षाएं जल्द दिखाई देंगी।', 'إرسال التقييم': 'समीक्षा भेजें', 'اختر تقييمك': 'अपनी रेटिंग चुनें', 'كيف كانت تجربتك معنا؟': 'आपका अनुभव कैसा रहा?'
    },
    'zh-CN': {
        'تجارب تُلهم ثقة جديدة': '激发全新信任的体验', 'نحن بانتظار أولى تجاربكم معنا.': '我们期待听到您与我们的第一次体验。', 'شاركنا رأيك': '分享您的体验', 'رأيك يساعدنا على تقديم تجربة أفضل.': '您的反馈帮助我们提供更好的体验。', 'معلومات الاتصال الرسمية': '官方联系信息', 'يسعدنا الإجابة على جميع استفساراتكم وبناء شراكات جديدة.': '我们乐意回答您的问题并建立新的合作伙伴关系。', 'البريد الإلكتروني': '电子邮箱', 'رقم الهاتف (الإمارات)': '电话（阿联酋）', 'المقر الرئيسي': '总部', 'سجل الشركة': '公司注册信息', 'معلومات الترخيص الرسمي للشركة:': '官方公司许可信息', 'الاسم المسجل': '注册名称', 'الحالة القانونية': '法律状态', 'جميع الحقوق محفوظة.': '版权所有。', 'اختر تقييمك': '选择评分', 'إرسال التقييم': '提交评价', 'التقييمات ستظهر هنا قريبًا.': '评价即将显示。', 'كيف كانت تجربتك معنا؟': '您的体验如何？'
    }
};

Object.entries(remainingPageCopy).forEach(([language, values]) => Object.assign(localLanguagePacks[language] || (localLanguagePacks[language] = {}), values));

Object.assign(localLanguagePacks.fr, {
    'حلول إستراتيجية وتجارية متكاملة بأسلوب': 'Des solutions stratégiques et commerciales intégrées dans un style',
    'عصري وفاخر': 'moderne et luxueux',
    'استكشف خدماتنا': 'Découvrez nos services',
    'تعرّف علينا': 'À propos de nous',
    'نحن شركة رائدة مسجلة في دولة الإمارات العربية المتحدة، نكرّس خبراتنا لمساعدة الأعمال والشركات على النمو والتوسّع وفق أحدث المعايير العالمية.': 'Nous sommes une entreprise leader enregistrée aux Émirats arabes unis, dédiée à aider les entreprises à se développer selon les normes mondiales les plus récentes.',
    'معلومات الاتصال الرسمية': 'Informations officielles de contact',
    'يسعدنا الإجابة على جميع استفساراتكم وبناء شراكات جديدة.': 'Nous sommes heureux de répondre à vos questions et de construire de nouveaux partenariats.',
    'البريد الإلكتروني': 'E-mail', 'رقم الهاتف (الإمارات)': 'Téléphone (EAU)', 'المقر الرئيسي': 'Siège social',
    'سجل الشركة': 'Registre de la société', 'معلومات الترخيص الرسمي للشركة:': 'Informations officielles sur la licence de la société', 'الاسم المسجل': 'Nom enregistré', 'الحالة القانونية': 'Statut juridique',
    'تجارب تُلهم ثقة جديدة': 'Des expériences qui inspirent une nouvelle confiance', 'نحن بانتظار أولى تجاربكم معنا.': 'Nous attendons avec plaisir votre première expérience avec nous.', 'شاركنا رأيك': 'Partagez votre expérience', 'رأيك يساعدنا على تقديم تجربة أفضل.': 'Votre avis nous aide à offrir une meilleure expérience.',
    'الاسم': 'Nom', 'التقييم': 'Évaluation', 'رسالتك': 'Votre message', 'إرسال التقييم': 'Envoyer l’avis', 'اختر تقييمك': 'Choisissez votre évaluation', 'كيف كانت تجربتك معنا؟': 'Comment était votre expérience avec nous ?', 'التقييمات ستظهر هنا قريبًا.': 'Les avis apparaîtront bientôt.',
    'جميع الحقوق محفوظة.': 'Tous droits réservés.'
});

Object.assign(localLanguagePacks.tr, {
    'استشارة مجانية': 'Ücretsiz danışmanlık', 'اطلب استشارتك المجانية': 'Ücretsiz danışmanlığınızı isteyin', 'دعنا نتواصل معك': 'Sizinle iletişime geçelim',
    'أرسل بياناتك وسيتواصل معك فريق AURA لمناقشة احتياجك وتقديم التوجيه المناسب.': 'Bilgilerinizi gönderin; AURA ekibi ihtiyaçlarınızı görüşmek ve uygun yönlendirmeyi sunmak için sizinle iletişime geçsin.',
    'مفتاح الدولة': 'Ülke kodu', 'رقم الهاتف': 'Telefon numarası', 'نوع الاستشارة': 'Danışmanlık türü', 'اختر نوع الاستشارة': 'Danışmanlık türünü seçin',
    'استشارة عامة': 'Genel danışmanlık', 'أوافق على التواصل معي بخصوص طلب الاستشارة.': 'Danışmanlık talebim hakkında benimle iletişime geçilmesini kabul ediyorum.', 'إرسال طلب الاستشارة': 'Danışmanlık talebi gönder'
});

Object.assign(localLanguagePacks.pt, {
    'الاسم': 'Nome', 'اكتب اسمك': 'Digite seu nome', 'البريد الإلكتروني': 'E-mail',
    'استشارة مجانية': 'Consulta gratuita', 'اطلب استشارتك المجانية': 'Solicite sua consulta gratuita', 'دعنا نتواصل معك': 'Fale conosco',
    'أرسل بياناتك وسيتواصل معك فريق AURA لمناقشة احتياجك وتقديم التوجيه المناسب.': 'Envie seus dados e a equipe AURA entrará em contato para entender sua necessidade e oferecer a orientação adequada.',
    'مفتاح الدولة': 'Código do país', 'رقم الهاتف': 'Número de telefone', 'نوع الاستشارة': 'Tipo de consulta', 'اختر نوع الاستشارة': 'Escolha o tipo de consulta',
    'استشارة عامة': 'Consulta geral', 'أوافق على التواصل معي بخصوص طلب الاستشارة.': 'Concordo em ser contatado sobre meu pedido de consulta.', 'إرسال طلب الاستشارة': 'Enviar pedido de consulta'
});

Object.assign(localLanguagePacks.hi, {
    'الاسم': 'नाम', 'اكتب اسمك': 'अपना नाम लिखें', 'البريد الإلكتروني': 'ईमेल',
    'استشارة مجانية': 'निःशुल्क परामर्श', 'اطلب استشارتك المجانية': 'अपना निःशुल्क परामर्श प्राप्त करें', 'دعنا نتواصل معك': 'हम आपसे संपर्क करेंगे',
    'أرسل بياناتك وسيتواصل معك فريق AURA لمناقشة احتياجك وتقديم التوجيه المناسب.': 'अपनी जानकारी भेजें और AURA टीम आपकी आवश्यकता पर चर्चा करने तथा उचित मार्गदर्शन देने के लिए आपसे संपर्क करेगी।',
    'مفتاح الدولة': 'देश कोड', 'رقم الهاتف': 'फोन नंबर', 'نوع الاستشارة': 'परामर्श का प्रकार', 'اختر نوع الاستشارة': 'परामर्श का प्रकार चुनें',
    'استشارة عامة': 'सामान्य परामर्श', 'أوافق على التواصل معي بخصوص طلب الاستشارة.': 'मैं अपने परामर्श अनुरोध के संबंध में संपर्क किए जाने के लिए सहमत हूं।', 'إرسال طلب الاستشارة': 'परामर्श अनुरोध भेजें'
});

const countryCallingCodes = [
    ['Afghanistan', '+93'], ['Albania', '+355'], ['Algeria', '+213'], ['Andorra', '+376'], ['Angola', '+244'], ['Antigua and Barbuda', '+1-268'], ['Argentina', '+54'], ['Armenia', '+374'], ['Australia', '+61'], ['Austria', '+43'], ['Azerbaijan', '+994'],
    ['Bahamas', '+1-242'], ['Bahrain', '+973'], ['Bangladesh', '+880'], ['Barbados', '+1-246'], ['Belarus', '+375'], ['Belgium', '+32'], ['Belize', '+501'], ['Benin', '+229'], ['Bhutan', '+975'], ['Bolivia', '+591'], ['Bosnia and Herzegovina', '+387'], ['Botswana', '+267'], ['Brazil', '+55'], ['Brunei', '+673'], ['Bulgaria', '+359'], ['Burkina Faso', '+226'], ['Burundi', '+257'],
    ['Cabo Verde', '+238'], ['Cambodia', '+855'], ['Cameroon', '+237'], ['Canada', '+1'], ['Central African Republic', '+236'], ['Chad', '+235'], ['Chile', '+56'], ['China', '+86'], ['Colombia', '+57'], ['Comoros', '+269'], ['Congo', '+242'], ['Costa Rica', '+506'], ['Croatia', '+385'], ['Cuba', '+53'], ['Cyprus', '+357'], ['Czechia', '+420'],
    ['Denmark', '+45'], ['Djibouti', '+253'], ['Dominica', '+1-767'], ['Dominican Republic', '+1-809'], ['Ecuador', '+593'], ['Egypt', '+20'], ['El Salvador', '+503'], ['Equatorial Guinea', '+240'], ['Eritrea', '+291'], ['Estonia', '+372'], ['Eswatini', '+268'], ['Ethiopia', '+251'],
    ['Fiji', '+679'], ['Finland', '+358'], ['France', '+33'], ['Gabon', '+241'], ['Gambia', '+220'], ['Georgia', '+995'], ['Germany', '+49'], ['Ghana', '+233'], ['Greece', '+30'], ['Grenada', '+1-473'], ['Guatemala', '+502'], ['Guinea', '+224'], ['Guinea-Bissau', '+245'], ['Guyana', '+592'],
    ['Haiti', '+509'], ['Honduras', '+504'], ['Hungary', '+36'], ['Iceland', '+354'], ['India', '+91'], ['Indonesia', '+62'], ['Iran', '+98'], ['Iraq', '+964'], ['Ireland', '+353'], ['Israel', '+972'], ['Italy', '+39'], ['Jamaica', '+1-876'], ['Japan', '+81'], ['Jordan', '+962'],
    ['Kazakhstan', '+7'], ['Kenya', '+254'], ['Kiribati', '+686'], ['Kuwait', '+965'], ['Kyrgyzstan', '+996'], ['Laos', '+856'], ['Latvia', '+371'], ['Lebanon', '+961'], ['Lesotho', '+266'], ['Liberia', '+231'], ['Libya', '+218'], ['Liechtenstein', '+423'], ['Lithuania', '+370'], ['Luxembourg', '+352'],
    ['Madagascar', '+261'], ['Malawi', '+265'], ['Malaysia', '+60'], ['Maldives', '+960'], ['Mali', '+223'], ['Malta', '+356'], ['Marshall Islands', '+692'], ['Mauritania', '+222'], ['Mauritius', '+230'], ['Mexico', '+52'], ['Micronesia', '+691'], ['Moldova', '+373'], ['Monaco', '+377'], ['Mongolia', '+976'], ['Montenegro', '+382'], ['Morocco', '+212'], ['Mozambique', '+258'], ['Myanmar', '+95'],
    ['Namibia', '+264'], ['Nauru', '+674'], ['Nepal', '+977'], ['Netherlands', '+31'], ['New Zealand', '+64'], ['Nicaragua', '+505'], ['Niger', '+227'], ['Nigeria', '+234'], ['North Korea', '+850'], ['North Macedonia', '+389'], ['Norway', '+47'], ['Oman', '+968'], ['Pakistan', '+92'], ['Palau', '+680'], ['Palestine', '+970'], ['Panama', '+507'], ['Papua New Guinea', '+675'], ['Paraguay', '+595'], ['Peru', '+51'], ['Philippines', '+63'], ['Poland', '+48'], ['Portugal', '+351'],
    ['Qatar', '+974'], ['Romania', '+40'], ['Russia', '+7'], ['Rwanda', '+250'], ['Saint Kitts and Nevis', '+1-869'], ['Saint Lucia', '+1-758'], ['Saint Vincent and the Grenadines', '+1-784'], ['Samoa', '+685'], ['San Marino', '+378'], ['Sao Tome and Principe', '+239'], ['Saudi Arabia', '+966'], ['Senegal', '+221'], ['Serbia', '+381'], ['Seychelles', '+248'], ['Sierra Leone', '+232'], ['Singapore', '+65'], ['Slovakia', '+421'], ['Slovenia', '+386'], ['Solomon Islands', '+677'], ['Somalia', '+252'], ['South Africa', '+27'], ['South Korea', '+82'], ['South Sudan', '+211'], ['Spain', '+34'], ['Sri Lanka', '+94'], ['Sudan', '+249'], ['Suriname', '+597'], ['Sweden', '+46'], ['Switzerland', '+41'], ['Syria', '+963'],
    ['Taiwan', '+886'], ['Tajikistan', '+992'], ['Tanzania', '+255'], ['Thailand', '+66'], ['Timor-Leste', '+670'], ['Togo', '+228'], ['Tonga', '+676'], ['Trinidad and Tobago', '+1-868'], ['Tunisia', '+216'], ['Turkey', '+90'], ['Turkmenistan', '+993'], ['Tuvalu', '+688'], ['Uganda', '+256'], ['Ukraine', '+380'], ['United Arab Emirates', '+971'], ['United Kingdom', '+44'], ['United States', '+1'], ['Uruguay', '+598'], ['Uzbekistan', '+998'], ['Vanuatu', '+678'], ['Vatican City', '+39'], ['Venezuela', '+58'], ['Vietnam', '+84'], ['Yemen', '+967'], ['Zambia', '+260'], ['Zimbabwe', '+263']
];

const consultationLanguagePacks = {
    en: { 'اطلب استشارة مجانية': 'Request a Free Consultation' },
    tr: { 'اطلب استشارة مجانية': 'Ücretsiz danışmanlık isteyin' },
    pt: { 'اطلب استشارة مجانية': 'Solicite uma consulta gratuita' },
    hi: { 'اطلب استشارة مجانية': 'निःशुल्क परामर्श प्राप्त करें' },
    es: {
        'اطلب استشارة مجانية': 'Solicita una consulta gratuita', 'استشارة مجانية': 'Consulta gratuita', 'اطلب استشارتك المجانية': 'Solicita tu consulta gratuita', 'دعنا نتواصل معك': 'Nos pondremos en contacto contigo', 'أرسل بياناتك وسيتواصل معك فريق AURA لمناقشة احتياجك وتقديم التوجيه المناسب.': 'Envía tus datos y el equipo de AURA se pondrá en contacto contigo para conocer tus necesidades y ofrecerte orientación.', 'الاسم': 'Nombre', 'اكتب اسمك': 'Escribe tu nombre', 'مفتاح الدولة': 'Código de país', 'رقم الهاتف': 'Número de teléfono', 'البريد الإلكتروني': 'Correo electrónico', 'نوع الاستشارة': 'Tipo de consulta', 'اختر نوع الاستشارة': 'Elige el tipo de consulta', 'استشارة عامة': 'Consulta general', 'أوافق على التواصل معي بخصوص طلب الاستشارة.': 'Acepto que me contacten sobre mi solicitud de consulta.', 'إرسال طلب الاستشارة': 'Enviar solicitud de consulta'
    },
    fr: {
        'اطلب استشارة مجانية': 'Demandez une consultation gratuite', 'استشارة مجانية': 'Consultation gratuite', 'اطلب استشارتك المجانية': 'Demandez votre consultation gratuite', 'دعنا نتواصل معك': 'Laissez-nous vous contacter', 'أرسل بياناتك وسيتواصل معك فريق AURA لمناقشة احتياجك وتقديم التوجيه المناسب.': 'Envoyez vos coordonnées et l’équipe AURA vous contactera pour comprendre vos besoins et vous orienter.', 'الاسم': 'Nom', 'اكتب اسمك': 'Écrivez votre nom', 'مفتاح الدولة': 'Indicatif du pays', 'رقم الهاتف': 'Numéro de téléphone', 'البريد الإلكتروني': 'E-mail', 'نوع الاستشارة': 'Type de consultation', 'اختر نوع الاستشارة': 'Choisissez le type de consultation', 'استشارة عامة': 'Consultation générale', 'أوافق على التواصل معي بخصوص طلب الاستشارة.': 'J’accepte d’être contacté au sujet de ma demande de consultation.', 'إرسال طلب الاستشارة': 'Envoyer la demande de consultation'
    },
    de: {
        'اطلب استشارة مجانية': 'Kostenlose Beratung anfordern', 'استشارة مجانية': 'Kostenlose Beratung', 'اطلب استشارتك المجانية': 'Kostenlose Beratung anfordern', 'دعنا نتواصل معك': 'Wir kontaktieren Sie', 'أرسل بياناتك وسيتواصل معك فريق AURA لمناقشة احتياجك وتقديم التوجيه المناسب.': 'Senden Sie Ihre Daten. Das AURA-Team kontaktiert Sie, um Ihren Bedarf zu besprechen und passende Beratung anzubieten.', 'الاسم': 'Name', 'اكتب اسمك': 'Namen eingeben', 'مفتاح الدولة': 'Ländervorwahl', 'رقم الهاتف': 'Telefonnummer', 'البريد الإلكتروني': 'E-Mail', 'نوع الاستشارة': 'Beratungsart', 'اختر نوع الاستشارة': 'Beratungsart auswählen', 'استشارة عامة': 'Allgemeine Beratung', 'أوافق على التواصل معي بخصوص طلب الاستشارة.': 'Ich stimme zu, bezüglich meiner Beratungsanfrage kontaktiert zu werden.', 'إرسال طلب الاستشارة': 'Beratungsanfrage senden'
    },
    'zh-CN': {
        'اطلب استشارة مجانية': '申请免费咨询', 'استشارة مجانية': '免费咨询', 'اطلب استشارتك المجانية': '申请免费咨询', 'دعنا نتواصل معك': '让我们联系您', 'أرسل بياناتك وسيتواصل معك فريق AURA لمناقشة احتياجك وتقديم التوجيه المناسب.': '提交您的信息，AURA 团队将联系您，了解您的需求并提供合适的指导。', 'الاسم': '姓名', 'اكتب اسمك': '请输入您的姓名', 'مفتاح الدولة': '国家/地区代码', 'رقم الهاتف': '电话号码', 'البريد الإلكتروني': '电子邮箱', 'نوع الاستشارة': '咨询类型', 'اختر نوع الاستشارة': '选择咨询类型', 'استشارة عامة': '一般咨询', 'أوافق على التواصل معي بخصوص طلب الاستشارة.': '我同意就咨询请求与我联系。', 'إرسال طلب الاستشارة': '提交咨询请求'
    },
    ur: {
        'اطلب استشارة مجانية': 'مفت مشاورت کی درخواست کریں', 'استشارة مجانية': 'مفتا مشاورت', 'اطلب استشارتك المجانية': 'اپنی مفتا مشاورت طلب کریں', 'دعنا نتواصل معك': 'ہم آپ سے رابطہ کریں گے', 'أرسل بياناتك وسيتواصل معك فريق AURA لمناقشة احتياجك وتقديم التوجيه المناسب.': 'اپنی معلومات بھیجیں، AURA ٹیم آپ کی ضرورت پر بات کرنے اور مناسب رہنمائی دینے کے لیے آپ سے رابطہ کرے گی۔', 'الاسم': 'نام', 'اكتب اسمك': 'اپنا نام لکھیں', 'مفتاح الدولة': 'ملکی کوڈ', 'رقم الهاتف': 'فون نمبر', 'البريد الإلكتروني': 'ای میل', 'نوع الاستشارة': 'مشاورت کی قسم', 'اختر نوع الاستشارة': 'مشاورت کی قسم منتخب کریں', 'استشارة عامة': 'عمومی مشاورت', 'أوافق على التواصل معي بخصوص طلب الاستشارة.': 'میں اپنی مشاورت کی درخواست کے بارے میں رابطے سے اتفاق کرتا ہوں۔', 'إرسال طلب الاستشارة': 'مشاورت کی درخواست بھیجیں'
    },
    fa: {
        'اطلب استشارة مجانية': 'درخواست مشاوره رایگان', 'استشارة مجانية': 'مشاوره رایگان', 'اطلب استشارتك المجانية': 'درخواست مشاوره رایگان', 'دعنا نتواصل معك': 'با شما تماس می‌گیریم', 'أرسل بياناتك وسيتواصل معك فريق AURA لمناقشة احتياجك وتقديم التوجيه المناسب.': 'اطلاعات خود را ارسال کنید تا تیم AURA برای بررسی نیاز شما و ارائه راهنمایی مناسب با شما تماس بگیرد.', 'الاسم': 'نام', 'اكتب اسمك': 'نام خود را وارد کنید', 'مفتاح الدولة': 'کد کشور', 'رقم الهاتف': 'شماره تلفن', 'البريد الإلكتروني': 'ایمیل', 'نوع الاستشارة': 'نوع مشاوره', 'اختر نوع الاستشارة': 'نوع مشاوره را انتخاب کنید', 'استشارة عامة': 'مشاوره عمومی', 'أوافق على التواصل معي بخصوص طلب الاستشارة.': 'با تماس درباره درخواست مشاوره خود موافقم.', 'إرسال طلب الاستشارة': 'ارسال درخواست مشاوره'
    }
};

Object.entries(consultationLanguagePacks).forEach(([language, values]) => Object.assign(localLanguagePacks[language] || (localLanguagePacks[language] = {}), values));

function setupCountryCallingCodes() {
    const select = document.getElementById('consultation-country');
    if (!select) return;
    select.replaceChildren(new Option('Select country code', ''));
    countryCallingCodes.forEach(([country, code]) => select.add(new Option(`${country} ${code}`, code)));
}

setupCountryCallingCodes();

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

function removeGoogleTranslationArtifacts() {
    const cookies = ['googtrans', 'googtransopt'];
    cookies.forEach(name => {
        document.cookie = `${name}=; Max-Age=0; path=/`;
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${location.hostname}`;
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.${location.hostname}`;
    });
    document.querySelectorAll('iframe, [id^="goog-gt-"], [class*="goog-te"], [class*="VIpgJd"]').forEach(element => {
        if (element.id === 'google_translate_element') return;
        element.remove();
    });
}

removeGoogleTranslationArtifacts();
setupLanguageMenu();
const savedLanguage = localStorage.getItem('aura-language') || 'ar';
translateText(savedLanguage);
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
const ratingLabels = {
    ar: ['ضعيف', 'مقبول', 'جيد', 'رائع', 'ممتاز'], en: ['Poor', 'Fair', 'Good', 'Great', 'Superb'],
    es: ['Mala', 'Regular', 'Buena', 'Muy buena', 'Excelente'], fr: ['Faible', 'Moyenne', 'Bonne', 'Très bonne', 'Excellente'],
    de: ['Schwach', 'Mäßig', 'Gut', 'Sehr gut', 'Hervorragend'], 'zh-CN': ['差', '一般', '好', '很好', '极佳'],
    ur: ['کمزور', 'مناسب', 'اچھا', 'بہت اچھا', 'بہترین'], fa: ['ضعیف', 'متوسط', 'خوب', 'عالی', 'عالی‌ترین'],
    hi: ['खराब', 'ठीक', 'अच्छा', 'बहुत अच्छा', 'उत्कृष्ट'], pt: ['Fraca', 'Razoável', 'Boa', 'Muito boa', 'Excelente'], tr: ['Zayıf', 'Orta', 'İyi', 'Çok iyi', 'Mükemmel']
};

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
        const language = document.documentElement.lang || 'ar';
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
            ratingTip.textContent = ratingLabels[document.documentElement.lang] ? ratingLabels[document.documentElement.lang][value - 1] : String(value);
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

const consultationForm = document.getElementById('consultation-form');
const consultationStatus = document.getElementById('consultation-status');
const consultationMessages = {
    ar: { success: 'تم استلام طلبك، وسيتم التواصل معك قريبًا.', error: 'تعذر إرسال الطلب. حاول مرة أخرى.' },
    en: { success: 'Your request was received. We will contact you soon.', error: 'Your request could not be sent. Please try again.' },
    tr: { success: 'Talebiniz alındı. Yakında sizinle iletişime geçeceğiz.', error: 'Talep gönderilemedi. Lütfen tekrar deneyin.' },
    pt: { success: 'Seu pedido foi recebido. Entraremos em contato em breve.', error: 'Não foi possível enviar o pedido. Tente novamente.' },
    hi: { success: 'आपका अनुरोध प्राप्त हो गया है। हम जल्द ही आपसे संपर्क करेंगे।', error: 'अनुरोध भेजा नहीं जा सका। कृपया पुनः प्रयास करें।' }
};
const consultationValidation = {
    ar: { name: 'يرجى كتابة الاسم.', country: 'يرجى اختيار مفتاح الدولة.', phone: 'يرجى كتابة رقم هاتف صحيح.', email: 'يرجى كتابة بريد إلكتروني صحيح.', consent: 'يرجى الموافقة على التواصل معك.' },
    en: { name: 'Please enter your name.', country: 'Please select a country code.', phone: 'Please enter a valid phone number.', email: 'Please enter a valid email address.', consent: 'Please agree to be contacted.' },
    es: { name: 'Escribe tu nombre.', country: 'Selecciona el código de país.', phone: 'Escribe un número de teléfono válido.', email: 'Escribe un correo electrónico válido.', consent: 'Acepta que te contactemos.' },
    fr: { name: 'Veuillez saisir votre nom.', country: 'Veuillez choisir un indicatif de pays.', phone: 'Veuillez saisir un numéro valide.', email: 'Veuillez saisir une adresse e-mail valide.', consent: 'Veuillez accepter d’être contacté.' },
    de: { name: 'Bitte geben Sie Ihren Namen ein.', country: 'Bitte wählen Sie eine Ländervorwahl.', phone: 'Bitte geben Sie eine gültige Telefonnummer ein.', email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.', consent: 'Bitte stimmen Sie der Kontaktaufnahme zu.' },
    'zh-CN': { name: '请输入您的姓名。', country: '请选择国家/地区代码。', phone: '请输入有效的电话号码。', email: '请输入有效的电子邮箱地址。', consent: '请同意我们与您联系。' },
    ur: { name: 'براہ کرم اپنا نام درج کریں۔', country: 'براہ کرم ملکی کوڈ منتخب کریں۔', phone: 'براہ کرم درست فون نمبر درج کریں۔', email: 'براہ کرم درست ای میل درج کریں۔', consent: 'براہ کرم رابطے کی اجازت دیں۔' },
    fa: { name: 'لطفاً نام خود را وارد کنید.', country: 'لطفاً کد کشور را انتخاب کنید.', phone: 'لطفاً شماره تلفن معتبر وارد کنید.', email: 'لطفاً ایمیل معتبر وارد کنید.', consent: 'لطفاً با تماس موافقت کنید.' },
    tr: { name: 'Lütfen adınızı girin.', country: 'Lütfen ülke kodunu seçin.', phone: 'Lütfen geçerli bir telefon numarası girin.', email: 'Lütfen geçerli bir e-posta adresi girin.', consent: 'Lütfen iletişim kurulmasını kabul edin.' },
    pt: { name: 'Digite seu nome.', country: 'Selecione o código do país.', phone: 'Digite um número de telefone válido.', email: 'Digite um e-mail válido.', consent: 'Aceite ser contatado.' },
    hi: { name: 'कृपया अपना नाम दर्ज करें।', country: 'कृपया देश कोड चुनें।', phone: 'कृपया मान्य फोन नंबर दर्ज करें।', email: 'कृपया मान्य ईमेल दर्ज करें।', consent: 'कृपया संपर्क किए जाने की सहमति दें।' }
};

function clearConsultationError(field) {
    field?.removeAttribute('aria-invalid');
    field?.parentElement?.querySelector('.consultation-field-error')?.remove();
}

function showConsultationError(field, message) {
    clearConsultationError(field);
    field.setAttribute('aria-invalid', 'true');
    const error = document.createElement('span');
    error.className = 'consultation-field-error';
    error.setAttribute('role', 'alert');
    error.textContent = message;
    field.parentElement.append(error);
}

if (consultationForm) {
    consultationForm.querySelectorAll('input, select').forEach(field => {
        field.addEventListener('input', () => clearConsultationError(field));
        field.addEventListener('change', () => clearConsultationError(field));
    });
    consultationForm.addEventListener('submit', async event => {
        event.preventDefault();
        const submitButton = consultationForm.querySelector('button[type="submit"]');
        const formData = new FormData(consultationForm);
        const language = document.documentElement.lang || 'ar';
        const messages = consultationMessages[language] || consultationMessages.en;
        const validation = consultationValidation[language] || consultationValidation.en;
        const nameField = consultationForm.elements.name;
        const countryField = consultationForm.elements.countryCode;
        const phoneField = consultationForm.elements.phone;
        const emailField = consultationForm.elements.email;
        const consentField = consultationForm.elements.consent;
        const email = String(formData.get('email') || '').trim();
        const errors = [
            !String(formData.get('name') || '').trim() && [nameField, validation.name],
            !String(formData.get('countryCode') || '').trim() && [countryField, validation.country],
            String(formData.get('phone') || '').replace(/\D/g, '').length < 6 && [phoneField, validation.phone],
            email && !/^\S+@\S+\.\S+$/.test(email) && [emailField, validation.email],
            !consentField.checked && [consentField, validation.consent]
        ].filter(Boolean);
        if (errors.length) {
            errors.forEach(([field, message]) => showConsultationError(field, message));
            errors[0][0].focus();
            return;
        }
        submitButton.disabled = true;
        consultationStatus.textContent = '';

        try {
            const response = await fetch('/api/consultations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    countryCode: formData.get('countryCode'),
                    phone: formData.get('phone'),
                    email: formData.get('email'),
                    service: formData.get('service'),
                    consent: formData.get('consent') === 'on',
                    website: formData.get('website')
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || messages.error);
            consultationForm.reset();
            consultationStatus.textContent = messages.success;
        } catch (error) {
            consultationStatus.textContent = error.message || messages.error;
        } finally {
            submitButton.disabled = false;
        }
    });
}
