// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    // Bugünün tarihini varsayılan olarak set et
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('newRecordDate').value = today;
    
    // Toplam bakiyeyi hesapla
    calculateTotalBalance();
    
    // Event listener'ları ekle
    setupEventListeners();
});

// Event listener'ları kurma
function setupEventListeners() {
    // Form input'larında değişiklik olduğunda toplam bakiyeyi güncelle
    const amountInputs = document.querySelectorAll('.record-amount');
    amountInputs.forEach(input => {
        input.addEventListener('input', calculateTotalBalance);
    });
    
    // Modal dışına tıklandığında kapat
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('recordModal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Yeni kayıt ekleme modalını aç
function addNewRecord() {
    const modal = document.getElementById('recordModal');
    modal.style.display = 'block';
    
    // Form alanlarını temizle
    document.getElementById('newRecordDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('newRecordDesc').value = '';
    document.getElementById('newRecordAmount').value = '';
    
    // İlk input'a focus ver
    document.getElementById('newRecordDate').focus();
}

// Modalı kapat
function closeModal() {
    const modal = document.getElementById('recordModal');
    modal.style.display = 'none';
}

// Yeni kaydı kaydet
function saveNewRecord() {
    const date = document.getElementById('newRecordDate').value;
    const desc = document.getElementById('newRecordDesc').value.trim();
    const amount = parseFloat(document.getElementById('newRecordAmount').value);
    
    // Validation
    if (!date || !desc || !amount || amount <= 0) {
        alert('Lütfen tüm alanları doğru şekilde doldurun!');
        return;
    }
    
    // Yeni record item oluştur
    const recordsContainer = document.getElementById('balanceRecords');
    const newRecord = createRecordElement(date, desc, amount);
    
    // Container'a ekle (en üste)
    recordsContainer.insertBefore(newRecord, recordsContainer.firstChild);
    
    // Toplam bakiyeyi güncelle
    calculateTotalBalance();
    
    // Modalı kapat
    closeModal();
    
    // Başarı mesajı
    showSuccessMessage('Yeni kayıt başarıyla eklendi!');
}

// Record element oluşturma
function createRecordElement(date, desc, amount) {
    const recordItem = document.createElement('div');
    recordItem.className = 'record-item';
    
    // Tarihi formatla (DD.MM.YYYY)
    const formattedDate = formatDate(date);
    
    recordItem.innerHTML = `
        <div class="record-date">${formattedDate}</div>
        <div class="record-desc">${desc.toUpperCase()}</div>
        <div class="record-amount">${amount} TL</div>
        <button class="delete-btn" onclick="deleteRecord(this)">×</button>
    `;
    
    return recordItem;
}

// Tarihi formatla (YYYY-MM-DD -> DD.MM.YYYY)
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// Kaydı sil
function deleteRecord(button) {
    if (confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
        const recordItem = button.closest('.record-item');
        recordItem.style.transition = 'all 0.3s ease';
        recordItem.style.transform = 'translateX(-100%)';
        recordItem.style.opacity = '0';
        
        setTimeout(() => {
            recordItem.remove();
            calculateTotalBalance();
            showSuccessMessage('Kayıt başarıyla silindi!');
        }, 300);
    }
}

// Toplam bakiyeyi hesapla
function calculateTotalBalance() {
    const recordAmounts = document.querySelectorAll('.record-amount');
    let total = 0;
    
    recordAmounts.forEach(amountElement => {
        const amount = parseFloat(amountElement.textContent.replace(' TL', '').replace(',', '.'));
        if (!isNaN(amount)) {
            total += amount;
        }
    });
    
    // Toplam bakiyeyi güncelle
    document.getElementById('totalBalance').value = total;
    
    // Summary'deki tutarı güncelle
    const summaryAmount = document.querySelector('.summary-item.total .amount');
    if (summaryAmount) {
        summaryAmount.textContent = `${total.toLocaleString('tr-TR')} TL`;
    }
    
    return total;
}

// Hasta bilgilerini kaydet
function savePatientInfo() {
    const patientData = {
        tcNo: document.getElementById('tcNo').value,
        patientName: document.getElementById('patientName').value,
        birthDate: document.getElementById('birthDate').value,
        bloodType: document.getElementById('bloodType').value,
        gender: document.getElementById('gender').value,
        phone: document.getElementById('phone').value,
        lastExam: document.getElementById('lastExam').value,
        totalBalance: document.getElementById('totalBalance').value
    };
    
    // Validation
    if (!patientData.tcNo || !patientData.patientName) {
        alert('TC Kimlik No ve Hasta Adı zorunludur!');
        return;
    }
    
    // Local storage'a kaydet (gerçek projede backend'e gönderilir)
    localStorage.setItem('patientData', JSON.stringify(patientData));
    
    // Başarı mesajı
    showSuccessMessage('Hasta bilgileri başarıyla kaydedildi!');
    
    console.log('Kaydedilen hasta verileri:', patientData);
}

// Hasta bilgilerini yazdır
function printPatientInfo() {
    // Yazdırma için CSS medya sorgusu kullanılabilir
    window.print();
}

// Rapor oluştur
function generateReport() {
    const patientName = document.getElementById('patientName').value;
    const totalBalance = document.getElementById('totalBalance').value;
    
    if (!patientName) {
        alert('Önce hasta adını giriniz!');
        return;
    }
    
    // Basit rapor oluştur
    const reportWindow = window.open('', '_blank');
    const reportContent = generateReportHTML(patientName, totalBalance);
    
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    reportWindow.print();
}

// Rapor HTML'i oluştur
function generateReportHTML(patientName, totalBalance) {
    const records = getBalanceRecords();
    const currentDate = new Date().toLocaleDateString('tr-TR');
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Hasta Raporu - ${patientName}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #ff0000; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { color: #ff0000; font-size: 24px; font-weight: bold; }
                .patient-info { margin: 20px 0; }
                .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
                .records-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .records-table th, .records-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                .records-table th { background-color: #f8f9fa; font-weight: bold; }
                .total-row { background-color: #ff0000; color: white; font-weight: bold; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">LARGEN DIAGNOSTIC</div>
                <h2>Hasta Bakiye Raporu</h2>
                <p>Rapor Tarihi: ${currentDate}</p>
            </div>
            
            <div class="patient-info">
                <h3>Hasta Bilgileri</h3>
                <div class="info-row">
                    <span><strong>Hasta Adı:</strong> ${patientName}</span>
                    <span><strong>TC No:</strong> ${document.getElementById('tcNo').value}</span>
                </div>
                <div class="info-row">
                    <span><strong>Kan Grubu:</strong> ${document.getElementById('bloodType').value}</span>
                    <span><strong>Telefon:</strong> ${document.getElementById('phone').value}</span>
                </div>
            </div>
            
            <h3>Bakiye Detayları</h3>
            <table class="records-table">
                <thead>
                    <tr>
                        <th>Tarih</th>
                        <th>Açıklama</th>
                        <th>Tutar (TL)</th>
                    </tr>
                </thead>
                <tbody>
                    ${records.map(record => `
                        <tr>
                            <td>${record.date}</td>
                            <td>${record.desc}</td>
                            <td>${record.amount} TL</td>
                        </tr>
                    `).join('')}
                    <tr class="total-row">
                        <td colspan="2"><strong>TOPLAM BAKİYE</strong></td>
                        <td><strong>${totalBalance} TL</strong></td>
                    </tr>
                </tbody>
            </table>
            
            <div class="footer">
                <p>Bu rapor Largen Diagnostic tarafından oluşturulmuştur.</p>
                <p>© 2025 Largen Diagnostic - Tüm hakları saklıdır.</p>
            </div>
        </body>
        </html>
    `;
}

// Bakiye kayıtlarını al
function getBalanceRecords() {
    const records = [];
    const recordElements = document.querySelectorAll('.record-item');
    
    recordElements.forEach(element => {
        const date = element.querySelector('.record-date').textContent;
        const desc = element.querySelector('.record-desc').textContent;
        const amount = element.querySelector('.record-amount').textContent.replace(' TL', '');
        
        records.push({ date, desc, amount });
    });
    
    return records;
}

// Geri dön
function goBack() {
    if (confirm('Kaydedilmemiş değişiklikler kaybolabilir. Geri dönmek istediğinizden emin misiniz?')) {
        // Ana sayfaya veya bir önceki sayfaya yönlendir
        window.history.back();
        // veya belirli bir sayfaya yönlendir:
        // window.location.href = 'index.html';
    }
}

// Başarı mesajı göster
function showSuccessMessage(message) {
    // Mevcut mesaj varsa kaldır
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Yeni mesaj oluştur
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(145deg, #28a745, #218838);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
        z-index: 1000;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `;
    successDiv.textContent = message;
    
    // CSS animasyonu ekle
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Sayfaya ekle
    document.body.appendChild(successDiv);
    
    // 3 saniye sonra kaldır
    setTimeout(() => {
        successDiv.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            successDiv.remove();
            style.remove();
        }, 300);
    }, 3000);
}

// Bakiye detaylarını göster/gizle
function toggleBalanceDetails() {
    const balanceRecords = document.querySelector('.balance-records');
    const isVisible = balanceRecords.style.display !== 'none';
    
    if (isVisible) {
        balanceRecords.style.display = 'none';
    } else {
        balanceRecords.style.display = 'block';
    }
}

// Toplam bakiye kartına tıklama event'i ekle
document.addEventListener('DOMContentLoaded', function() {
    const totalBalanceCard = document.querySelector('.summary-item.total');
    if (totalBalanceCard) {
        totalBalanceCard.addEventListener('click', function() {
            // Bakiye detaylarını toggle et
            const balanceRecords = document.querySelector('.balance-records');
            const isHidden = balanceRecords.style.maxHeight === '0px' || balanceRecords.style.display === 'none';
            
            if (isHidden) {
                balanceRecords.style.display = 'block';
                balanceRecords.style.maxHeight = '500px';
                balanceRecords.style.transition = 'max-height 0.3s ease';
                showSuccessMessage('Bakiye detayları gösteriliyor');
            } else {
                balanceRecords.style.maxHeight = '0px';
                setTimeout(() => {
                    balanceRecords.style.display = 'none';
                }, 300);
                showSuccessMessage('Bakiye detayları gizlendi');
            }
        });
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl+S ile kaydet
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        savePatientInfo();
    }
    
    // Escape ile modal kapat
    if (event.key === 'Escape') {
        closeModal();
    }
    
    // Ctrl+P ile yazdır
    if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        printPatientInfo();
    }
    
    // Ctrl+N ile yeni kayıt
    if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        addNewRecord();
    }
});

// Form validation
function validateForm() {
    const requiredFields = ['tcNo', 'patientName'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const value = field.value.trim();
        
        if (!value) {
            field.style.borderColor = '#dc3545';
            field.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
            isValid = false;
        } else {
            field.style.borderColor = '#28a745';
            field.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
        }
    });
    
    return isValid;
}

// TC Kimlik No formatı kontrol
document.getElementById('tcNo').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, ''); // Sadece rakamlar
    if (value.length > 11) {
        value = value.slice(0, 11);
    }
    e.target.value = value;
    
    // TC kimlik doğrulama
    if (value.length === 11) {
        if (validateTCNumber(value)) {
            e.target.style.borderColor = '#28a745';
        } else {
            e.target.style.borderColor = '#dc3545';
        }
    }
});

// TC Kimlik No doğrulama algoritması
function validateTCNumber(tc) {
    if (tc.length !== 11) return false;
    if (tc[0] === '0') return false;
    
    let odd = 0, even = 0;
    
    for (let i = 0; i < 9; i++) {
        if (i % 2 === 0) {
            odd += parseInt(tc[i]);
        } else {
            even += parseInt(tc[i]);
        }
    }
    
    let checksum1 = (odd * 7 - even) % 10;
    let checksum2 = (odd + even + parseInt(tc[9])) % 10;
    
    return checksum1 === parseInt(tc[9]) && checksum2 === parseInt(tc[10]);
}

// Telefon numarası formatla
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0 && value[0] !== '0') {
        value = '0' + value;
    }
    
    if (value.length > 11) {
        value = value.slice(0, 11);
    }
    
    // Format: 0XXX XXX XX XX
    if (value.length > 4) {
        value = value.slice(0, 4) + ' ' + value.slice(4);
    }
    if (value.length > 8) {
        value = value.slice(0, 8) + ' ' + value.slice(8);
    }
    if (value.length > 11) {
        value = value.slice(0, 11) + ' ' + value.slice(11);
    }
    
    e.target.value = value;
});

// Auto-save functionality
let autoSaveTimer;
function enableAutoSave() {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                // Auto-save to localStorage
                const formData = {};
                inputs.forEach(inp => {
                    if (inp.id) {
                        formData[inp.id] = inp.value;
                    }
                });
                localStorage.setItem('autoSavedPatientData', JSON.stringify(formData));
                console.log('Otomatik kayıt yapıldı');
            }, 2000); // 2 saniye sonra kaydet
        });
    });
}

// Sayfa yüklendiğinde otomatik kaydedilen verileri yükle
function loadAutoSavedData() {
    const saved = localStorage.getItem('autoSavedPatientData');
    if (saved) {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(key => {
            const element = document.getElementById(key);
            if (element && data[key]) {
                element.value = data[key];
            }
        });
    }
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', function() {
    enableAutoSave();
    loadAutoSavedData();
});