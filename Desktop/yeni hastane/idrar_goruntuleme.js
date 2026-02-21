// Global değişkenler
let currentPatient = null;
let currentCategory = 'İdrar';
let samplePatients = [];
let patientTestHistory = [];
let currentTestResults = {};

// İdrar test alanları
const urineFields = [
    'GLUKOZ', 'PROTEIN', 'PH', 'SPESIFIK', 'GRAVITASYON', 'KETONER',
    'BILIRUBIN', 'UROBILINOGEN', 'KAN', 'LOKOSIT', 'NITRIT', 'ASKORBIK_ASIT',
    'RENK', 'BERRAKLIK', 'MIKROSKOPIK', 'EPITEL', 'BAKTERI', 'CAST'
];

// Normal değerler ve durumlar
const normalValues = {
    'GLUKOZ': { normal: ['negatif', 'neg', '-'], type: 'negative' },
    'PROTEIN': { normal: ['negatif', 'neg', '-', 'eser'], type: 'negative' },
    'PH': { min: 5.0, max: 8.0, type: 'range' },
    'SPESIFIK': { min: 1.003, max: 1.030, type: 'range' },
    'GRAVITASYON': { min: 1.003, max: 1.030, type: 'range' },
    'KETONER': { normal: ['negatif', 'neg', '-'], type: 'negative' },
    'BILIRUBIN': { normal: ['negatif', 'neg', '-'], type: 'negative' },
    'UROBILINOGEN': { normal: ['normal', 'norm'], type: 'normal' },
    'KAN': { normal: ['negatif', 'neg', '-'], type: 'negative' },
    'LOKOSIT': { normal: ['negatif', 'neg', '-'], type: 'negative' },
    'NITRIT': { normal: ['negatif', 'neg', '-'], type: 'negative' },
    'ASKORBIK_ASIT': { normal: ['normal', 'norm'], type: 'normal' },
    'RENK': { normal: ['sarı', 'sari', 'yellow'], type: 'normal' },
    'BERRAKLIK': { normal: ['berrak', 'şeffaf', 'seffaf', 'clear'], type: 'normal' },
    'MIKROSKOPIK': { normal: ['normal', 'norm'], type: 'normal' },
    'EPITEL': { normal: ['0-5/hpf', '0-5', 'az'], type: 'normal' },
    'BAKTERI': { normal: ['az', 'yok', 'nadir'], type: 'normal' },
    'CAST': { normal: ['yok', 'nadir'], type: 'normal' }
};

// Örnek hastalar ve test sonuçları
const initializeSampleData = () => {
    samplePatients = [
        {
            id: 1,
            name: 'Mustafa GÜL',
            tc: '23412424',
            age: 2,
            gender: 'Erkek',
            birthDate: '2022-01-15',
            phone: '05353636363'
        },
        {
            id: 2,
            name: 'Ayşe KAYA',
            tc: '98765432109',
            age: 35,
            gender: 'Kadın',
            birthDate: '1988-05-20',
            phone: '05321234567'
        },
        {
            id: 3,
            name: 'Mehmet DEMİR',
            tc: '11223344556',
            age: 45,
            gender: 'Erkek',
            birthDate: '1978-12-10',
            phone: '05449876543'
        }
    ];

    // Örnek test geçmişi
    patientTestHistory = [
        {
            id: 1,
            patientId: 1,
            patientName: 'Mustafa GÜL',
            category: 'İdrar',
            date: '2024-12-15',
            results: {
                'GLUKOZ': 'Negatif',
                'PROTEIN': 'Negatif',
                'PH': '6.5',
                'SPESIFIK': '1.020',
                'RENK': 'Sarı',
                'BERRAKLIK': 'Berrak',
                'KAN': 'Negatif',
                'LOKOSIT': 'Negatif'
            }
        },
        {
            id: 2,
            patientId: 1,
            patientName: 'Mustafa GÜL',
            category: 'İdrar',
            date: '2024-11-20',
            results: {
                'GLUKOZ': 'Negatif',
                'PROTEIN': 'Eser',
                'PH': '6.0',
                'SPESIFIK': '1.018',
                'RENK': 'Sarı',
                'BERRAKLIK': 'Berrak'
            }
        },
        {
            id: 3,
            patientId: 2,
            patientName: 'Ayşe KAYA',
            category: 'İdrar',
            date: '2024-12-10',
            results: {
                'GLUKOZ': 'Negatif',
                'PROTEIN': 'Negatif',
                'PH': '7.0',
                'SPESIFIK': '1.015',
                'RENK': 'Sarı',
                'BERRAKLIK': 'Berrak',
                'KAN': 'Negatif',
                'NITRIT': 'Negatif'
            }
        }
    ];
};

// Sayfa yüklendiğinde çalışacak
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
    setupEventListeners();
    loadFromLocalStorage();
    
    // Varsayılan hasta seç
    selectPatient(samplePatients[0]);
});

// Event listener'ları kurma
function setupEventListeners() {
    // Hasta adı input'unda arama
    document.getElementById('patientName').addEventListener('input', function(event) {
        const searchTerm = event.target.value.trim();
        if (searchTerm.length >= 2) {
            searchPatientByName();
        } else if (searchTerm.length === 0) {
            clearPatientInfo();
        }
    });
    
    // Enter tuşu ile arama
    document.getElementById('patientName').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            searchPatient();
        }
    });
    
    // Modal dışına tıklandığında kapat
    window.addEventListener('click', function(event) {
        const patientModal = document.getElementById('patientModal');
        const historyModal = document.getElementById('historyModal');
        const reportModal = document.getElementById('reportModal');
        
        if (event.target === patientModal) {
            closePatientModal();
        }
        if (event.target === historyModal) {
            closeHistoryModal();
        }
        if (event.target === reportModal) {
            closeReportModal();
        }
    });
    
    // Dropdown dışına tıklandığında kapat
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown-wrapper')) {
            closeAllDropdowns();
        }
    });
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
    
    // Sonuçları güncelle
    if (currentPatient) {
        loadPatientTestResults();
    }
    
    closeAllDropdowns();
    showToast(`${category} kategorisi seçildi!`, 'info');
}

// Kategori açıklamasını güncelle
function updateCategoryDescription(category) {
    const descriptions = {
        'İdrar': 'İdrar kimyasal ve mikroskobik analizi sonuçları',
        'Hematoloji': 'Kan sayımı ve kan hücreleri analizi sonuçları',
        'Solunum Panel': 'Solunum yolu enfeksiyonları panel analizi',
        'Gaita': 'Dışkı mikroskobik ve kimyasal analizi'
    };
    
    const descElement = document.querySelector('.category-description p');
    if (descElement) {
        descElement.textContent = descriptions[category] || 'Test analizi sonuçları';
    }
    
    // Başlığı güncelle
    document.querySelector('.results-section h3').textContent = category;
}

// Hasta adına göre arama
function searchPatientByName() {
    const searchTerm = document.getElementById('patientName').value.toLowerCase().trim();
    
    if (searchTerm.length < 2) return;
    
    // Hasta ara
    const matchingPatients = samplePatients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm)
    );
    
    if (matchingPatients.length === 1) {
        // Tek eşleşme varsa otomatik seç
        selectPatient(matchingPatients[0]);
        showToast('Hasta bulundu!', 'success');
    } else if (matchingPatients.length > 1) {
        // Birden fazla eşleşme varsa modal aç
        openPatientModal(matchingPatients);
    } else {
        // Eşleşme yoksa bilgileri temizle
        clearPatientInfo();
    }
}

// Hasta ara (arama butonu)
function searchPatient() {
    const searchTerm = document.getElementById('patientName').value.trim();
    
    if (!searchTerm) {
        showToast('Lütfen hasta adı girin!', 'warning');
        return;
    }
    
    const matchingPatients = samplePatients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.tc.includes(searchTerm)
    );
    
    if (matchingPatients.length === 0) {
        showToast('Hasta bulunamadı!', 'error');
        clearPatientInfo();
    } else if (matchingPatients.length === 1) {
        selectPatient(matchingPatients[0]);
        showToast('Hasta bulundu!', 'success');
    } else {
        openPatientModal(matchingPatients);
    }
}

// Hasta seç
function selectPatient(patient) {
    currentPatient = patient;
    updatePatientDisplay();
    loadPatientTestResults();
    loadPatientHistory();
    
    // Hasta adı input'unu güncelle
    document.getElementById('patientName').value = patient.name;
}

// Hasta görüntüsünü güncelle
function updatePatientDisplay() {
    if (!currentPatient) return;
    
    document.getElementById('patientTCDisplay').textContent = currentPatient.tc;
    document.getElementById('patientNameDisplay').textContent = currentPatient.name;
    document.getElementById('patientAgeDisplay').textContent = currentPatient.age;
    document.getElementById('patientGenderDisplay').textContent = currentPatient.gender;
    
    // Auto-fill alanlarını işaretle
    document.querySelectorAll('.auto-fill-field').forEach(field => {
        field.classList.add('filled');
    });
}

// Hasta bilgilerini temizle
function clearPatientInfo() {
    currentPatient = null;
    currentTestResults = {};
    
    document.getElementById('patientTCDisplay').textContent = '-';
    document.getElementById('patientNameDisplay').textContent = '-';
    document.getElementById('patientAgeDisplay').textContent = '-';
    document.getElementById('patientGenderDisplay').textContent = '-';
    
    // Auto-fill alanlarının işaretini kaldır
    document.querySelectorAll('.auto-fill-field').forEach(field => {
        field.classList.remove('filled');
    });
    
    // Test sonuçlarını temizle
    clearTestResults();
    
    // Geçmişi temizle
    clearHistory();
}

// Test sonuçlarını yükle
function loadPatientTestResults() {
    if (!currentPatient) return;
    
    // En son test sonuçlarını al
    const latestTest = patientTestHistory
        .filter(test => test.patientId === currentPatient.id && test.category === currentCategory)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    
    if (latestTest) {
        currentTestResults = latestTest.results;
        displayTestResults();
        showToast('Test sonuçları yüklendi', 'info');
    } else {
        // Test sonucu yoksa temizle
        clearTestResults();
        showToast('Bu kategori için test sonucu bulunamadı', 'warning');
    }
}

// Test sonuçlarını görüntüle
function displayTestResults() {
    urineFields.forEach(fieldId => {
        const displayElement = document.getElementById(`${fieldId}_display`);
        if (displayElement) {
            const value = currentTestResults[fieldId];
            
            if (value) {
                displayElement.textContent = value;
                displayElement.classList.add('has-value');
                
                // Normal/anormal kontrolü
                const status = getResultStatus(fieldId, value);
                displayElement.classList.remove('normal', 'abnormal', 'warning', 'positive', 'negative');
                displayElement.classList.add(status);
                
                // Status indicator ekle
                const existingIndicator = displayElement.querySelector('.status-indicator');
                if (existingIndicator) {
                    existingIndicator.remove();
                }
                
                const indicator = document.createElement('span');
                indicator.className = `status-indicator ${status === 'positive' ? 'abnormal' : status === 'negative' ? 'normal' : status}`;
                displayElement.appendChild(indicator);
                
            } else {
                displayElement.textContent = '-';
                displayElement.classList.remove('has-value', 'normal', 'abnormal', 'warning', 'positive', 'negative');
            }
        }
    });
}

// Sonuç durumunu belirle
function getResultStatus(fieldId, value) {
    const normalValue = normalValues[fieldId];
    if (!normalValue) return 'normal';
    
    const valueLower = value.toLowerCase().trim();
    
    if (normalValue.type === 'negative') {
        // Negatif olması gereken testler
        const isNormal = normalValue.normal.some(norm => valueLower.includes(norm));
        return isNormal ? 'negative' : 'positive';
    } else if (normalValue.type === 'normal') {
        // Normal olması gereken testler
        const isNormal = normalValue.normal.some(norm => valueLower.includes(norm));
        return isNormal ? 'normal' : 'abnormal';
    } else if (normalValue.type === 'range') {
        // Numerik aralık kontrolü
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            if (numValue < normalValue.min || numValue > normalValue.max) {
                return 'abnormal';
            } else {
                return 'normal';
            }
        }
    }
    
    return 'normal';
}

// Test sonuçlarını temizle
function clearTestResults() {
    urineFields.forEach(fieldId => {
        const displayElement = document.getElementById(`${fieldId}_display`);
        if (displayElement) {
            displayElement.textContent = '-';
            displayElement.className = 'result-display';
        }
    });
}

// Hasta geçmişini yükle
function loadPatientHistory() {
    if (!currentPatient) {
        clearHistory();
        return;
    }
    
    const patientTests = patientTestHistory.filter(test => test.patientId === currentPatient.id);
    
    if (patientTests.length === 0) {
        clearHistory();
        return;
    }
    
    // Tarihe göre sırala (en yeni en üstte)
    patientTests.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = patientTests.map(test => createHistoryItemHTML(test)).join('');
}

// Geçmiş item HTML oluştur
function createHistoryItemHTML(test) {
    const resultCount = Object.keys(test.results).length;
    const date = new Date(test.date).toLocaleDateString('tr-TR');
    
    return `
        <div class="history-item" onclick="viewHistoryDetail(${test.id})">
            <div class="history-item-header">
                <div class="history-date">${date}</div>
                <div class="history-category">${test.category}</div>
            </div>
            <div class="history-summary">
                <span class="history-count">${resultCount} test sonucu</span> mevcut
            </div>
        </div>
    `;
}

// Geçmişi temizle
function clearHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '<div class="no-history">Henüz test geçmişi bulunamadı</div>';
}

// Geçmiş detayını görüntüle
function viewHistoryDetail(testId) {
    const test = patientTestHistory.find(t => t.id === testId);
    if (!test) return;
    
    const historyDetailContent = document.getElementById('historyDetailContent');
    const date = new Date(test.date).toLocaleDateString('tr-TR');
    
    historyDetailContent.innerHTML = `
        <div class="history-detail-header">
            <div class="history-detail-date">${date}</div>
            <div class="history-detail-category">${test.category}</div>
        </div>
        <div class="history-results-grid">
            ${Object.keys(test.results).map(fieldId => {
                const value = test.results[fieldId];
                const status = getResultStatus(fieldId, value);
                return `
                    <div class="history-result-item">
                        <div class="history-result-label">${fieldId}</div>
                        <div class="history-result-value ${status}">${value}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    document.getElementById('historyModal').style.display = 'block';
}

// Hasta modal aç
function openPatientModal(patients = null) {
    document.getElementById('patientModal').style.display = 'block';
    loadPatientsListInModal(patients || samplePatients);
    document.getElementById('modalPatientSearch').focus();
}

// Modal'da hastaları listele
function loadPatientsListInModal(patients) {
    const patientsList = document.getElementById('patientsList');
    
    if (patients.length === 0) {
        patientsList.innerHTML = '<p style="text-align: center; color: #666;">Hasta bulunamadı</p>';
        return;
    }
    
    patientsList.innerHTML = patients.map(patient => 
        createPatientItemHTML(patient)
    ).join('');
}

// Hasta item HTML oluştur
function createPatientItemHTML(patient) {
    return `
        <div class="patient-item" onclick="selectPatientFromModal(${patient.id})">
            <div class="patient-name">${patient.name}</div>
            <div class="patient-tc">TC: ${patient.tc}</div>
            <div class="patient-info">Yaş: ${patient.age} | ${patient.gender}</div>
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

// Modal'da hasta ara
function searchPatientsInModal() {
    const searchTerm = document.getElementById('modalPatientSearch').value.toLowerCase().trim();
    
    if (searchTerm.length < 2) {
        loadPatientsListInModal(samplePatients);
        return;
    }
    
    const filteredPatients = samplePatients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.tc.includes(searchTerm)
    );
    
    loadPatientsListInModal(filteredPatients);
}

// Modal'ları kapat
function closePatientModal() {
    document.getElementById('patientModal').style.display = 'none';
}

function closeHistoryModal() {
    document.getElementById('historyModal').style.display = 'none';
}

function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
}

// Rapor oluştur
function generateReport() {
    if (!currentPatient) {
        showToast('Önce bir hasta seçin!', 'error');
        return;
    }
    
    if (Object.keys(currentTestResults).length === 0) {
        showToast('Görüntülenecek test sonucu bulunamadı!', 'warning');
        return;
    }
    
    generateReportContent();
    document.getElementById('reportModal').style.display = 'block';
}

// Rapor içeriği oluştur
function generateReportContent() {
    const reportContent = document.getElementById('reportContent');
    const currentDate = new Date().toLocaleDateString('tr-TR');
    const currentTime = new Date().toLocaleTimeString('tr-TR');
    
    reportContent.innerHTML = `
        <div class="report-header">
            <div class="report-logo">LARGEN DIAGNOSTIC</div>
            <h2>${currentCategory} Test Sonuçları</h2>
            <p>Rapor Tarihi: ${currentDate} - Saat: ${currentTime}</p>
        </div>
        
        <div class="report-patient-info">
            <div class="report-info-section">
                <div class="report-info-title">HASTA BİLGİLERİ</div>
                <p><strong>Adı Soyadı:</strong> ${currentPatient.name}</p>
                <p><strong>TC Kimlik:</strong> ${currentPatient.tc}</p>
                <p><strong>Yaş:</strong> ${currentPatient.age}</p>
                <p><strong>Cinsiyet:</strong> ${currentPatient.gender}</p>
            </div>
            <div class="report-info-section">
                <div class="report-info-title">TEST BİLGİLERİ</div>
                <p><strong>Test Kategorisi:</strong> ${currentCategory}</p>
                <p><strong>Test Tarihi:</strong> ${currentDate}</p>
                <p><strong>Sonuç Sayısı:</strong> ${Object.keys(currentTestResults).length}</p>
            </div>
        </div>
        
        ${generateReportResultsTable()}
    `;
}

// Rapor sonuçları tablosu
function generateReportResultsTable() {
    const tableRows = Object.keys(currentTestResults).map(fieldId => {
        const value = currentTestResults[fieldId];
        const normalValue = normalValues[fieldId];
        const normalText = getNormalValueText(fieldId);
        const status = getResultStatus(fieldId, value);
        const statusText = getStatusText(status);
        
        return `
            <tr>
                <td>${fieldId}</td>
                <td>${value}</td>
                <td>${normalText}</td>
                <td class="${status}">${statusText}</td>
            </tr>
        `;
    }).join('');
    
    return `
        <table class="report-results-table">
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

// Normal değer metni al
function getNormalValueText(fieldId) {
    const normalValue = normalValues[fieldId];
    if (!normalValue) return '-';
    
    if (normalValue.type === 'negative') {
        return 'Negatif';
    } else if (normalValue.type === 'normal') {
        return 'Normal';
    } else if (normalValue.type === 'range') {
        return `${normalValue.min}-${normalValue.max}`;
    }
    
    return '-';
}

// Durum metni al
function getStatusText(status) {
    switch (status) {
        case 'normal': return '✓ Normal';
        case 'negative': return '✓ Normal (Negatif)';
        case 'positive': return '⚠ Pozitif';
        case 'abnormal': return '✗ Anormal';
        case 'warning': return '⚠ Sınırda';
        default: return '-';
    }
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
    doc.text(`Yaş: ${currentPatient.age}`, 20, 85);
    doc.text(`Cinsiyet: ${currentPatient.gender}`, 20, 95);
    doc.text(`Test Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 20, 105);
    
    // Test kategorisi
    doc.setFontSize(16);
    doc.text(`${currentCategory.toUpperCase()} SONUÇLARI`, 20, 125);
    
    // Sonuçlar tablosu
    let yPosition = 140;
    doc.setFontSize(10);
    
    // Tablo başlıkları
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Test Adı', 20, yPosition);
    doc.text('Sonuç', 70, yPosition);
    doc.text('Normal Değer', 110, yPosition);
    doc.text('Durum', 160, yPosition);
    
    // Çizgi
    doc.line(20, yPosition + 2, 190, yPosition + 2);
    yPosition += 10;
    
    // Sonuçları ekle
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    Object.keys(currentTestResults).forEach(fieldId => {
        const value = currentTestResults[fieldId];
        const normalText = getNormalValueText(fieldId);
        const status = getResultStatus(fieldId, value);
        const statusText = getStatusText(status).replace(/[✓✗⚠]/g, '').trim();
        
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }
        
        doc.text(fieldId, 20, yPosition);
        doc.text(value, 70, yPosition);
        doc.text(normalText, 110, yPosition);
        doc.text(statusText, 160, yPosition);
        
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

// Geçmiş raporu oluştur
function generateHistoryReport() {
    if (!currentPatient) {
        showToast('Hasta seçili değil!', 'error');
        return;
    }
    
    const patientTests = patientTestHistory.filter(test => test.patientId === currentPatient.id);
    
    if (patientTests.length === 0) {
        showToast('Test geçmişi bulunamadı!', 'warning');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(255, 0, 0);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('LARGEN DIAGNOSTIC - TEST GEÇMİŞİ', 105, 20, { align: 'center' });
    
    // Hasta bilgileri
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(`Hasta: ${currentPatient.name} (${currentPatient.tc})`, 20, 50);
    
    let yPosition = 70;
    doc.setFontSize(12);
    
    // Test geçmişini tarihe göre sırala
    patientTests.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    patientTests.forEach((test, index) => {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${test.category} - ${new Date(test.date).toLocaleDateString('tr-TR')}`, 20, yPosition);
        yPosition += 10;
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        
        Object.keys(test.results).forEach(fieldId => {
            doc.text(`${fieldId}: ${test.results[fieldId]}`, 30, yPosition);
            yPosition += 6;
        });
        
        yPosition += 5;
        doc.setFontSize(12);
    });
    
    // PDF'i indir
    const fileName = `${currentPatient.name}_Idrar_Gecmisi_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    showToast('Test geçmişi raporu oluşturuldu!', 'success');
}

// Sonuçları yazdır
function printResults() {
    if (!currentPatient) {
        showToast('Önce bir hasta seçin!', 'error');
        return;
    }
    
    window.print();
    showToast('Yazdırma işlemi başlatıldı', 'info');
}

// Sonuçları dışa aktar
function exportResults() {
    if (!currentPatient) {
        showToast('Önce bir hasta seçin!', 'error');
        return;
    }
    
    if (Object.keys(currentTestResults).length === 0) {
        showToast('Dışa aktarılacak test sonucu bulunamadı!', 'warning');
        return;
    }
    
    const exportData = {
        patient: currentPatient,
        category: currentCategory,
        results: currentTestResults,
        exportDate: new Date().toISOString(),
        normalValues: normalValues
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${currentPatient.name}_Idrar_sonuclari.json`;
    link.click();
    
    showToast('Test sonuçları dışa aktarıldı!', 'success');
}

// Sonuçları temizle
function clearResults() {
    if (confirm('Görüntülenen sonuçları temizlemek istediğinizden emin misiniz?')) {
        clearPatientInfo();
        document.getElementById('patientName').value = '';
        showToast('Sonuçlar temizlendi', 'warning');
    }
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
    localStorage.setItem('urine_view_patients', JSON.stringify(samplePatients));
    localStorage.setItem('urine_view_history', JSON.stringify(patientTestHistory));
}

// LocalStorage'dan yükle
function loadFromLocalStorage() {
    const savedPatients = localStorage.getItem('urine_view_patients');
    if (savedPatients) {
        samplePatients = JSON.parse(savedPatients);
    }
    
    const savedHistory = localStorage.getItem('urine_view_history');
    if (savedHistory) {
        patientTestHistory = JSON.parse(savedHistory);
    }
}

// Klavye kısayolları
document.addEventListener('keydown', function(event) {
    // F2 ile hasta arama
    if (event.key === 'F2') {
        event.preventDefault();
        document.getElementById('patientName').focus();
    }
    
    // F3 ile hasta modal
    if (event.key === 'F3') {
        event.preventDefault();
        openPatientModal();
    }
    
    // F4 ile rapor oluştur
    if (event.key === 'F4') {
        event.preventDefault();
        generateReport();
    }
    
    // Ctrl+P ile yazdır
    if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        printResults();
    }
    
    // Escape ile modal'ları kapat
    if (event.key === 'Escape') {
        closePatientModal();
        closeHistoryModal();
        closeReportModal();
        closeAllDropdowns();
    }
});

// Raporlama fonksiyonları
const ReportingFunctions = {
    // Hasta istatistikleri
    getPatientStats: () => {
        const totalPatients = samplePatients.length;
        const maleCount = samplePatients.filter(p => p.gender === 'Erkek').length;
        const femaleCount = samplePatients.filter(p => p.gender === 'Kadın').length;
        const avgAge = samplePatients.reduce((sum, p) => sum + p.age, 0) / totalPatients;
        
        return {
            totalPatients,
            maleCount,
            femaleCount,
            averageAge: avgAge.toFixed(1)
        };
    },
    
    // Test istatistikleri
    getTestStats: () => {
        const totalTests = patientTestHistory.length;
        const categoryCounts = {};
        
        patientTestHistory.forEach(test => {
            categoryCounts[test.category] = (categoryCounts[test.category] || 0) + 1;
        });
        
        return {
            totalTests,
            categoryCounts,
            testsPerPatient: (totalTests / samplePatients.length).toFixed(1)
        };
    },
    
    // Anormal sonuç analizi (İdrar spesifik)
    getUrineAbnormalAnalysis: () => {
        const abnormalResults = {};
        let totalResults = 0;
        let positiveCount = 0;
        let abnormalCount = 0;
        
        patientTestHistory.filter(test => test.category === 'İdrar').forEach(test => {
            Object.keys(test.results).forEach(fieldId => {
                totalResults++;
                const status = getResultStatus(fieldId, test.results[fieldId]);
                
                if (status === 'positive') {
                    positiveCount++;
                    abnormalResults[fieldId] = (abnormalResults[fieldId] || 0) + 1;
                } else if (status === 'abnormal') {
                    abnormalCount++;
                    abnormalResults[fieldId] = (abnormalResults[fieldId] || 0) + 1;
                }
            });
        });
        
        return {
            totalResults,
            positiveCount,
            abnormalCount,
            totalAbnormal: positiveCount + abnormalCount,
            abnormalRate: ((positiveCount + abnormalCount) / totalResults * 100).toFixed(2),
            abnormalByField: abnormalResults
        };
    }
};

// MySQL helper fonksiyonları
const MySQLHelpers = {
    // Hasta arama sorgusu
    searchPatientsQuery: (searchTerm) => {
        return `
            SELECT id, tc_kimlik, hasta_adi, yas, cinsiyet, telefon 
            FROM hastalar 
            WHERE hasta_adi LIKE '%${searchTerm}%' 
               OR tc_kimlik LIKE '%${searchTerm}%'
            ORDER BY hasta_adi
        `;
    },
    
    // İdrar test sonuçları getirme sorgusu
    getUrineTestResultsQuery: (patientId) => {
        return `
            SELECT * FROM test_sonuclari 
            WHERE hasta_id = ${patientId} 
              AND kategori = 'İdrar'
            ORDER BY test_tarihi DESC 
            LIMIT 1
        `;
    },
    
    // İdrar test geçmişi sorgusu
    getUrineTestHistoryQuery: (patientId) => {
        return `
            SELECT id, test_tarihi, test_sonuclari 
            FROM test_sonuclari 
            WHERE hasta_id = ${patientId} 
              AND kategori = 'İdrar'
            ORDER BY test_tarihi DESC
        `;
    },
    
    // Anormal sonuç istatistikleri
    getAbnormalStatsQuery: (startDate, endDate) => {
        return `
            SELECT 
                COUNT(*) as toplam_test,
                SUM(CASE WHEN JSON_EXTRACT(test_sonuclari, '$.GLUKOZ') != 'Negatif' THEN 1 ELSE 0 END) as glukoz_pozitif,
                SUM(CASE WHEN JSON_EXTRACT(test_sonuclari, '$.PROTEIN') NOT IN ('Negatif', 'Eser') THEN 1 ELSE 0 END) as protein_pozitif,
                SUM(CASE WHEN JSON_EXTRACT(test_sonuclari, '$.KAN') != 'Negatif' THEN 1 ELSE 0 END) as kan_pozitif
            FROM test_sonuclari 
            WHERE kategori = 'İdrar'
              AND test_tarihi BETWEEN '${startDate}' AND '${endDate}'
        `;
    }
};

// Debug fonksiyonları
function enableDebugMode() {
    console.log('🧪 İdrar Görüntüleme Debug Modu Aktif');
    console.log('📊 Sistem durumu:');
    console.log(`   - Hasta sayısı: ${samplePatients.length}`);
    console.log(`   - Test geçmişi: ${patientTestHistory.length} kayıt`);
    console.log(`   - Aktif hasta: ${currentPatient?.name || 'Yok'}`);
    console.log(`   - Aktif kategori: ${currentCategory}`);
    
    // Global değişkenleri window'a ekle
    window.debugUrineView = {
        patients: samplePatients,
        testHistory: patientTestHistory,
        currentPatient: currentPatient,
        currentResults: currentTestResults,
        normalValues: normalValues,
        urineFields: urineFields,
        ReportingFunctions: ReportingFunctions,
        MySQLHelpers: MySQLHelpers
    };
    
    console.log('🔧 Debug araçları window.debugUrineView içinde mevcut');
}

// Console yardım fonksiyonu
function showConsoleHelp() {
    console.log(`
🧪 İDRAR GÖRÜNTÜLEME KONSOL KOMUTLARI:
• enableDebugMode() - Debug modunu aktif et
• ReportingFunctions.getPatientStats() - Hasta istatistikleri
• ReportingFunctions.getTestStats() - Test istatistikleri
• ReportingFunctions.getUrineAbnormalAnalysis() - İdrar anormal analizi
• showConsoleHelp() - Bu yardımı göster

⌨️  KLAVYE KISAYOLLARI:
• F2 - Hasta arama
• F3 - Hasta modal
• F4 - Rapor oluştur
• Ctrl+P - Yazdır
• Escape - Modal'ları kapat

🔬 İDRAR TEST ALANLARI:
${urineFields.map(field => `• ${field}`).join('\n')}

💡 ÖZELLİKLER:
• Hasta adı yazarak otomatik arama
• Negatif/Pozitif otomatik analiz
• Normal değer aralığı kontrolü
• Test geçmişi görüntüleme
• PDF rapor oluşturma
    `);
}

// Sistem başlatma
function initializeSystem() {
    console.log('🧪 İdrar Sonuç Görüntüleme Sistemi başlatıldı');
    console.log('💡 Yardım için showConsoleHelp() komutunu kullanın');
}

// Sayfa tamamen yüklendiğinde sistem başlat
window.addEventListener('load', function() {
    setTimeout(initializeSystem, 500);
});

// Sayfa kapatılırken verileri kaydet
window.addEventListener('beforeunload', function() {
    saveToLocalStorage();
});

// İlk yükleme mesajı
console.log('🧪 İdrar Sonuç Sistemi hazır');
console.log('💡 Yardım: showConsoleHelp()');