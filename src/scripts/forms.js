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
