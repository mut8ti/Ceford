// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB__VrarOe_CFfI7hKL5jFsEni1Lh3Lnqs",
  authDomain: "cefored-institute.firebaseapp.com",
  projectId: "cefored-institute",
  storageBucket: "cefored-institute.firebasestorage.app",
  messagingSenderId: "460320160628",
  appId: "1:460320160628:web:614f9decdecbdfb50a4a21",
  measurementId: "G-HMTSZWL569"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  // Contact Form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Get form values
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone')?.value.trim() || '';
      const message = document.getElementById('message').value.trim();
      
      // Simple validation
      if (!name || !email || !message) {
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
        // Add a new document to the 'contacts' collection
        await addDoc(collection(db, 'contacts'), {
          name,
          email,
          ...(phone && { phone }), // Only include phone if it exists
          message,
          timestamp: serverTimestamp(),
          source: 'contact-form'
        });

        // Hide spinner and show popup with tick
        showLoadingSpinner(false);
        showSuccessPopup('Thank you for contacting us! We will get back to you soon.');
        contactForm.reset();
      } catch (error) {
        showLoadingSpinner(false);
        console.error('Error adding contact:', error);
        showMessage('formMessage', 'There was an error sending your message. Please try again later.', true);
      }
    });
  }

  // Newsletter Subscription Form
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      // Show loading spinner
      const spinner = document.getElementById('newsletterLoadingSpinner');
      if (spinner) spinner.style.display = 'flex';
      e.preventDefault();
      
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const messageElement = document.getElementById('newsletterMessage');
      
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
        // Check if email already exists
        const q = query(
          collection(db, 'newsletter'),
          where('email', '==', email)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          showMessage('newsletterMessage', 'This email is already subscribed. Thank you!');
          return;
        }
        
        // Add to newsletter collection
        await addDoc(collection(db, 'newsletter'), {
          name,
          email,
          timestamp: serverTimestamp(),
          status: 'subscribed'
        });
        
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
        const spinner = document.getElementById('newsletterLoadingSpinner');
        if (spinner) spinner.style.display = 'none';
        showMessage('newsletterMessage', 'There was an error subscribing. Please try again later.', true);
      }
    });
  }
});
