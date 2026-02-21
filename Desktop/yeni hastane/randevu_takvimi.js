// Global değişkenler
let currentDate = new Date();
let selectedDate = null;
let appointments = [];

// Türkçe ay ve gün isimleri
const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const weekDays = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

// Sayfa yüklendiğinde çalışacak
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    loadSampleAppointments();
    setupEventListeners();
    generateCalendar();
});

// Event listener'ları kurma
function setupEventListeners() {
    // Modal dışına tıklandığında kapat
    window.addEventListener('click', function(event) {
        const appointmentModal = document.getElementById('appointmentModal');
        const cancelModal = document.getElementById('cancelModal');
        
        if (event.target === appointmentModal) {
            closeModal();
        }
        if (event.target === cancelModal) {
            closeCancelModal();
        }
    });

    // Telefon numarası formatla
    document.getElementById('patientPhone').addEventListener('input', formatPhone);
    
    // Enter tuşu ile kaydet
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && document.getElementById('appointmentModal').style.display === 'block') {
            event.preventDefault();
            saveAppointment();
        }
        if (event.key === 'Escape') {
            closeModal();
            closeCancelModal();
        }
    });
}

// Takvimi başlat
function initializeCalendar() {
    updateMonthDisplay();
    // Bugünü seç
    selectedDate = new Date();
    updateSelectedDateDisplay();
}

// Örnek randevuları yükle
function loadSampleAppointments() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    appointments = [
        {
            id: 1,
            date: formatDateForStorage(today),
            time: '11:30',
            patientName: 'Mustafa Gül',
            phone: '05353636363',
            type: 'Muayene',
            notes: 'Kontrol muayenesi'
        },
        {
            id: 2,
            date: formatDateForStorage(today),
            time: '12:30',
            patientName: 'Halil Ay',
            phone: '05321234567',
            type: 'Muayene',
            notes: 'İlk muayene'
        },
        {
            id: 3,
            date: formatDateForStorage(today),
            time: '13:30',
            patientName: 'Helin Ay',
            phone: '05329876543',
            type: 'Aşı',
            notes: 'Grip aşısı'
        }
    ];
    
    displayAppointments();
}

// Takvim oluştur
function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Ayın ilk günü
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Hafta başlangıcını pazartesi yap
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysToSubtract);
    
    // 6 hafta (42 gün) göster
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayElement = createDayElement(date, month);
        calendarGrid.appendChild(dayElement);
    }
    
    updateMonthDisplay();
}

// Gün elementi oluştur
function createDayElement(date, currentMonth) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    
    const dateString = formatDateForStorage(date);
    const dayAppointments = getAppointmentsForDate(dateString);
    
    // CSS sınıfları ekle
    if (date.getMonth() !== currentMonth) {
        dayDiv.classList.add('other-month');
    }
    
    if (isToday(date)) {
        dayDiv.classList.add('today');
    }
    
    if (selectedDate && isSameDate(date, selectedDate)) {
        dayDiv.classList.add('selected');
    }
    
    // Gün numarası
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = date.getDate();
    dayDiv.appendChild(dayNumber);
    
    // Randevu sayısı
    if (dayAppointments.length > 0) {
        const countBadge = document.createElement('div');
        countBadge.className = 'appointment-count';
        countBadge.textContent = dayAppointments.length;
        dayDiv.appendChild(countBadge);
        
        // Randevu göstergeleri
        const indicators = document.createElement('div');
        indicators.className = 'appointment-indicators';
        for (let i = 0; i < Math.min(dayAppointments.length, 3); i++) {
            const dot = document.createElement('div');
            dot.className = 'appointment-dot';
            indicators.appendChild(dot);
        }
        dayDiv.appendChild(indicators);
    }
    
    // Click event
    dayDiv.addEventListener('click', () => selectDate(date));
    
    return dayDiv;
}

// Tarih seçme
function selectDate(date) {
    selectedDate = new Date(date);
    updateSelectedDateDisplay();
    displayAppointments();
    generateCalendar(); // Seçili günü vurgula
}

// Seçili tarih görüntüsünü güncelle
function updateSelectedDateDisplay() {
    const titleElement = document.getElementById('selectedDateTitle');
    if (selectedDate) {
        const dayName = weekDays[selectedDate.getDay()];
        const dateStr = selectedDate.toLocaleDateString('tr-TR');
        titleElement.textContent = `${dayName}, ${dateStr}`;
    } else {
        titleElement.textContent = 'Tarih Seçiniz';
    }
}

// Ay görüntüsünü güncelle
function updateMonthDisplay() {
    const monthElement = document.getElementById('currentMonth');
    monthElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
}

// Önceki ay
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar();
}

// Sonraki ay
function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar();
}

// Randevuları görüntüle
function displayAppointments() {
    const appointmentsList = document.getElementById('appointmentsList');
    
    if (!selectedDate) {
        appointmentsList.innerHTML = '<div class="no-appointments"><p>Henüz bir tarih seçilmedi</p></div>';
        return;
    }
    
    const dateString = formatDateForStorage(selectedDate);
    const dayAppointments = getAppointmentsForDate(dateString);
    
    if (dayAppointments.length === 0) {
        appointmentsList.innerHTML = `
            <div class="no-appointments">
                <p>Bu tarihte randevu bulunmuyor</p>
                <button class="btn btn-primary" onclick="openNewAppointmentModal()">Yeni Randevu Ekle</button>
            </div>
        `;
        return;
    }
    
    // Randevuları saate göre sırala
    dayAppointments.sort((a, b) => a.time.localeCompare(b.time));
    
    appointmentsList.innerHTML = dayAppointments.map(appointment => 
        createAppointmentHTML(appointment)
    ).join('');
}

// Randevu HTML'i oluştur
function createAppointmentHTML(appointment) {
    return `
        <div class="appointment-item" data-id="${appointment.id}">
            <div class="appointment-time">${appointment.time}</div>
            <div class="appointment-patient">${appointment.patientName}</div>
            <div class="appointment-type">${appointment.type}</div>
            <div class="appointment-phone">📞 ${appointment.phone}</div>
            ${appointment.notes ? `<div class="appointment-notes">💬 ${appointment.notes}</div>` : ''}
            <div class="appointment-actions">
                <button class="btn btn-small btn-edit" onclick="editAppointment(${appointment.id})">Düzenle</button>
                <button class="btn btn-small btn-delete" onclick="deleteAppointment(${appointment.id})">Sil</button>
            </div>
        </div>
    `;
}

// Yeni randevu modal aç
function openNewAppointmentModal() {
    const modal = document.getElementById('appointmentModal');
    modal.style.display = 'block';
    
    // Form temizle
    clearAppointmentForm();
    
    // Seçili tarihi set et
    if (selectedDate) {
        document.getElementById('appointmentDate').value = formatDateForInput(selectedDate);
    }
    
    // İlk input'a focus ver
    document.getElementById('patientName').focus();
}

// Randevu modalını kapat
function closeModal() {
    document.getElementById('appointmentModal').style.display = 'none';
}

// İptal modalını kapat
function closeCancelModal() {
    document.getElementById('cancelModal').style.display = 'none';
}

// Form temizle
function clearAppointmentForm() {
    document.getElementById('patientName').value = '';
    document.getElementById('patientPhone').value = '';
    document.getElementById('appointmentDate').value = '';
    document.getElementById('appointmentTime').value = '';
    document.getElementById('appointmentType').value = '';
    document.getElementById('appointmentNotes').value = '';
}

// Randevu kaydet
function saveAppointment() {
    const patientName = document.getElementById('patientName').value.trim();
    const patientPhone = document.getElementById('patientPhone').value.trim();
    const appointmentDate = document.getElementById('appointmentDate').value;
    const appointmentTime = document.getElementById('appointmentTime').value;
    const appointmentType = document.getElementById('appointmentType').value;
    const appointmentNotes = document.getElementById('appointmentNotes').value.trim();
    
    // Validation
    if (!patientName || !patientPhone || !appointmentDate || !appointmentTime || !appointmentType) {
        showToast('Lütfen tüm zorunlu alanları doldurun!', 'error');
        return;
    }
    
    // Telefon format kontrolü
    if (!isValidPhone(patientPhone)) {
        showToast('Lütfen geçerli bir telefon numarası girin!', 'error');
        return;
    }
    
    // Çakışma kontrolü
    if (hasTimeConflict(appointmentDate, appointmentTime)) {
        if (!confirm('Bu saatte başka bir randevu var. Yine de kaydetmek istiyor musunuz?')) {
            return;
        }
    }
    
    // Yeni randevu oluştur
    const newAppointment = {
        id: Date.now(), // Basit ID üretimi
        date: appointmentDate,
        time: appointmentTime,
        patientName: patientName,
        phone: patientPhone,
        type: appointmentType,
        notes: appointmentNotes
    };
    
    appointments.push(newAppointment);
    
    // Modal kapat
    closeModal();
    
    // Seçili tarihi güncelle
    selectedDate = new Date(appointmentDate);
    updateSelectedDateDisplay();
    
    // Görüntüleri güncelle
    displayAppointments();
    generateCalendar();
    
    showToast('Randevu başarıyla kaydedildi!', 'success');
    
    // MySQL için hazır veri (console'da görünecek)
    console.log('MySQL INSERT için veri:', {
        hasta_adi: patientName,
        telefon: patientPhone,
        randevu_tarihi: appointmentDate,
        randevu_saati: appointmentTime,
        randevu_turu: appointmentType,
        notlar: appointmentNotes,
        olusturma_tarihi: new Date().toISOString()
    });
}

// Randevu düzenle
function editAppointment(appointmentId) {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    // Form'u doldur
    document.getElementById('patientName').value = appointment.patientName;
    document.getElementById('patientPhone').value = appointment.phone;
    document.getElementById('appointmentDate').value = appointment.date;
    document.getElementById('appointmentTime').value = appointment.time;
    document.getElementById('appointmentType').value = appointment.type;
    document.getElementById('appointmentNotes').value = appointment.notes || '';
    
    // Modalı aç
    openNewAppointmentModal();
    
    // Kaydet butonunu güncelle
    const saveBtn = document.querySelector('#appointmentModal .btn-primary');
    saveBtn.textContent = 'Güncelle';
    saveBtn.onclick = function() {
        updateAppointment(appointmentId);
    };
}

// Randevu güncelle
function updateAppointment(appointmentId) {
    const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
    if (appointmentIndex === -1) return;
    
    const patientName = document.getElementById('patientName').value.trim();
    const patientPhone = document.getElementById('patientPhone').value.trim();
    const appointmentDate = document.getElementById('appointmentDate').value;
    const appointmentTime = document.getElementById('appointmentTime').value;
    const appointmentType = document.getElementById('appointmentType').value;
    const appointmentNotes = document.getElementById('appointmentNotes').value.trim();
    
    // Validation
    if (!patientName || !patientPhone || !appointmentDate || !appointmentTime || !appointmentType) {
        showToast('Lütfen tüm zorunlu alanları doldurun!', 'error');
        return;
    }
    
    // Randevuyu güncelle
    appointments[appointmentIndex] = {
        ...appointments[appointmentIndex],
        patientName: patientName,
        phone: patientPhone,
        date: appointmentDate,
        time: appointmentTime,
        type: appointmentType,
        notes: appointmentNotes
    };
    
    // Modal kapat
    closeModal();
    
    // Kaydet butonunu normale döndür
    const saveBtn = document.querySelector('#appointmentModal .btn-primary');
    saveBtn.textContent = 'Randevu Kaydet';
    saveBtn.onclick = saveAppointment;
    
    // Görüntüleri güncelle
    displayAppointments();
    generateCalendar();
    
    showToast('Randevu başarıyla güncellendi!', 'success');
}

// Randevu sil
function deleteAppointment(appointmentId) {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    if (confirm(`"${appointment.patientName}" adlı hastanın randevusunu silmek istediğinizden emin misiniz?`)) {
        appointments = appointments.filter(apt => apt.id !== appointmentId);
        displayAppointments();
        generateCalendar();
        showToast('Randevu başarıyla silindi!', 'success');
    }
}

// Randevu iptal modalını aç
function cancelAppointment() {
    document.getElementById('cancelModal').style.display = 'block';
    document.getElementById('searchPatient').focus();
}

// Randevu ara
function searchAppointments() {
    const searchTerm = document.getElementById('searchPatient').value.toLowerCase().trim();
    const searchResults = document.getElementById('searchResults');
    
    if (searchTerm.length < 2) {
        searchResults.innerHTML = '<p style="text-align: center; color: #666;">En az 2 karakter girin</p>';
        return;
    }
    
    const matchingAppointments = appointments.filter(appointment => 
        appointment.patientName.toLowerCase().includes(searchTerm) ||
        appointment.phone.includes(searchTerm)
    );
    
    if (matchingAppointments.length === 0) {
        searchResults.innerHTML = '<p style="text-align: center; color: #666;">Eşleşen randevu bulunamadı</p>';
        return;
    }
    
    searchResults.innerHTML = matchingAppointments.map(appointment => 
        createSearchResultHTML(appointment)
    ).join('');
}

// Arama sonucu HTML'i oluştur
function createSearchResultHTML(appointment) {
    const appointmentDate = new Date(appointment.date);
    const dateStr = appointmentDate.toLocaleDateString('tr-TR');
    
    return `
        <div class="search-item">
            <div class="search-patient-name">${appointment.patientName}</div>
            <div class="search-appointment-info">
                📅 ${dateStr} - ${appointment.time} | ${appointment.type} | 📞 ${appointment.phone}
            </div>
            <div class="search-actions">
                <button class="btn btn-small btn-delete" onclick="deleteAppointmentFromSearch(${appointment.id})">
                    Randevuyu İptal Et
                </button>
            </div>
        </div>
    `;
}

// Arama sonucundan randevu sil
function deleteAppointmentFromSearch(appointmentId) {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    if (confirm(`"${appointment.patientName}" adlı hastanın randevusunu iptal etmek istediğinizden emin misiniz?`)) {
        appointments = appointments.filter(apt => apt.id !== appointmentId);
        
        // Arama sonuçlarını güncelle
        searchAppointments();
        
        // Ana görüntüleri güncelle
        displayAppointments();
        generateCalendar();
        
        showToast('Randevu başarıyla iptal edildi!', 'success');
    }
}

// Telefon formatla
function formatPhone(event) {
    let value = event.target.value.replace(/\D/g, '');
    
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
    
    event.target.value = value;
}

// Telefon doğrulama
function isValidPhone(phone) {
    const cleanPhone = phone.replace(/\s/g, '');
    return /^0[0-9]{10}$/.test(cleanPhone);
}

// Saat çakışması kontrolü
function hasTimeConflict(date, time, excludeId = null) {
    return appointments.some(appointment => 
        appointment.date === date && 
        appointment.time === time && 
        appointment.id !== excludeId
    );
}

// Belirli tarih için randevuları getir
function getAppointmentsForDate(dateString) {
    return appointments.filter(appointment => appointment.date === dateString);
}

// Tarih formatı (storage için)
function formatDateForStorage(date) {
    return date.toISOString().split('T')[0];
}

// Tarih formatı (input için)
function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

// Bugün mü kontrolü
function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

// Aynı tarih mi kontrolü
function isSameDate(date1, date2) {
    return date1.toDateString() === date2.toDateString();
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

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl+N ile yeni randevu
    if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        openNewAppointmentModal();
    }
    
    // Ctrl+F ile randevu ara
    if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        cancelAppointment();
    }
    
    // Arrow keys ile tarih değiştir
    if (selectedDate && !document.querySelector('.modal[style*="block"]')) {
        if (event.key === 'ArrowLeft') {
            const prevDay = new Date(selectedDate);
            prevDay.setDate(selectedDate.getDate() - 1);
            selectDate(prevDay);
        }
        if (event.key === 'ArrowRight') {
            const nextDay = new Date(selectedDate);
            nextDay.setDate(selectedDate.getDate() + 1);
            selectDate(nextDay);
        }
        if (event.key === 'ArrowUp') {
            const prevWeek = new Date(selectedDate);
            prevWeek.setDate(selectedDate.getDate() - 7);
            selectDate(prevWeek);
        }
        if (event.key === 'ArrowDown') {
            const nextWeek = new Date(selectedDate);
            nextWeek.setDate(selectedDate.getDate() + 7);
            selectDate(nextWeek);
        }
    }
});

// MySQL bağlantısı için örnek fonksiyonlar (backend tarafında kullanılacak)
const MySQLQueries = {
    // Randevu ekleme sorgusu
    insertAppointment: (appointment) => {
        return `
            INSERT INTO randevular (
                hasta_adi, telefon, randevu_tarihi, randevu_saati, 
                randevu_turu, notlar, olusturma_tarihi
            ) VALUES (
                '${appointment.patientName}',
                '${appointment.phone}',
                '${appointment.date}',
                '${appointment.time}',
                '${appointment.type}',
                '${appointment.notes}',
                NOW()
            )
        `;
    },
    
    // Randevu güncelleme sorgusu
    updateAppointment: (id, appointment) => {
        return `
            UPDATE randevular SET
                hasta_adi = '${appointment.patientName}',
                telefon = '${appointment.phone}',
                randevu_tarihi = '${appointment.date}',
                randevu_saati = '${appointment.time}',
                randevu_turu = '${appointment.type}',
                notlar = '${appointment.notes}',
                guncelleme_tarihi = NOW()
            WHERE id = ${id}
        `;
    },
    
    // Randevu silme sorgusu
    deleteAppointment: (id) => {
        return `DELETE FROM randevular WHERE id = ${id}`;
    },
    
    // Tarih aralığına göre randevuları getirme
    getAppointmentsByDateRange: (startDate, endDate) => {
        return `
            SELECT * FROM randevular 
            WHERE randevu_tarihi BETWEEN '${startDate}' AND '${endDate}'
            ORDER BY randevu_tarihi, randevu_saati
        `;
    },
    
    // Hasta adına göre arama
    searchAppointmentsByPatient: (searchTerm) => {
        return `
            SELECT * FROM randevular 
            WHERE hasta_adi LIKE '%${searchTerm}%' 
               OR telefon LIKE '%${searchTerm}%'
            ORDER BY randevu_tarihi DESC, randevu_saati
        `;
    }
};

// Debug için MySQL sorgularını console'da göster
function logMySQLQuery(queryType, data) {
    console.log(`MySQL ${queryType} Query:`, MySQLQueries[queryType](data));
}

// Auto-save functionality için localStorage
function saveToLocalStorage() {
    localStorage.setItem('largen_appointments', JSON.stringify(appointments));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('largen_appointments');
    if (saved) {
        appointments = JSON.parse(saved);
        displayAppointments();
        generateCalendar();
    }
}

// Sayfa yüklendiğinde localStorage'dan yükle
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    
    // Her değişiklikte otomatik kaydet
    const originalPush = appointments.push;
    appointments.push = function(...args) {
        const result = originalPush.apply(this, args);
        saveToLocalStorage();
        return result;
    };
});

// Export/Import functionality
function exportAppointments() {
    const dataStr = JSON.stringify(appointments, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `randevular_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function importAppointments(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedAppointments = JSON.parse(e.target.result);
            appointments = [...appointments, ...importedAppointments];
            saveToLocalStorage();
            displayAppointments();
            generateCalendar();
            showToast('Randevular başarıyla içe aktarıldı!', 'success');
        } catch (error) {
            showToast('Dosya formatı hatalı!', 'error');
        }
    };
    reader.readAsText(file);
}