/* ==========================================================================
   reveal — חשיפה בגלילה, ספירת המספרים ומחליף המקצועות בהירו
   ========================================================================== */

(function (YD) {
    'use strict';

    // --- חשיפה בגלילה ---
    // הרשימה הזו חייבת להישאר זהה לזו שב-css/motion.css, ששם מוגדר
    // מצב הפתיחה. כאן רק מחליטים מתי כל אלמנט הופך לגלוי.
    var REVEAL_SELECTOR = '.section-intro, .card, .service-card, .resource-card';
    var revealItems = document.querySelectorAll(REVEAL_SELECTOR);

    function revealAll() {
        revealItems.forEach(function (el) { el.classList.add('is-visible'); });
    }

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                // חושפים פעם אחת, ואז משחררים את המשקיף לשארית הביקור
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealItems.forEach(function (el) {
            // השהיה מדורגת בין אחים באותה שורה (50ms), עם תקרה של 4 צעדים
            // כדי שרשימה ארוכה לא תגרום לאחרון להרגיש מאחר
            var index = Array.prototype.indexOf.call(el.parentElement.children, el);
            el.style.setProperty('--reveal-delay', Math.min(index, 4) * 50 + 'ms');

            observer.observe(el);
        });
    } else {
        // בלי IntersectionObserver התוכן לא יישאר מוסתר לעולם
        revealAll();
    }

    // רשת ביטחון: אם משהו במשקיף נכשל, אחרי 3 שניות הכול גלוי בכל מקרה
    setTimeout(function () {
        revealItems.forEach(function (el) {
            if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible');
        });
    }, 3000);

    // --- פס הנוסחאות רץ רק כשהוא על המסך ---
    var strip = document.querySelector('.formula-strip');

    if (strip && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                strip.classList.toggle('is-onscreen', entry.isIntersecting);
            });
        }, { threshold: 0 }).observe(strip);
    } else if (strip) {
        strip.classList.add('is-onscreen');
    }

    // --- ספירת המספרים ---
    // רצה פעם אחת, כשהמספרים באמת על המסך. ספרות מונוספייס שומרות
    // על רוחב קבוע, כך ששום דבר לא רועד בזמן הספירה.
    function animateCount(el) {
        var target = Number(el.dataset.count);
        var suffix = el.dataset.suffix || '';

        if (!Number.isFinite(target)) return;

        if (YD.prefersReducedMotion()) {
            el.textContent = target + suffix;
            return;
        }

        var duration = 900;
        var start = performance.now();

        function frame(now) {
            var progress = Math.min((now - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3); // ease-out
            el.textContent = Math.round(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(frame);
        }

        el.textContent = '0' + suffix;
        requestAnimationFrame(frame);
    }

    var counters = document.querySelectorAll('.stat-number[data-count]');

    if (counters.length && 'IntersectionObserver' in window) {
        var counterObserver = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                animateCount(entry.target);
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.5 });

        counters.forEach(function (el) { counterObserver.observe(el); });
    }

    // --- מחליף המקצועות ---
    // הטשטוש מגשר בין שתי המילים, כך שהעין רואה מעבר אחד
    // ולא שתי מילים שמתחלפות.
    var rotator = document.querySelector('.rotator[data-words]');

    if (rotator) {
        var words = rotator.dataset.words.split(',').map(function (w) { return w.trim(); }).filter(Boolean);
        var index = 0;
        var timer = null;

        function scheduleSwap() {
            if (words.length < 2) return;
            clearTimeout(timer);

            timer = setTimeout(function () {
                rotator.setAttribute('data-swapping', '');

                setTimeout(function () {
                    index = (index + 1) % words.length;
                    rotator.textContent = words[index];
                    rotator.removeAttribute('data-swapping');
                    scheduleSwap();
                }, 160); // תואם ל-transition-duration של היציאה ב-hero.css
            }, 2600);
        }

        // עוצרים כשהלשונית מוסתרת: אף אחד לא מסתכל, וטיימר שממשיך לרוץ
        // ברקע רק שורף סוללה.
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) clearTimeout(timer); else scheduleSwap();
        });

        scheduleSwap();
    }
})(window.YD);
