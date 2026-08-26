/* ==========================================================================
   MEDICARE+ INTERACTIVE CONTROLLER
   Controls Ripple Effects, Card Switching, Validation, and Notifications
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // --- Element Selectors ---
  const signinCard = document.getElementById('signin-card');
  const signupCard = document.getElementById('signup-card');
  const forgotCard = document.getElementById('forgot-card');
  const dashboardCard = document.getElementById('dashboard-card');

  // Navigation Links
  const linkSignup = document.getElementById('link-signup');
  const linkForgot = document.getElementById('link-forgot');
  const linkSigninBack = document.getElementById('link-signin-back');
  const linkSigninFromForgot = document.getElementById('link-signin-from-forgot');

  // Forms & Inputs
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');
  const forgotForm = document.getElementById('forgot-form');

  const signinEmail = document.getElementById('signin-email');
  const signinPassword = document.getElementById('signin-password');
  const toggleSigninPasswordBtn = document.getElementById('toggle-signin-password');

  // Social & Action Buttons
  const btnGoogle = document.getElementById('btn-google');
  const btnApple = document.getElementById('btn-apple');
  const btnLogout = document.getElementById('btn-logout');

  // --- 1. Ripple Effect on Buttons ---
  document.querySelectorAll('.ripple-btn, .btn-social').forEach(button => {
    button.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // --- 2. Password Visibility Toggle ---
  if (toggleSigninPasswordBtn && signinPassword) {
    toggleSigninPasswordBtn.addEventListener('click', () => {
      const isPassword = signinPassword.getAttribute('type') === 'password';
      signinPassword.setAttribute('type', isPassword ? 'text' : 'password');
      
      const eyeIcon = toggleSigninPasswordBtn.querySelector('i');
      if (eyeIcon) {
        eyeIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  // --- 3. View Switcher Helper ---
  function switchCard(hideCard, showCard) {
    hideCard.classList.remove('active-card');
    hideCard.classList.add('hidden-card');

    setTimeout(() => {
      showCard.classList.remove('hidden-card');
      showCard.classList.add('active-card');
      if (window.lucide) lucide.createIcons();
    }, 150);
  }

  if (linkSignup) {
    linkSignup.addEventListener('click', (e) => {
      e.preventDefault();
      switchCard(signinCard, signupCard);
    });
  }

  if (linkForgot) {
    linkForgot.addEventListener('click', (e) => {
      e.preventDefault();
      switchCard(signinCard, forgotCard);
    });
  }

  if (linkSigninBack) {
    linkSigninBack.addEventListener('click', (e) => {
      e.preventDefault();
      switchCard(signupCard, signinCard);
    });
  }

  if (linkSigninFromForgot) {
    linkSigninFromForgot.addEventListener('click', (e) => {
      e.preventDefault();
      switchCard(forgotCard, signinCard);
    });
  }

  // --- 4. Sign In Form Submission ---
  if (signinForm) {
    signinForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = document.getElementById('btn-signin');
      const emailVal = signinEmail.value.trim();
      const passwordVal = signinPassword.value.trim();

      if (!emailVal || !passwordVal) {
        showToast('Please enter both email and password.', 'warning');
        return;
      }

      // Show Loading State
      btn.classList.add('loading');

      setTimeout(() => {
        btn.classList.remove('loading');
        
        // Extract Name from Email for Greeting
        const namePart = emailVal.split('@')[0].replace('.', ' ');
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        
        const userDisplay = document.getElementById('user-display-name');
        if (userDisplay) userDisplay.textContent = formattedName;

        showToast(`Welcome back, ${formattedName}!`, 'success');
        switchCard(signinCard, dashboardCard);
      }, 1200);
    });
  }

  // --- 5. Sign Up Form Submission ---
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-signup-submit');
      const name = document.getElementById('signup-name').value.trim();

      if (!name) {
        showToast('Please enter your full name.', 'warning');
        return;
      }

      btn.classList.add('loading');
      setTimeout(() => {
        btn.classList.remove('loading');
        showToast('Account created successfully! Logging you in...', 'success');
        
        const userDisplay = document.getElementById('user-display-name');
        if (userDisplay) userDisplay.textContent = name;
        
        switchCard(signupCard, dashboardCard);
      }, 1200);
    });
  }

  // --- 6. Forgot Password Submission ---
  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value.trim();
      if (!email) {
        showToast('Please enter a valid email address.', 'warning');
        return;
      }

      showToast(`Password reset link sent to ${email}`, 'info');
      switchCard(forgotCard, signinCard);
    });
  }

  // --- 7. Social Sign In Mock Handlers ---
  if (btnGoogle) {
    btnGoogle.addEventListener('click', () => {
      showToast('Connecting to Google SSO...', 'info');
      setTimeout(() => {
        showToast('Signed in with Google Account!', 'success');
        const userDisplay = document.getElementById('user-display-name');
        if (userDisplay) userDisplay.textContent = 'Google User';
        switchCard(signinCard, dashboardCard);
      }, 1000);
    });
  }

  if (btnApple) {
    btnApple.addEventListener('click', () => {
      showToast('Connecting to Apple ID...', 'info');
      setTimeout(() => {
        showToast('Signed in with Apple ID!', 'success');
        const userDisplay = document.getElementById('user-display-name');
        if (userDisplay) userDisplay.textContent = 'Apple User';
        switchCard(signinCard, dashboardCard);
      }, 1000);
    });
  }

  // --- 8. Sign Out Handler ---
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      showToast('You have been signed out.', 'info');
      switchCard(dashboardCard, signinCard);
    });
  }
});

// --- Toast Notification Generator ---
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconName = 'check-circle-2';
  if (type === 'info') iconName = 'info';
  if (type === 'warning') iconName = 'alert-triangle';

  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
