// Global değişkenler
let selectedItems = [];
let currentPatient = null;
let samplePatients = [];

// Örnek hastalar verisi
const initializeSampleData = () => {
    samplePatients = [
        {
            id: 1,
            tc: '12345678901',
            name: 'Mustafa GÜL',
            phone: '05353636363',
            birthDate: '1990-01-01',
            bloodType: 'A RH+',
            balance: 2100
        },
        {
            id: 2,
            tc: '98765432109',
            name: 'Ayşe KAYA',
            phone: '05321234567',
            birthDate: '1985-05-15',
            bloodType: 'B RH-',
            balance: 0
        },
        {
            id: 3,
            tc: '11223344556',
            name: 'Mehmet DEMİR',
            phone: '05449876543',
            birthDate: '1978-12-22',
            bloodType: '0 RH+',
            balance: 450
        }
    ];
};

// Sayfa yüklendiğinde çalışacak
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
    setupEventListeners();
    updateTotal();
});

// Event listener'ları kurma
function setupEventListeners() {
    // TC input formatla
    document.getElementById('patientTC').addEventListener('input', formatTCInput);
    
    // Ödenen miktar değiştiğinde kalan bakiyeyi güncelle
    document.getElementById('paidAmount').addEventListener('input', calculateRemainingBalance);
    
    // Enter tuşu ile hasta ara
    document.getElementById('patientTC').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            searchPatient();
        }
    });
    
    // Modal dışına tıklandığında kapat
    window.addEventListener('click', function(event) {
        const patientModal = document.getElementById('patientModal');
        const confirmModal = document.getElementById('confirmModal');
        
        if (event.target === patientModal) {
            closePatientModal();
        }
        if (event.target === confirmModal) {
            closeConfirmModal();
        }
    });
    
    // Dropdown dışına tıklandığında kapat
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown-wrapper')) {
            closeAllDropdowns();
        }
    });
}

// TC input formatla
function formatTCInput(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) {
        value = value.slice(0, 11);
    }
    event.target.value = value;
}

// Dropdown toggle
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const header = dropdown.previousElementSibling;
    
    // Diğer dropdownları kapat
    closeAllDropdowns(dropdownId);
    
    // Bu dropdown'ı toggle et
    const isActive = dropdown.classList.contains('active');
    
    if (isActive) {
        dropdown.classList.remove('active');
        header.classList.remove('active');
    } else {
        dropdown.classList.add('active');
        header.classList.add('active');
    }
}

// Tüm dropdownları kapat
function closeAllDropdowns(except = null) {
    const dropdowns = document.querySelectorAll('.dropdown-content');
    const headers = document.querySelectorAll('.dropdown-header');
    
    dropdowns.forEach((dropdown, index) => {
        if (except && dropdown.id === except) return;
        dropdown.classList.remove('active');
        headers[index].classList.remove('active');
    });
}

// Tarife seç
function selectTarife(tarife) {
    document.getElementById('tarifeSelected').textContent = tarife;
    closeAllDropdowns();
    
    // Seçilen tarifenin stilini güncelle
    highlightSelection('tarifeSelected');
}

// Tetkik seç
function selectTetkik(tetkik, price) {
    addItem(tetkik, price, 'Tetkik');
    document.getElementById('tetkikSelected').textContent = 'Seçildi: ' + tetkik;
    closeAllDropdowns();
    
    highlightSelection('tetkikSelected');
}

// Ekstra seç
function selectEkstra(item, price) {
    addItem(item, price, 'Ekstra');
    document.getElementById('ekstraSelected').textContent = 'Seçildi: ' + item;
    closeAllDropdowns();
    
    highlightSelection('ekstraSelected');
}

// Özel kalem ekle
function addCustomItem() {
    const itemName = document.getElementById('customItemName').value.trim();
    const itemPrice = parseFloat(document.getElementById('customItemPrice').value);
    
    if (!itemName || !itemPrice || itemPrice <= 0) {
        showToast('Lütfen geçerli bir kalem adı ve fiyat girin!', 'error');
        return;
    }
    
    addItem(itemName, itemPrice, 'Özel');
    
    // Input'ları temizle
    document.getElementById('customItemName').value = '';
    document.getElementById('customItemPrice').value = '';
    
    closeAllDropdowns();
    showToast('Özel kalem başarıyla eklendi!', 'success');
}

// Kalem ekle
function addItem(name, price, category) {
    const item = {
        id: Date.now(),
        name: name,
        price: parseFloat(price),
        category: category
    };
    
    selectedItems.push(item);
    updateSelectedItemsList();
    updateTotal();
    calculateRemainingBalance();
}

// Seçili kalemleri güncelle
function updateSelectedItemsList() {
    const listElement = document.getElementById('selectedItemsList');
    
    if (selectedItems.length === 0) {
        listElement.innerHTML = '<div class="no-items">Henüz kalem seçilmedi</div>';
        return;
    }
    
    listElement.innerHTML = selectedItems.map(item => 
        createSelectedItemHTML(item)
    ).join('');
}

// Seçili kalem HTML'i oluştur
function createSelectedItemHTML(item) {
    return `
        <div class="selected-item" data-id="${item.id}">
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-category">${item.category}</div>
            </div>
            <div class="item-price">${item.price.toFixed(2)} TL</div>
            <button class="remove-item" onclick="removeItem(${item.id})" title="Kaldır">×</button>
        </div>
    `;
}

// Kalem kaldır
function removeItem(itemId) {
    selectedItems = selectedItems.filter(item => item.id !== itemId);
    updateSelectedItemsList();
    updateTotal();
    calculateRemainingBalance();
    
    showToast('Kalem kaldırıldı', 'warning');
}

// Toplam güncelle
function updateTotal() {
    const total = selectedItems.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('totalAmount').textContent = total.toFixed(2) + ' TL';
    calculateRemainingBalance();
}

// Kalan bakiye hesapla
function calculateRemainingBalance() {
    const total = selectedItems.reduce((sum, item) => sum + item.price, 0);
    const paid = parseFloat(document.getElementById('paidAmount').value) || 0;
    const remaining = total - paid;
    
    const remainingElement = document.getElementById('remainingBalance');
    remainingElement.textContent = remaining.toFixed(2) + ' TL';
    
    // Renk kodlama
    if (remaining > 0) {
        remainingElement.style.color = '#ff0000';
    } else if (remaining < 0) {
        remainingElement.style.color = '#28a745';
    } else {
        remainingElement.style.color = '#333';
    }
}

// Hasta ara
function searchPatient() {
    const tc = document.getElementById('patientTC').value.trim();
    
    if (tc.length < 11) {
        showToast('Lütfen 11 haneli TC kimlik numarası girin!', 'error');
        return;
    }
    
    // TC formatı kontrolü
    if (!/^\d{11}$/.test(tc)) {
        showToast('TC kimlik numarası sadece rakamlardan oluşmalıdır!', 'error');
        return;
    }
    
    // Hastayı bul
    const patient = samplePatients.find(p => p.tc === tc);
    
    if (patient) {
        selectPatient(patient);
        showToast('Hasta bulundu!', 'success');
    } else {
        // Hasta bulunamadı, yeni hasta ekleme seçeneği
        if (confirm('Bu TC numarasına ait hasta bulunamadı. Yeni hasta eklemek istiyor musunuz?')) {
            addNewPatient(tc);
        }
    }
}

// Hasta seç
function selectPatient(patient) {
    currentPatient = patient;
    updatePatientInfo();
    highlightSelection('patientTC');
}

// Hasta bilgilerini güncelle
function updatePatientInfo() {
    const patientInfoElement = document.getElementById('patientInfo');
    
    if (!currentPatient) {
        patientInfoElement.innerHTML = `
            <p>Bu ekranda girilen Ücretler toplamı Hasta bilgilerinde<br>
            Bakiye kısmında gözükecek<br>
            hasta tcsi girdiğimiz için oradan alabilir bilgiyi</p>
        `;
        return;
    }
    
    patientInfoElement.innerHTML = `
        <div class="patient-details active">
            <div class="patient-detail-item">
                <span class="detail-label">Hasta Adı:</span>
                <span class="detail-value">${currentPatient.name}</span>
            </div>
            <div class="patient-detail-item">
                <span class="detail-label">TC Kimlik:</span>
                <span class="detail-value">${currentPatient.tc}</span>
            </div>
            <div class="patient-detail-item">
                <span class="detail-label">Telefon:</span>
                <span class="detail-value">${currentPatient.phone}</span>
            </div>
            <div class="patient-detail-item">
                <span class="detail-label">Kan Grubu:</span>
                <span class="detail-value">${currentPatient.bloodType}</span>
            </div>
            <div class="patient-detail-item">
                <span class="detail-label">Mevcut Bakiye:</span>
                <span class="detail-value" style="color: #ff0000; font-weight: bold;">${currentPatient.balance} TL</span>
            </div>
        </div>
    `;
}

// Yeni hasta ekle
function addNewPatient(tc) {
    const name = prompt('Hasta adını girin:');
    if (!name) return;
    
    const phone = prompt('Telefon numarasını girin:');
    if (!phone) return;
    
    const newPatient = {
        id: samplePatients.length + 1,
        tc: tc,
        name: name.toUpperCase(),
        phone: phone,
        birthDate: '1990-01-01',
        bloodType: 'Bilinmiyor',
        balance: 0
    };
    
    samplePatients.push(newPatient);
    selectPatient(newPatient);
    
    showToast('Yeni hasta başarıyla eklendi!', 'success');
    
    // MySQL için veri logla
    console.log('MySQL INSERT Query for new patient:', {
        tc_kimlik: newPatient.tc,
        hasta_adi: newPatient.name,
        telefon: newPatient.phone,
        dogum_tarihi: newPatient.birthDate,
        kan_grubu: newPatient.bloodType,
        olusturma_tarihi: new Date().toISOString()
    });
}

// Hasta modal aç
function openPatientModal() {
    document.getElementById('patientModal').style.display = 'block';
    loadPatientsList();
    document.getElementById('patientSearch').focus();
}

// Hasta modal kapat
function closePatientModal() {
    document.getElementById('patientModal').style.display = 'none';
}

// Hastaları listele
function loadPatientsList() {
    const patientsList = document.getElementById('patientsList');
    
    if (samplePatients.length === 0) {
        patientsList.innerHTML = '<p style="text-align: center; color: #666;">Henüz hasta kaydı bulunmuyor</p>';
        return;
    }
    
    patientsList.innerHTML = samplePatients.map(patient => 
        createPatientItemHTML(patient)
    ).join('');
}

// Hasta item HTML'i oluştur
function createPatientItemHTML(patient) {
    return `
        <div class="patient-item" onclick="selectPatientFromModal(${patient.id})">
            <div class="patient-name">${patient.name}</div>
            <div class="patient-tc">TC: ${patient.tc}</div>
            <div class="patient-balance">Bakiye: ${patient.balance} TL</div>
        </div>
    `;
}

// Modal'dan hasta seç
function selectPatientFromModal(patientId) {
    const patient = samplePatients.find(p => p.id === patientId);
    if (patient) {
        document.getElementById('patientTC').value = patient.tc;
        selectPatient(patient);
        closePatientModal();
        showToast('Hasta seçildi!', 'success');
    }
}

// Hasta ara (modal içinde)
function searchPatients() {
    const searchTerm = document.getElementById('patientSearch').value.toLowerCase().trim();
    
    if (searchTerm.length < 2) {
        loadPatientsList();
        return;
    }
    
    const filteredPatients = samplePatients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.tc.includes(searchTerm) ||
        patient.phone.includes(searchTerm)
    );
    
    const patientsList = document.getElementById('patientsList');
    
    if (filteredPatients.length === 0) {
        patientsList.innerHTML = '<p style="text-align: center; color: #666;">Eşleşen hasta bulunamadı</p>';
        return;
    }
    
    patientsList.innerHTML = filteredPatients.map(patient => 
        createPatientItemHTML(patient)
    ).join('');
}

// İşlemi kaydet
function saveTransaction() {
    // Validation
    if (!currentPatient) {
        showToast('Lütfen önce bir hasta seçin!', 'error');
        return;
    }
    
    if (selectedItems.length === 0) {
        showToast('Lütfen en az bir kalem seçin!', 'error');
        return;
    }
    
    const total = selectedItems.reduce((sum, item) => sum + item.price, 0);
    const paidAmount = parseFloat(document.getElementById('paidAmount').value) || 0;
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    if (paidAmount > 0 && !paymentMethod) {
        showToast('Ödeme yöntemi seçin!', 'error');
        return;
    }
    
    // Onay modalını göster
    showConfirmationModal(total, paidAmount, paymentMethod);
}

// Onay modalını göster
function showConfirmationModal(total, paidAmount, paymentMethod) {
    const modal = document.getElementById('confirmModal');
    const detailsElement = document.getElementById('confirmationDetails');
    
    const remaining = total - paidAmount;
    
    detailsElement.innerHTML = `
        <div class="confirmation-item">
            <span class="confirmation-label">Hasta:</span>
            <span class="confirmation-value">${currentPatient.name}</span>
        </div>
        <div class="confirmation-item">
            <span class="confirmation-label">TC:</span>
            <span class="confirmation-value">${currentPatient.tc}</span>
        </div>
        <div class="confirmation-item">
            <span class="confirmation-label">Toplam Tutar:</span>
            <span class="confirmation-value">${total.toFixed(2)} TL</span>
        </div>
        <div class="confirmation-item">
            <span class="confirmation-label">Ödenen:</span>
            <span class="confirmation-value">${paidAmount.toFixed(2)} TL</span>
        </div>
        ${paymentMethod ? `
            <div class="confirmation-item">
                <span class="confirmation-label">Ödeme Yöntemi:</span>
                <span class="confirmation-value">${paymentMethod}</span>
            </div>
        ` : ''}
        <div class="confirmation-item">
            <span class="confirmation-label">Kalan Bakiye:</span>
            <span class="confirmation-value" style="color: ${remaining > 0 ? '#ff0000' : '#28a745'};">
                ${remaining.toFixed(2)} TL
            </span>
        </div>
        <hr style="margin: 15px 0;">
        <h4>Seçilen Kalemler:</h4>
        ${selectedItems.map(item => `
            <div class="confirmation-item">
                <span class="confirmation-label">${item.name}:</span>
                <span class="confirmation-value">${item.price.toFixed(2)} TL</span>
            </div>
        `).join('')}
    `;
    
    modal.style.display = 'block';
}

// Onay modalını kapat
function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

// İşlemi onayla
function confirmTransaction() {
    const total = selectedItems.reduce((sum, item) => sum + item.price, 0);
    const paidAmount = parseFloat(document.getElementById('paidAmount').value) || 0;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const remaining = total - paidAmount;
    
    // Hasta bakiyesini güncelle
    currentPatient.balance += remaining;
    
    // İşlem kaydı oluştur
    const transaction = {
        id: Date.now(),
        patientId: currentPatient.id,
        patientName: currentPatient.name,
        patientTC: currentPatient.tc,
        items: [...selectedItems],
        totalAmount: total,
        paidAmount: paidAmount,
        paymentMethod: paymentMethod,
        remainingBalance: remaining,
        date: new Date().toISOString(),
        status: 'completed'
    };
    
    // MySQL için veri logla
    console.log('MySQL Transaction Data:', transaction);
    
    // Bakiye kayıtları için MySQL
    selectedItems.forEach(item => {
        console.log('MySQL Bakiye Kaydı:', {
            hasta_id: currentPatient.id,
            hasta_adi: currentPatient.name,
            islem_tarihi: new Date().toISOString().split('T')[0],
            islem_aciklamasi: item.name,
            tutar: item.price,
            islem_turu: 'Borç',
            odeme_yontemi: paymentMethod || null,
            olusturma_tarihi: new Date().toISOString()
        });
    });
    
    // Ödeme kaydı
    if (paidAmount > 0) {
        console.log('MySQL Ödeme Kaydı:', {
            hasta_id: currentPatient.id,
            hasta_adi: currentPatient.name,
            islem_tarihi: new Date().toISOString().split('T')[0],
            islem_aciklamasi: 'Ödeme',
            tutar: -paidAmount,
            islem_turu: 'Ödeme',
            odeme_yontemi: paymentMethod,
            olusturma_tarihi: new Date().toISOString()
        });
    }
    
    // Modalı kapat
    closeConfirmModal();
    
    // Başarı mesajı
    showToast('İşlem başarıyla kaydedildi!', 'success');
    
    // Forma yeni bakiyeyi yansıt
    updatePatientInfo();
    
    // Form'u temizle
    setTimeout(() => {
        clearAll();
    }, 2000);
}

// Formu temizle
function clearAll() {
    selectedItems = [];
    currentPatient = null;
    
    document.getElementById('patientTC').value = '';
    document.getElementById('tarifeSelected').textContent = 'çoktan seçmeli olacak';
    document.getElementById('tetkikSelected').textContent = 'çoktan seçmeli olacak';
    document.getElementById('ekstraSelected').textContent = 'ÜCRET GİRİLEBİLECEK';
    document.getElementById('paidAmount').value = '';
    document.getElementById('paymentMethod').value = '';
    
    updateSelectedItemsList();
    updateTotal();
    updatePatientInfo();
    
    showToast('Form temizlendi', 'warning');
}

// Seçim vurgusu
function highlightSelection(elementId) {
    const element = document.getElementById(elementId);
    element.classList.add('highlight');
    setTimeout(() => {
        element.classList.remove('highlight');
    }, 600);
}

// Toast göster
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const messageElement = toast.querySelector('.toast-message');
    
    messageElement.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Klavye kısayolları
document.addEventListener('keydown', function(event) {
    // Ctrl+S ile kaydet
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        saveTransaction();
    }
    
    // Escape ile modal'ları kapat
    if (event.key === 'Escape') {
        closePatientModal();
        closeConfirmModal();
        closeAllDropdowns();
    }
    
    // F2 ile hasta ara
    if (event.key === 'F2') {
        event.preventDefault();
        document.getElementById('patientTC').focus();
    }
    
    // F3 ile hasta modal aç
    if (event.key === 'F3') {
        event.preventDefault();
        openPatientModal();
    }
});

// LocalStorage işlemleri
function saveToLocalStorage() {
    const data = {
        patients: samplePatients,
        transactions: [] // İşlemler için ayrı array
    };
    localStorage.setItem('largen_billing_data', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('largen_billing_data');
    if (saved) {
        const data = JSON.parse(saved);
        samplePatients = data.patients || [];
    }
}

// Export/Import işlemleri
function exportData() {
    const data = {
        patients: samplePatients,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `largen_hastalar_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Auto-save işlevi
let autoSaveTimer;
function enableAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        saveToLocalStorage();
        console.log('Otomatik kayıt yapıldı');
    }, 5000); // 5 saniye sonra kaydet
}

// Sayfa yüklendiğinde localStorage'dan yükle
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    
    // Form değişikliklerinde otomatik kayıt
    document.addEventListener('input', enableAutoSave);
    document.addEventListener('change', enableAutoSave);
});

// Sayfa kapatılırken kaydet
window.addEventListener('beforeunload', function() {
    saveToLocalStorage();
});

// Debugging ve MySQL query helper fonksiyonları
const MySQLHelpers = {
    // Hasta ekleme sorgusu
    insertPatient: (patient) => {
        return `
            INSERT INTO hastalar (tc_kimlik, hasta_adi, telefon, dogum_tarihi, kan_grubu, olusturma_tarihi)
            VALUES ('${patient.tc}', '${patient.name}', '${patient.phone}', '${patient.birthDate}', '${patient.bloodType}', NOW())
        `;
    },
    
    // Bakiye kaydı ekleme
    insertBillingRecord: (record) => {
        return `
            INSERT INTO bakiye_kayitlari (hasta_id, hasta_adi, islem_tarihi, islem_aciklamasi, tutar, islem_turu, odeme_yontemi, olusturma_tarihi)
            VALUES (${record.hasta_id}, '${record.hasta_adi}', '${record.islem_tarihi}', '${record.islem_aciklamasi}', ${record.tutar}, '${record.islem_turu}', '${record.odeme_yontemi}', NOW())
        `;
    },
    
    // Hasta bakiye sorgusu
    getPatientBalance: (patientId) => {
        return `
            SELECT 
                SUM(CASE WHEN islem_turu = 'Borç' THEN tutar ELSE -tutar END) as toplam_bakiye
            FROM bakiye_kayitlari 
            WHERE hasta_id = ${patientId}
        `;
    },
    
    // Hasta arama sorgusu
    searchPatients: (searchTerm) => {
        return `
            SELECT * FROM hastalar 
            WHERE hasta_adi LIKE '%${searchTerm}%' 
               OR tc_kimlik LIKE '%${searchTerm}%' 
               OR telefon LIKE '%${searchTerm}%'
            ORDER BY hasta_adi
        `;
    }
};

// Debug modunu aktif etmek için
function enableDebugMode() {
    console.log('Debug modu aktif edildi');
    window.samplePatients = samplePatients;
    window.selectedItems = selectedItems;
    window.currentPatient = currentPatient;
    window.MySQLHelpers = MySQLHelpers;
    
    // Debug panel oluştur
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debugPanel';
    debugPanel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #333;
        color: white;
        padding: 15px;
        border-radius: 10px;
        z-index: 9999;
        font-size: 12px;
        max-width: 300px;
        font-family: monospace;
    `;
    
    debugPanel.innerHTML = `
        <h4>Debug Panel</h4>
        <p>Hasta Sayısı: ${samplePatients.length}</p>
        <p>Seçili Kalem: ${selectedItems.length}</p>
        <p>Aktif Hasta: ${currentPatient ? currentPatient.name : 'Yok'}</p>
        <button onclick="exportData()" style="margin: 5px; padding: 5px;">Export Data</button>
        <button onclick="console.log(samplePatients)" style="margin: 5px; padding: 5px;">Log Patients</button>
        <button onclick="this.parentElement.remove()" style="margin: 5px; padding: 5px;">Kapat</button>
    `;
    
    document.body.appendChild(debugPanel);
}

// Gelişmiş hasta arama fonksiyonu
function advancedPatientSearch(criteria) {
    return samplePatients.filter(patient => {
        if (criteria.tc && !patient.tc.includes(criteria.tc)) return false;
        if (criteria.name && !patient.name.toLowerCase().includes(criteria.name.toLowerCase())) return false;
        if (criteria.phone && !patient.phone.includes(criteria.phone)) return false;
        if (criteria.minBalance && patient.balance < criteria.minBalance) return false;
        if (criteria.maxBalance && patient.balance > criteria.maxBalance) return false;
        return true;
    });
}

// Raporlama fonksiyonları
const ReportingFunctions = {
    // Günlük gelir raporu
    getDailyIncome: (date) => {
        // Bu fonksiyon gerçek projede backend'den veri çekecek
        console.log(`Günlük gelir raporu: ${date}`);
        return {
            totalIncome: 0,
            totalPayments: 0,
            netIncome: 0,
            patientCount: 0
        };
    },
    
    // Hasta bakiye raporu
    getPatientBalanceReport: () => {
        const report = samplePatients.map(patient => ({
            name: patient.name,
            tc: patient.tc,
            balance: patient.balance,
            status: patient.balance > 0 ? 'Borçlu' : patient.balance < 0 ? 'Alacaklı' : 'Sıfır'
        }));
        
        console.table(report);
        return report;
    },
    
    // En çok kullanılan hizmetler
    getMostUsedServices: () => {
        // Bu fonksiyon gerçek projede veritabanından istatistik çekecek
        return [
            { service: 'Muayene', count: 45, total: 5400 },
            { service: 'Hemogram', count: 32, total: 4800 },
            { service: 'Ultrason', count: 28, total: 8400 }
        ];
    }
};

// Hızlı işlemler menüsü
function createQuickActionsMenu() {
    const quickMenu = document.createElement('div');
    quickMenu.id = 'quickActionsMenu';
    quickMenu.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        padding: 15px;
        z-index: 1000;
        display: none;
    `;
    
    quickMenu.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold;">Hızlı İşlemler</div>
        <button onclick="quickAddMuayene()" class="btn btn-primary" style="margin: 5px; padding: 8px 12px; font-size: 12px;">Hızlı Muayene</button>
        <button onclick="quickAddHemogram()" class="btn btn-primary" style="margin: 5px; padding: 8px 12px; font-size: 12px;">Hızlı Hemogram</button>
        <button onclick="ReportingFunctions.getPatientBalanceReport()" class="btn btn-secondary" style="margin: 5px; padding: 8px 12px; font-size: 12px;">Bakiye Raporu</button>
        <button onclick="this.parentElement.style.display='none'" style="margin: 5px; padding: 8px 12px; font-size: 12px;">Kapat</button>
    `;
    
    document.body.appendChild(quickMenu);
    
    // F4 tuşu ile aç/kapat
    document.addEventListener('keydown', function(event) {
        if (event.key === 'F4') {
            event.preventDefault();
            const menu = document.getElementById('quickActionsMenu');
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }
    });
}

// Hızlı muayene ekleme
function quickAddMuayene() {
    if (!currentPatient) {
        showToast('Önce bir hasta seçin!', 'error');
        return;
    }
    
    addItem('Muayene', 120, 'Hızlı');
    showToast('Muayene eklendi!', 'success');
}

// Hızlı hemogram ekleme
function quickAddHemogram() {
    if (!currentPatient) {
        showToast('Önce bir hasta seçin!', 'error');
        return;
    }
    
    addItem('Hemogram', 150, 'Hızlı');
    showToast('Hemogram eklendi!', 'success');
}

// Fatura yazdırma fonksiyonu
function printInvoice() {
    if (!currentPatient || selectedItems.length === 0) {
        showToast('Önce hasta seçin ve kalem ekleyin!', 'error');
        return;
    }
    
    const total = selectedItems.reduce((sum, item) => sum + item.price, 0);
    const paidAmount = parseFloat(document.getElementById('paidAmount').value) || 0;
    const remaining = total - paidAmount;
    
    const invoiceWindow = window.open('', '_blank');
    const invoiceHTML = generateInvoiceHTML(total, paidAmount, remaining);
    
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    invoiceWindow.print();
}

// Fatura HTML oluştur
function generateInvoiceHTML(total, paidAmount, remaining) {
    const currentDate = new Date().toLocaleDateString('tr-TR');
    const currentTime = new Date().toLocaleTimeString('tr-TR');
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Fatura - ${currentPatient.name}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #ff0000; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { color: #ff0000; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .patient-info, .invoice-details { width: 48%; }
                .info-title { font-weight: bold; color: #333; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                .info-row { margin: 5px 0; }
                .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                .items-table th { background-color: #f8f9fa; font-weight: bold; }
                .total-section { margin-top: 30px; border-top: 2px solid #ddd; padding-top: 20px; }
                .total-row { display: flex; justify-content: space-between; margin: 10px 0; }
                .total-row.main { font-size: 18px; font-weight: bold; color: #ff0000; }
                .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">LARGEN DIAGNOSTIC</div>
                <h2>HASTA FATURASI</h2>
                <p>Tarih: ${currentDate} - Saat: ${currentTime}</p>
            </div>
            
            <div class="invoice-info">
                <div class="patient-info">
                    <div class="info-title">HASTA BİLGİLERİ</div>
                    <div class="info-row"><strong>Adı Soyadı:</strong> ${currentPatient.name}</div>
                    <div class="info-row"><strong>TC Kimlik:</strong> ${currentPatient.tc}</div>
                    <div class="info-row"><strong>Telefon:</strong> ${currentPatient.phone}</div>
                    <div class="info-row"><strong>Kan Grubu:</strong> ${currentPatient.bloodType}</div>
                </div>
                <div class="invoice-details">
                    <div class="info-title">FATURA BİLGİLERİ</div>
                    <div class="info-row"><strong>Fatura No:</strong> ${Date.now()}</div>
                    <div class="info-row"><strong>Tarih:</strong> ${currentDate}</div>
                    <div class="info-row"><strong>Saat:</strong> ${currentTime}</div>
                    <div class="info-row"><strong>Kalem Sayısı:</strong> ${selectedItems.length}</div>
                </div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Sıra</th>
                        <th>Hizmet/Ürün</th>
                        <th>Kategori</th>
                        <th>Birim Fiyat</th>
                    </tr>
                </thead>
                <tbody>
                    ${selectedItems.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.name}</td>
                            <td>${item.category}</td>
                            <td>${item.price.toFixed(2)} TL</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total-section">
                <div class="total-row">
                    <span>Ara Toplam:</span>
                    <span>${total.toFixed(2)} TL</span>
                </div>
                <div class="total-row main">
                    <span>GENEL TOPLAM:</span>
                    <span>${total.toFixed(2)} TL</span>
                </div>
                <div class="total-row">
                    <span>Ödenen Tutar:</span>
                    <span>${paidAmount.toFixed(2)} TL</span>
                </div>
                <div class="total-row" style="color: ${remaining > 0 ? '#ff0000' : '#28a745'};">
                    <span>Kalan Bakiye:</span>
                    <span>${remaining.toFixed(2)} TL</span>
                </div>
            </div>
            
            <div class="footer">
                <p>Bu fatura Largen Diagnostic tarafından düzenlenmiştir.</p>
                <p>© 2025 Largen Diagnostic - Tüm hakları saklıdır.</p>
                <p>Yazdırma Tarihi: ${new Date().toLocaleString('tr-TR')}</p>
            </div>
        </body>
        </html>
    `;
}

// Gelişmiş validasyon fonksiyonları
const ValidationHelpers = {
    // TC kimlik doğrulama
    validateTC: (tc) => {
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
    },
    
    // Telefon doğrulama
    validatePhone: (phone) => {
        const cleanPhone = phone.replace(/\s/g, '');
        return /^0[0-9]{10}$/.test(cleanPhone);
    },
    
    // Fiyat doğrulama
    validatePrice: (price) => {
        const numPrice = parseFloat(price);
        return !isNaN(numPrice) && numPrice > 0 && numPrice <= 99999;
    }
};

// Backup ve restore fonksiyonları
function createBackup() {
    const backupData = {
        patients: samplePatients,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `largen_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showToast('Yedek dosyası oluşturuldu!', 'success');
}

function restoreBackup(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            if (confirm('Mevcut veriler silinecek ve yedek geri yüklenecek. Emin misiniz?')) {
                samplePatients = backupData.patients || [];
                saveToLocalStorage();
                
                // Formu temizle
                clearAll();
                
                showToast('Yedek başarıyla geri yüklendi!', 'success');
                console.log('Restore edildi:', backupData);
            }
        } catch (error) {
            showToast('Yedek dosyası geçersiz!', 'error');
            console.error('Restore hatası:', error);
        }
    };
    reader.readAsText(file);
}

// İstatistik fonksiyonları
const StatisticsHelper = {
    getTotalPatients: () => samplePatients.length,
    
    getTotalBalance: () => samplePatients.reduce((sum, patient) => sum + patient.balance, 0),
    
    getPatientsByBalanceStatus: () => {
        const stats = {
            positive: samplePatients.filter(p => p.balance > 0).length,
            zero: samplePatients.filter(p => p.balance === 0).length,
            negative: samplePatients.filter(p => p.balance < 0).length
        };
        return stats;
    },
    
    getAverageBalance: () => {
        const total = StatisticsHelper.getTotalBalance();
        const count = StatisticsHelper.getTotalPatients();
        return count > 0 ? (total / count).toFixed(2) : 0;
    }
};

// Sistem başlatma kontrolü
function systemStartupCheck() {
    console.log('🏥 Largen Diagnostic - Ücretlendirme Sistemi');
    console.log('📊 İstatistikler:', StatisticsHelper.getPatientsByBalanceStatus());
    console.log('💰 Toplam Bakiye:', StatisticsHelper.getTotalBalance(), 'TL');
    console.log('👥 Hasta Sayısı:', StatisticsHelper.getTotalPatients());
    
    // Sistem uyarıları
    if (samplePatients.length === 0) {
        console.warn('⚠️  Sistemde hasta kaydı bulunmuyor!');
    }
    
    // Hızlı menüyü oluştur
    setTimeout(createQuickActionsMenu, 1000);
}

// Sayfa tamamen yüklendiğinde sistem kontrolü yap
window.addEventListener('load', function() {
    setTimeout(systemStartupCheck, 500);
});

// Console komutları için yardım
function showConsoleHelp() {
    console.log(`
🔧 KONSOL KOMUTLARI:
• enableDebugMode() - Debug panelini aç
• exportData() - Veriyi dışa aktar  
• createBackup() - Yedek oluştur
• ReportingFunctions.getPatientBalanceReport() - Bakiye raporu
• StatisticsHelper.getTotalBalance() - Toplam bakiye
• showConsoleHelp() - Bu yardımı göster

⌨️  KLAVYE KISAYOLLARI:
• F2 - Hasta arama
• F3 - Hasta modal
• F4 - Hızlı işlemler menüsü
• Ctrl+S - Kaydet
• Escape - Modal'ları kapat
    `);
}

// İlk yükleme mesajı
console.log('💡 Yardım için showConsoleHelp() komutunu kullanın');