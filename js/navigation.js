/* ==========================================================================
   navigation — הדר, תפריט נייד, גלילה חלקה וכפתור "חזרה למעלה"
   ========================================================================== */

(function (YD) {
    'use strict';

    var header = document.querySelector('header');
    var mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    var mobileNav = document.querySelector('.mobile-nav');
    var backToTopBtn = document.getElementById('backToTop');

    // --- גובה ההדר ---
    // מתפרסם כמשתנה CSS, כך שהתפריט הנייד יושב בדיוק על שוליו
    // וגם עוגני הגלילה עוצרים במקום הנכון, בשני מצבי ההדר.
    function syncHeaderHeight() {
        if (!header) return;
        var height = Math.round(header.getBoundingClientRect().height);
        document.documentElement.style.setProperty('--header-h', height + 'px');
    }

    syncHeaderHeight();

    // המדידה הראשונה רצה לפני שהגופנים הגיעו, כשהניווט עוד עלול להישבר
    // לשתי שורות — מודדים שוב כשהמידות האמיתיות בפנים.
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(syncHeaderHeight);
    }
    window.addEventListener('load', syncHeaderHeight);

    if (window.ResizeObserver && header) {
        new ResizeObserver(syncHeaderHeight).observe(header);
    } else {
        window.addEventListener('resize', syncHeaderHeight);
    }

    // --- אפקטי גלילה ---
    // מאזין אחד, passive, שמקובץ לפריים אחד: אף פעם לא שתי כתיבות
    // מחלקה נפרדות באותו פריים.
    var scrollTicking = false;

    // המטבע שבלוגו. בדפדפן שתומך ב-scroll timeline הסיבוב רץ ב-CSS
    // מחוץ ל-main thread, ואז אין כאן מה לעשות.
    var coin = document.querySelector('.logo-coin');

    // לא מסתפקים בהצהרת תמיכה: בודקים שהאנימציה באמת רצה על האלמנט.
    // כך גם טעות ב-CSS לא משאירה את המטבע קפוא בלי גיבוי.
    var coinNeedsJS = !!coin && !(coin.getAnimations && coin.getAnimations().some(function (a) {
        return a.timeline && a.timeline !== document.timeline;
    }));

    function spinCoin(scrollTop) {
        if (!coinNeedsJS || YD.prefersReducedMotion()) return;

        var max = document.documentElement.scrollHeight - window.innerHeight;
        var progress = max > 0 ? Math.min(scrollTop / max, 1) : 0;

        // שתי סיבובים על פני כל העמוד, בדיוק כמו בגרסת ה-CSS.
        // כתיבה ישירה על האלמנט ולא משתנה CSS על ההורה: משתנה על ההורה
        // מכריח חישוב סגנון מחדש לכל הצאצאים.
        coin.style.transform = 'rotateX(' + (progress * 720) + 'deg)';
    }

    function onScrollFrame() {
        var currentScroll = window.pageYOffset;

        if (header) header.classList.toggle('scrolled', currentScroll > 100);
        if (backToTopBtn) backToTopBtn.classList.toggle('visible', currentScroll > 300);
        spinCoin(currentScroll);

        scrollTicking = false;
    }

    window.addEventListener('scroll', function () {
        if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(onScrollFrame);
        }
    }, { passive: true });

    // --- תפריט נייד ---
    function setMenuState(open) {
        if (!mobileNav || !mobileMenuBtn) return;
        mobileNav.classList.toggle('active', open);
        mobileMenuBtn.textContent = open ? '✕' : '☰';
        mobileMenuBtn.setAttribute('aria-expanded', String(open));
        mobileMenuBtn.setAttribute('aria-label', open ? 'סגירת תפריט' : 'פתיחת תפריט');
    }

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function () {
            setMenuState(!mobileNav.classList.contains('active'));
        });

        document.addEventListener('click', function (e) {
            if (!mobileNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                setMenuState(false);
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape' || !mobileNav.classList.contains('active')) return;

            // פעולת מקלדת לא מונפשת: אנימציה כאן מרגישה איטית מהמקש שהפעיל אותה
            mobileNav.setAttribute('data-instant', '');
            setMenuState(false);
            mobileMenuBtn.focus();

            requestAnimationFrame(function () {
                requestAnimationFrame(function () { mobileNav.removeAttribute('data-instant'); });
            });
        });
    }

    // --- גלילה חלקה לעוגנים ---
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href === '#') return;

            var target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            var offset = YD.headerHeight() + 18;
            var top = target.getBoundingClientRect().top + window.pageYOffset - offset;

            window.scrollTo({ top: top, behavior: YD.scrollBehavior() });
            setMenuState(false);
        });
    });

    // --- חזרה למעלה ---
    // הנראות מטופלת בפריים הגלילה המשותף שלמעלה
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: YD.scrollBehavior() });
        });
    }
})(window.YD);
