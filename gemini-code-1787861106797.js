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
        'Main.html': ['AURA ENTERPRISE FZE LLC | الموقع الرسمي', 'AURA ENTERPRISE FZE LLC | Official Website'],
        'about.html': ['عن الشركة | AURA ENTERPRISE FZE LLC', 'About the Company | AURA ENTERPRISE FZE LLC'],
        'services.html': ['مجالات العمل | AURA ENTERPRISE FZE LLC', 'Fields of Work | AURA ENTERPRISE FZE LLC'],
        'contact.html': ['التواصل | AURA ENTERPRISE FZE LLC', 'Contact | AURA ENTERPRISE FZE LLC']
    };
    const currentPage = window.location.pathname.split('/').pop() || 'Main.html';
    if (pageTitles[currentPage]) document.title = pageTitles[currentPage][language === 'en' ? 1 : 0];
    const toggle = document.getElementById('language-toggle');
    if (toggle) {
        toggle.textContent = language === 'en' ? 'العربية' : 'English';
        toggle.setAttribute('aria-label', language === 'en' ? 'Switch to Arabic' : 'Switch to English');
    }
}

const savedLanguage = localStorage.getItem('aura-language') || 'ar';
translateText(savedLanguage);

const currentPage = window.location.pathname.split('/').pop() || 'Main.html';
document.querySelectorAll('nav a[href]').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
});

document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', function(event) {
        const destination = link.getAttribute('href');
        if (!destination || destination === currentPage || link.target === '_blank') return;
        event.preventDefault();
        document.body.classList.add('page-leaving');
        window.setTimeout(() => { window.location.href = destination; }, 220);
    });
});

const languageToggle = document.getElementById('language-toggle');
if (languageToggle) languageToggle.addEventListener('click', function() {
    localStorage.setItem('aura-language', document.documentElement.lang === 'ar' ? 'en' : 'ar');
    window.location.reload();
});