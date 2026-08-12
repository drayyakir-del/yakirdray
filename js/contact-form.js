/* ==========================================================================
   contact-form — ולידציה בעברית, הכרזה לקוראי מסך ושליחה לוואטסאפ
   ========================================================================== */

(function (YD) {
    'use strict';

    var form = document.getElementById('contactForm');
    if (!form) return;

    var SERVICE_NAMES = {
        math: 'מתמטיקה',
        physics: 'פיזיקה',
        cs: 'מדעי המחשב',
        student: 'ליווי סטודנטים',
        other: 'אחר'
    };

    /**
     * בודק שדה בודד, מסמן אותו ומראה את הודעת השגיאה שלו.
     * ת"י 5568: ההודעה בעברית, מקושרת לשדה ב-aria-describedby ומוכרזת
     * דרך role="alert" שכבר קיים במבנה.
     */
    function validateField(input) {
        var value = input.value.trim();
        var isValid = true;

        if (input.hasAttribute('required') && !value) isValid = false;
        if (input.type === 'email' && value && !YD.validateEmail(value)) isValid = false;
        if (input.type === 'tel' && value && !YD.validatePhone(value)) isValid = false;

        // מחלקה ולא סגנון inline: מעבר צבע המסגרת חי ב-CSS
        input.classList.toggle('error', !isValid);
        input.setAttribute('aria-invalid', String(!isValid));

        var errorEl = document.getElementById(input.id + '-error');
        if (errorEl) errorEl.hidden = isValid;

        return isValid;
    }

    function showMessage(type, message) {
        var successEl = document.getElementById('formSuccess');
        var errorEl = document.getElementById('formError');

        if (type === 'success' && successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
            if (errorEl) errorEl.style.display = 'none';
        } else if (type === 'error' && errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            if (successEl) successEl.style.display = 'none';
        }

        setTimeout(function () {
            if (successEl) successEl.style.display = 'none';
            if (errorEl) errorEl.style.display = 'none';
        }, 5000);
    }

    // ולידציה תוך כדי: בעזיבת השדה, ואז בכל הקלדה רק אם הוא כבר שגוי
    document.querySelectorAll('.form-group input, .form-group textarea, .form-group select')
        .forEach(function (input) {
            input.addEventListener('blur', function () { validateField(this); });
            input.addEventListener('input', function () {
                if (this.classList.contains('error')) validateField(this);
            });
        });

    var isSubmitting = false;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (isSubmitting) return;

        var name = document.getElementById('name').value.trim();
        var phone = document.getElementById('phone').value.trim();
        var email = document.getElementById('email').value.trim();
        var service = document.getElementById('service').value;
        var message = document.getElementById('message').value.trim();

        // בודקים הכל, מציגים את ההודעות במקום, ושולחים את הפוקוס
        // לבעיה הראשונה כדי שמשתמש מקלדת או קורא מסך ינחת עליה.
        var fields = ['name', 'phone', 'email']
            .map(function (id) { return document.getElementById(id); })
            .filter(Boolean);

        var firstInvalid = fields.filter(function (field) { return !validateField(field); })[0];

        if (firstInvalid) {
            showMessage('error', 'הטופס לא נשלח. נא לתקן את השדות המסומנים.');
            firstInvalid.focus();
            return;
        }

        var text = 'שלום, אני ' + name + '%0a';
        text += 'טלפון: ' + phone + '%0a';
        if (email) text += 'אימייל: ' + email + '%0a';
        if (service) text += 'מקצוע: ' + SERVICE_NAMES[service] + '%0a';
        if (message) text += '%0aפרטים נוספים:%0a' + message;

        YD.track('generate_lead', { event_category: 'Contact', event_label: service || 'unknown' });
        if (typeof fbq !== 'undefined') fbq('track', 'Lead');

        showMessage('success', 'מעביר אותך לוואטסאפ...');

        isSubmitting = true;
        setTimeout(function () {
            window.open('https://wa.me/' + YD.WHATSAPP_NUMBER + '?text=' + text, '_blank');
            form.reset();
            isSubmitting = false;
        }, 1000);
    });
})(window.YD);
