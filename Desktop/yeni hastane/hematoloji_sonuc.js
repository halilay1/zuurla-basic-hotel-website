// Global değişkenler
let currentPatient = null;
let currentCategory = 'Hematoloji';
let samplePatients = [];
let patientTestHistory = [];
let currentTestResults = {};

// Hematoloji test alanları
const hematologyFields = [
    'WBC', 'RBC', 'HGB', 'HCT', 'MCV', 'MCH', 'MCHC',
    'NEU_PERCENT', 'NEU', 'LYM_PERCENT', 'LYM', 'MON_PERCENT', 'MON',
    'EOS_PERCENT', 'EOS', 'BAS_PERCENT', 'BAS', 'PLT', 'MPV', 'PDW', 'PCT'
];

// Normal değer aralıkları
const normalRanges = {
    'WBC': { min: 4.5, max: 11.0, unit: 'K/μL' },
    'RBC': { min: 4.2, max: 5.4, unit: 'M/μL' },
    'HGB': { min: 12.0, max: 16.0, unit: 'g/dL' },
    'HCT': { min: 36.0, max: 46.0, unit: '%' },
    'MCV': { min: 80, max: 100, unit: 'fL' },
    'MCH': { min: 27, max: 32, unit: 'pg' },
    'MCHC': { min: 32, max: 36, unit: 'g/dL' },
    'PLT': { min: 150, max: 450, unit: 'K/μL' },
    'NEU_PERCENT': { min: 50, max: 70, unit: '%' },
    'LYM_PERCENT': { min: 20, max: 45, unit: '%' },
    'MON_PERCENT': { min: 2, max: 10, unit: '%' },
    'EOS_PERCENT': { min: 1, max: 4, unit: '%' },
    'BAS_PERCENT': { min: 0, max: 1, unit: '%' }
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
            anamnesis: 'Rutin Muayene',
            birthDate: '2022-01-15',
            phone: '05353636363'
        },
        {
            id: 2,
            name: 'Ayşe KAYA',
            tc: '98765432109',
            age: 35,
            gender: 'Kadın',
            anamnesis: 'Kontrol Muayenesi',
            birthDate: '1988-05-20',
            phone: '05321234567'
        },
        {
            id: 3,
            name: 'Mehmet DEMİR',
            tc: '11223344556',
            age: 45,
            gender: 'Erkek',
            anamnesis: 'Rutin Tahlil',
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
            category: 'Hematoloji',
            date: '2024-12-15',
            results: {
                'WBC': '8.5',
                'RBC': '4.8',
                'HGB': '14.2',
                'HCT': '42.0',
                'PLT': '320'
            }
        },
        {
            id: 2,
            patientId: 1,
            patientName: 'Mustafa GÜL',
            category: 'Hematoloji',
            date: '2024-11-20',
            results: {
                'WBC': '7.8',
                'RBC': '4.6',
                'HGB': '13.8',
                'HCT': '40.5',
                'PLT': '295'
            }
        },
        {
            id: 3,
            patientId: 2,
            patientName: 'Ayşe KAYA',
            category: 'Hematoloji',
            date: '2024-12-10',
            results: {
                'WBC': '6.2',
                'RBC': '4.4',
                'HGB': '12.8',
                'HCT': '38.0',
                'PLT': '280'
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
    document.getElementById('categorySelected').textContent = category.toLowerCase();
    
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
        'Hematoloji': 'Kan sayımı ve kan hücreleri analizi sonuçları',
        'İdrar': 'İdrar kimyasal ve mikroskobik analizi sonuçları',
        'Solunum Panel': 'Solunum yolu enfeksiyonları panel analizi',
        'Gaita': 'Dışkı mikroskobik ve kimyasal analizi',
        'Biyokimya': 'Biyokimyasal parametreler analizi'
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
    document.getElementById('patientAnamnesisDisplay').textContent = currentPatient.anamnesis;
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
    document.getElementById('patientAnamnesisDisplay').textContent = '-';
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
    hematologyFields.forEach(fieldId => {
        const displayElement = document.getElementById(`${fieldId}_display`);
        if (displayElement) {
            const value = currentTestResults[fieldId];
            
            if (value) {
                displayElement.textContent = value;
                displayElement.classList.add('has-value');
                
                // Normal/anormal kontrolü
                const status = getResultStatus(fieldId, value);
                displayElement.classList.remove('normal', 'abnormal', 'warning');
                
                if (status === 'abnormal') {
                    displayElement.classList.add('abnormal');
                } else if (status === 'warning') {
                    displayElement.classList.add('warning');
                } else {
                    displayElement.classList.add('normal');
                }
                
                // Status indicator ekle
                const existingIndicator = displayElement.querySelector('.status-indicator');
                if (existingIndicator) {
                    existingIndicator.remove();
                }
                
                const indicator = document.createElement('span');
                indicator.className = `status-indicator ${status}`;
                displayElement.appendChild(indicator);
                
            } else {
                displayElement.textContent = '-';
                displayElement.classList.remove('has-value', 'normal', 'abnormal', 'warning');
            }
        }
    });
}

// Sonuç durumunu belirle
function getResultStatus(fieldId, value) {
    const normalRange = normalRanges[fieldId];
    if (!normalRange) return 'normal';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'normal';
    
    if (numValue < normalRange.min || numValue > normalRange.max) {
        // Çok düşük veya çok yüksekse anormal
        const deviation = Math.abs(numValue - ((normalRange.min + normalRange.max) / 2));
        const range = normalRange.max - normalRange.min;
        
        if (deviation > range * 0.5) {
            return 'abnormal';
        } else {
            return 'warning';
        }
    }
    
    return 'normal';
}

// Test sonuçlarını temizle
function clearTestResults() {
    hematologyFields.forEach(fieldId => {
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
                <p><strong>Anamnez:</strong> ${currentPatient.anamnesis}</p>
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
        const normalRange = normalRanges[fieldId];
        const normalRangeText = normalRange ? 
            `${normalRange.min}-${normalRange.max} ${normalRange.unit}` : '-';
        const status = getResultStatus(fieldId, value);
        const statusText = status === 'normal' ? '✓ Normal' : 
                          status === 'warning' ? '⚠ Sınırda' : '✗ Anormal';
        
        return `
            <tr>
                <td>${fieldId}</td>
                <td>${value}</td>
                <td>${normalRangeText}</td>
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
                    <th>Normal Aralık</th>
                    <th>Durum</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
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
    doc.text('Normal Aralık', 110, yPosition);
    doc.text('Durum', 160, yPosition);
    
    // Çizgi
    doc.line(20, yPosition + 2, 190, yPosition + 2);
    yPosition += 10;
    
    // Sonuçları ekle
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    Object.keys(currentTestResults).forEach(fieldId => {
        const value = currentTestResults[fieldId];
        const normalRange = normalRanges[fieldId];
        const normalRangeText = normalRange ? 
            `${normalRange.min}-${normalRange.max} ${normalRange.unit}` : '-';
        const status = getResultStatus(fieldId, value);
        const statusText = status === 'normal' ? 'Normal' : 
                          status === 'warning' ? 'Sınırda' : 'Anormal';
        
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }
        
        doc.text(fieldId, 20, yPosition);
        doc.text(value, 70, yPosition);
        doc.text(normalRangeText, 110, yPosition);
        doc.text(statusText, 160, yPosition);
        
        yPosition += 8;
    });
    
    // Footer
    doc.setFontSize(8);
    doc.text('Bu rapor Largen Diagnostic tarafından oluşturulmuştur.', 105, 280, { align: 'center' });
    doc.text(`Oluşturma Tarihi: ${new Date().toLocaleString('tr-TR')}`, 105, 290, { align: 'center' });
    
    // PDF'i indir
    const fileName = `${currentPatient.name}_${currentCategory}_${new Date().toISOString().split('T')[0]}.pdf`;
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
    const fileName = `${currentPatient.name}_Test_Gecmisi_${new Date().toISOString().split('T')[0]}.pdf`;
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
        normalRanges: normalRanges
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${currentPatient.name}_${currentCategory}_sonuclari.json`;
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
    localStorage.setItem('hematology_view_patients', JSON.stringify(samplePatients));
    localStorage.setItem('hematology_view_history', JSON.stringify(patientTestHistory));
}

// LocalStorage'dan yükle
function loadFromLocalStorage() {
    const savedPatients = localStorage.getItem('hematology_view_patients');
    if (savedPatients) {
        samplePatients = JSON.parse(savedPatients);
    }
    
    const savedHistory = localStorage.getItem('hematology_view_history');
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
    
    // Anormal sonuç analizi
    getAbnormalResultsAnalysis: () => {
        const abnormalResults = {};
        let totalResults = 0;
        let abnormalCount = 0;
        
        patientTestHistory.forEach(test => {
            Object.keys(test.results).forEach(fieldId => {
                totalResults++;
                const status = getResultStatus(fieldId, test.results[fieldId]);
                
                if (status !== 'normal') {
                    abnormalCount++;
                    abnormalResults[fieldId] = (abnormalResults[fieldId] || 0) + 1;
                }
            });
        });
        
        return {
            totalResults,
            abnormalCount,
            abnormalRate: ((abnormalCount / totalResults) * 100).toFixed(2),
            abnormalByField: abnormalResults
        };
    }
};

// MySQL helper fonksiyonları (database entegrasyonu için)
const MySQLHelpers = {
    // Hasta arama sorgusu
    searchPatientsQuery: (searchTerm) => {
        return `
            SELECT id, tc_kimlik, hasta_adi, yas, cinsiyet, anamnez, telefon 
            FROM hastalar 
            WHERE hasta_adi LIKE '%${searchTerm}%' 
               OR tc_kimlik LIKE '%${searchTerm}%'
            ORDER BY hasta_adi
        `;
    },
    
    // Test sonuçları getirme sorgusu
    getTestResultsQuery: (patientId, category) => {
        return `
            SELECT * FROM test_sonuclari 
            WHERE hasta_id = ${patientId} 
              AND kategori = '${category}'
            ORDER BY test_tarihi DESC 
            LIMIT 1
        `;
    },
    
    // Test geçmişi sorgusu
    getTestHistoryQuery: (patientId) => {
        return `
            SELECT id, kategori, test_tarihi, test_sonuclari 
            FROM test_sonuclari 
            WHERE hasta_id = ${patientId}
            ORDER BY test_tarihi DESC
        `;
    },
    
    // Hasta güncelleme sorgusu
    updatePatientQuery: (patientId, patientData) => {
        return `
            UPDATE hastalar SET
                hasta_adi = '${patientData.name}',
                yas = ${patientData.age},
                cinsiyet = '${patientData.gender}',
                anamnez = '${patientData.anamnesis}',
                guncelleme_tarihi = NOW()
            WHERE id = ${patientId}
        `;
    }
};

// Debug fonksiyonları
function enableDebugMode() {
    console.log('🔬 Hematoloji Görüntüleme Debug Modu Aktif');
    console.log('📊 Sistem durumu:');
    console.log(`   - Hasta sayısı: ${samplePatients.length}`);
    console.log(`   - Test geçmişi: ${patientTestHistory.length} kayıt`);
    console.log(`   - Aktif hasta: ${currentPatient?.name || 'Yok'}`);
    console.log(`   - Aktif kategori: ${currentCategory}`);
    
    // Global değişkenleri window'a ekle
    window.debugHematologyView = {
        patients: samplePatients,
        testHistory: patientTestHistory,
        currentPatient: currentPatient,
        currentResults: currentTestResults,
        normalRanges: normalRanges,
        ReportingFunctions: ReportingFunctions,
        MySQLHelpers: MySQLHelpers
    };
    
    console.log('🔧 Debug araçları window.debugHematologyView içinde mevcut');
}

// Console yardım fonksiyonu
function showConsoleHelp() {
    console.log(`
🔬 HEMATOLOJİ GÖRÜNTÜLEME KONSOL KOMUTLARI:
• enableDebugMode() - Debug modunu aktif et
• ReportingFunctions.getPatientStats() - Hasta istatistikleri
• ReportingFunctions.getTestStats() - Test istatistikleri
• ReportingFunctions.getAbnormalResultsAnalysis() - Anormal sonuç analizi
• showConsoleHelp() - Bu yardımı göster

⌨️  KLAVYE KISAYOLLARI:
• F2 - Hasta arama
• F3 - Hasta modal
• F4 - Rapor oluştur
• Ctrl+P - Yazdır
• Escape - Modal'ları kapat

🔬 ÖZELLİKLER:
• Hasta adı yazarak otomatik arama
• Test sonuçları normal/anormal analizi
• Test geçmişi görüntüleme
• PDF rapor oluşturma
• Kategori bazlı sonuç görüntüleme
    `);
}

// Sistem başlatma
function initializeSystem() {
    console.log('🔬 Hematoloji Sonuç Görüntüleme Sistemi başlatıldı');
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
console.log('🔬 Hematoloji Sonuç Sistemi hazır');
console.log('💡 Yardım: showConsoleHelp()');