/* ==========================================================================
   core — עזרים משותפים לכל שאר הקבצים.
   נטען ראשון ומגדיר את מרחב השמות YD, כדי שהמודולים לא יזהמו את הגלובל.
   ========================================================================== */

window.YD = window.YD || {};

(function (YD) {
    'use strict';

    var reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    /** האם המשתמש ביקש פחות תנועה (מערכת ההפעלה או ווידג'ט הנגישות) */
    YD.prefersReducedMotion = function () {
        return reducedMotionQuery.matches ||
            document.documentElement.classList.contains('a11y-reduce-motion');
    };

    /** התנהגות גלילה שמכבדת את אותה בקשה */
    YD.scrollBehavior = function () {
        return YD.prefersReducedMotion() ? 'auto' : 'smooth';
    };

    /** גובה ההדר בפועל — משתנה בין המצב הרגיל למצב המכווץ */
    YD.headerHeight = function () {
        var header = document.querySelector('header');
        return header ? header.getBoundingClientRect().height : 74;
    };

    YD.validateEmail = function (email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    YD.validatePhone = function (phone) {
        return /^0\d{9}$/.test(phone);
    };

    /** דיווח לאנליטיקס אם היא מותקנת, בלי להפיל את הדף אם לא */
    YD.track = function (name, params) {
        if (typeof gtag !== 'undefined') gtag('event', name, params);
    };

    YD.WHATSAPP_NUMBER = '972528985233';
})(window.YD);
