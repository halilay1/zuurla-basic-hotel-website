// Sample stock data - Database ile değiştirilecek
let stockData = [
    {
        code: 'OSR2312',
        name: 'PAROL',
        category: 'Ağrı Kesici',
        quantity: 32,
        expiryDate: '2026-04-05'
    },
    {
        code: 'ANT5547',
        name: 'AMOKSİSİLİN',
        category: 'Antibiyotik',
        quantity: 15,
        expiryDate: '2025-12-15'
    },
    {
        code: 'VIT8823',
        name: 'VİTAMİN D3',
        category: 'Vitamin',
        quantity: 0,
        expiryDate: '2026-08-20'
    }
];

// DOM yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    loadStockTable();
    setupEventListeners();
});

// Event listener'ları kurma
function setupEventListeners() {
    // Form submit event'leri
    document.getElementById('addStockForm').addEventListener('submit', handleAddStock);
    document.getElementById('editStockForm').addEventListener('submit', handleEditStock);
    document.getElementById('addQuantityForm').addEventListener('submit', handleAddQuantity);
    
    // Modal dışına tıklama ile kapama
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Stok tablosunu yükleme
function loadStockTable() {
    const tableBody = document.getElementById('stockTableBody');
    tableBody.innerHTML = '';
    
    stockData.forEach(item => {
        const row = createStockRow(item);
        tableBody.appendChild(row);
    });
}

// Stok satırı oluşturma
function createStockRow(item) {
    const row = document.createElement('tr');
    
    // Stok durumuna göre stil
    if (item.quantity === 0) {
        row.classList.add('out-of-stock');
    } else if (item.quantity <= 10) {
        row.classList.add('low-stock');
    }
    
    // Tarihi formatla
    const formattedDate = formatDate(item.expiryDate);
    
    row.innerHTML = `
        <td>${item.code}</td>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td class="stock-count">${item.quantity}</td>
        <td>${formattedDate}</td>
        <td class="actions">
            <button class="btn-edit" onclick="editStock('${item.code}')" title="Düzenle">✏️</button>
            <button class="btn-delete" onclick="deleteStock('${item.code}')" title="Sil">🗑️</button>
            <button class="btn-add-stock" onclick="addStockQuantity('${item.code}')" title="Stok Ekle">+</button>
        </td>
    `;
    
    return row;
}

// Tarih formatlama
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
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

// Yeni stok ekleme
function handleAddStock(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const newStock = {
        code: formData.get('productCode'),
        name: formData.get('productName'),
        category: formData.get('category'),
        quantity: parseInt(formData.get('quantity')),
        expiryDate: formData.get('expiryDate')
    };
    
    // Aynı kod kontrolü
    if (stockData.find(item => item.code === newStock.code)) {
        showMessage('Bu ürün kodu zaten mevcut!', 'error');
        return;
    }
    
    // Database'e ekle (şimdilik array'e ekle)
    stockData.push(newStock);
    
    // Tabloyu güncelle
    loadStockTable();
    
    // Modal'ı kapat
    closeModal('addModal');
    
    // Başarı mesajı
    showMessage('Yeni stok başarıyla eklendi!', 'success');
}

// Stok düzenleme
function editStock(productCode) {
    const stock = stockData.find(item => item.code === productCode);
    if (!stock) return;
    
    // Form'u doldur
    document.getElementById('editProductCode').value = stock.code;
    document.getElementById('editProductName').value = stock.name;
    document.getElementById('editCategory').value = stock.category;
    document.getElementById('editQuantity').value = stock.quantity;
    document.getElementById('editExpiryDate').value = stock.expiryDate;
    
    // Modal'ı aç
    openModal('editModal');
}

// Stok düzenleme form işleme
function handleEditStock(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const productCode = formData.get('productCode');
    
    const stockIndex = stockData.findIndex(item => item.code === productCode);
    if (stockIndex === -1) return;
    
    // Stok bilgilerini güncelle
    stockData[stockIndex] = {
        code: productCode,
        name: formData.get('productName'),
        category: formData.get('category'),
        quantity: parseInt(formData.get('quantity')),
        expiryDate: formData.get('expiryDate')
    };
    
    // Tabloyu güncelle
    loadStockTable();
    
    // Modal'ı kapat
    closeModal('editModal');
    
    // Başarı mesajı
    showMessage('Stok bilgileri başarıyla güncellendi!', 'success');
}

// Stok silme
function deleteStock(productCode) {
    if (confirm('Bu stoğu silmek istediğinizden emin misiniz?')) {
        const stockIndex = stockData.findIndex(item => item.code === productCode);
        if (stockIndex !== -1) {
            stockData.splice(stockIndex, 1);
            loadStockTable();
            showMessage('Stok başarıyla silindi!', 'success');
        }
    }
}

// Stok miktarı ekleme
function addStockQuantity(productCode) {
    const stock = stockData.find(item => item.code === productCode);
    if (!stock) return;
    
    // Form'u doldur
    document.getElementById('addQuantityProductCode').value = stock.code;
    document.getElementById('addQuantityProductName').textContent = stock.name;
    document.getElementById('currentStock').textContent = stock.quantity;
    
    // Modal'ı aç
    openModal('addQuantityModal');
}

// Stok miktarı ekleme form işleme
function handleAddQuantity(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const productCode = formData.get('productCode');
    const additionalQuantity = parseInt(formData.get('quantity'));
    
    const stockIndex = stockData.findIndex(item => item.code === productCode);
    if (stockIndex === -1) return;
    
    // Stok miktarını artır
    stockData[stockIndex].quantity += additionalQuantity;
    
    // Tabloyu güncelle
    loadStockTable();
    
    // Modal'ı kapat
    closeModal('addQuantityModal');
    
    // Başarı mesajı
    showMessage(`${additionalQuantity} adet stok başarıyla eklendi!`, 'success');
}

// Stok arama
function searchStock() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const tableRows = document.querySelectorAll('#stockTableBody tr');
    
    tableRows.forEach(row => {
        const productCode = row.cells[0].textContent.toLowerCase();
        const productName = row.cells[1].textContent.toLowerCase();
        
        if (productCode.includes(searchTerm) || productName.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Kategoriye göre filtreleme
function filterByCategory() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const tableRows = document.querySelectorAll('#stockTableBody tr');
    
    tableRows.forEach(row => {
        const category = row.cells[2].textContent;
        
        if (selectedCategory === '' || category === selectedCategory) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Mesaj gösterme
function showMessage(message, type) {
    // Önceki mesajları temizle
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Yeni mesaj oluştur
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    
    // Container'ın başına ekle
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    // 5 saniye sonra otomatik kaldır
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Stok hareketleri gösterme (placeholder)
function showStockMovements() {
    showMessage('Stok hareketleri sayfası yakında eklenecek.', 'success');
}

// Tedarikçi faturaları gösterme (placeholder)
function showSupplierOrders() {
    showMessage('Tedarikçi faturaları sayfası yakında eklenecek.', 'success');
}

// Tedarikçi bakiyeleri gösterme (placeholder)
function showSupplierInfo() {
    showMessage('Tedarikçi bakiyeleri sayfası yakında eklenecek.', 'success');
}

// Database işlemleri için placeholder fonksiyonlar
// Bu fonksiyonlar database entegrasyonu sırasında geliştirilecek

// Veritabanından stok verilerini getirme
async function fetchStockData() {
    try {
        // const response = await fetch('/api/stock');
        // const data = await response.json();
        // return data;
        
        // Şimdilik sample data döndür
        return stockData;
    } catch (error) {
        console.error('Stok verileri alınırken hata:', error);
        showMessage('Stok verileri yüklenirken hata oluştu.', 'error');
        return [];
    }
}

// Veritabanına yeni stok ekleme
async function saveStockToDatabase(stockItem) {
    try {
        // const response = await fetch('/api/stock', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(stockItem)
        // });
        // 
        // if (!response.ok) {
        //     throw new Error('Stok eklenirken hata oluştu');
        // }
        // 
        // return await response.json();
        
        console.log('Stok veritabanına eklendi:', stockItem);
        return { success: true };
    } catch (error) {
        console.error('Stok eklenirken hata:', error);
        throw error;
    }
}

// Veritabanında stok güncelleme
async function updateStockInDatabase(stockItem) {
    try {
        // const response = await fetch(`/api/stock/${stockItem.code}`, {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(stockItem)
        // });
        // 
        // if (!response.ok) {
        //     throw new Error('Stok güncellenirken hata oluştu');
        // }
        // 
        // return await response.json();
        
        console.log('Stok veritabanında güncellendi:', stockItem);
        return { success: true };
    } catch (error) {
        console.error('Stok güncellenirken hata:', error);
        throw error;
    }
}

// Veritabanından stok silme
async function deleteStockFromDatabase(productCode) {
    try {
        // const response = await fetch(`/api/stock/${productCode}`, {
        //     method: 'DELETE'
        // });
        // 
        // if (!response.ok) {
        //     throw new Error('Stok silinirken hata oluştu');
        // }
        // 
        // return await response.json();
        
        console.log('Stok veritabanından silindi:', productCode);
        return { success: true };
    } catch (error) {
        console.error('Stok silinirken hata:', error);
        throw error;
    }
}

// Stok hareket kaydı ekleme
async function addStockMovement(movement) {
    try {
        // const response = await fetch('/api/stock-movements', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(movement)
        // });
        // 
        // if (!response.ok) {
        //     throw new Error('Stok hareketi kaydedilirken hata oluştu');
        // }
        // 
        // return await response.json();
        
        console.log('Stok hareketi kaydedildi:', movement);
        return { success: true };
    } catch (error) {
        console.error('Stok hareketi kaydedilirken hata:', error);
        throw error;
    }
}

// Sayfa yüklendiğinde stok verilerini kontrol et
window.addEventListener('load', function() {
    // Düşük stok uyarıları
    checkLowStock();
    
    // Son kullanma tarihi uyarıları
    checkExpiryDates();
});

// Düşük stok kontrolü
function checkLowStock() {
    const lowStockItems = stockData.filter(item => item.quantity <= 10 && item.quantity > 0);
    const outOfStockItems = stockData.filter(item => item.quantity === 0);
    
    if (outOfStockItems.length > 0) {
        showMessage(`${outOfStockItems.length} ürün stokta yok!`, 'error');
    } else if (lowStockItems.length > 0) {
        showMessage(`${lowStockItems.length} ürünün stok seviyesi düşük.`, 'error');
    }
}

// Son kullanma tarihi kontrolü
function checkExpiryDates() {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const expiringSoon = stockData.filter(item => {
        const expiryDate = new Date(item.expiryDate);
        return expiryDate <= thirtyDaysFromNow && expiryDate > today;
    });
    
    const expired = stockData.filter(item => {
        const expiryDate = new Date(item.expiryDate);
        return expiryDate <= today;
    });
    
    if (expired.length > 0) {
        showMessage(`${expired.length} ürünün son kullanma tarihi geçmiş!`, 'error');
    } else if (expiringSoon.length > 0) {
        showMessage(`${expiringSoon.length} ürünün son kullanma tarihi 30 gün içinde dolacak.`, 'error');
    }
}

// Klavye kısayolları
document.addEventListener('keydown', function(event) {
    // Ctrl+N: Yeni stok ekleme
    if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        openModal('addModal');
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

// Verileri Excel'e aktarma
function exportToExcel() {
    const headers = ['Ürün Kodu', 'Ürün Adı', 'Kategori', 'Adet', 'Son Kullanım Tarihi'];
    const rows = stockData.map(item => [
        item.code,
        item.name,
        item.category,
        item.quantity,
        formatDate(item.expiryDate)
    ]);
    
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stok_listesi.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Form validasyonu
function validateForm(formData) {
    const errors = [];
    
    if (!formData.get('productCode') || formData.get('productCode').length < 3) {
        errors.push('Ürün kodu en az 3 karakter olmalıdır.');
    }
    
    if (!formData.get('productName') || formData.get('productName').length < 2) {
        errors.push('Ürün adı en az 2 karakter olmalıdır.');
    }
    
    if (!formData.get('category')) {
        errors.push('Kategori seçilmelidir.');
    }
    
    const quantity = parseInt(formData.get('quantity'));
    if (isNaN(quantity) || quantity < 0) {
        errors.push('Geçerli bir adet giriniz.');
    }
    
    const expiryDate = new Date(formData.get('expiryDate'));
    const today = new Date();
    if (expiryDate <= today) {
        errors.push('Son kullanma tarihi bugünden sonra olmalıdır.');
    }
    
    return errors;
}