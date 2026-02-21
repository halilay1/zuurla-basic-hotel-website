// Sample data - Database'den alınacak
let statisticsData = {
    currentPeriod: {
        hematology: 45,
        urine: 32,
        panel: 28,
        stool: 18
    },
    previousPeriod: {
        hematology: 38,
        urine: 29,
        panel: 25,
        stool: 16
    },
    dailyData: [
        { date: '2025-06-01', hematology: 8, urine: 5, panel: 4, stool: 2 },
        { date: '2025-06-02', hematology: 5, urine: 3, panel: 6, stool: 1 },
        { date: '2025-06-03', hematology: 12, urine: 8, panel: 7, stool: 4 },
        { date: '2025-06-04', hematology: 9, urine: 6, panel: 5, stool: 3 },
        { date: '2025-06-05', hematology: 11, urine: 10, panel: 6, stool: 8 }
    ]
};

let currentUser = null;
let chart = null;

// DOM yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    loadUserInfo();
    loadStatistics();
    createChart();
});

// Sayfa başlatma
function initializePage() {
    // Bugünün tarihini set et
    const today = new Date();
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
    
    // Bir ay öncesini set et
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    document.getElementById('startDate').value = lastMonth.toISOString().split('T')[0];
}

// Event listener'ları kurma
function setupEventListeners() {
    // Tarih aralığı değişikliği
    document.getElementById('dateRange').addEventListener('change', function() {
        const customGroup = document.getElementById('customDateGroup');
        if (this.value === 'custom') {
            customGroup.style.display = 'flex';
        } else {
            customGroup.style.display = 'none';
            updateStatistics();
        }
    });
}

// Kullanıcı bilgilerini yükleme
async function loadUserInfo() {
    try {
        // Database'den kullanıcı bilgilerini al
        currentUser = await fetchCurrentUser();
        
        const userInfoElement = document.getElementById('userInfo');
        if (currentUser) {
            userInfoElement.innerHTML = `
                <span class="user-name">${currentUser.title} ${currentUser.name}</span>
            `;
        } else {
            userInfoElement.innerHTML = `
                <span class="user-name">Kullanıcı Bilgisi Bulunamadı</span>
            `;
        }
    } catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
        document.getElementById('userInfo').innerHTML = `
            <span class="user-name">Kullanıcı Bilgisi Yüklenemedi</span>
        `;
    }
}

// İstatistikleri yükleme
async function loadStatistics() {
    showLoading(true);
    
    try {
        // Database'den istatistik verilerini al
        statisticsData = await fetchStatisticsData();
        
        // Kartları güncelle
        updateStatCards();
        
        // Grafiği güncelle
        updateChart();
        
        // Özet bilgileri güncelle
        updateSummaryCards();
        
        // Detaylı tabloyu güncelle
        updateDetailedTable();
        
    } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error);
        showError('İstatistikler yüklenirken bir hata oluştu.');
    } finally {
        showLoading(false);
    }
}

// İstatistik kartlarını güncelleme
function updateStatCards() {
    const current = statisticsData.currentPeriod;
    const previous = statisticsData.previousPeriod;
    
    // Hematoloji
    updateStatCard('hematology', current.hematology, previous.hematology);
    
    // İdrar
    updateStatCard('urine', current.urine, previous.urine);
    
    // S.Panel
    updateStatCard('panel', current.panel, previous.panel);
    
    // Gaita
    updateStatCard('stool', current.stool, previous.stool);
}

// Tek bir stat kartını güncelleme
function updateStatCard(type, currentValue, previousValue) {
    const countElement = document.getElementById(`${type}Count`);
    const changeElement = document.getElementById(`${type}Change`);
    
    // Değeri güncelle
    countElement.textContent = currentValue.toLocaleString();
    
    // Değişim yüzdesini hesapla
    const changePercentage = previousValue > 0 ? 
        ((currentValue - previousValue) / previousValue * 100).toFixed(1) : 0;
    
    const changeIndicator = changeElement.querySelector('.change-indicator');
    
    // Değişim rengini ve işaretini belirle
    if (changePercentage > 0) {
        changeIndicator.textContent = `+${changePercentage}%`;
        changeIndicator.className = 'change-indicator positive';
    } else if (changePercentage < 0) {
        changeIndicator.textContent = `${changePercentage}%`;
        changeIndicator.className = 'change-indicator negative';
    } else {
        changeIndicator.textContent = '0%';
        changeIndicator.className = 'change-indicator neutral';
    }
}

// Grafik oluşturma
function createChart() {
    const canvas = document.getElementById('patientChart');
    const ctx = canvas.getContext('2d');
    
    // Basit bar chart çizimi
    drawBarChart(ctx, canvas);
}

// Bar chart çizimi
function drawBarChart(ctx, canvas) {
    const data = statisticsData.currentPeriod;
    const labels = ['Yeni Eklenen', 'Genel Tetkik', 'Biyokimya', 'Çeşitli'];
    const values = [data.hematology, data.urine, data.panel, data.stool];
    const colors = ['#dc2626', '#dc2626', '#dc2626', '#dc2626'];
    
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // Canvas'ı temizle
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Maksimum değeri bul
    const maxValue = Math.max(...values);
    const barWidth = chartWidth / values.length * 0.6;
    const barSpacing = chartWidth / values.length;
    
    // Y ekseni için değerler
    const yAxisValues = [0, 2, 4, 6, 8, 10, 12, 14];
    const yAxisMax = 14;
    
    // Grid çizgileri
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Yatay grid çizgileri
    yAxisValues.forEach(value => {
        const y = padding + chartHeight - (value / yAxisMax) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
    });
    
    // Y ekseni etiketleri
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    yAxisValues.forEach(value => {
        const y = padding + chartHeight - (value / yAxisMax) * chartHeight;
        ctx.fillText(value.toString(), padding - 10, y + 4);
    });
    
    // Barları çiz
    values.forEach((value, index) => {
        const x = padding + index * barSpacing + (barSpacing - barWidth) / 2;
        const barHeight = (value / yAxisMax) * chartHeight;
        const y = padding + chartHeight - barHeight;
        
        // Bar
        ctx.fillStyle = colors[index];
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Bar üzerinde değer
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
        
        // X ekseni etiketleri
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        const labelY = padding + chartHeight + 15;
        
        // Etiketleri satırlara böl
        const words = labels[index].split(' ');
        words.forEach((word, wordIndex) => {
            ctx.fillText(word, x + barWidth / 2, labelY + wordIndex * 12);
        });
    });
}

// Grafiği güncelleme
function updateChart() {
    const canvas = document.getElementById('patientChart');
    const ctx = canvas.getContext('2d');
    drawBarChart(ctx, canvas);
}

// Özet kartlarını güncelleme
function updateSummaryCards() {
    const dailyData = statisticsData.dailyData;
    const totalDays = dailyData.length;
    
    // Günlük ortalama hasta sayısı
    const totalPatients = dailyData.reduce((sum, day) => 
        sum + day.hematology + day.urine + day.panel + day.stool, 0);
    const avgPatients = Math.round(totalPatients / totalDays);
    document.getElementById('avgPatients').textContent = avgPatients;
    
    // Günlük ortalama tetkik sayısı
    const avgTests = Math.round(totalPatients / totalDays);
    document.getElementById('avgTests').textContent = avgTests;
    
    // En çok talep edilen tetkik
    const testTotals = {
        'Hematoloji': statisticsData.currentPeriod.hematology,
        'İdrar': statisticsData.currentPeriod.urine,
        'S.Panel': statisticsData.currentPeriod.panel,
        'Gaita': statisticsData.currentPeriod.stool
    };
    
    const mostRequested = Object.entries(testTotals)
        .sort(([,a], [,b]) => b - a)[0];
    
    document.getElementById('mostRequestedTest').textContent = mostRequested[0];
    document.getElementById('mostRequestedCount').textContent = mostRequested[1];
    
    // Performans hesaplamaları
    const targetDaily = 30; // Günlük hedef
    const actualDaily = avgPatients;
    const targetPercentage = Math.round((actualDaily / targetDaily) * 100);
    
    document.getElementById('targetPercentage').textContent = `${targetPercentage}%`;
    
    // Verimlilik (örnek hesaplama)
    const efficiency = targetPercentage > 100 ? 'Yüksek' : 
                      targetPercentage > 80 ? 'İyi' : 
                      targetPercentage > 60 ? 'Orta' : 'Düşük';
    document.getElementById('efficiency').textContent = efficiency;
}

// Detaylı tabloyu güncelleme
function updateDetailedTable() {
    const tableBody = document.getElementById('detailedStatsBody');
    tableBody.innerHTML = '';
    
    statisticsData.dailyData.forEach(dayData => {
        const row = document.createElement('tr');
        const total = dayData.hematology + dayData.urine + dayData.panel + dayData.stool;
        
        row.innerHTML = `
            <td>${formatDate(dayData.date)}</td>
            <td>${dayData.hematology}</td>
            <td>${dayData.urine}</td>
            <td>${dayData.panel}</td>
            <td>${dayData.stool}</td>
            <td class="total-column">${total}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Toplam satırı ekle
    const totalRow = document.createElement('tr');
    totalRow.style.fontWeight = 'bold';
    totalRow.style.backgroundColor = '#f9fafb';
    
    const totals = statisticsData.dailyData.reduce((acc, day) => {
        acc.hematology += day.hematology;
        acc.urine += day.urine;
        acc.panel += day.panel;
        acc.stool += day.stool;
        return acc;
    }, { hematology: 0, urine: 0, panel: 0, stool: 0 });
    
    const grandTotal = totals.hematology + totals.urine + totals.panel + totals.stool;
    
    totalRow.innerHTML = `
        <td>TOPLAM</td>
        <td>${totals.hematology}</td>
        <td>${totals.urine}</td>
        <td>${totals.panel}</td>
        <td>${totals.stool}</td>
        <td class="total-column">${grandTotal}</td>
    `;
    
    tableBody.appendChild(totalRow);
}

// İstatistikleri güncelleme
function updateStatistics() {
    const dateRange = document.getElementById('dateRange').value;
    let startDate, endDate;
    
    switch (dateRange) {
        case 'today':
            startDate = endDate = new Date();
            break;
        case 'week':
            endDate = new Date();
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            break;
        case 'month':
            endDate = new Date();
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case 'year':
            endDate = new Date();
            startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        case 'custom':
            startDate = new Date(document.getElementById('startDate').value);
            endDate = new Date(document.getElementById('endDate').value);
            break;
        default:
            return;
    }
    
    // Yeni tarih aralığı ile verileri yükle
    loadStatistics();
}

// İstatistikleri yenileme
function refreshStatistics() {
    loadStatistics();
}

// İstatistikleri export etme
function exportStatistics() {
    const dateRange = document.getElementById('dateRange').value;
    const data = statisticsData;
    
    // CSV formatında export
    const headers = ['Tarih', 'Hematoloji', 'İdrar', 'S.Panel', 'Gaita', 'Toplam'];
    let csvContent = headers.join(',') + '\n';
    
    data.dailyData.forEach(day => {
        const total = day.hematology + day.urine + day.panel + day.stool;
        const row = [
            formatDate(day.date),
            day.hematology,
            day.urine,
            day.panel,
            day.stool,
            total
        ];
        csvContent += row.join(',') + '\n';
    });
    
    // Özet bilgileri ekle
    csvContent += '\n,ÖZET RAPOR\n';
    csvContent += `,Toplam Hematoloji,${data.currentPeriod.hematology}\n`;
    csvContent += `,Toplam İdrar,${data.currentPeriod.urine}\n`;
    csvContent += `,Toplam S.Panel,${data.currentPeriod.panel}\n`;
    csvContent += `,Toplam Gaita,${data.currentPeriod.stool}\n`;
    
    // Dosyayı indir
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `istatistik_raporu_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Yükleme durumunu gösterme
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

// Hata mesajı gösterme
function showError(message) {
    alert(message); // Basit alert, gelişmiş notification sistemi eklenebilir
}

// Tarih formatlama
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// Canvas responsive yapma
function resizeChart() {
    const canvas = document.getElementById('patientChart');
    const container = canvas.parentElement;
    
    // Container boyutlarını al
    const containerWidth = container.clientWidth - 60; // padding için
    const containerHeight = Math.min(containerWidth * 0.6, 300);
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // Grafiği yeniden çiz
    updateChart();
}

// Window resize event
window.addEventListener('resize', function() {
    setTimeout(resizeChart, 100);
});

// Sayfa yüklendiğinde canvas boyutunu ayarla
window.addEventListener('load', function() {
    resizeChart();
});

// Database işlemleri için placeholder fonksiyonlar
// Bu fonksiyonlar database entegrasyonu sırasında geliştirilecek

// Mevcut kullanıcı bilgilerini getirme
async function fetchCurrentUser() {
    try {
        // const response = await fetch('/api/current-user');
        // return await response.json();
        
        // Şimdilik sample data döndür
        return {
            id: 1,
            title: 'Uzman Doktor',
            name: 'Ali Seçkin Yalçın',
            department: 'Kardiyoloji'
        };
    } catch (error) {
        console.error('Kullanıcı bilgileri alınırken hata:', error);
        return null;
    }
}

// İstatistik verilerini getirme
async function fetchStatisticsData() {
    try {
        // const dateRange = document.getElementById('dateRange').value;
        // const startDate = document.getElementById('startDate').value;
        // const endDate = document.getElementById('endDate').value;
        
        // const response = await fetch(`/api/statistics?range=${dateRange}&start=${startDate}&end=${endDate}`);
        // return await response.json();
        
        // Şimdilik sample data döndür
        return statisticsData;
    } catch (error) {
        console.error('İstatistik verileri alınırken hata:', error);
        throw error;
    }
}

// Belirli tarih aralığı için istatistik verilerini getirme
async function fetchStatisticsByDateRange(startDate, endDate) {
    try {
        // const response = await fetch(`/api/statistics/range?start=${startDate}&end=${endDate}`);
        // return await response.json();
        
        console.log(`İstatistikler getiriliyor: ${startDate} - ${endDate}`);
        return statisticsData;
    } catch (error) {
        console.error('Tarih aralığı istatistikleri alınırken hata:', error);
        throw error;
    }
}

// Doktor bazlı istatistikleri getirme
async function fetchDoctorStatistics(doctorId) {
    try {
        // const response = await fetch(`/api/statistics/doctor/${doctorId}`);
        // return await response.json();
        
        console.log(`Doktor ${doctorId} için istatistikler getiriliyor`);
        return statisticsData;
    } catch (error) {
        console.error('Doktor istatistikleri alınırken hata:', error);
        throw error;
    }
}

// Tetkik türü bazlı detaylı istatistikleri getirme
async function fetchTestTypeStatistics() {
    try {
        // const response = await fetch('/api/statistics/test-types');
        // return await response.json();
        
        return {
            testTypes: [
                { name: 'Hematoloji', total: 245, percentage: 35 },
                { name: 'İdrar', total: 187, percentage: 27 },
                { name: 'S.Panel', total: 156, percentage: 22 },
                { name: 'Gaita', total: 112, percentage: 16 }
            ]
        };
    } catch (error) {
        console.error('Tetkik türü istatistikleri alınırken hata:', error);
        throw error;
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // F5: Refresh statistics
    if (event.key === 'F5') {
        event.preventDefault();
        refreshStatistics();
    }
    
    // Ctrl+E: Export statistics
    if (event.ctrlKey && event.key === 'e') {
        event.preventDefault();
        exportStatistics();
    }
});

// Touch events for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Sol swipe - önceki dönem
            console.log('Önceki dönem');
        } else {
            // Sağ swipe - sonraki dönem
            console.log('Sonraki dönem');
        }
    }
}