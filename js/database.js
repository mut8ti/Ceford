// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import firebaseConfig from './config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('Firebase initialized successfully');
console.log('Firebase config:', firebaseConfig.projectId);

// Helper function to show messages
function showMessage(elementId, message, isError = false) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.style.color = isError ? 'red' : 'green';
    element.style.display = 'block';
    
    // Hide message after 5 seconds
    setTimeout(() => {
      element.style.opacity = '0';
      setTimeout(() => {
        element.textContent = '';
        element.style.display = 'none';
        element.style.opacity = '1';
      }, 500);
    }, 5000);
  }
}

// Loading spinner and popup helpers
function showLoadingSpinner(show) {
  let spinner = document.getElementById('formLoadingSpinner');
  if (!spinner) {
    spinner = document.createElement('div');
    spinner.id = 'formLoadingSpinner';
    spinner.innerHTML = `<div class="spinner-overlay"><div class="spinner"></div></div>`;
    document.body.appendChild(spinner);
  }
  spinner.style.display = show ? 'flex' : 'none';
}

function showSuccessPopup(message) {
  let popup = document.getElementById('formSuccessPopup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'formSuccessPopup';
    popup.innerHTML = `
      <div class="popup-overlay">
        <div class="popup-content">
          <div class="tick-circle">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="28" fill="#4BB543"/>
              <path d="M16 29L24 37L40 21" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="popup-message">${message}</div>
          <button class="popup-close">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);
    popup.querySelector('.popup-close').onclick = () => {
      popup.style.display = 'none';
    };
    popup.onclick = (e) => {
      if (e.target.classList.contains('popup-overlay')) {
        popup.style.display = 'none';
      }
    };
  } else {
    popup.querySelector('.popup-message').textContent = message;
    popup.style.display = 'flex';
  }
  popup.style.display = 'flex';
}

// Handle contact form submission
document.addEventListener('DOMContentLoaded', () => {
  console.log('Database.js loaded and DOM ready');
  
  // Test Firebase connection
  try {
    console.log('Testing Firebase connection...');
    console.log('Database instance:', db);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
  // Contact Form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    console.log('Contact form found, adding event listener');
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Contact form submitted');
      
      // Get form values
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone')?.value.trim() || '';
      const course = document.getElementById('course')?.value.trim() || '';
      const message = document.getElementById('message').value.trim();
      
      console.log('Form data:', { name, email, phone, course, message });
      
      // Simple validation
      if (!name || !email) {
        showMessage('formMessage', 'Please fill in all required fields.', true);
        return;
      }
      
      // Email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showMessage('formMessage', 'Please enter a valid email address.', true);
        return;
      }
      
      // Show loading spinner
      showLoadingSpinner(true);
      try {
        console.log('Attempting to add document to Firestore...');
        // Add a new document to the 'contacts' collection
        const docRef = await addDoc(collection(db, 'contacts'), {
          name,
          email,
          ...(phone && { phone }), // Only include phone if it exists
          ...(course && { course }), // Only include course if selected
          message,
          timestamp: serverTimestamp(),
          source: 'contact-form'
        });

        console.log('Document written with ID: ', docRef.id);
        // Hide spinner and show popup with tick
        showLoadingSpinner(false);
        showSuccessPopup('Thank you for contacting us! We will get back to you soon.');
        contactForm.reset();
      } catch (error) {
        showLoadingSpinner(false);
        console.error('Error adding contact:', error);
        console.error('Error details:', error.message, error.code);
        showMessage('formMessage', 'There was an error sending your message. Please try again later.', true);
      }
    });
  }

  // Newsletter Subscription Form
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
  console.log('Newsletter form found, adding event listener');
    newsletterForm.addEventListener('submit', async (e) => {
      // Show loading spinner
      const spinner = document.getElementById('newsletterLoadingSpinner');
      if (spinner) spinner.style.display = 'flex';
      e.preventDefault();
      console.log('Newsletter form submitted');
      
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const messageElement = document.getElementById('newsletterMessage');
      
      console.log('Newsletter data:', { name, email });
      
      // Validation
      if (!name || !email) {
        showMessage('newsletterMessage', 'Please enter both name and email.', true);
        return;
      }
      
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showMessage('newsletterMessage', 'Please enter a valid email address.', true);
        return;
      }
      
      try {
        console.log('Adding new newsletter subscription (duplicate check removed)...');
        // Add to newsletter collection
        const docRef = await addDoc(collection(db, 'newsletter'), {
          name,
          email,
          timestamp: serverTimestamp(),
          status: 'subscribed'
        });
        
        console.log('Newsletter subscription added with ID:', docRef.id);
        // Show success message and reset form
        // Hide spinner
        const spinner = document.getElementById('newsletterLoadingSpinner');
        if (spinner) spinner.style.display = 'none';
        // Show popup confirmation
        const popup = document.getElementById('newsletterSuccessPopup');
        if (popup) popup.style.display = 'flex';
        newsletterForm.reset();
      } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        console.error('Newsletter error details:', error.message, error.code);
        const spinner = document.getElementById('newsletterLoadingSpinner');
        if (spinner) spinner.style.display = 'none';
        showMessage('newsletterMessage', 'There was an error subscribing. Please try again later.', true);
      }
    });
  }
});
