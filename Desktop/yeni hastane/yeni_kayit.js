// Hasta kayıt sistemi JavaScript dosyası

// DOM yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
});

// Form başlatma
function initializeForm() {
    // Bugünün tarihini maksimum doğum tarihi olarak ayarla
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dogumTarihi').max = today;
    
    // TC kimlik numarası için sadece rakam girişi
    setupTCValidation();
    
    // Telefon numarası formatı
    setupPhoneValidation();
}
document.getElementById("hastaForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const formData = new FormData(this);

    fetch("hasta_kaydet.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        if (data.trim() === "success") {
            document.getElementById("successModal").style.display = "block";
        } else {
            alert("Kayıt sırasında bir hata oluştu.");
        }
    })
    .catch(error => {
        console.error("Hata:", error);
    });
});

function formTemizle() {
    document.getElementById("hastaForm").reset();
}

function yeniKayit() {
    document.getElementById("successModal").style.display = "none";
    formTemizle();
}


// Event listener'ları kurma
function setupEventListeners() {
    const form = document.getElementById('hastaForm');
    const modal = document.getElementById('successModal');
    const closeBtn = document.querySelector('.close');
    
    // Form gönderimi
    form.addEventListener('submit', handleFormSubmit);
    
    // Modal kapatma
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Real-time validasyon
    setupRealTimeValidation();
}

// TC kimlik numarası validasyonu
function setupTCValidation() {
    const tcInput = document.getElementById('tc');
    
    tcInput.addEventListener('input', function(e) {
        // Sadece rakam girişine izin ver
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        
        // 11 haneli kontrol
        if (e.target.value.length === 11) {
            e.target.classList.remove('error');
            e.target.classList.add('success');
            removeErrorMessage(e.target);
        } else if (e.target.value.length > 0) {
            e.target.classList.add('error');
            e.target.classList.remove('success');
            showErrorMessage(e.target, 'T.C. Kimlik Numarası 11 haneli olmalıdır');
        } else {
            e.target.classList.remove('success', 'error');
            removeErrorMessage(e.target);
        }
    });
}

// Telefon numarası validasyonu
function setupPhoneValidation() {
    const phoneInput = document.getElementById('iletisim');
    
    phoneInput.addEventListener('input', function(e) {
        // Sadece rakam girişine izin ver
        let value = e.target.value.replace(/[^0-9]/g, '');
        
        // Telefon numarası formatı (05xx xxx xx xx)
        if (value.length > 0 && !value.startsWith('05')) {
            if (value.startsWith('5')) {
                value = '0' + value;
            }
        }
        
        if (value.length > 11) {
            value = value.substring(0, 11);
        }
        
        // Format uygula
        if (value.length >= 4) {
            value = value.substring(0, 4) + ' ' + value.substring(4);
        }
        if (value.length >= 8) {
            value = value.substring(0, 8) + ' ' + value.substring(8);
        }
        if (value.length >= 11) {
            value = value.substring(0, 11) + ' ' + value.substring(11);
        }
        
        e.target.value = value;
        
        // Validasyon
        const cleanValue = value.replace(/\s/g, '');
        if (cleanValue.length === 11 && cleanValue.startsWith('05')) {
            e.target.classList.remove('error');
            e.target.classList.add('success');
            removeErrorMessage(e.target);
        } else if (cleanValue.length > 0) {
            e.target.classList.add('error');
            e.target.classList.remove('success');
            showErrorMessage(e.target, 'Geçerli bir telefon numarası giriniz (05xx xxx xx xx)');
        }
    });
}

// Real-time validasyon kurma
function setupRealTimeValidation() {
    const inputs = document.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(input);
        });
        
        input.addEventListener('input', function() {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
    });
}

// Tek alan validasyonu
function validateField(field) {
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        field.classList.add('error');
        showErrorMessage(field, 'Bu alan zorunludur');
        return false;
    }
    
    field.classList.remove('error');
    removeErrorMessage(field);
    return true;
}

// Basit TC kontrol fonksiyonu - sadece 11 hane ve rakam kontrolü
function isValidTCFormat(tc) {
    return tc.length === 11 && /^\d{11}$/.test(tc) && tc[0] !== '0';
}

// Form gönderimi
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showNotification('Lütfen tüm zorunlu alanları doğru şekilde doldurunuz.', 'error');
        return;
    }
    
    const submitBtn = document.querySelector('.btn-primary');
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Kaydediliyor...';
    submitBtn.disabled = true;
    
    // Simüle edilmiş kaydetme işlemi
    setTimeout(() => {
        savePatient();
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'KAYDET';
        submitBtn.disabled = false;
    }, 2000);
}

// Form validasyonu
function validateForm() {
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // TC basit validasyonu - sadece 11 hane kontrolü
    const tcField = document.getElementById('tc');
    if (tcField.value && tcField.value.length !== 11) {
        tcField.classList.add('error');
        showErrorMessage(tcField, 'T.C. Kimlik Numarası 11 haneli olmalıdır');
        isValid = false;
    }
    
    // Telefon özel validasyonu
    const phoneField = document.getElementById('iletisim');
    const cleanPhone = phoneField.value.replace(/\s/g, '');
    if (phoneField.value && (cleanPhone.length !== 11 || !cleanPhone.startsWith('05'))) {
        phoneField.classList.add('error');
        showErrorMessage(phoneField, 'Geçerli bir telefon numarası giriniz');
        isValid = false;
    }
    
    return isValid;
}

// Hasta kaydetme
function savePatient() {
    const formData = new FormData(document.getElementById('hastaForm'));
    const patientData = {};

    for (let [key, value] of formData.entries()) {
        patientData[key] = value.trim();
    }

    // Yaş hesapla
    const birthDate = new Date(patientData.dogumTarihi);
    const today = new Date();
    patientData.yas = today.getFullYear() - birthDate.getFullYear();
    if (
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
        patientData.yas--;
    }

    patientData.hastaNo = generatePatientNumber();
    patientData.kayitTarihi = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Backend'e POST isteği
    fetch('hasta_kaydet.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
    })
    .then(res => res.json())
    .then(response => {
        if (response.status === 'success') {
            showSuccessModal();
        } else {
            showNotification('Kayıt sırasında hata oluştu: ' + response.message, 'error');
        }
    })
    .catch(err => {
        showNotification('Sunucu hatası: ' + err, 'error');
    });
}


// Hasta numarası oluşturma
function generatePatientNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    return `H${year}${month}${random}`;
}

// Local storage'a kaydetme


// Başarı modalını göster
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Modal kapatma
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Yeni kayıt için formu temizle
function yeniKayit() {
    closeModal();
    formTemizle();
    document.getElementById('hastaAdi').focus();
}

// Formu temizleme
function formTemizle() {
    const form = document.getElementById('hastaForm');
    form.reset();
    
    // Tüm hata mesajlarını ve stiller temizle
    const errorFields = document.querySelectorAll('.error, .success');
    errorFields.forEach(field => {
        field.classList.remove('error', 'success');
    });
    
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    
    showNotification('Form temizlendi', 'success');
}

// Hata mesajı gösterme
function showErrorMessage(field, message) {
    removeErrorMessage(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

// Hata mesajını kaldırma
function removeErrorMessage(field) {
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

// Bildirim gösterme
function showNotification(message, type = 'info') {
    // Basit bir toast notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Stil
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '10px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '600',
        zIndex: '9999',
        opacity: '0',
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease'
    });
    
    // Tip'e göre renk
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #f56565, #e53e3e)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #4299e1, #3182ce)';
    }
    
    document.body.appendChild(notification);
    
    // Animasyon
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Otomatik kaldırma
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Yaş hesaplama fonksiyonu
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

// Kayıtlı hastaları getirme (admin paneli için)
function getPatients() {
    return JSON.parse(localStorage.getItem('patients') || '[]');
}

// Hasta arama fonksiyonu
function searchPatient(query) {
    const patients = getPatients();
    return patients.filter(patient => 
        patient.hastaAdi.toLowerCase().includes(query.toLowerCase()) ||
        patient.hastaSoyadi.toLowerCase().includes(query.toLowerCase()) ||
        patient.tc.includes(query) ||
        patient.hastaNo.includes(query)
    );
}

// Excel'e dışa aktarma
function exportToExcel() {
    const patients = getPatients();
    if (patients.length === 0) {
        showNotification('Dışa aktarılacak hasta kaydı bulunamadı', 'error');
        return;
    }

    // CSV formatında veri hazırlama
    const csvContent = [
        ['Hasta No', 'Ad', 'Soyad', 'TC', 'Doğum Tarihi', 'Yaş', 'Cinsiyet', 'Kan Grubu', 'Telefon', 'Adres', 'Alerjiler', 'Kayıt Tarihi'],
        ...patients.map(p => [
            p.hastaNo,
            p.hastaAdi,
            p.hastaSoyadi,
            p.tc,
            p.dogumTarihi,
            p.yas || calculateAge(p.dogumTarihi),
            p.cinsiyet,
            p.kanGrubu || '',
            p.iletisim,
            p.adres || '',
            p.alerji || '',
            new Date(p.kayitTarihi).toLocaleDateString('tr-TR')
        ])
    ].map(row => row.join(',')).join('\n');

    // Dosya indirme
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hasta_kayitlari_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Hasta kayıtları dışa aktarıldı', 'success');
}

// Yazdırma fonksiyonu
function printPatientCard(patientData) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Hasta Kartı - ${patientData.hastaAdi} ${patientData.hastaSoyadi}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #e53e3e; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { color: #e53e3e; font-size: 24px; font-weight: bold; }
                .patient-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .info-group { margin-bottom: 15px; }
                .label { font-weight: bold; color: #555; }
                .value { margin-top: 5px; padding: 8px; background: #f5f5f5; border-radius: 5px; }
                @media print { 
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">LARGEN DIAGNOSTIC</div>
                <h2>Hasta Kartı</h2>
            </div>
            <div class="patient-info">
                <div class="info-group">
                    <div class="label">Hasta No:</div>
                    <div class="value">${patientData.hastaNo}</div>
                </div>
                <div class="info-group">
                    <div class="label">Ad Soyad:</div>
                    <div class="value">${patientData.hastaAdi} ${patientData.hastaSoyadi}</div>
                </div>
                <div class="info-group">
                    <div class="label">T.C. Kimlik No:</div>
                    <div class="value">${patientData.tc}</div>
                </div>
                <div class="info-group">
                    <div class="label">Doğum Tarihi:</div>
                    <div class="value">${new Date(patientData.dogumTarihi).toLocaleDateString('tr-TR')}</div>
                </div>
                <div class="info-group">
                    <div class="label">Yaş:</div>
                    <div class="value">${patientData.yas || calculateAge(patientData.dogumTarihi)}</div>
                </div>
                <div class="info-group">
                    <div class="label">Cinsiyet:</div>
                    <div class="value">${patientData.cinsiyet}</div>
                </div>
                <div class="info-group">
                    <div class="label">Kan Grubu:</div>
                    <div class="value">${patientData.kanGrubu || 'Belirtilmemiş'}</div>
                </div>
                <div class="info-group">
                    <div class="label">Telefon:</div>
                    <div class="value">${patientData.iletisim}</div>
                </div>
                <div class="info-group" style="grid-column: 1/-1;">
                    <div class="label">Adres:</div>
                    <div class="value">${patientData.adres || 'Belirtilmemiş'}</div>
                </div>
                <div class="info-group" style="grid-column: 1/-1;">
                    <div class="label">Alerji Bilgileri:</div>
                    <div class="value">${patientData.alerji || 'Bilinen alerji yok'}</div>
                </div>
                <div class="info-group">
                    <div class="label">Kayıt Tarihi:</div>
                    <div class="value">${new Date(patientData.kayitTarihi).toLocaleDateString('tr-TR')}</div>
                </div>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    }
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Hasta güncelleme fonksiyonu
function updatePatient(hastaNo, updatedData) {
    let patients = getPatients();
    const index = patients.findIndex(p => p.hastaNo === hastaNo);
    
    if (index !== -1) {
        patients[index] = { ...patients[index], ...updatedData };
        localStorage.setItem('patients', JSON.stringify(patients));
        showNotification('Hasta bilgileri güncellendi', 'success');
        return true;
    }
    
    showNotification('Hasta bulunamadı', 'error');
    return false;
}

// Hasta silme fonksiyonu
function deletePatient(hastaNo) {
    if (!confirm('Bu hasta kaydını silmek istediğinizden emin misiniz?')) {
        return false;
    }
    
    let patients = getPatients();
    const filteredPatients = patients.filter(p => p.hastaNo !== hastaNo);
    
    if (filteredPatients.length < patients.length) {
        localStorage.setItem('patients', JSON.stringify(filteredPatients));
        showNotification('Hasta kaydı silindi', 'success');
        return true;
    }
    
    showNotification('Hasta bulunamadı', 'error');
    return false;
}

// İstatistik fonksiyonları
function getPatientStats() {
    const patients = getPatients();
    
    const stats = {
        total: patients.length,
        male: patients.filter(p => p.cinsiyet === 'erkek').length,
        female: patients.filter(p => p.cinsiyet === 'kadin').length,
        bloodGroups: {},
        ageGroups: {
            '0-18': 0,
            '19-35': 0,
            '36-50': 0,
            '51-65': 0,
            '65+': 0
        },
        recentRegistrations: patients.filter(p => {
            const regDate = new Date(p.kayitTarihi);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return regDate > weekAgo;
        }).length
    };
    
    // Kan grubu istatistikleri
    patients.forEach(p => {
        if (p.kanGrubu) {
            stats.bloodGroups[p.kanGrubu] = (stats.bloodGroups[p.kanGrubu] || 0) + 1;
        }
    });
    
    // Yaş grubu istatistikleri
    patients.forEach(p => {
        const age = p.yas || calculateAge(p.dogumTarihi);
        if (age <= 18) stats.ageGroups['0-18']++;
        else if (age <= 35) stats.ageGroups['19-35']++;
        else if (age <= 50) stats.ageGroups['36-50']++;
        else if (age <= 65) stats.ageGroups['51-65']++;
        else stats.ageGroups['65+']++;
    });
    
    return stats;
}

// Veri yedekleme
function backupData() {
    const patients = getPatients();
    const backup = {
        patients: patients,
        backupDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `largen_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Veri yedeği oluşturuldu', 'success');
}

// Veri geri yükleme
function restoreData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            if (backup.patients && Array.isArray(backup.patients)) {
                localStorage.setItem('patients', JSON.stringify(backup.patients));
                showNotification(`${backup.patients.length} hasta kaydı geri yüklendi`, 'success');
            } else {
                throw new Error('Geçersiz yedek dosyası');
            }
        } catch (error) {
            showNotification('Yedek dosyası okunamadı', 'error');
        }
    };
    reader.readAsText(file);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+S: Formu kaydet
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        document.getElementById('hastaForm').dispatchEvent(new Event('submit'));
    }
    
    // Ctrl+R: Formu temizle
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        formTemizle();
    }
    
    // Escape: Modal kapat
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Otomatik kaydetme (draft)
let autoSaveInterval;
function startAutoSave() {
    autoSaveInterval = setInterval(() => {
        const formData = new FormData(document.getElementById('hastaForm'));
        const draftData = {};
        
        for (let [key, value] of formData.entries()) {
            if (value.trim()) {
                draftData[key] = value;
            }
        }
        
        if (Object.keys(draftData).length > 0) {
            localStorage.setItem('patientDraft', JSON.stringify(draftData));
        }
    }, 30000); // 30 saniyede bir kaydet
}

// Draft'ı geri yükle
function loadDraft() {
    const draft = localStorage.getItem('patientDraft');
    if (draft) {
        const draftData = JSON.parse(draft);
        
        if (confirm('Kaydedilmemiş form verisi bulundu. Geri yüklemek istiyor musunuz?')) {
            Object.keys(draftData).forEach(key => {
                const field = document.getElementById(key);
                if (field) {
                    field.value = draftData[key];
                }
            });
            
            showNotification('Draft geri yüklendi', 'info');
        }
        
        localStorage.removeItem('patientDraft');
    }
}

// Sayfa yüklendiğinde draft kontrol et
window.addEventListener('load', () => {
    loadDraft();
    startAutoSave();
});

// Sayfa kapatılırken draft temizle
window.addEventListener('beforeunload', () => {
    clearInterval(autoSaveInterval);
    localStorage.removeItem('patientDraft');
});