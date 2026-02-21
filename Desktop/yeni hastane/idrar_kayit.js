// Global değişkenler
let currentPatient = null;
let currentCategory = 'İdrar';
let samplePatients = [];
let testResults = {};

// İdrar test alanları
const urineFields = [
    'GLUKOZ', 'PROTEIN', 'PH', 'SPESIFIK', 'GRAVITASYON', 'KETONER',
    'BILIRUBIN', 'UROBILINOGEN', 'KAN', 'LOKOSIT', 'NITRIT', 'ASKORBIK_ASIT',
    'RENK', 'BERRAKLIK', 'MIKROSKOPIK', 'EPITEL', 'BAKTERI', 'CAST'
];

// Normal değer aralıkları
const normalRanges = {
    'GLUKOZ': 'Negatif',
    'PROTEIN': 'Negatif/Eser',
    'PH': '5.0-8.0',
    'SPESIFIK': '1.003-1.030',
    'GRAVITASYON': '1.003-1.030',
    'KETONER': 'Negatif',
    'BILIRUBIN': 'Negatif',
    'UROBILINOGEN': 'Normal',
    'KAN': 'Negatif',
    'LOKOSIT': 'Negatif',
    'NITRIT': 'Negatif',
    'ASKORBIK_ASIT': 'Normal',
    'RENK': 'Sarı',
    'BERRAKLIK': 'Berrak',
    'MIKROSKOPIK': 'Normal',
    'EPITEL': '0-5/HPF',
    'BAKTERI': 'Az/Yok',
    'CAST': 'Yok'
};

// Örnek hastalar verisi
const initializeSampleData = () => {
    samplePatients = [
        {
            id: 1,
            tc: '12345678901',
            name: 'Mustafa GÜL',
            gender: 'Erkek',
            birthDate: '1990-01-01',
            phone: '05353636363'
        },
        {
            id: 2,
            tc: '98765432109',
            name: 'Ayşe KAYA',
            gender: 'Kadın',
            birthDate: '1985-05-15',
            phone: '05321234567'
        },
        {
            id: 3,
            tc: '11223344556',
            name: 'Mehmet DEMİR',
            gender: 'Erkek',
            birthDate: '1978-12-22',
            phone: '05449876543'
        }
    ];
};

// Sayfa yüklendiğinde çalışacak
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
    setupEventListeners();
    
    // Varsayılan hasta seç
    selectPatient(samplePatients[0]);
    
    // LocalStorage'dan verileri yükle
    loadFromLocalStorage();
});

// Event listener'ları kurma
function setupEventListeners() {
    // TC input formatla
    document.getElementById('patientTC').addEventListener('input', formatTCInput);
    
    // Enter tuşu ile hasta ara
    document.getElementById('patientTC').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            searchPatient();
        }
    });
    
    // Sonuç input'larında değişiklik takibi
    document.addEventListener('input', function(event) {
        if (event.target.classList.contains('result-input')) {
            handleResultInput(event.target);
        }
    });
    
    // Modal dışına tıklandığında kapat
    window.addEventListener('click', function(event) {
        const patientModal = document.getElementById('patientModal');
        const previewModal = document.getElementById('previewModal');
        
        if (event.target === patientModal) {
            closePatientModal();
        }
        if (event.target === previewModal) {
            closePreviewModal();
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
    
    // 11 haneli TC girildiğinde otomatik arama
    if (value.length === 11) {
        searchPatient();
    }
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

// Kategori seç
function selectCategory(category) {
    currentCategory = category;
    document.getElementById('categorySelected').textContent = category;
    
    // Kategori açıklamasını güncelle
    updateCategoryDescription(category);
    
    closeAllDropdowns();
    showToast(`${category} kategorisi seçildi!`, 'success');
}

// Kategori açıklamasını güncelle
function updateCategoryDescription(category) {
    const descriptions = {
        'İdrar': 'İdrar kimyasal ve mikroskobik analizi',
        'Hematoloji': 'Kan sayımı ve kan hücreleri analizi',
        'Solunum Panel': 'Solunum yolu enfeksiyonları panel analizi',
        'Gaita': 'Dışkı mikroskobik ve kimyasal analizi'
    };
    
    const descElement = document.querySelector('.category-description p');
    if (descElement) {
        descElement.textContent = descriptions[category] || 'Test analizi';
    }
    
    // Başlığı güncelle
    document.querySelector('.results-section h3').textContent = category;
}

// Sonuç input'u işle
function handleResultInput(input) {
    const value = input.value.trim();
    
    if (value) {
        input.classList.add('filled');
        testResults[input.id] = value;
        
        // Değer kontrolü yap
        validateResultValue(input);
    } else {
        input.classList.remove('filled');
        delete testResults[input.id];
        input.style.borderColor = '#e0e0e0';
        input.title = '';
    }
    
    // Otomatik kayıt
    saveToLocalStorage();
}

// Değer doğrulama
function validateResultValue(input) {
    const fieldId = input.id;
    const value = input.value.trim().toLowerCase();
    const normalRange = normalRanges[fieldId];
    
    if (!normalRange) return;
    
    let isNormal = false;
    
    // Değer tipine göre kontrol
    if (normalRange.includes('Negatif')) {
        isNormal = value.includes('negatif') || value.includes('neg') || value === '-';
    } else if (normalRange.includes('Normal')) {
        isNormal = value.includes('normal') || value.includes('norm');
    } else if (normalRange.includes('Berrak')) {
        isNormal = value.includes('berrak') || value.includes('şeffaf');
    } else if (normalRange.includes('Sarı')) {
        isNormal = value.includes('sarı') || value.includes('sari') || value.includes('yellow');
    } else if (normalRange.includes('-')) {
        // Numerik aralık kontrolü (pH, Spesifik ağırlık)
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            const [min, max] = extractRange(normalRange);
            if (min !== null && max !== null) {
                isNormal = numValue >= min && numValue <= max;
            }
        }
    }
    
    // Görsel feedback
    if (isNormal) {
        input.style.borderColor = '#28a745';
        input.title = `Normal değer. Aralık: ${normalRange}`;
    } else {
        input.style.borderColor = '#ffc107';
        input.title = `Kontrol gerekli. Normal aralık: ${normalRange}`;
    }
}

// Aralık çıkar
function extractRange(rangeString) {
    const match = rangeString.match(/(\d+\.?\d*)-(\d+\.?\d*)/);
    if (match) {
        return [parseFloat(match[1]), parseFloat(match[2])];
    }
    return [null, null];
}

// Hasta ara
function searchPatient() {
    const tc = document.getElementById('patientTC').value.trim();
    
    if (tc.length < 11) {
        if (tc.length > 0) {
            showToast('Lütfen 11 haneli TC kimlik numarası girin!', 'warning');
        }
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
        // Hasta bulunamadı
        if (confirm('Bu TC numarasına ait hasta bulunamadı. Yeni hasta eklemek istiyor musunuz?')) {
            addNewPatient(tc);
        }
    }
}

// Hasta seç
function selectPatient(patient) {
    currentPatient = patient;
    updatePatientDisplay();
    
    // Önceki sonuçları yükle
    loadPreviousResults();
}

// Hasta görüntüsünü güncelle
function updatePatientDisplay() {
    if (!currentPatient) return;
    
    document.getElementById('patientTC').value = currentPatient.tc;
    document.getElementById('patientNameDisplay').textContent = currentPatient.name;
    document.getElementById('patientGenderDisplay').textContent = currentPatient.gender;
}

// Önceki sonuçları yükle
function loadPreviousResults() {
    const saved = localStorage.getItem(`urine_results_${currentPatient.tc}`);
    if (saved) {
        testResults = JSON.parse(saved);
        
        // Form alanlarını doldur
        Object.keys(testResults).forEach(fieldId => {
            const input = document.getElementById(fieldId);
            if (input) {
                input.value = testResults[fieldId];
                input.classList.add('filled');
                validateResultValue(input);
            }
        });
        
        showToast('Önceki sonuçlar yüklendi', 'info');
    }
}

// Yeni hasta ekle
function addNewPatient(tc) {
    const name = prompt('Hasta adını girin:');
    if (!name) return;
    
    const gender = prompt('Cinsiyeti girin (Erkek/Kadın):');
    if (!gender) return;
    
    const newPatient = {
        id: samplePatients.length + 1,
        tc: tc,
        name: name.toUpperCase(),
        gender: gender,
        birthDate: '1990-01-01',
        phone: '05000000000'
    };
    
    samplePatients.push(newPatient);
    selectPatient(newPatient);
    
    showToast('Yeni hasta başarıyla eklendi!', 'success');
    
    // LocalStorage'a kaydet
    saveToLocalStorage();
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
            <div class="patient-gender">Cinsiyet: ${patient.gender}</div>
        </div>
    `;
}

// Modal'dan hasta seç
function selectPatientFromModal(patientId) {
    const patient = samplePatients.find(p => p.id === patientId);
    if (patient) {
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
        patient.tc.includes(searchTerm)
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

// Sonuçları kaydet
function saveResults() {
    if (!currentPatient) {
        showToast('Önce bir hasta seçin!', 'error');
        return;
    }
    
    const filledResults = Object.keys(testResults).length;
    
    if (filledResults === 0) {
        showToast('En az bir test sonucu girin!', 'error');
        return;
    }
    
    // Sonuçları kaydet
    const resultData = {
        patientId: currentPatient.id,
        patientName: currentPatient.name,
        patientTC: currentPatient.tc,
        category: currentCategory,
        results: { ...testResults },
        date: new Date().toISOString(),
        createdBy: 'Kullanıcı'
    };
    
    // LocalStorage'a kaydet
    saveToLocalStorage();
    
    // Console'a database için veri logla
    console.log('Database kayıt için veri:', resultData);
    
    // PDF oluştur
    generatePDF();
    
    showToast('Sonuçlar başarıyla kaydedildi ve PDF oluşturuldu!', 'success');
}

// Sonuçları temizle
function clearResults() {
    if (confirm('Tüm girilen sonuçları temizlemek istediğinizden emin misiniz?')) {
        testResults = {};
        
        // Form alanlarını temizle
        document.querySelectorAll('.result-input').forEach(input => {
            input.value = '';
            input.classList.remove('filled');
            input.style.borderColor = '#e0e0e0';
            input.title = '';
        });
        
        showToast('Sonuçlar temizlendi', 'warning');
        saveToLocalStorage();
    }
}

// Önizleme göster
function previewResults() {
    if (!currentPatient) {
        showToast('Önce bir hasta seçin!', 'error');
        return;
    }
    
    const filledResults = Object.keys(testResults).length;
    
    if (filledResults === 0) {
        showToast('Önizleme için en az bir test sonucu girin!', 'error');
        return;
    }
    
    generatePreview();
    document.getElementById('previewModal').style.display = 'block';
}

// Önizleme oluştur
function generatePreview() {
    const previewContent = document.getElementById('previewContent');
    const currentDate = new Date().toLocaleDateString('tr-TR');
    const currentTime = new Date().toLocaleTimeString('tr-TR');
    
    previewContent.innerHTML = `
        <div class="preview-header">
            <div class="preview-logo">LARGEN DIAGNOSTIC</div>
            <h2>${currentCategory} Test Sonuçları</h2>
            <p>Tarih: ${currentDate} - Saat: ${currentTime}</p>
        </div>
        
        <div class="preview-patient-info">
            <div class="preview-info-section">
                <div class="preview-info-title">HASTA BİLGİLERİ</div>
                <p><strong>Adı Soyadı:</strong> ${currentPatient.name}</p>
                <p><strong>TC Kimlik:</strong> ${currentPatient.tc}</p>
                <p><strong>Cinsiyet:</strong> ${currentPatient.gender}</p>
                <p><strong>Doğum Tarihi:</strong> ${currentPatient.birthDate}</p>
            </div>
            <div class="preview-info-section">
                <div class="preview-info-title">TEST BİLGİLERİ</div>
                <p><strong>Test Kategorisi:</strong> ${currentCategory}</p>
                <p><strong>Test Tarihi:</strong> ${currentDate}</p>
                <p><strong>Sonuç Sayısı:</strong> ${Object.keys(testResults).length}</p>
            </div>
        </div>
        
        ${generateResultsTable()}
    `;
}

// Sonuç tablosu oluştur
function generateResultsTable() {
    const tableRows = Object.keys(testResults).map(fieldId => {
        const value = testResults[fieldId];
        const normalRange = normalRanges[fieldId] || '-';
        const status = getResultStatus(fieldId, value);
        
        return `
            <tr>
                <td>${fieldId}</td>
                <td>${value}</td>
                <td>${normalRange}</td>
                <td>${status}</td>
            </tr>
        `;
    }).join('');
    
    return `
        <table class="preview-results-table">
            <thead>
                <tr>
                    <th>Test Adı</th>
                    <th>Sonuç</th>
                    <th>Normal Değer</th>
                    <th>Durum</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

// Sonuç durumunu belirle
function getResultStatus(fieldId, value) {
    const normalRange = normalRanges[fieldId];
    if (!normalRange) return '-';
    
    const valueLower = value.toLowerCase();
    
    if (normalRange.includes('Negatif')) {
        if (valueLower.includes('negatif') || valueLower.includes('neg') || value === '-') {
            return '✓ Normal';
        } else {
            return '⚠ Pozitif';
        }
    } else if (normalRange.includes('Normal')) {
        if (valueLower.includes('normal')) {
            return '✓ Normal';
        } else {
            return '⚠ Anormal';
        }
    } else if (normalRange.includes('-')) {
        // Numerik aralık
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            const [min, max] = extractRange(normalRange);
            if (min !== null && max !== null) {
                if (numValue < min) return '↓ Düşük';
                if (numValue > max) return '↑ Yüksek';
                return '✓ Normal';
            }
        }
    }
    
    return '✓ Normal';
}

// Önizleme modalını kapat
function closePreviewModal() {
    document.getElementById('previewModal').style.display = 'none';
}

// PDF oluştur
function generatePDF() {
    if (!window.jsPDF) {
        showToast('PDF kütüphanesi yüklenmemiş!', 'error');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(255, 0, 0);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('LARGEN DIAGNOSTIC', 105, 20, { align: 'center' });
    
    // Hasta bilgileri
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('HASTA BİLGİLERİ', 20, 50);
    
    doc.setFontSize(12);
    doc.text(`Hasta Adı: ${currentPatient.name}`, 20, 65);
    doc.text(`TC Kimlik: ${currentPatient.tc}`, 20, 75);
    doc.text(`Cinsiyet: ${currentPatient.gender}`, 20, 85);
    doc.text(`Test Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 20, 95);
    
    // Test kategorisi
    doc.setFontSize(16);
    doc.text(`${currentCategory.toUpperCase()} SONUÇLARI`, 20, 115);
    
    // Sonuçlar tablosu
    let yPosition = 130;
    doc.setFontSize(10);
    
    // Tablo başlıkları
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Test Adı', 20, yPosition);
    doc.text('Sonuç', 80, yPosition);
    doc.text('Normal Değer', 120, yPosition);
    doc.text('Durum', 170, yPosition);
    
    // Çizgi
    doc.line(20, yPosition + 2, 190, yPosition + 2);
    yPosition += 10;
    
    // Sonuçları ekle
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    Object.keys(testResults).forEach(fieldId => {
        const value = testResults[fieldId];
        const normalRange = normalRanges[fieldId] || '-';
        const status = getResultStatus(fieldId, value);
        
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }
        
        doc.text(fieldId, 20, yPosition);
        doc.text(value, 80, yPosition);
        doc.text(normalRange, 120, yPosition);
        doc.text(status, 170, yPosition);
        
        yPosition += 8;
    });
    
    // Footer
    doc.setFontSize(8);
    doc.text('Bu rapor Largen Diagnostic tarafından oluşturulmuştur.', 105, 280, { align: 'center' });
    doc.text(`Oluşturma Tarihi: ${new Date().toLocaleString('tr-TR')}`, 105, 290, { align: 'center' });
    
    // PDF'i indir
    const fileName = `${currentPatient.name}_Idrar_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    showToast('PDF başarıyla oluşturuldu!', 'success');
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

// LocalStorage'a kaydet
function saveToLocalStorage() {
    if (currentPatient) {
        const key = `urine_results_${currentPatient.tc}`;
        localStorage.setItem(key, JSON.stringify(testResults));
    }
    
    // Hastalar listesini de kaydet
    localStorage.setItem('urine_patients', JSON.stringify(samplePatients));
}

// LocalStorage'dan yükle
function loadFromLocalStorage() {
    const saved = localStorage.getItem('urine_patients');
    if (saved) {
        samplePatients = JSON.parse(saved);
    }
}

// Klavye kısayolları
document.addEventListener('keydown', function(event) {
    // Ctrl+S ile kaydet
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        saveResults();
    }
    
    // Escape ile modal'ları kapat
    if (event.key === 'Escape') {
        closePatientModal();
        closePreviewModal();
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
    
    // F4 ile önizleme
    if (event.key === 'F4') {
        event.preventDefault();
        previewResults();
    }
});

// Otomatik kayıt sistemi
let autoSaveTimer;
function enableAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        saveToLocalStorage();
        console.log('💾 Otomatik kayıt yapıldı');
    }, 3000);
}

// Form değişikliklerinde otomatik kayıt
document.addEventListener('input', function(event) {
    if (event.target.classList.contains('result-input')) {
        enableAutoSave();
    }
});

// Sayfa kapatılırken kaydet
window.addEventListener('beforeunload', function() {
    saveToLocalStorage();
});

// Debug fonksiyonları
function enableDebugMode() {
    console.log('🧪 İdrar Test Sistemi Debug Modu Aktif');
    console.log('📊 Mevcut hasta sayısı:', samplePatients.length);
    console.log('🔬 Aktif kategori:', currentCategory);
    console.log('👤 Seçili hasta:', currentPatient?.name || 'Yok');
    console.log('📝 Girilen sonuç sayısı:', Object.keys(testResults).length);
    
    // Global değişkenleri window'a ekle
    window.debugUrine = {
        patients: samplePatients,
        currentPatient: currentPatient,
        testResults: testResults,
        normalRanges: normalRanges,
        urineFields: urineFields
    };
    
    console.log('🔧 Debug araçları window.debugUrine içinde mevcut');
}

// Veri dışa aktarma
function exportData() {
    const exportData = {
        patients: samplePatients,
        normalRanges: normalRanges,
        urineFields: urineFields,
        exportDate: new Date().toISOString()
    };
    
    // Tüm test sonuçlarını ekle
    const allResults = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('urine_results_')) {
            allResults[key] = JSON.parse(localStorage.getItem(key));
        }
    }
    exportData.testResults = allResults;
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `idrar_test_verileri_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showToast('Veriler başarıyla dışa aktarıldı!', 'success');
}

// Veri içe aktarma
function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (confirm('Mevcut veriler silinecek ve yeni veriler yüklenecek. Emin misiniz?')) {
                samplePatients = importedData.patients || [];
                
                // Test sonuçlarını yükle
                if (importedData.testResults) {
                    Object.keys(importedData.testResults).forEach(key => {
                        localStorage.setItem(key, JSON.stringify(importedData.testResults[key]));
                    });
                }
                
                saveToLocalStorage();
                showToast('Veriler başarıyla içe aktarıldı!', 'success');
                
                // Sayfa yenile
                location.reload();
            }
        } catch (error) {
            showToast('Dosya formatı geçersiz!', 'error');
            console.error('Import hatası:', error);
        }
    };
    reader.readAsText(file);
}

// Raporlama fonksiyonları
const ReportingFunctions = {
    // Hasta test geçmişi
    getPatientHistory: (patientTC) => {
        const history = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key === `urine_results_${patientTC}`) {
                const data = JSON.parse(localStorage.getItem(key));
                history.push({
                    category: 'İdrar',
                    results: data,
                    date: new Date().toISOString() // Gerçek projede kayıt tarihinden gelecek
                });
            }
        }
        return history;
    },
    
    // Anormal sonuç istatistikleri
    getAbnormalStats: () => {
        let totalTests = 0;
        let abnormalCount = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('urine_results_')) {
                const data = JSON.parse(localStorage.getItem(key));
                
                Object.keys(data).forEach(fieldId => {
                    totalTests++;
                    const status = getResultStatus(fieldId, data[fieldId]);
                    if (!status.includes('Normal')) {
                        abnormalCount++;
                    }
                });
            }
        }
        
        return {
            totalTests,
            abnormalCount,
            normalCount: totalTests - abnormalCount,
            abnormalRate: totalTests > 0 ? ((abnormalCount / totalTests) * 100).toFixed(2) : 0
        };
    },
    
    // En sık anormal çıkan testler
    getMostAbnormalTests: () => {
        const abnormalCounts = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('urine_results_')) {
                const data = JSON.parse(localStorage.getItem(key));
                
                Object.keys(data).forEach(fieldId => {
                    const status = getResultStatus(fieldId, data[fieldId]);
                    if (!status.includes('Normal')) {
                        abnormalCounts[fieldId] = (abnormalCounts[fieldId] || 0) + 1;
                    }
                });
            }
        }
        
        return Object.entries(abnormalCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
    }
};

// MySQL helper fonksiyonları
const MySQLHelpers = {
    // Test sonucu ekleme sorgusu
    insertTestResult: (resultData) => {
        return `
            INSERT INTO test_sonuclari (
                hasta_id, hasta_adi, test_tarihi, kategori, test_sonuclari, 
                doktor_adi, olusturma_tarihi
            ) VALUES (
                ${resultData.patientId},
                '${resultData.patientName}',
                '${new Date().toISOString().split('T')[0]}',
                '${resultData.category}',
                '${JSON.stringify(resultData.results)}',
                'Kullanıcı',
                NOW()
            )
        `;
    },
    
    // Hasta ekleme sorgusu
    insertPatient: (patient) => {
        return `
            INSERT INTO hastalar (tc_kimlik, hasta_adi, cinsiyet, dogum_tarihi, telefon, olusturma_tarihi)
            VALUES ('${patient.tc}', '${patient.name}', '${patient.gender}', '${patient.birthDate}', '${patient.phone}', NOW())
        `;
    },
    
    // Hasta arama sorgusu
    searchPatients: (searchTerm) => {
        return `
            SELECT * FROM hastalar 
            WHERE hasta_adi LIKE '%${searchTerm}%' 
               OR tc_kimlik LIKE '%${searchTerm}%'
            ORDER BY hasta_adi
        `;
    },
    
    // Test geçmişi sorgusu
    getPatientTestHistory: (patientId) => {
        return `
            SELECT * FROM test_sonuclari 
            WHERE hasta_id = ${patientId} AND kategori = 'İdrar'
            ORDER BY test_tarihi DESC
        `;
    }
};

// Hızlı değer girişi için önceden tanımlı değerler
const quickValues = {
    'GLUKOZ': ['Negatif', 'Pozitif', 'Eser'],
    'PROTEIN': ['Negatif', 'Eser', '+1', '+2', '+3'],
    'PH': ['5.0', '6.0', '7.0', '8.0'],
    'KETONER': ['Negatif', 'Eser', '+1', '+2'],
    'RENK': ['Sarı', 'Koyu Sarı', 'Amber', 'Kırmızı'],
    'BERRAKLIK': ['Berrak', 'Hafif Bulanık', 'Bulanık'],
    'KAN': ['Negatif', 'Eser', '+1', '+2', '+3'],
    'NITRIT': ['Negatif', 'Pozitif'],
    'LOKOSIT': ['Negatif', 'Eser', '+1', '+2', '+3']
};

// Hızlı değer seçimi (double click ile)
document.addEventListener('dblclick', function(event) {
    if (event.target.classList.contains('result-input')) {
        const fieldId = event.target.id;
        if (quickValues[fieldId]) {
            showQuickValueMenu(event.target, quickValues[fieldId]);
        }
    }
});

function showQuickValueMenu(input, values) {
    // Varolan menüyü kaldır
    const existingMenu = document.querySelector('.quick-value-menu');
    if (existingMenu) existingMenu.remove();
    
    // Yeni menü oluştur
    const menu = document.createElement('div');
    menu.className = 'quick-value-menu';
    menu.style.cssText = `
        position: absolute;
        background: white;
        border: 2px solid #ff0000;
        border-radius: 8px;
        padding: 5px;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    
    values.forEach(value => {
        const item = document.createElement('div');
        item.textContent = value;
        item.style.cssText = `
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 4px;
            transition: background 0.2s;
        `;
        item.addEventListener('mouseover', () => item.style.background = '#f0f0f0');
        item.addEventListener('mouseout', () => item.style.background = 'white');
        item.addEventListener('click', () => {
            input.value = value;
            input.dispatchEvent(new Event('input'));
            menu.remove();
        });
        menu.appendChild(item);
    });
    
    // Menüyü konumlandır
    const rect = input.getBoundingClientRect();
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${rect.bottom + 5}px`;
    
    document.body.appendChild(menu);
    
    // Dışarı tıklandığında kapat
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

// Console yardım fonksiyonu
function showConsoleHelp() {
    console.log(`
🧪 İDRAR TEST SİSTEMİ KONSOL KOMUTLARI:
• enableDebugMode() - Debug modunu aktif et
• exportData() - Verileri dışa aktar
• ReportingFunctions.getPatientHistory('TC') - Hasta geçmişi
• ReportingFunctions.getAbnormalStats() - Anormal sonuç istatistikleri
• ReportingFunctions.getMostAbnormalTests() - En sık anormal testler
• showConsoleHelp() - Bu yardımı göster

⌨️  KLAVYE KISAYOLLARI:
• F2 - Hasta TC arama
• F3 - Hasta modal
• F4 - Sonuç önizleme
• Ctrl+S - Kaydet
• Escape - Modal'ları kapat
• Çift tık - Hızlı değer seçimi (ilgili alanlarda)

🔬 İDRAR TEST ALANLARI:
${urineFields.map(field => `• ${field}`).join('\n')}

💡 İpuçları:
• TC girişi otomatik hasta arama yapar
• Test alanlarına çift tıklayarak hızlı değer seçebilirsiniz
• Sonuçlar otomatik olarak normal/anormal kontrol edilir
    `);
}

// Sistem başlatma
function initializeSystem() {
    console.log('🧪 İdrar Test Sonuç Sistemi başlatıldı');
    console.log('📊 Sistem durumu:');
    console.log(`   - Hasta sayısı: ${samplePatients.length}`);
    console.log(`   - Test alanı sayısı: ${urineFields.length}`);
    console.log(`   - Normal değer tanımı: ${Object.keys(normalRanges).length} alan`);
    console.log('💡 Yardım için showConsoleHelp() komutunu kullanın');
}

// Sayfa tamamen yüklendiğinde sistem başlat
window.addEventListener('load', function() {
    setTimeout(initializeSystem, 500);
});

// Error handling
window.addEventListener('error', function(event) {
    console.error('Sistem hatası:', event.error);
    showToast('Bir hata oluştu. Lütfen sayfayı yenileyin.', 'error');
});

// Validation helpers
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
    
    // pH değer kontrolü
    validatePH: (value) => {
        const ph = parseFloat(value);
        return !isNaN(ph) && ph >= 4.5 && ph <= 9.0;
    },
    
    // Spesifik ağırlık kontrolü
    validateSpecificGravity: (value) => {
        const sg = parseFloat(value);
        return !isNaN(sg) && sg >= 1.000 && sg <= 1.040;
    }
};

// İlk yükleme mesajı
console.log('🧪 İdrar Test Sistemi hazır');
console.log('💡 Yardım: showConsoleHelp()');