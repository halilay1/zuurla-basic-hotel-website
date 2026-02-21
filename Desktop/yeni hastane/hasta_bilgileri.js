// Hasta Bilgileri JavaScript Kodu

// Global değişkenler
let currentPage = 1;
let totalPages = 1;
let patientsPerPage = 10;
let allPatients = [];
let filteredPatients = [];

// Örnek hasta verileri (MySQL entegrasyonu için hazır)
const samplePatients = [
    {
        tcno: "23513351345",
        name: "Mustafa Gül",
        phone: "03453453234",
        email: "mustafa.gul@email.com",
        lastVisit: "03.05.2024",
        balance: "2100",
        address: "Ankara, Türkiye",
        birthDate: "15.06.1985",
        gender: "Erkek"
    }
];

// Sayfa yüklendiğinde çalışacak fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadPatients();
    updateStats();
});

// Sayfa başlatma
function initializePage() {
    console.log('Hasta Bilgileri sayfası yüklendi');
    
    // Enter tuşu ile arama
    document.getElementById('tcArama').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            aramaYap();
        }
    });
    
    document.getElementById('isimArama').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            isimArama();
        }
    });
}

// Hasta verilerini yükle
function loadPatients() {
    // Gerçek uygulamada bu fonksiyon MySQL'den veri çekecek
    allPatients = samplePatients;
    filteredPatients = [...allPatients];
    
    updatePagination();
    displayPatients();
}

// Hastaları tabloda göster
function displayPatients() {
    const tbody = document.getElementById('patientsTableBody');
    tbody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * patientsPerPage;
    const endIndex = Math.min(startIndex + patientsPerPage, filteredPatients.length);
    
    // Aktif hasta verileri
    for (let i = startIndex; i < endIndex; i++) {
        const patient = filteredPatients[i];
        const row = createPatientRow(patient, false);
        tbody.appendChild(row);
    }
    
    // Boş satırlar ekle
    const remainingRows = patientsPerPage - (endIndex - startIndex);
    for (let i = 0; i < remainingRows; i++) {
        const emptyRow = createPatientRow(null, true);
        tbody.appendChild(emptyRow);
    }
}

// Hasta satırı oluştur
function createPatientRow(patient, isEmpty) {
    const row = document.createElement('tr');
    row.className = isEmpty ? 'patient-row empty-row' : 'patient-row';
    
    if (isEmpty) {
        row.innerHTML = `
            <td class="tc-column">-</td>
            <td class="name-column">-</td>
            <td class="date-column">-</td>
            <td class="contact-column">-</td>
            <td class="balance-column">-</td>
            <td class="actions-column">
                <button class="btn-detail" disabled>Detay</button>
                <button class="btn-edit" disabled>Düzenle</button>
            </td>
        `;
    } else {
        row.innerHTML = `
            <td class="tc-column">${patient.tcno}</td>
            <td class="name-column">${patient.name}</td>
            <td class="date-column">${patient.lastVisit}</td>
            <td class="contact-column">${patient.phone}</td>
            <td class="balance-column">${patient.balance} TL</td>
            <td class="actions-column">
                <button class="btn-detail" onclick="hastaDetay('${patient.tcno}')">Detay</button>
                <button class="btn-edit" onclick="hastaEdit('${patient.tcno}')">Düzenle</button>
            </td>
        `;
        
        // Satıra tıklanabilirlik ekle
        row.style.cursor = 'pointer';
        row.addEventListener('click', function(e) {
            if (!e.target.classList.contains('btn-detail') && !e.target.classList.contains('btn-edit')) {
                hastaDetay(patient.tcno);
            }
        });
    }
    
    return row;
}

// TC ile arama yap
function aramaYap() {
    const tcInput = document.getElementById('tcArama');
    const searchTerm = tcInput.value.trim();
    
    if (!searchTerm) {
        // Boşsa tüm hastaları göster
        filteredPatients = [...allPatients];
    } else {
        filteredPatients = allPatients.filter(patient => 
            patient.tcno.includes(searchTerm)
        );
    }
    
    currentPage = 1;
    updatePagination();
    displayPatients();
    updateStats();
    
    // Arama sonucunu göster
    showSearchResult(filteredPatients.length);
}

// İsim ile arama yap
function isimArama() {
    const nameInput = document.getElementById('isimArama');
    const searchTerm = nameInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        // Boşsa tüm hastaları göster
        filteredPatients = [...allPatients];
    } else {
        filteredPatients = allPatients.filter(patient => 
            patient.name.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    updatePagination();
    displayPatients();
    updateStats();
    
    // Arama sonucunu göster
    showSearchResult(filteredPatients.length);
}

// Arama sonucunu göster
function showSearchResult(count) {
    // Geçici bildirim göster
    const notification = document.createElement('div');
    notification.className = count > 0 ? 'success-message' : 'error-message';
    notification.textContent = count > 0 ? 
        `${count} hasta bulundu.` : 
        'Arama kriterinize uygun hasta bulunamadı.';
    
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(notification, mainContent.firstChild);
    
    // 3 saniye sonra kaldır
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Sayfalama güncelle
function updatePagination() {
    totalPages = Math.max(1, Math.ceil(filteredPatients.length / patientsPerPage));
    currentPage = Math.min(currentPage, totalPages);
    
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    
    // Buton durumlarını güncelle
    document.getElementById('prevBtn').disabled = currentPage <= 1;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages;
}

// Önceki sayfa
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        updatePagination();
        displayPatients();
    }
}

// Sonraki sayfa
function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
        displayPatients();
    }
}

// İstatistikleri güncelle
function updateStats() {
    const totalPatients = filteredPatients.length;
    const totalBalance = filteredPatients.reduce((sum, patient) => {
        return sum + parseFloat(patient.balance || 0);
    }, 0);
    
    // Bu ay muayene sayısı (örnek hesaplama)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlyPatients = filteredPatients.filter(patient => {
        if (!patient.lastVisit) return false;
        const [day, month, year] = patient.lastVisit.split('.');
        return parseInt(month) === currentMonth && parseInt(year) === currentYear;
    }).length;
    
    document.getElementById('totalPatients').textContent = totalPatients;
    document.getElementById('totalBalance').textContent = `${totalBalance.toLocaleString('tr-TR')} TL`;
    document.getElementById('monthlyPatients').textContent = monthlyPatients;
}

// Hasta detayını göster
function hastaDetay(tcno) {
    const patient = allPatients.find(p => p.tcno === tcno);
    
    if (!patient) {
        alert('Hasta bulunamadı!');
        return;
    }
    
    const modalContent = document.getElementById('patientDetailContent');
    modalContent.innerHTML = `
        <div style="padding: 20px;">
            <h3 style="color: #333; margin-bottom: 20px; border-bottom: 2px solid #e53e3e; padding-bottom: 10px;">
                ${patient.name}
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                <div>
                    <h4 style="color: #666; margin-bottom: 10px;">Kişisel Bilgiler</h4>
                    <p><strong>TC Kimlik No:</strong> ${patient.tcno}</p>
                    <p><strong>Doğum Tarihi:</strong> ${patient.birthDate || 'Belirtilmemiş'}</p>
                    <p><strong>Cinsiyet:</strong> ${patient.gender || 'Belirtilmemiş'}</p>
                </div>
                <div>
                    <h4 style="color: #666; margin-bottom: 10px;">İletişim Bilgileri</h4>
                    <p><strong>Telefon:</strong> ${patient.phone}</p>
                    <p><strong>E-posta:</strong> ${patient.email || 'Belirtilmemiş'}</p>
                    <p><strong>Adres:</strong> ${patient.address || 'Belirtilmemiş'}</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h4 style="color: #666; margin-bottom: 10px;">Muayene Bilgileri</h4>
                    <p><strong>Son Muayene:</strong> ${patient.lastVisit}</p>
                    <p><strong>Bakiye:</strong> ${patient.balance} TL</p>
                </div>
                <div>
                    <h4 style="color: #666; margin-bottom: 10px;">İşlemler</h4>
                    <button class="btn-primary" onclick="muayeneGecmisi('${patient.tcno}')" style="margin-right: 10px; margin-bottom: 10px;">
                        Muayene Geçmişi
                    </button>
                    <button class="btn-secondary" onclick="randevuVer('${patient.tcno}')" style="margin-bottom: 10px;">
                        Randevu Ver
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('patientDetailModal').style.display = 'block';
}

// Hasta düzenle
function hastaEdit(tcno) {
    // Bu fonksiyon hasta düzenleme sayfasına yönlendirecek
    alert(`Hasta düzenleme sayfası: ${tcno} - Bu özellik geliştirilecek`);
    // Gerçek uygulamada: window.location.href = `hasta-duzenle.html?tc=${tcno}`;
}

// Modal kapat
function closeModal() {
    document.getElementById('patientDetailModal').style.display = 'none';
}

// Modal dışına tıklanınca kapat
window.onclick = function(event) {
    const modal = document.getElementById('patientDetailModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Yeni hasta ekle
function yeniHastaEkle() {
    // Hasta ekleme sayfasına yönlendir
    alert('Yeni hasta ekleme sayfasına yönlendirilecek - Bu özellik geliştirilecek');
    // Gerçek uygulamada: window.location.href = 'yeni-hasta.html';
}

// Excel'e aktar
function exportToExcel() {
    alert('Excel export özelliği geliştirilecek');
    // Gerçek uygulamada Excel export işlemi burada yapılacak
}

// Rapor oluştur
function raporOlustur() {
    alert('Rapor oluşturma özelliği geliştirilecek');
    // Gerçek uygulamada PDF rapor oluşturma işlemi burada yapılacak
}

// Muayene geçmişi
function muayeneGecmisi(tcno) {
    alert(`${tcno} için muayene geçmişi - Bu özellik geliştirilecek`);
    closeModal();
}

// Randevu ver
function randevuVer(tcno) {
    alert(`${tcno} için randevu verme - Bu özellik geliştirilecek`);
    closeModal();
}

// Arama kutularını temizle
function clearSearch() {
    document.getElementById('tcArama').value = '';
    document.getElementById('isimArama').value = '';
    filteredPatients = [...allPatients];
    currentPage = 1;
    updatePagination();
    displayPatients();
    updateStats();
}

// Veri yenileme
function refreshData() {
    loadPatients();
    updateStats();
    showNotification('Veriler yenilendi!', 'success');
}

// Bildirim göster
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = type === 'success' ? 'success-message' : 'error-message';
    notification.textContent = message;
    
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(notification, mainContent.firstChild);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// MySQL entegrasyonu için hazır fonksiyonlar

// Veritabanından hasta verilerini çek
async function fetchPatientsFromDB() {
    try {
        // Gerçek uygulamada bu API çağrısı yapılacak
        // const response = await fetch('/api/patients');
        // const patients = await response.json();
        // return patients;
        
        // Şimdilik örnek veri döndür
        return samplePatients;
    } catch (error) {
        console.error('Hasta verileri yüklenirken hata:', error);
        showNotification('Veriler yüklenirken hata oluştu!', 'error');
        return [];
    }
}

// Veritabanına hasta kaydet
async function savePatientToDB(patientData) {
    try {
        // Gerçek uygulamada bu API çağrısı yapılacak
        // const response = await fetch('/api/patients', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(patientData)
        // });
        // return await response.json();
        
        console.log('Hasta kaydedilecek:', patientData);
        return { success: true };
    } catch (error) {
        console.error('Hasta kaydedilirken hata:', error);
        showNotification('Hasta kaydedilirken hata oluştu!', 'error');
        return { success: false };
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + F ile arama odağı
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('tcArama').focus();
    }
    
    // ESC ile modal kapat
    if (e.key === 'Escape') {
        closeModal();
    }
});

console.log('Hasta Bilgileri JavaScript yüklendi');