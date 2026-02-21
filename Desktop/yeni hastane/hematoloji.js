// Global değişkenler
let currentPatient = null;
let currentCategory = 'Hematoloji';
let samplePatients = [];
let testResults = {};

// Kategori tanımları
const categories = {
    'Hematoloji': {
        name: 'Hematoloji',
        description: 'Kan sayımı ve kan hücreleri analizi',
        fields: [
            'WBC', 'RBC', 'HGB', 'HCT', 'MCV', 'MCH', 'MCHC',
            'NEU_PERCENT', 'NEU', 'LYM_PERCENT', 'LYM', 'MON_PERCENT', 'MON',
            'EOS_PERCENT', 'EOS', 'BAS_PERCENT', 'BAS', 'PLT', 'MPV', 'PDW', 'PCT'
        ]
    },
    'İdrar': {
        name: 'İdrar Analizi',
        description: 'İdrar kimyasal ve mikroskobik analizi',
        fields: [
            'RENK', 'BERRAKLIK', 'YOGUNLUK', 'PH', 'PROTEIN', 'GLUKOZ',
            'KETON', 'BILIRUBIN', 'UROBILINOGEN', 'NITRIT', 'LÖKOSIT_ESTERAZ',
            'ERITROSIT', 'LÖKOSIT', 'EPITEL', 'SILINDIR', 'KRISTAL', 'BAKTERI'
        ]
    },
    'Solunum Panel': {
        name: 'Solunum Panel',
        description: 'Solunum yolu enfeksiyonları panel analizi',
        fields: [
            'INFLUENZA_A', 'INFLUENZA_B', 'RSV', 'ADENOVIRUS', 'PARAINFLUENZA',
            'MYCOPLASMA', 'CHLAMYDIA', 'LEGIONELLA', 'PNEUMOCOCCUS'
        ]
    },
    'Gaitalar': {
        name: 'Gaita Analizi',
        description: 'Dışkı mikroskobik ve kimyasal analizi',
        fields: [
            'MAKROSKOPIK', 'MIKROSKOPIK', 'ERITROSIT', 'LÖKOSIT', 'PARAZIT',
            'MAYA', 'BAKTERI', 'GIZLI_KAN', 'YAĞ_GLOBULU'
        ]
    }
};

// Normal değer aralıkları
const normalRanges = {
    'WBC': '4.5-11.0 K/μL',
    'RBC': '4.2-5.4 M/μL',
    'HGB': '12.0-16.0 g/dL',
    'HCT': '36.0-46.0 %',
    'MCV': '80-100 fL',
    'MCH': '27-32 pg',
    'MCHC': '32-36 g/dL',
    'PLT': '150-450 K/μL'
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
    generateResultsGrid();
    
    // Varsayılan hasta seç
    selectPatient(samplePatients[0]);
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
    
    // Kategori bilgisini güncelle
    updateCategoryInfo();
    
    // Sonuç alanlarını yeniden oluştur
    generateResultsGrid();
    
    closeAllDropdowns();
    showToast(`${category} kategorisi seçildi!`, 'success');
}

// Kategori bilgisini güncelle
function updateCategoryInfo() {
    const categoryInfo = categories[currentCategory];
    if (categoryInfo) {
        document.querySelector('.category-name').textContent = categoryInfo.name;
        document.querySelector('.category-description').textContent = categoryInfo.description;
        document.querySelector('.results-section h3').textContent = categoryInfo.name;
    }
}

// Sonuç alanlarını oluştur
function generateResultsGrid() {
    const resultsGrid = document.getElementById('resultsGrid');
    const categoryInfo = categories[currentCategory];
    
    if (!categoryInfo) return;
    
    const fields = categoryInfo.fields;
    const columnsCount = 3;
    const fieldsPerColumn = Math.ceil(fields.length / columnsCount);
    
    resultsGrid.innerHTML = '';
    
    for (let col = 0; col < columnsCount; col++) {
        const column = document.createElement('div');
        column.className = 'results-column';
        
        const startIndex = col * fieldsPerColumn;
        const endIndex = Math.min(startIndex + fieldsPerColumn, fields.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const field = fields[i];
            const resultItem = createResultItem(field);
            column.appendChild(resultItem);
        }
        
        resultsGrid.appendChild(column);
    }
}

// Sonuç item oluştur
function createResultItem(fieldId) {
    const div = document.createElement('div');
    div.className = 'result-item';
    
    const label = document.createElement('label');
    label.textContent = formatFieldLabel(fieldId);
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'result-input';
    input.id = fieldId;
    input.placeholder = 'Değer';
    
    // Normal değer aralığı varsa tooltip ekle
    if (normalRanges[fieldId]) {
        input.title = `Normal aralık: ${normalRanges[fieldId]}`;
    }
    
    div.appendChild(label);
    div.appendChild(input);
    
    return div;
}

// Alan adını formatla
function formatFieldLabel(fieldId) {
    // Alt çizgileri boşlukla değiştir ve parantezleri düzenle
    return fieldId.replace(/_/g, ' ').replace(/PERCENT/g, '(%)');
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
    }
    
    // Otomatik kayıt
    saveToLocalStorage();
}

// Değer doğrulama
function validateResultValue(input) {
    const fieldId = input.id;
    const value = parseFloat(input.value);
    
    // Numeric değerler için kontrol
    if (!isNaN(value) && normalRanges[fieldId]) {
        const range = normalRanges[fieldId];
        const [min, max] = extractRange(range);
        
        if (min !== null && max !== null) {
            if (value < min || value > max) {
                input.style.borderColor = '#dc3545';
                input.title = `Anormal değer! Normal aralık: ${range}`;
            } else {
                input.style.borderColor = '#28a745';
                input.title = `Normal değer. Aralık: ${range}`;
            }
        }
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
    const saved = localStorage.getItem(`results_${currentPatient.tc}_${currentCategory}`);
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
    
    // MySQL için veri logla
    console.log('MySQL INSERT Query for new patient:', {
        tc_kimlik: newPatient.tc,
        hasta_adi: newPatient.name,
        cinsiyet: newPatient.gender,
        dogum_tarihi: newPatient.birthDate,
        telefon: newPatient.phone,
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
    
    // MySQL için veri logla
    console.log('MySQL Test Sonucu Kaydı:', resultData);
    
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
                <td>${formatFieldLabel(fieldId)}</td>
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

// Sonuç durumunu belirle
function getResultStatus(fieldId, value) {
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue) && normalRanges[fieldId]) {
        const [min, max] = extractRange(normalRanges[fieldId]);
        
        if (min !== null && max !== null) {
            if (numValue < min) return '↓ Düşük';
            if (numValue > max) return '↑ Yüksek';
            return '✓ Normal';
        }
    }
    
    return '-';
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
    doc.text('Normal Aralık', 120, yPosition);
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
        
        doc.text(formatFieldLabel(fieldId), 20, yPosition);
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
    const fileName = `${currentPatient.name}_${currentCategory}_${new Date().toISOString().split('T')[0]}.pdf`;
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
    if (!currentPatient) return;
    
    const key = `results_${currentPatient.tc}_${currentCategory}`;
    localStorage.setItem(key, JSON.stringify(testResults));
    
    // Hastalar listesini de kaydet
    localStorage.setItem('hematology_patients', JSON.stringify(samplePatients));
}

// LocalStorage'dan yükle
function loadFromLocalStorage() {
    const saved = localStorage.getItem('hematology_patients');
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

// Veri validasyonu
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
    
    // Numerik değer kontrolü
    validateNumericResult: (value, fieldId) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return false;
        
        // Alan tipine göre kontrol
        if (fieldId.includes('PERCENT') || fieldId.includes('%')) {
            return numValue >= 0 && numValue <= 100;
        }
        
        return numValue >= 0;
    }
};

// Rapor fonksiyonları
const ReportingFunctions = {
    // Hasta sonuç geçmişi
    getPatientHistory: (patientTC) => {
        const history = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`results_${patientTC}_`)) {
                const category = key.split('_')[2];
                const data = JSON.parse(localStorage.getItem(key));
                history.push({
                    category: category,
                    results: data,
                    date: new Date().toISOString() // Bu gerçek projede kayıt tarihinden gelecek
                });
            }
        }
        return history;
    },
    
    // Kategori istatistikleri
    getCategoryStats: (category) => {
        let totalTests = 0;
        let abnormalResults = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.includes(`_${category}`)) {
                const data = JSON.parse(localStorage.getItem(key));
                totalTests += Object.keys(data).length;
                
                // Anormal sonuç sayısını hesapla
                Object.keys(data).forEach(fieldId => {
                    const value = parseFloat(data[fieldId]);
                    if (!isNaN(value) && normalRanges[fieldId]) {
                        const [min, max] = extractRange(normalRanges[fieldId]);
                        if (min !== null && max !== null && (value < min || value > max)) {
                            abnormalResults++;
                        }
                    }
                });
            }
        }
        
        return {
            totalTests,
            abnormalResults,
            normalResults: totalTests - abnormalResults,
            abnormalRate: totalTests > 0 ? ((abnormalResults / totalTests) * 100).toFixed(2) : 0
        };
    }
};

// Veri dışa aktarma
function exportData() {
    const exportData = {
        patients: samplePatients,
        categories: categories,
        normalRanges: normalRanges,
        exportDate: new Date().toISOString()
    };
    
    // Tüm test sonuçlarını ekle
    const allResults = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('results_')) {
            allResults[key] = JSON.parse(localStorage.getItem(key));
        }
    }
    exportData.testResults = allResults;
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `hematoloji_verileri_${new Date().toISOString().split('T')[0]}.json`;
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
    
    // Hasta test geçmişi sorgusu
    getPatientTestHistory: (patientId) => {
        return `
            SELECT * FROM test_sonuclari 
            WHERE hasta_id = ${patientId}
            ORDER BY test_tarihi DESC
        `;
    },
    
    // Kategori bazlı istatistik sorgusu
    getCategoryStatistics: (category, startDate, endDate) => {
        return `
            SELECT 
                COUNT(*) as toplam_test,
                COUNT(DISTINCT hasta_id) as hasta_sayisi,
                DATE(test_tarihi) as test_gunu
            FROM test_sonuclari 
            WHERE kategori = '${category}'
            AND test_tarihi BETWEEN '${startDate}' AND '${endDate}'
            GROUP BY DATE(test_tarihi)
            ORDER BY test_tarihi DESC
        `;
    }
};

// Debug fonksiyonları
function enableDebugMode() {
    console.log('🧪 Hematoloji Debug Modu Aktif');
    console.log('📊 Mevcut hasta sayısı:', samplePatients.length);
    console.log('🔬 Aktif kategori:', currentCategory);
    console.log('👤 Seçili hasta:', currentPatient?.name || 'Yok');
    console.log('📝 Girilen sonuç sayısı:', Object.keys(testResults).length);
    
    // Global değişkenleri window'a ekle
    window.debugHematology = {
        patients: samplePatients,
        currentPatient: currentPatient,
        testResults: testResults,
        categories: categories,
        normalRanges: normalRanges,
        ReportingFunctions: ReportingFunctions,
        MySQLHelpers: MySQLHelpers
    };
    
    console.log('🔧 Debug araçları window.debugHematology içinde mevcut');
}

// Otomatik kayıt sistemi
let autoSaveTimer;
function enableAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        saveToLocalStorage();
        console.log('💾 Otomatik kayıt yapıldı');
    }, 5000);
}

// Form değişikliklerinde otomatik kayıt
document.addEventListener('input', function(event) {
    if (event.target.classList.contains('result-input')) {
        enableAutoSave();
    }
});

// Sayfa kapatılırken uyarı
window.addEventListener('beforeunload', function(event) {
    const filledInputs = document.querySelectorAll('.result-input:not([value=""])').length;
    if (filledInputs > 0 && Object.keys(testResults).length > 0) {
        const message = 'Kaydedilmemiş değişiklikler var. Çıkmak istediğinizden emin misiniz?';
        event.returnValue = message;
        return message;
    }
});

// Sayfa yüklendiğinde localStorage'dan veri yükle
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
});

// Console yardım fonksiyonu
function showConsoleHelp() {
    console.log(`
🧪 HEMATOLOJİ KONSOL KOMUTLARI:
• enableDebugMode() - Debug modunu aktif et
• exportData() - Verileri dışa aktar
• ReportingFunctions.getPatientHistory('TC') - Hasta geçmişi
• ReportingFunctions.getCategoryStats('Hematoloji') - Kategori istatistikleri
• showConsoleHelp() - Bu yardımı göster

⌨️  KLAVYE KISAYOLLARI:
• F2 - Hasta TC arama
• F3 - Hasta modal
• F4 - Sonuç önizleme
• Ctrl+S - Kaydet
• Escape - Modal'ları kapat

🔬 MEVCUT KATEGORİLER:
${Object.keys(categories).map(cat => `• ${cat}`).join('\n')}
    `);
}

// İlk yükleme mesajı
console.log('🧪 Hematoloji Sonuç Sistemi yüklendi');
console.log('💡 Yardım için showConsoleHelp() komutunu kullanın');