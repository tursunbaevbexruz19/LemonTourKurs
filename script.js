/* ===================================================================
   LEMON TOUR — Script
   Form validation, Google Sheets (with retry), scroll reveals,
   counter animations, smooth mobile UX
   =================================================================== */

; (function () {
    'use strict';

    // ─── CONFIG ──────────────────────────────────────────────────────
    const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycby96sNrHvf3eSDWZOrWCM1G_kyDkyGq6p9TcfxSowrzw-nv-0yRKbgg73XRdATKZnyemw/exec';
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1500; // ms

    // ─── DOM REFS ────────────────────────────────────────────────────
    const form = document.getElementById('leadForm');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const ageSelect = document.getElementById('age');
    const submitBtn = document.getElementById('submitBtn');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');

    // ─── PHONE FORMATTING ───────────────────────────────────────────
    phoneInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) val = val.slice(0, 2) + ' ' + val.slice(2);
        if (val.length > 6) val = val.slice(0, 6) + ' ' + val.slice(6);
        if (val.length > 9) val = val.slice(0, 9) + ' ' + val.slice(9);
        if (val.length > 12) val = val.slice(0, 12);
        e.target.value = val;
    });

    // ─── VALIDATION ─────────────────────────────────────────────────
    function validateField(input, errorId, condition) {
        const errorEl = document.getElementById(errorId);
        const wrapper = input.closest('.phone-input-wrap') || input;
        if (!condition) {
            wrapper.classList.add('error');
            wrapper.classList.remove('success');
            errorEl.classList.add('visible');
            // Gentle shake on error
            wrapper.style.animation = 'none';
            wrapper.offsetHeight; // trigger reflow
            wrapper.style.animation = 'shake .4s ease';
            return false;
        } else {
            wrapper.classList.remove('error');
            wrapper.classList.add('success');
            errorEl.classList.remove('visible');
            return true;
        }
    }

    function validateForm() {
        const nameOk = validateField(nameInput, 'nameError', nameInput.value.trim().length >= 2);
        const digits = phoneInput.value.replace(/\D/g, '');
        const phoneOk = validateField(phoneInput, 'phoneError', digits.length === 9);
        const ageOk = validateField(ageSelect, 'ageError', ageSelect.value !== '');
        return nameOk && phoneOk && ageOk;
    }

    // Clear errors on input
    [nameInput, phoneInput, ageSelect].forEach(el => {
        const events = el.tagName === 'SELECT' ? ['change'] : ['input', 'focus'];
        events.forEach(evt => {
            el.addEventListener(evt, () => {
                const wrapper = el.closest('.phone-input-wrap') || el;
                wrapper.classList.remove('error');
                wrapper.style.animation = '';
                const errorEl = el.name === 'name' ? document.getElementById('nameError')
                    : el.name === 'phone' ? document.getElementById('phoneError')
                        : document.getElementById('ageError');
                errorEl.classList.remove('visible');
            });
        });
    });

    // ─── RETRY-ENABLED FETCH ────────────────────────────────────────
    async function submitWithRetry(data, attempt = 1) {
        try {
            await fetch(GOOGLE_SHEET_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return true; // no-cors won't throw on success
        } catch (err) {
            if (attempt < MAX_RETRIES) {
                await new Promise(r => setTimeout(r, RETRY_DELAY * attempt));
                return submitWithRetry(data, attempt + 1);
            }
            throw err;
        }
    }

    // ─── SUBMIT ─────────────────────────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Prevent double-submit
        if (submitBtn.disabled) return;

        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        const data = {
            name: nameInput.value.trim(),
            phone: '+998 ' + phoneInput.value.trim(),
            age: ageSelect.value,
            timestamp: new Date().toLocaleString('uz-UZ', {
                timeZone: 'Asia/Tashkent',
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            })
        };

        try {
            await submitWithRetry(data);

            submitBtn.classList.remove('loading');
            submitBtn.classList.add('sent');
            showToast('Muvaffaqiyatli yuborildi! Tez orada bog\'lanamiz.', false);

            setTimeout(() => {
                form.reset();
                submitBtn.classList.remove('sent');
                submitBtn.disabled = false;
                [nameInput, ageSelect].forEach(el => el.classList.remove('success'));
                const phoneWrap = phoneInput.closest('.phone-input-wrap');
                if (phoneWrap) phoneWrap.classList.remove('success');
            }, 3500);

        } catch (err) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            showToast('Internet aloqasi yo\'q. Iltimos, qayta urinib ko\'ring.', true);
            console.error('Submission error:', err);
        }
    });

    // ─── TOAST ──────────────────────────────────────────────────────
    let toastTimeout;
    function showToast(message, isError) {
        clearTimeout(toastTimeout);
        toastMsg.textContent = message;
        toast.classList.toggle('toast--error', isError);
        toast.classList.add('visible');
        toastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
        }, 4500);
    }

    // ─── ANIMATED COUNTERS ──────────────────────────────────────────
    function animateCounter(el, target, suffix = '') {
        const duration = 1400;
        const start = performance.now();
        const initial = 0;

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(initial + (target - initial) * eased);
            el.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // ─── SCROLL REVEAL + COUNTER TRIGGER ────────────────────────────
    const countersAnimated = new Set();

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Trigger counter animation on proof stats
                const counter = entry.target.querySelector('.proof__number');
                if (counter && !countersAnimated.has(counter)) {
                    countersAnimated.add(counter);
                    const text = counter.dataset.target || counter.textContent;
                    const num = parseInt(text);
                    const suffix = text.replace(/\d/g, '');
                    if (!isNaN(num)) animateCounter(counter, num, suffix);
                }

                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -30px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // ─── SMOOTH SCROLL ──────────────────────────────────────────────
    document.querySelectorAll('a[href="#form"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('form').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ─── ACTIVE INPUT LABEL HIGHLIGHT ───────────────────────────────
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('focus', () => {
            input.closest('.form-group')?.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.closest('.form-group')?.classList.remove('focused');
        });
    });

})();
