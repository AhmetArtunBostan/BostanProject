// Initialize weather app
document.addEventListener('DOMContentLoaded', () => {
    // Show splash screen for 2 seconds
    setTimeout(() => {
        const splashScreen = document.getElementById('splashScreen');
        if (splashScreen) {
            splashScreen.classList.add('fade-out');
            setTimeout(() => {
                splashScreen.style.display = 'none';
            }, 500);
        }
    }, 2000);

    // İlk yüklemede history'yi temizle
    localStorage.removeItem('weatherHistory');
    // Örnek veriler ekle
    generateSampleHistory();

    initWeatherFeatures();
    initNavigation();
    
    // Weather view'ı aktif et
    showView('weather');
});

function generateSampleHistory() {
    const now = new Date();
    const history = [];
    
    // Son 1 ay için örnek veriler
    for(let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Rastgele sıcaklık (26-30 arası)
        const temp = Math.floor(Math.random() * (30 - 26 + 1)) + 26;
        
        history.push({
            location: 'Warsaw, Poland',
            temp: temp.toString(),
            condition: 'Partly Cloudy',
            timestamp: date.toISOString()
        });
    }
    
    localStorage.setItem('weatherHistory', JSON.stringify(history));
}

function initWeatherFeatures() {
    initPermissions();
    initHistoryFilters();
}

// Permission handlers
function initPermissions() {
    // Location permission
    const locationBtn = document.getElementById('locationBtn');
    if (locationBtn) {
        locationBtn.addEventListener('click', async () => {
            if ("geolocation" in navigator) {
                const permission = confirm("Allow Weather App to access your location?");
                if (permission) {
                    try {
                        locationBtn.classList.add('active');
                    } catch (error) {
                        console.error('Location error:', error);
                        alert('Could not get your location. Please check your permissions.');
                    }
                }
            }
        });
    }

    // Notification permission
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', async () => {
            if ('Notification' in window) {
                try {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        notificationBtn.classList.add('active');
                        showNotification('Weather App', 'Notifications enabled successfully!');
                    } else {
                        alert('Please enable notifications in your browser settings.');
                    }
                } catch (error) {
                    console.error('Notification error:', error);
                    alert('Could not enable notifications.');
                }
            }
        });
    }

    // Camera permission
    const cameraPermissionBtn = document.getElementById('cameraPermissionBtn');
    if (cameraPermissionBtn) {
        cameraPermissionBtn.addEventListener('click', async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ video: true });
                cameraPermissionBtn.classList.add('active');
            } catch (error) {
                console.error('Camera error:', error);
                alert('Could not access camera. Please check your permissions.');
            }
        });
    }
}

// History functionality
function initHistoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Aktif butonu güncelle
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // History'yi filtrele
            displayHistory(button.dataset.filter);
        });
    });
}

function displayHistory(filter = '24h') {
    const historyContent = document.querySelector('.history-content');
    if (!historyContent) return;

    try {
        const history = JSON.parse(localStorage.getItem('weatherHistory') || '[]');
        const now = new Date();
        
        // Filtreleme
        let filteredHistory = history.filter(item => {
            const itemDate = new Date(item.timestamp);
            const diffHours = (now - itemDate) / (1000 * 60 * 60);
            
            switch(filter) {
                case '24h':
                    return diffHours <= 24;
                case '1w':
                    return diffHours <= 168; // 7 * 24
                case '1m':
                    return diffHours <= 720; // 30 * 24
                default:
                    return true;
            }
        });
        
        if (filteredHistory.length === 0) {
            historyContent.innerHTML = '<p class="no-history">No weather history available for selected period</p>';
            return;
        }

        const historyHTML = filteredHistory.map(item => `
            <div class="history-item">
                <div class="history-info">
                    <div class="history-location">${item.location}</div>
                    <div class="history-temp">${item.temp}°C</div>
                    <div class="history-condition">${item.condition}</div>
                </div>
                <div class="history-time">${new Date(item.timestamp).toLocaleString()}</div>
            </div>
        `).join('');

        historyContent.innerHTML = historyHTML;
    } catch (error) {
        console.error('Error displaying history:', error);
        historyContent.innerHTML = '<p class="no-history">Error loading weather history</p>';
    }
}

// Navigation
function initNavigation() {
    const views = ['weather', 'camera', 'history'];
    views.forEach(view => {
        const btn = document.getElementById(`${view}NavBtn`);
        if (btn) {
            btn.addEventListener('click', () => {
                showView(view);
                if (view === 'history') {
                    displayHistory();
                }
            });
        }
    });

    // Back buttons
    const backFromCamera = document.getElementById('backFromCamera');
    if (backFromCamera) {
        backFromCamera.addEventListener('click', () => {
            stopCamera();
            showView('weather');
        });
    }
}

function showView(viewName) {
    const views = document.querySelectorAll('.view');
    const buttons = document.querySelectorAll('.nav-button');
    
    views.forEach(view => {
        view.classList.remove('active');
        if (view.id === `${viewName}View`) {
            view.classList.add('active');
            view.style.display = 'block';
        } else {
            view.style.display = 'none';
        }
    });
    
    buttons.forEach(button => {
        button.classList.toggle('active', button.id === `${viewName}NavBtn`);
    });

    if (viewName === 'camera') {
        initCamera();
    }
}

// Camera functionality
function initCamera() {
    const video = document.getElementById('cameraPreview');
    const captureBtn = document.getElementById('captureBtn');
    const photoPreview = document.getElementById('photoPreview');
    const capturedPhoto = document.getElementById('capturedPhoto');
    const deleteBtn = document.getElementById('deletePhotoBtn');
    const saveBtn = document.getElementById('savePhotoBtn');
    let stream = null;

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            video.srcObject = stream;
            video.style.display = 'block';
            photoPreview.style.display = 'none';
            document.querySelector('.camera-controls').style.display = 'block';
            document.querySelector('.photo-controls').style.display = 'none';
        } catch (error) {
            console.error('Camera error:', error);
            alert('Could not access camera. Please check permissions.');
            showView('weather');
        }
    }

    startCamera();

    if (captureBtn) {
        captureBtn.addEventListener('click', () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            capturedPhoto.src = canvas.toDataURL('image/png');
            
            video.style.display = 'none';
            photoPreview.style.display = 'block';
            document.querySelector('.camera-controls').style.display = 'none';
            document.querySelector('.photo-controls').style.display = 'block';
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            video.style.display = 'block';
            photoPreview.style.display = 'none';
            document.querySelector('.camera-controls').style.display = 'block';
            document.querySelector('.photo-controls').style.display = 'none';
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (capturedPhoto.src) {
                const link = document.createElement('a');
                link.download = `weather-photo-${new Date().toISOString()}.png`;
                link.href = capturedPhoto.src;
                link.click();
                
                // Fotoğraf kaydedildikten sonra kamera preview'a geri dön
                video.style.display = 'block';
                photoPreview.style.display = 'none';
                document.querySelector('.camera-controls').style.display = 'block';
                document.querySelector('.photo-controls').style.display = 'none';
            }
        });
    }
}

function stopCamera() {
    const video = document.getElementById('cameraPreview');
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
}

function showNotification(title, message) {
    new Notification(title, {
        body: message,
        icon: '/images/icons/icon-192x192.png'
    });
}
