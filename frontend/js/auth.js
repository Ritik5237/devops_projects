// TaskFlow - Authentication Handler

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in on login/register pages
  if (API.isAuthenticated()) {
    const isAuthPage = window.location.pathname.includes('login') || window.location.pathname.includes('register');
    if (isAuthPage) {
      window.location.href = '/dashboard.html';
      return;
    }
  }

  // Handle Login Form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        showToast('Please enter both email and password', 'error');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Signing In...</span>';

        const res = await API.login(email, password);
        showToast('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 800);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Sign In</span>';
      }
    });
  }

  // Handle Register Form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      if (!name || !email || !password) {
        showToast('Please fill out all required fields', 'error');
        return;
      }

      if (password.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Creating Account...</span>';

        await API.register(name, email, password);
        showToast('Account created successfully! Welcome to TaskFlow', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1000);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Create Account</span>';
      }
    });
  }
});
