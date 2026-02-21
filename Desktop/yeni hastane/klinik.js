// Sample data - Database ile değiştirilecek
let doctorsData = [
    {
        id: 1,
        title: 'Uzman Doktor',
        name: 'Ali Seçkin Yalçın',
        department: 'Kardiyoloji',
        phone: '+90 532 123 45 67',
        email: 'ali.yalcin@largen.com',
        address: 'Merkez Mah. Hastane Cad. No:15 Mersin',
        specialty: 'Kalp Cerrahisi',
        experience: 8,
        license: 'TR123456789'
    },
    {
        id: 2,
        title: 'Dr.',
        name: 'Ayşe Demir',
        department: 'Dahiliye',
        phone: '+90 532 987 65 43',
        email: 'ayse.demir@largen.com',
        address: 'Çankaya Mah. Sağlık Sok. No:8 Mersin',
        specialty: 'İç Hastalıkları',
        experience: 12,
        license: 'TR987654321'
    },
    {
        id: 3,
        title: 'Prof. Dr.',
        name: 'Mehmet Özkan',
        department: 'Nöroloji',
        phone: '+90 532 555 44 33',
        email: 'mehmet.ozkan@largen.com',
        address: 'Akdeniz Mah. Üniversite Cad. No:25 Mersin',
        specialty: 'Beyin Cerrahisi',
        experience: 15,
        license: 'TR555444333'
    }
];

let departmentsData = [
    {
        id: 1,
        name: 'Kardiyoloji',
        description: 'Kalp ve damar hastalıkları',
        floor: '2. Kat',
        phone: '+90 324 123 45 67'
    },
    {
        id: 2,
        name: 'Dahiliye',
        description: 'İç hastalıkları ve genel tıp',
        floor: '1. Kat',
        phone: '+90 324 123 45 68'
    },
    {
        id: 3,
        name: 'Nöroloji',
        description: 'Sinir sistemi hastalıkları',
        floor: '3. Kat',
        phone: '+90 324 123 45 69'
    },
    {
        id: 4,
        name: 'Ortopedi',
        description: 'Kemik ve eklem hastalıkları',
        floor: '2. Kat',
        phone: '+90 324 123 45 70'
    },
    {
        id: 5,
        name: 'Göz Hastalıkları',
        description: 'Göz muayenesi ve tedavisi',
        floor: '1. Kat',
        phone: '+90 324 123 45 71'
    }
];

// DOM yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    loadDoctors();
    loadDepartments();
    populateDepartmentSelects();
    setupEventListeners();
});

// Event listener'ları kurma
function setupEventListeners() {
    // Form submit event'leri
    document.getElementById('addDoctorForm').addEventListener('submit', handleAddDoctor);
    document.getElementById('editDoctorForm').addEventListener('submit', handleEditDoctor);
    document.getElementById('addDepartmentForm').addEventListener('submit', handleAddDepartment);
    
    // Modal dışına tıklama ile kapama
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Doktor listesini yükleme
function loadDoctors() {
    const doctorsGrid = document.getElementById('doctorsGrid');
    doctorsGrid.innerHTML = '';
    
    if (doctorsData.length === 0) {
        doctorsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👨‍⚕️</div>
                <div class="empty-state-title">Henüz doktor eklenmemiş</div>
                <div class="empty-state-description">İlk doktoru eklemek için "Yeni Doktor Ekle" butonuna tıklayın</div>
            </div>
        `;
        return;
    }
    
    doctorsData.forEach(doctor => {
        const doctorCard = createDoctorCard(doctor);
        doctorsGrid.appendChild(doctorCard);
    });
}

// Doktor kartı oluşturma
function createDoctorCard(doctor) {
    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.onclick = () => showDoctorDetail(doctor.id);
    
    card.innerHTML = `
        <div class="doctor-header">
            <div>
                <div class="doctor-title">${doctor.title}</div>
                <h3 class="doctor-name">${doctor.name}</h3>
            </div>
            <div class="doctor-actions" onclick="event.stopPropagation()">
                <button class="btn-small btn-edit-small" onclick="editDoctor(${doctor.id})" title="Düzenle">✏️</button>
                <button class="btn-small btn-delete-small" onclick="deleteDoctor(${doctor.id})" title="Sil">🗑️</button>
            </div>
        </div>
        <div class="doctor-info">
            <div class="doctor-info-item">
                <strong>Telefon:</strong> ${doctor.phone || 'Belirtilmemiş'}
            </div>
            <div class="doctor-info-item">
                <strong>E-posta:</strong> ${doctor.email || 'Belirtilmemiş'}
            </div>
            <div class="doctor-info-item">
                <strong>Uzmanlık:</strong> ${doctor.specialty || 'Belirtilmemiş'}
            </div>
            <div class="doctor-info-item">
                <strong>Deneyim:</strong> ${doctor.experience || 0} yıl
            </div>
        </div>
        <div class="doctor-department">${doctor.department}</div>
    `;
    
    return card;
}

// Bölüm listesini yükleme
function loadDepartments() {
    const departmentsGrid = document.getElementById('departmentsGrid');
    departmentsGrid.innerHTML = '';
    
    departmentsData.forEach(department => {
        const departmentCard = createDepartmentCard(department);
        departmentsGrid.appendChild(departmentCard);
    });
}

// Bölüm kartı oluşturma
function createDepartmentCard(department) {
    const doctorCount = doctorsData.filter(doctor => doctor.department === department.name).length;
    
    const card = document.createElement('div');
    card.className = 'department-card';
    
    card.innerHTML = `
        <div class="department-name">${department.name}</div>
        <div class="department-doctor-count">${doctorCount} Doktor</div>
        <div class="department-info">
            <div>${department.floor} • ${department.phone}</div>
            <div>${department.description}</div>
        </div>
    `;
    
    return card;
}

// Bölüm seçeneklerini doldurma
function populateDepartmentSelects() {
    const selects = [
        document.getElementById('doctorDepartment'),
        document.getElementById('editDoctorDepartment'),
        document.getElementById('departmentFilter')
    ];
    
    selects.forEach(select => {
        if (select.id === 'departmentFilter') {
            // Filter için "Tüm Bölümler" seçeneğini koru
            select.innerHTML = '<option value="">Tüm Bölümler</option>';
        } else {
            // Form select'leri için temizle
            select.innerHTML = '<option value="">Bölüm Seçin</option>';
        }
        
        departmentsData.forEach(department => {
            const option = document.createElement('option');
            option.value = department.name;
            option.textContent = department.name;
            select.appendChild(option);
        });
    });
}

// Modal açma
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Modal kapama
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Form'ları temizle
    const forms = document.querySelectorAll(`#${modalId} form`);
    forms.forEach(form => form.reset());
}

// Yeni doktor ekleme
function handleAddDoctor(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const newDoctor = {
        id: Date.now(), // Geçici ID
        title: formData.get('title'),
        name: formData.get('name'),
        department: formData.get('department'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        specialty: formData.get('specialty'),
        experience: parseInt(formData.get('experience')) || 0,
        license: formData.get('license')
    };
    
    // Validasyon
    const errors = validateDoctorForm(formData);
    if (errors.length > 0) {
        showMessage(errors.join('<br>'), 'error');
        return;
    }
    
    // Database'e ekle (şimdilik array'e ekle)
    doctorsData.push(newDoctor);
    
    // Listeleri güncelle
    loadDoctors();
    loadDepartments();
    
    // Modal'ı kapat
    closeModal('addDoctorModal');
    
    // Başarı mesajı
    showMessage('Yeni doktor başarıyla eklendi!', 'success');
}

// Doktor düzenleme
function editDoctor(doctorId) {
    const doctor = doctorsData.find(d => d.id === doctorId);
    if (!doctor) return;
    
    // Form'u doldur
    document.getElementById('editDoctorId').value = doctor.id;
    document.getElementById('editDoctorTitle').value = doctor.title;
    document.getElementById('editDoctorName').value = doctor.name;
    document.getElementById('editDoctorDepartment').value = doctor.department;
    document.getElementById('editDoctorPhone').value = doctor.phone || '';
    document.getElementById('editDoctorEmail').value = doctor.email || '';
    document.getElementById('editDoctorAddress').value = doctor.address || '';
    document.getElementById('editDoctorSpecialty').value = doctor.specialty || '';
    document.getElementById('editDoctorExperience').value = doctor.experience || '';
    document.getElementById('editDoctorLicense').value = doctor.license || '';
    
    // Modal'ı aç
    openModal('editDoctorModal');
}

// Doktor düzenleme form işleme
function handleEditDoctor(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const doctorId = parseInt(formData.get('id'));
    
    const doctorIndex = doctorsData.findIndex(d => d.id === doctorId);
    if (doctorIndex === -1) return;
    
    // Validasyon
    const errors = validateDoctorForm(formData);
    if (errors.length > 0) {
        showMessage(errors.join('<br>'), 'error');
        return;
    }
    
    // Doktor bilgilerini güncelle
    doctorsData[doctorIndex] = {
        id: doctorId,
        title: formData.get('title'),
        name: formData.get('name'),
        department: formData.get('department'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        specialty: formData.get('specialty'),
        experience: parseInt(formData.get('experience')) || 0,
        license: formData.get('license')
    };
    
    // Listeleri güncelle
    loadDoctors();
    loadDepartments();
    
    // Modal'ı kapat
    closeModal('editDoctorModal');
    
    // Başarı mesajı
    showMessage('Doktor bilgileri başarıyla güncellendi!', 'success');
}

// Doktor silme
function deleteDoctor(doctorId) {
    const doctor = doctorsData.find(d => d.id === doctorId);
    if (!doctor) return;
    
    if (confirm(`${doctor.name} isimli doktoru silmek istediğinizden emin misiniz?`)) {
        const doctorIndex = doctorsData.findIndex(d => d.id === doctorId);
        if (doctorIndex !== -1) {
            doctorsData.splice(doctorIndex, 1);
            loadDoctors();
            loadDepartments();
            showMessage('Doktor başarıyla silindi!', 'success');
        }
    }
}

// Doktor detaylarını gösterme
function showDoctorDetail(doctorId) {
    const doctor = doctorsData.find(d => d.id === doctorId);
    if (!doctor) return;
    
    document.getElementById('doctorDetailTitle').textContent = `${doctor.title} ${doctor.name}`;
    
    const content = document.getElementById('doctorDetailContent');
    content.innerHTML = `
        <div class="doctor-detail-info">
            <div class="detail-section">
                <h4>Kişisel Bilgiler</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Ad Soyad</div>
                        <div class="detail-value">${doctor.name}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Unvan</div>
                        <div class="detail-value">${doctor.title}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Bölüm</div>
                        <div class="detail-value">${doctor.department}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Uzmanlık Alanı</div>
                        <div class="detail-value">${doctor.specialty || 'Belirtilmemiş'}</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>İletişim Bilgileri</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Telefon</div>
                        <div class="detail-value">${doctor.phone || 'Belirtilmemiş'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">E-posta</div>
                        <div class="detail-value">${doctor.email || 'Belirtilmemiş'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Adres</div>
                        <div class="detail-value">${doctor.address || 'Belirtilmemiş'}</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Mesleki Bilgiler</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Deneyim</div>
                        <div class="detail-value">${doctor.experience || 0} yıl</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Lisans No</div>
                        <div class="detail-value">${doctor.license || 'Belirtilmemiş'}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    openModal('doctorDetailModal');
}

// Yeni bölüm ekleme
function handleAddDepartment(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const newDepartment = {
        id: Date.now(),
        name: formData.get('name'),
        description: formData.get('description'),
        floor: formData.get('floor'),
        phone: formData.get('phone')
    };
    
    // Aynı isim kontrolü
    if (departmentsData.find(dept => dept.name.toLowerCase() === newDepartment.name.toLowerCase())) {
        showMessage('Bu bölüm adı zaten mevcut!', 'error');
        return;
    }
    
    // Database'e ekle (şimdilik array'e ekle)
    departmentsData.push(newDepartment);
    
    // Listeleri güncelle
    loadDepartments();
    populateDepartmentSelects();
    
    // Modal'ı kapat
    closeModal('addDepartmentModal');
    
    // Başarı mesajı
    showMessage('Yeni bölüm başarıyla eklendi!', 'success');
}

// Doktor arama
function searchDoctors() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const doctorCards = document.querySelectorAll('.doctor-card');
    
    doctorCards.forEach(card => {
        const doctorName = card.querySelector('.doctor-name').textContent.toLowerCase();
        const department = card.querySelector('.doctor-department').textContent.toLowerCase();
        
        if (doctorName.includes(searchTerm) || department.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Bölüme göre filtreleme
function filterByDepartment() {
    const selectedDepartment = document.getElementById('departmentFilter').value;
    const doctorCards = document.querySelectorAll('.doctor-card');
    
    doctorCards.forEach(card => {
        const department = card.querySelector('.doctor-department').textContent;
        
        if (selectedDepartment === '' || department === selectedDepartment) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Form validasyonu
function validateDoctorForm(formData) {
    const errors = [];
    
    if (!formData.get('name') || formData.get('name').trim().length < 2) {
        errors.push('Ad soyad en az 2 karakter olmalıdır.');
    }
    
    if (!formData.get('title')) {
        errors.push('Unvan seçilmelidir.');
    }
    
    if (!formData.get('department')) {
        errors.push('Bölüm seçilmelidir.');
    }
    
    const email = formData.get('email');
    if (email && !isValidEmail(email)) {
        errors.push('Geçerli bir e-posta adresi giriniz.');
    }
    
    const phone = formData.get('phone');
    if (phone && !isValidPhone(phone)) {
        errors.push('Geçerli bir telefon numarası giriniz.');
    }
    
    return errors;
}

// E-posta validasyonu
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Telefon validasyonu
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

// Mesaj gösterme
function showMessage(message, type) {
    // Önceki mesajları temizle
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Yeni mesaj oluştur
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.innerHTML = message;
    
    // Container'ın başına ekle
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    // 5 saniye sonra otomatik kaldır
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Doktor listesini export etme
function exportDoctorList() {
    const headers = ['Unvan', 'Ad Soyad', 'Bölüm', 'Telefon', 'E-posta', 'Uzmanlık', 'Deneyim', 'Lisans No'];
    const rows = doctorsData.map(doctor => [
        doctor.title,
        doctor.name,
        doctor.department,
        doctor.phone || '',
        doctor.email || '',
        doctor.specialty || '',
        doctor.experience || 0,
        doctor.license || ''
    ]);
    
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(field => `"${field}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'doktor_listesi.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Klavye kısayolları
document.addEventListener('keydown', function(event) {
    // Ctrl+N: Yeni doktor ekleme
    if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        openModal('addDoctorModal');
    }
    
    // Ctrl+D: Yeni bölüm ekleme
    if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        openModal('addDepartmentModal');
    }
    
    // ESC: Modal kapatma
    if (event.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal[style*="block"]');
        openModals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }
});

// Database işlemleri için placeholder fonksiyonlar
// Bu fonksiyonlar database entegrasyonu sırasında geliştirilecek

// Veritabanından doktor verilerini getirme
async function fetchDoctorsData() {
    try {
        // const response = await fetch('/api/doctors');
        // const data = await response.json();
        // return data;
        
        return doctorsData;
    } catch (error) {
        console.error('Doktor verileri alınırken hata:', error);
        showMessage('Doktor verileri yüklenirken hata oluştu.', 'error');
        return [];
    }
}

// Veritabanından bölüm verilerini getirme
async function fetchDepartmentsData() {
    try {
        // const response = await fetch('/api/departments');
        // const data = await response.json();
        // return data;
        
        return departmentsData;
    } catch (error) {
        console.error('Bölüm verileri alınırken hata:', error);
        showMessage('Bölüm verileri yüklenirken hata oluştu.', 'error');
        return [];
    }
}

// Veritabanına yeni doktor ekleme
async function saveDoctorToDatabase(doctor) {
    try {
        // const response = await fetch('/api/doctors', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(doctor)
        // });
        // 
        // if (!response.ok) {
        //     throw new Error('Doktor eklenirken hata oluştu');
        // }
        // 
        // return await response.json();
        
        console.log('Doktor veritabanına eklendi:', doctor);
        return { success: true };
    } catch (error) {
        console.error('Doktor eklenirken hata:', error);
        throw error;
    }
}

// Veritabanına yeni bölüm ekleme
async function saveDepartmentToDatabase(department) {
    try {
        // const response = await fetch('/api/departments', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(department)
        // });
        // 
        // if (!response.ok) {
        //     throw new Error('Bölüm eklenirken hata oluştu');
        // }
        // 
        // return await response.json();
        
        console.log('Bölüm veritabanına eklendi:', department);
        return { success: true };
    } catch (error) {
        console.error('Bölüm eklenirken hata:', error);
        throw error;
    }
}

// Sayfa yüklendiğinde istatistikleri göster
window.addEventListener('load', function() {
    showStatistics();
});

// İstatistikleri gösterme
function showStatistics() {
    const totalDoctors = doctorsData.length;
    const totalDepartments = departmentsData.length;
    
    console.log(`Toplam ${totalDoctors} doktor, ${totalDepartments} bölümde görev yapıyor.`);
    
    // Bölüm başına doktor sayısı
    const departmentStats = {};
    departmentsData.forEach(dept => {
        departmentStats[dept.name] = doctorsData.filter(doc => doc.department === dept.name).length;
    });
    
    console.log('Bölüm başına doktor dağılımı:', departmentStats);
}