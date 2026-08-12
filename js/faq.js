/* ==========================================================================
   faq — אקורדיון השאלות הנפוצות, כולל קשרי ה-ARIA שלו
   ========================================================================== */

(function () {
    'use strict';

    var questions = document.querySelectorAll('.faq-question');
    if (!questions.length) return;

    // כל שאלה "מחזיקה" את התשובה שלה ומדווחת אם היא פתוחה,
    // כדי שקורא מסך ידע מה עומד להיפתח.
    questions.forEach(function (question, i) {
        var item = question.parentElement;
        var answer = item.querySelector('.faq-answer');
        if (!answer) return;

        var questionId = 'faq-question-' + (i + 1);
        var answerId = 'faq-answer-' + (i + 1);

        question.id = questionId;
        question.setAttribute('aria-controls', answerId);
        question.setAttribute('aria-expanded', 'false');

        answer.id = answerId;
        answer.setAttribute('role', 'region');
        answer.setAttribute('aria-labelledby', questionId);
    });

    function setState(item, open) {
        item.classList.toggle('active', open);
        var question = item.querySelector('.faq-question');
        if (question) question.setAttribute('aria-expanded', String(open));
    }

    questions.forEach(function (question) {
        question.addEventListener('click', function () {
            var item = question.parentElement;
            var wasOpen = item.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(function (other) {
                setState(other, false);
            });

            if (!wasOpen) setState(item, true);
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        document.querySelectorAll('.faq-item.active').forEach(function (item) {
            setState(item, false);
        });
    });
})();
