// script.js

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    
    // Sayfa yükleme animasyonu
    initPageAnimation();
    
    // Buton hover efektleri
    initButtonEffects();
    
    // Sayfa geçiş kontrolleri
    initPageNavigation();
    
    // Logo animasyonu
    initLogoAnimation();
    
});

// Sayfa yükleme animasyonu
function initPageAnimation() {
    const sections = document.querySelectorAll('.section');
    const logo = document.querySelector('.logo');
    
    // Logo'yu animate et
    logo.style.opacity = '0';
    logo.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        logo.style.transition = 'all 0.8s ease';
        logo.style.opacity = '1';
        logo.style.transform = 'translateY(0)';
    }, 100);
    
    // Bölümleri sırayla animate et
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            section.style.transition = 'all 0.6s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 300 + (index * 200));
    });
}

// Buton hover efektleri
function initButtonEffects() {
    const buttons = document.querySelectorAll('.nav-button');
    
    buttons.forEach(button => {
        // Mouse enter efekti
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            
            // Ripple efekti ekle
            createRippleEffect(this);
        });
        
        // Mouse leave efekti
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Tıklama efekti
        button.addEventListener('click', function(e) {
            // Tıklama animasyonu
            this.style.transform = 'translateY(-2px) scale(0.98)';
            
            setTimeout(() => {
                this.style.transform = 'translateY(-5px) scale(1.02)';
            }, 100);
            
            // Yükleme göstergesi (opsiyonel)
            showLoadingIndicator(this);
        });
    });
}

// Ripple efekti oluştur
function createRippleEffect(button) {
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 0, 0, 0.1)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.width = '100px';
    ripple.style.height = '100px';
    ripple.style.marginLeft = '-50px';
    ripple.style.marginTop = '-50px';
    ripple.style.pointerEvents = 'none';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// CSS animasyonu tanımla
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
    
    .loading {
        animation: pulse 1s infinite;
    }
`;
document.head.appendChild(style);

// Sayfa geçiş kontrolleri
function initPageNavigation() {
    const navButtons = document.querySelectorAll('.nav-button');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Eğer sayfa mevcut değilse uyarı göster
            if (href && !href.startsWith('http')) {
                // Local storage'a son tıklanan buton bilgisini kaydet
                localStorage.setItem('lastClickedButton', this.textContent.trim());
                localStorage.setItem('lastClickTime', new Date().getTime());
            }
        });
    });
}

// Logo animasyon efektleri
function initLogoAnimation() {
    const logoCircle = document.querySelector('.logo-circle');
    
    // Logo'ya tıklandığında animasyon
    logoCircle.addEventListener('click', function() {
        this.style.animation = 'pulse 0.6s ease';
        
        setTimeout(() => {
            this.style.animation = '';
        }, 600);
    });
    
    // Periyodik logo animasyonu (opsiyonel - 30 saniyede bir)
    setInterval(() => {
        logoCircle.style.animation = 'pulse 2s ease';
        
        setTimeout(() => {
            logoCircle.style.animation = '';
        }, 2000);
    }, 30000);
}

// Yükleme göstergesi
function showLoadingIndicator(button) {
    const originalContent = button.innerHTML;
    
    // Geçici yükleme göstergesi
    button.classList.add('loading');
    
    setTimeout(() => {
        button.classList.remove('loading');
    }, 500);
}

// Sayfa görünürlük değişimini kontrol et
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Sayfa gizlendiğinde animasyonları durdur
        document.querySelectorAll('.nav-button').forEach(button => {
            button.style.animation = 'none';
        });
    } else {
        // Sayfa tekrar görünür olduğunda animasyonları başlat
        initButtonEffects();
    }
});

// Hata yakalama
window.addEventListener('error', function(e) {
    console.log('Sayfa hatası:', e.message);
    
    // Kullanıcıya dostane hata mesajı (opsiyonel)
    // showErrorMessage('Bir hata oluştu, lütfen sayfayı yenileyin.');
});

// Keyboard navigasyonu
document.addEventListener('keydown', function(e) {
    const buttons = document.querySelectorAll('.nav-button');
    const activeButton = document.activeElement;
    
    // Tab tuşu ile navigasyon iyileştirmesi
    if (e.key === 'Tab') {
        buttons.forEach(button => {
            button.style.outline = '2px solid #ff0000';
            button.style.outlineOffset = '2px';
        });
    }
    
    // Enter tuşu ile buton aktivasyonu
    if (e.key === 'Enter' && activeButton.classList.contains('nav-button')) {
        activeButton.click();
    }
});

// Touch cihazlar için ek optimizasyonlar
if ('ontouchstart' in window) {
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'translateY(-3px) scale(1.01)';
        });
        
        button.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = 'translateY(0) scale(1)';
            }, 100);
        });
    });
}