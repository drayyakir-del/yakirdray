/* ==========================================================================
   ווידג'ט העדפות נגישות — תקנה 35 / ת"י 5568
   כלי נוחות למשתמש: מחליף מחלקות CSS על <html> בלבד.
   הוא לא נוגע בתוכן העמוד, לא מייצר טקסט חלופי ולא כותב ARIA.
   ========================================================================== */

(function () {
    'use strict';

    var STORAGE_KEY = 'yd_a11y_prefs_v1';

    var DEFAULTS = {
        version: 1,
        links: false,
        headings: false,
        readable: false,
        bigCursor: false,
        reduceMotion: false,
        contrast: 'off',
        textSize: 100,
        lineHeight: 0
    };

    // מחזורי ערכים לכפתורים הרב-מצביים
    var CYCLES = {
        contrast: ['off', 'high', 'invert', 'mono'],
        textSize: [100, 115, 130, 150],
        lineHeight: [0, 16, 20]
    };

    var LABELS = {
        contrast: { off: 'רגילה', high: 'גבוהה', invert: 'הפוכה', mono: 'גווני אפור' },
        textSize: { 100: '100%', 115: '115%', 130: '130%', 150: '150%' },
        lineHeight: { 0: 'רגיל', 16: 'מוגדל', 20: 'מוגדל מאוד' }
    };

    var TOGGLE_NAMES = {
        links: 'הדגשת קישורים',
        headings: 'הדגשת כותרות',
        readable: 'גופן קריא',
        bigCursor: 'סמן גדול',
        reduceMotion: 'עצירת אנימציות'
    };

    var trigger = document.getElementById('a11y-trigger');
    var panel = document.getElementById('a11y-panel');
    var closeBtn = document.getElementById('a11y-close');
    var live = document.getElementById('a11y-live');

    if (!trigger || !panel) return;

    var prefs = load();

    function load() {
        var stored = {};
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                // גרסה לא תואמת מבטלת את השמור, כדי שלא יישארו שדות ישנים
                if (parsed && parsed.version === DEFAULTS.version) stored = parsed;
            }
        } catch (e) { /* גלישה פרטית או אחסון חסום — ממשיכים עם ברירות המחדל */ }

        var result = {};
        for (var key in DEFAULTS) {
            result[key] = Object.prototype.hasOwnProperty.call(stored, key) ? stored[key] : DEFAULTS[key];
        }
        return result;
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
        } catch (e) { /* אין אחסון — ההעדפות עדיין פועלות עד סוף הביקור */ }
    }

    /*
     * רשימת המחלקות חייבת להיות זהה לזו שבסקריפט ה-bootstrap שב-<head>,
     * אחרת המשתמש רואה הבזק של העיצוב הרגיל בכל טעינת עמוד.
     */
    function apply() {
        var c = document.documentElement.classList;
        c.toggle('a11y-links', !!prefs.links);
        c.toggle('a11y-headings', !!prefs.headings);
        c.toggle('a11y-readable', !!prefs.readable);
        c.toggle('a11y-cursor-big', !!prefs.bigCursor);
        c.toggle('a11y-reduce-motion', !!prefs.reduceMotion);
        c.toggle('a11y-contrast-high', prefs.contrast === 'high');
        c.toggle('a11y-contrast-invert', prefs.contrast === 'invert');
        c.toggle('a11y-contrast-mono', prefs.contrast === 'mono');
        c.toggle('a11y-text-115', prefs.textSize === 115);
        c.toggle('a11y-text-130', prefs.textSize === 130);
        c.toggle('a11y-text-150', prefs.textSize === 150);
        c.toggle('a11y-lines-16', prefs.lineHeight === 16);
        c.toggle('a11y-lines-20', prefs.lineHeight === 20);
    }

    function syncUI() {
        panel.querySelectorAll('.a11y-toggle').forEach(function (btn) {
            var key = btn.dataset.a11y;
            if (key === 'reset') return;

            if (CYCLES[key]) {
                // כפתור רב-מצבי: הערך הנוכחי הוא חלק מהשם הנגיש, בלי aria-pressed
                var valueEl = panel.querySelector('[data-value-for="' + key + '"]');
                if (valueEl) valueEl.textContent = LABELS[key][prefs[key]];
                btn.classList.toggle('is-active', prefs[key] !== DEFAULTS[key]);
            } else {
                btn.setAttribute('aria-pressed', String(!!prefs[key]));
                btn.classList.toggle('is-active', !!prefs[key]);
            }
        });
    }

    function announce(message) {
        if (!live) return;
        live.textContent = '';
        // איפוס ואז כתיבה, כדי שקורא המסך יכריז גם על אותו טקסט פעמיים ברצף
        window.setTimeout(function () { live.textContent = message; }, 60);
    }

    function nextInCycle(key) {
        var cycle = CYCLES[key];
        var index = cycle.indexOf(prefs[key]);
        return cycle[(index + 1) % cycle.length];
    }

    function handleToggle(btn) {
        var key = btn.dataset.a11y;

        if (key === 'reset') {
            for (var k in DEFAULTS) prefs[k] = DEFAULTS[k];
            apply(); save(); syncUI();
            announce('הגדרות הנגישות אופסו');
            return;
        }

        if (CYCLES[key]) {
            prefs[key] = nextInCycle(key);
            apply(); save(); syncUI();
            var name = btn.querySelector('.a11y-toggle-label').textContent;
            announce(name + ': ' + LABELS[key][prefs[key]]);
            return;
        }

        prefs[key] = !prefs[key];
        apply(); save(); syncUI();
        announce(TOGGLE_NAMES[key] + ': ' + (prefs[key] ? 'פעיל' : 'כבוי'));
    }

    // --- פתיחה וסגירה ---

    function isOpen() {
        return !panel.hasAttribute('hidden');
    }

    function openPanel() {
        panel.removeAttribute('hidden');
        // פריים אחד לפני הוספת המחלקה, כדי שהמעבר ירוץ במקום לקפוץ
        requestAnimationFrame(function () { panel.classList.add('is-open'); });
        trigger.setAttribute('aria-expanded', 'true');
        trigger.setAttribute('aria-label', 'סגירת תפריט נגישות');
        var first = panel.querySelector('.a11y-toggle');
        if (first) first.focus();
    }

    function closePanel(returnFocus) {
        panel.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-label', 'פתיחת תפריט נגישות');

        // משך ההסתרה נלקח מה-CSS ולא מקבוע כאן, כדי שלא ייווצר פער
        // בין הזמן שהמעבר באמת לוקח לבין הרגע שבו הפאנל נעלם.
        var duration = parseFloat(getComputedStyle(panel).transitionDuration) * 1000 || 180;
        var finish = function () { panel.setAttribute('hidden', ''); };
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || prefs.reduceMotion;

        if (reduced) finish(); else window.setTimeout(finish, duration);

        if (returnFocus) trigger.focus();
    }

    trigger.addEventListener('click', function () {
        if (isOpen()) closePanel(true); else openPanel();
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', function () { closePanel(true); });
    }

    panel.addEventListener('click', function (event) {
        var btn = event.target.closest('.a11y-toggle');
        if (btn) handleToggle(btn);
    });

    document.addEventListener('click', function (event) {
        if (!isOpen()) return;
        if (panel.contains(event.target) || trigger.contains(event.target)) return;
        closePanel(false);
    });

    document.addEventListener('keydown', function (event) {
        // Alt+A מכל מקום. e.code ולא e.key: ב-macOS הצירוף מפיק תו מת
        if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.code === 'KeyA') {
            event.preventDefault();
            if (isOpen()) closePanel(true); else openPanel();
            return;
        }

        if (event.key === 'Escape' && isOpen()) {
            event.preventDefault();
            closePanel(true);
        }
    });

    // מצב התחלתי: המחלקות כבר הוחלו ב-<head>, כאן מסנכרנים את הכפתורים
    apply();
    syncUI();
})();
