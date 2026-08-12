/* ==========================================================================
   misc — הורדת משאבים, ספירה לאחור, מעקב קישורים חיצוניים והדפסה
   ========================================================================== */

(function (YD) {
    'use strict';

    // --- הורדת משאבים חינמיים ---
    document.querySelectorAll('.download-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var resource = this.getAttribute('data-resource');

            var userName = prompt('אנא הכנס את שמך המלא:');
            if (!userName) {
                alert('נדרש שם להורדת המשאב');
                return;
            }

            var userEmail = prompt('אנא הכנס את כתובת האימייל שלך:');
            if (!userEmail || !YD.validateEmail(userEmail)) {
                alert('נדרשת כתובת אימייל תקינה להורדת המשאב');
                return;
            }

            YD.track('download', { event_category: 'Resources', event_label: resource });

            alert('תודה ' + userName + '! המשאב יישלח אליך לאימייל ' + userEmail);

            var text = 'שלום, אני ' + userName + '%0aאימייל: ' + userEmail +
                '%0aאני מעוניין/ת להוריד את המשאב: ' + resource;
            window.open('https://wa.me/' + YD.WHATSAPP_NUMBER + '?text=' + text, '_blank');
        });
    });

    // --- ספירה לאחור למרתון הבא ---
    function updateCountdown() {
        var banner = document.querySelector('.urgency-banner');
        if (!banner) return;

        var now = new Date();
        var target = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)); // שבועיים קדימה
        var days = Math.floor((target - now) / (1000 * 60 * 60 * 24));

        if (days > 0) {
            banner.textContent = '🔥 המרתון הבא בעוד ' + days + ' ימים! נותרו 3 מקומות בלבד';
        }
    }

    updateCountdown();

    // --- מעקב אחרי קישורים יוצאים ---
    document.querySelectorAll('a[href^="http"]').forEach(function (link) {
        if (link.href.indexOf(window.location.hostname) !== -1) return;

        link.addEventListener('click', function () {
            YD.track('click', { event_category: 'Outbound Link', event_label: this.href });
        });
    });

    // --- הדפסה ---
    window.addEventListener('beforeprint', function () {
        document.body.classList.add('printing');
    });

    window.addEventListener('afterprint', function () {
        document.body.classList.remove('printing');
    });

    console.log('%c👋 שלום! מעוניין בשיתוף פעולה? צור קשר: drayyakir@gmail.com',
        'font-size: 16px; color: #2560f0; font-weight: bold;');
})(window.YD);
