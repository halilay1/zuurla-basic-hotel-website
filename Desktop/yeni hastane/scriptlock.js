// Form validation and handling
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Add event listeners for form inputs
    usernameInput.addEventListener('input', validateUsername);
    passwordInput.addEventListener('input', validatePassword);
    
    // Handle form submission
    form.addEventListener('submit', handleSubmit);

    function validateUsername() {
        const username = usernameInput.value.trim();
        
        if (username.length < 3) {
            usernameInput.style.borderBottomColor = '#ff6b6b';
            return false;
        } else {
            usernameInput.style.borderBottomColor = '#51cf66';
            return true;
        }
    }

    function validatePassword() {
        const password = passwordInput.value;
        
        if (password.length < 6) {
            passwordInput.style.borderBottomColor = '#ff6b6b';
            return false;
        } else {
            passwordInput.style.borderBottomColor = '#51cf66';
            return true;
        }
    }
    document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    fetch('login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.location.href = 'dashboard.html';
        } else {
            alert('Kullanıcı adı veya şifre hatalı!');
        }
    })
    .catch(err => {
        console.error('Hata:', err);
        alert('Sunucu hatası oluştu.');
    });
});


    function handleSubmit(e) {
        e.preventDefault();
        
        const isUsernameValid = validateUsername();
        const isPasswordValid = validatePassword();
        
        if (isUsernameValid && isPasswordValid) {
            // Simulate login process
            console.log('Giriş yapılıyor...');
           
        } else {
            alert('Lütfen geçerli kullanıcı adı ve şifre giriniz.');
        }
    }

    // Add focus/blur effects
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
});