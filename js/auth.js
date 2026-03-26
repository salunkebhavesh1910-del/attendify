let currentUser = null;
let selectedRole = '';

function selectSignupRole(role) {
  selectedRole = role;
  document.querySelectorAll('.role-option').forEach(opt => opt.classList.remove('selected'));
  document.querySelector(`.role-option[data-role="${role}"]`).classList.add('selected');
  document.getElementById('signupRole').value = role;
  
  const rollNoField = document.getElementById('rollNoField');
  const classField = document.getElementById('classField');
  
  if (role === 'student') {
    rollNoField.style.display = 'block';
    classField.style.display = 'block';
    document.getElementById('signupRollNo').required = true;
    document.getElementById('signupClass').required = true;
  } else {
    rollNoField.style.display = 'none';
    classField.style.display = 'none';
  }
}

function showSignupModal() {
  selectedRole = '';
  document.getElementById('signupRole').value = '';
  document.querySelectorAll('.role-option').forEach(opt => opt.classList.remove('selected'));
  document.getElementById('rollNoField').style.display = 'none';
  document.getElementById('classField').style.display = 'none';
  document.getElementById('signupForm').reset();
  document.getElementById('signupModal').style.display = 'flex';
}

function closeSignupModal() {
  document.getElementById('signupModal').style.display = 'none';
}

document.getElementById('signupForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  const role = document.getElementById('signupRole').value;
  const rollNo = document.getElementById('signupRollNo').value;
  const className = document.getElementById('signupClass').value;
  
  if (!role) {
    alert('Please select a role');
    return;
  }
  
  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }
  
  if (db.users.find(u => u.email === email)) {
    alert('Email already registered! Please login.');
    closeSignupModal();
    showLoginScreen();
    return;
  }
  
  const newUser = {
    id: 'user_' + Date.now(),
    name: name,
    email: email,
    password: password,
    role: role,
    createdAt: new Date().toISOString()
  };
  
  if (role === 'student') {
    newUser.rollNo = rollNo;
    newUser.class = className;
  }
  
  db.users.push(newUser);
  saveToLocalStorage();
  
  alert(`Account created successfully as ${role.toUpperCase()}! Please login.`);
  closeSignupModal();
  showLoginScreen();
});

function showLoginScreen() {
  document.getElementById('welcomeContainer').style.display = 'none';
  document.getElementById('loginContainer').style.display = 'flex';
}

function showWelcomeScreen() {
  document.getElementById('loginContainer').style.display = 'none';
  document.getElementById('welcomeContainer').style.display = 'flex';
}

document.getElementById('loginForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  const user = db.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    currentUser = user;
    localStorage.setItem('attendify_current_user', JSON.stringify(currentUser));
    showApp();
  } else {
    alert('Invalid email or password!');
  }
});

function logout() {
  currentUser = null;
  localStorage.removeItem('attendify_current_user');
  document.getElementById('appContainer').style.display = 'none';
  document.getElementById('welcomeContainer').style.display = 'flex';
}