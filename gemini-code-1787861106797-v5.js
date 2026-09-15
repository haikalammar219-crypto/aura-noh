window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
});

const translations = {
    'عن الشركة': 'About the Company', 'مجالات العمل': 'Fields of Work', 'التواصل': 'Contact',
    'تواصل معنا': 'Contact Us', 'استكشف خدماتنا': 'Explore Our Services', 'تعرّف علينا': 'About Us',
    'من نحن': 'About Us', 'مجالات التميز': 'Areas of Excellence', 'مباشرة التواصل': 'Get in Touch',
    'رؤيتنا': 'Our Vision', 'مهمتنا': 'Our Mission', 'قيمنا': 'Our Values',
    'خدماتنا الاستراتيجية': 'Our Strategic Services', 'تطوير الأعمال': 'Business Development',
    'الاستشارات والحلول': 'Consulting and Solutions', 'التجارة والاستثمار': 'Trade and Investment',
    'تواصل مع فريقنا': 'Contact Our Team', 'معلومات الاتصال الرسمية': 'Official Contact Information',
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
    'أن نكون الشريك المفضل للشركات والمؤسسات الإقليمية والدولية الباحثة عن التميز والابتكار في سوق الإمارات والشرق الأوسط.': 'To be the preferred partner for regional and international companies and institutions seeking excellence and innovation in the UAE and Middle East markets.',
    'تقديم خدمات وحلول عالمية المستوى تضمن لشركائنا تحقيق أعلى مستويات الأداء والاستدامة والربحية.': 'To provide world-class services and solutions that help our partners achieve the highest levels of performance, sustainability, and profitability.',
    'الشفافية، الجودة الشاملة، الالتزام بالتميز، وبناء علاقات طويلة الأمد مع عملائنا وشركائنا.': 'Transparency, total quality, commitment to excellence, and building long-term relationships with our clients and partners.',
    'صياغة استراتيجيات تطويرية مبتكرة تهدف للتوسع المالي والتجاري وزيادة الحصة السوقية.': 'Creating innovative development strategies to drive financial and commercial growth and increase market share.',
    'تقديم دراسات واستشارات متخصصة تساهم في رفع كفاءة العمليات وتخفيض التكاليف التشغيلية.': 'Providing specialized studies and consulting that improve operational efficiency and reduce operating costs.',
    'إدارة العمليات التجارية والفرص الاستثمارية القيمة في دولة الإمارات والأسواق العالمية.': 'Managing valuable commercial operations and investment opportunities in the UAE and global markets.'
    , 'آراء العملاء': 'Client Reviews', 'تجارب تُلهم ثقة جديدة': 'Experiences That Inspire New Confidence',
    'نحن بانتظار أولى تجاربكم معنا.': 'We are waiting to hear about your first experience with us.',
    'شاركنا رأيك': 'Share Your Experience', 'رأيك يساعدنا على تقديم تجربة أفضل.': 'Your feedback helps us create a better experience.',
    'الاسم': 'Name', 'اكتب اسمك': 'Enter your name', 'التقييم': 'Rating', 'اختر تقييمك': 'Choose your rating',
    'رسالتك': 'Your message', 'كيف كانت تجربتك معنا؟': 'How was your experience with us?',
    'إرسال التقييم': 'Submit Review', 'التقييمات ستظهر هنا قريبًا.': 'Reviews will appear here soon.',
    'جارٍ إرسال تقييمك...': 'Submitting your review...',
    'شكرًا لك. تم استلام تقييمك وسيظهر بعد المراجعة.': 'Thank you. Your review was received and will appear after approval.',
    'حدث خطأ، حاول مرة أخرى.': 'Something went wrong. Please try again.'
};

const reverseTranslations = Object.fromEntries(Object.entries(translations).map(([arabic, english]) => [english, arabic]));

function translateText(language) {
    const dictionary = language === 'en' ? translations : reverseTranslations;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => {
        const value = node.nodeValue;
        const trimmed = value.trim();
        if (dictionary[trimmed]) node.nodeValue = value.replace(trimmed, dictionary[trimmed]);
    });
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
    const pageTitles = {
        'Main-v5.html': ['AURA ENTERPRISE FZE LLC | الموقع الرسمي', 'AURA ENTERPRISE FZE LLC | Official Website'],
        'about.html': ['عن الشركة | AURA ENTERPRISE FZE LLC', 'About the Company | AURA ENTERPRISE FZE LLC'],
        'services.html': ['مجالات العمل | AURA ENTERPRISE FZE LLC', 'Fields of Work | AURA ENTERPRISE FZE LLC'],
        'contact.html': ['التواصل | AURA ENTERPRISE FZE LLC', 'Contact | AURA ENTERPRISE FZE LLC']
    };
    const currentPage = window.location.pathname.split('/').pop() || 'Main-v5.html';
    if (pageTitles[currentPage]) document.title = pageTitles[currentPage][language === 'en' ? 1 : 0];
    const toggle = document.getElementById('language-toggle');
    if (toggle) {
        toggle.textContent = language === 'en' ? 'العربية' : 'English';
        toggle.setAttribute('aria-label', language === 'en' ? 'Switch to Arabic' : 'Switch to English');
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
    const ratingPicker = document.querySelector('.rating-picker');
    if (nameInput) nameInput.placeholder = copy.namePlaceholder;
    if (commentInput) commentInput.placeholder = copy.commentPlaceholder;
    if (ratingPicker) ratingPicker.setAttribute('aria-label', copy.ratingLabel);
    document.querySelectorAll('.rating-picker input').forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) label.setAttribute('aria-label', copy.stars[Number(input.value) - 1]);
    });
}

const savedLanguage = localStorage.getItem('aura-language') || 'ar';
translateText(savedLanguage);

const currentPage = window.location.pathname.split('/').pop() || 'Main-v5.html';
document.querySelectorAll('nav a[href]').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
});

const reviewsList = document.getElementById('reviews-list');
const reviewForm = document.getElementById('review-form');
const reviewStatus = document.getElementById('review-status');

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
        submitButton.disabled = true;
        reviewStatus.textContent = reviewCopy[document.documentElement.lang].loading;

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    rating,
                    comment: formData.get('comment')
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'حدث خطأ، حاول مرة أخرى.');
            reviewForm.reset();
            reviewStatus.textContent = reviewCopy[document.documentElement.lang].success;
        } catch (error) {
            reviewStatus.textContent = error.message || reviewCopy[document.documentElement.lang].error;
        } finally {
            submitButton.disabled = false;
        }
    });
    loadReviews();
}

const languageToggle = document.getElementById('language-toggle');
if (languageToggle) languageToggle.addEventListener('click', function() {
    localStorage.setItem('aura-language', document.documentElement.lang === 'ar' ? 'en' : 'ar');
    window.location.reload();
});