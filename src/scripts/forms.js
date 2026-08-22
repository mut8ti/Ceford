/* Firestore-backed forms.
 *
 * Markup opts in with  <form data-firestore="contacts">  and the builder below
 * turns its fields into a payload. The payloads must match the allowlists in
 * firestore.rules exactly — hasOnly() rejects the whole write for one stray
 * key, so keep the two in step.
 */
import { addDocument } from '../lib/firebase.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BUILDERS = {
  // rules: hasAll [name,email,source], hasOnly [name,email,message,source,phone,course,timestamp]
  contacts(f) {
    const code = f.countryCode?.value ?? '';
    const local = f.phone?.value.trim().replace(/^0+/, '') ?? '';
    const payload = {
      name: f.name.value.trim(),
      email: f.email.value.trim(),
      source: 'contact-form',
    };
    // The legacy form collected a country code and then dropped it, storing a
    // bare local number. Join them so the record is actually dialable.
    if (local) payload.phone = `${code}${local}`;
    if (f.course?.value) payload.course = f.course.value;
    if (f.message?.value.trim()) payload.message = f.message.value.trim();
    return payload;
  },

  // rules: hasAll [name,email,status], hasOnly [name,email,status,timestamp]
  newsletter(f) {
    return {
      name: f.name.value.trim(),
      email: f.email.value.trim(),
      status: 'subscribed',
    };
  },
};

function setStatus(form, text, kind) {
  const box = form.querySelector('[data-form-status]');
  if (!box) return;
  box.textContent = text;
  box.dataset.formStatus = kind; // '', 'error', 'ok', 'pending'
}

document.querySelectorAll('form[data-firestore]').forEach((form) => {
  const collectionName = form.dataset.firestore;
  const build = BUILDERS[collectionName];
  if (!build) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot: a field hidden from humans. Anything that fills it is a bot,
    // so pretend it worked and write nothing.
    if (form.elements.website?.value) {
      form.reset();
      setStatus(form, 'Thank you.', 'ok');
      return;
    }

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();

    if (!name || !email) {
      setStatus(form, 'Please fill in your name and email.', 'error');
      return;
    }
    if (!EMAIL.test(email)) {
      setStatus(form, 'Please enter a valid email address.', 'error');
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const label = button?.textContent;
    if (button) { button.disabled = true; button.textContent = 'Sending…'; }
    setStatus(form, 'Sending…', 'pending');

    try {
      await addDocument(collectionName, build(form.elements));
      form.reset();
      setStatus(form, form.dataset.success || 'Thank you — we have received your message.', 'ok');
    } catch (err) {
      console.error(`[${collectionName}]`, err);
      setStatus(form, 'Something went wrong sending that. Please try again, or email us directly.', 'error');
    } finally {
      if (button) { button.disabled = false; button.textContent = label; }
    }
  });
});

/* Auto-fill course interest from URL query parameter (e.g. /contact?course=AI%20in%20Procurement) */
function initCourseAutofill() {
  const courseSelect = document.getElementById('course');
  if (!courseSelect) return;

  const params = new URLSearchParams(window.location.search);
  const courseParam = params.get('course') || params.get('program') || params.get('realm') || params.get('package');
  if (!courseParam) return;

  const target = courseParam.trim().toLowerCase();
  let matched = false;

  // 1. Exact match on option value or text (case-insensitive)
  for (const opt of courseSelect.options) {
    if (opt.value.toLowerCase() === target || opt.textContent.trim().toLowerCase() === target) {
      opt.selected = true;
      courseSelect.value = opt.value;
      matched = true;
      break;
    }
  }

  // 2. Substring / slug matching (e.g. 'logistics' -> 'Realm 1: AI in Logistics...')
  if (!matched) {
    for (const opt of courseSelect.options) {
      const val = opt.value.toLowerCase();
      const txt = opt.textContent.toLowerCase();
      if (val && (val.includes(target) || target.includes(val) || txt.includes(target))) {
        opt.selected = true;
        courseSelect.value = opt.value;
        matched = true;
        break;
      }
    }
  }

  // 3. Fallback: dynamically add and select option if custom query was supplied
  if (!matched && courseParam.trim()) {
    const customOpt = document.createElement('option');
    customOpt.value = courseParam.trim();
    customOpt.textContent = courseParam.trim();
    customOpt.selected = true;
    courseSelect.appendChild(customOpt);
    courseSelect.value = courseParam.trim();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCourseAutofill);
} else {
  initCourseAutofill();
}

