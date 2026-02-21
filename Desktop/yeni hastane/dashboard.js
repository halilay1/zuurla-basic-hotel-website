// dashboard.js

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    
    // Dashboard animasyonlarını başlat
    initDashboardAnimations();
    
    // Menu item efektlerini başlat
    initMenuEffects();
    
    // Keyboard navigasyonunu başlat
    initKeyboardNavigation();
    
    // Logo animasyonunu başlat
    initLogoAnimation();
    
    // Sayfa geçiş efektlerini başlat
    initPageTransitions();
    
    // Responsive kontrolleri başlat
    initResponsiveControls();
    
});

// Dashboard animasyonları
function initDashboardAnimations() {
    const sections = document.querySelectorAll('.dashboard-section');
    
    // Intersection Observer ile scroll animasyonları
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        root: null,
        rootMargin: '0px 0px -50px 0px'
    });
    
    sections.forEach((section, index) => {
        // İlk yükleme animasyonu
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.6s ease';
        
        // Gecikmeli animasyon
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 100 + (index * 150));
        
        observer.observe(section);
    });
}

// Menu item efektleri
function initMenuEffects() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        // Hover efektleri
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px) scale(1.02)';
            
            // Ripple efekti ekle
            createRippleEffect(this);
            
            // Icon animasyonu
            const icon = this.querySelector('.menu-icon');
            if (icon) {
                icon.style.transform = 'scale(1.15) rotate(5deg)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) scale(1)';
            
            // Icon animasyonunu sıfırla
            const icon = this.querySelector('.menu-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
        
        // Tıklama efektleri
        item.addEventListener('mousedown', function() {
            this.style.transform = 'translateX(5px) scale(0.98)';
        });
        
        item.addEventListener('mouseup', function() {
            this.style.transform = 'translateX(5px) scale(1.02)';
        });
        
        // Tıklama animasyonu
        item.addEventListener('click', function(e) {
            // Tıklama dalga efekti
            createClickWave(this, e);
            
            // Sayfa geçiş animasyonu
            showPageTransition();
            
            // Analytics (opsiyonel)
            trackMenuClick(this);
        });
    });
}

// Ripple efekti oluştur
function createRippleEffect(element) {
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 0, 0, 0.1)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.width = '50px';
    ripple.style.height = '50px';
    ripple.style.marginLeft = '-25px';
    ripple.style.marginTop = '-25px';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '0';
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Tıklama dalga efekti
function createClickWave(element, event) {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const wave = document.createElement('div');
    wave.style.position = 'absolute';
    wave.style.left = x + 'px';
    wave.style.top = y + 'px';
    wave.style.width = '0';
    wave.style.height = '0';
    wave.style.borderRadius = '50%';
    wave.style.background = 'rgba(255, 0, 0, 0.2)';
    wave.style.transform = 'translate(-50%, -50%)';
    wave.style.animation = 'clickWave 0.6s ease-out';
    wave.style.pointerEvents = 'none';
    wave.style.zIndex = '1';
    
    element.appendChild(wave);
    
    setTimeout(() => {
        wave.remove();
    }, 600);
}

// Keyboard navigasyonu
function initKeyboardNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    let currentIndex = -1;
    
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'Tab':
                // Tab ile navigasyon
                e.preventDefault();
                currentIndex = (currentIndex + 1) % menuItems.length;
                focusMenuItem(currentIndex);
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                currentIndex = (currentIndex + 1) % menuItems.length;
                focusMenuItem(currentIndex);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                currentIndex = currentIndex <= 0 ? menuItems.length - 1 : currentIndex - 1;
                focusMenuItem(currentIndex);
                break;
                
            case 'Enter':
                if (currentIndex >= 0 && currentIndex < menuItems.length) {
                    menuItems[currentIndex].click();
                }
                break;
                
            case 'Escape':
                currentIndex = -1;
                menuItems.forEach(item => item.blur());
                break;
        }
    });
    
    function focusMenuItem(index) {
        menuItems.forEach((item, i) => {
            if (i === index) {
                item.focus();
                item.style.outline = '2px solid #ff0000';
                item.style.outlineOffset = '2px';
            } else {
                item.style.outline = 'none';
            }
        });
    }
}

// Logo animasyonu
function initLogoAnimation() {
    const logoCircle = document.querySelector('.logo-circle');
    const logoText = document.querySelector('.logo-text');
    
    // Logo tıklama animasyonu
    logoCircle.addEventListener('click', function() {
        this.style.animation = 'logoSpin 1s ease-in-out';
        logoText.style.animation = 'logoTextBounce 1s ease-in-out';
        
        setTimeout(() => {
            this.style.animation = '';
            logoText.style.animation = '';
        }, 1000);
    });
    
    // Periyodik logo animasyonu (her 45 saniyede bir)
    setInterval(() => {
        logoCircle.style.animation = 'logoPulse 2s ease-in-out';
        
        setTimeout(() => {
            logoCircle.style.animation = '';
        }, 2000);
    }, 45000);
}

// Sayfa geçiş efektleri
function initPageTransitions() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Eğer href varsa ve # ile başlamıyorsa
            if (href && !href.startsWith('#')) {
                // Sayfa geçiş animasyonu göster
                showPageTransition();
                
                // Local storage'a son erişilen sayfa bilgisini kaydet
                localStorage.setItem('lastVisitedPage', href);
                localStorage.setItem('lastVisitTime', new Date().getTime());
            }
        });
    });
}

// Sayfa geçiş animasyonu göster
function showPageTransition() {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'linear-gradient(45deg, rgba(255, 0, 0, 0.1), rgba(255, 0, 0, 0.05))';
    overlay.style.zIndex = '9999';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.pointerEvents = 'none';
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 50);
    
    setTimeout(() => {
        overlay.remove();
    }, 300);
}

// Responsive kontroller
function initResponsiveControls() {
    let isTouch = false;
    
    // Touch cihaz kontrolü
    document.addEventListener('touchstart', function() {
        isTouch = true;
        document.body.classList.add('touch-device');
    });
    
    // Viewport değişimi kontrolü
    window.addEventListener('resize', debounce(() => {
        // Responsive animasyonları güncelle
        updateResponsiveAnimations();
    }, 250));
    
    // Orientasyon değişimi
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            updateResponsiveAnimations();
        }, 100);
    });
}

// Responsive animasyonları güncelle
function updateResponsiveAnimations() {
    const sections = document.querySelectorAll('.dashboard-section');
    
    sections.forEach((section, index) => {
        section.style.transition = 'all 0.3s ease';
    });
}

// Menu tıklama takibi (analytics için)
function trackMenuClick(menuItem) {
    const menuText = menuItem.querySelector('.menu-text').textContent.trim();
    const href = menuItem.getAttribute('href');
    
    // Console log (geliştirme için)
    console.log('Menu clicked:', {
        text: menuText,
        href: href,
        timestamp: new Date().toISOString()
    });
    
    // Buraya analytics kodu eklenebilir
    // örnek: gtag('event', 'menu_click', { menu_item: menuText });
}

// Debounce fonksiyonu
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// CSS animasyonları tanımla
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    @keyframes clickWave {
        to {
            width: 100px;
            height: 100px;
            opacity: 0;
        }
    }
    
    @keyframes logoSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    @keyframes logoTextBounce {
        0%, 20%, 60%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        80% { transform: translateY(-5px); }
    }
    
    @keyframes logoPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .touch-device .menu-item:hover {
        transform: none;
    }
    
    .touch-device .menu-item:active {
        transform: scale(0.95);
    }
`;
document.head.appendChild(style);

// Sayfa görünürlük kontrolü
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Sayfa gizlendiğinde animasyonları durdur
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.style.animationPlayState = 'paused';
        });
    } else {
        // Sayfa tekrar görünür olduğunda animasyonları devam ettir
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.style.animationPlayState = 'running';
        });
    }
});

// Hata yakalama
window.addEventListener('error', function(e) {
    console.error('Dashboard error:', e.message);
    
    // Hata durumunda kullanıcıya bilgi ver (opsiyonel)
    // showErrorNotification('Bir hata oluştu, lütfen sayfayı yenileyin.');
});

// Sayfa yüklenme performansı
window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log('Dashboard loaded in:', Math.round(loadTime), 'ms');
    
    // Performans optimizasyonu için lazy loading
    if (loadTime > 3000) {
        // Yavaş yükleme durumunda animasyonları azalt
        document.body.classList.add('reduced-motion');
    }
});