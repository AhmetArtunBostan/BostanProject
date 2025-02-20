// PWA installation handler
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installButton = document.getElementById('installButton');
    installButton.classList.remove('hidden');
});

document.getElementById('installButton').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('App was installed');
        }
        deferredPrompt = null;
        document.getElementById('installButton').classList.add('hidden');
    }
});

// Offline status check
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
    const offlineMessage = document.getElementById('offline-message');
    if (navigator.onLine) {
        offlineMessage.classList.add('hidden');
        loadWeatherData(); // Refresh data when back online
    } else {
        offlineMessage.classList.remove('hidden');
    }
}

// Location permission and handling
async function requestLocationPermission() {
    try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'granted') {
            return true;
        } else if (permission.state === 'prompt') {
            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(
                    () => resolve(true),
                    () => resolve(false)
                );
            });
        }
        return false;
    } catch (error) {
        console.error('Error checking location permission:', error);
        return false;
    }
}

// Notification permission and handling
async function requestNotificationPermission() {
    try {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    } catch (error) {
        console.error('Error checking notification permission:', error);
        return false;
    }
}

// Check permissions on app start
async function checkPermissions() {
    const locationAllowed = await requestLocationPermission();
    const notificationAllowed = await requestNotificationPermission();

    if (locationAllowed) {
        document.getElementById('locationButton').classList.remove('hidden');
    }

    if (notificationAllowed) {
        // Enable notification features
        setupNotifications();
    }
}

// Notification setup
function setupNotifications() {
    // Timer for daily weather notification
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0, 0); // Next day at 8:00
    const timeUntilNotification = tomorrow - now;

    setTimeout(() => {
        sendWeatherNotification();
        // Repeat every 24 hours
        setInterval(sendWeatherNotification, 24 * 60 * 60 * 1000);
    }, timeUntilNotification);
}

function sendWeatherNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('Daily Weather Update', {
            body: 'Click to see today\'s weather forecast',
            icon: '/images/icons/icon-192x192.png'
        });

        notification.onclick = function() {
            window.focus();
            loadWeatherData();
        };
    }
}

// Permission Indicators
const notificationIndicator = document.getElementById('notificationIndicator');
const cameraIndicator = document.getElementById('cameraIndicator');
const locationIndicator = document.getElementById('locationIndicator');

// Weather Animation
const weatherAnimation = document.getElementById('weatherAnimation');

// Toast
const toast = document.getElementById('toast');

// Tab Navigation
const tabs = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Permission Handling
async function checkPermissionsNew() {
    // Notification Permission
    if ('Notification' in window) {
        const status = await Notification.requestPermission();
        updatePermissionIndicator(notificationIndicator, status);
    }

    // Camera Permission
    if ('mediaDevices' in navigator) {
        try {
            const result = await navigator.mediaDevices.getUserMedia({ video: true });
            result.getTracks().forEach(track => track.stop());
            updatePermissionIndicator(cameraIndicator, 'granted');
        } catch (error) {
            updatePermissionIndicator(cameraIndicator, 'denied');
        }
    }

    // Location Permission
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            () => updatePermissionIndicator(locationIndicator, 'granted'),
            () => updatePermissionIndicator(locationIndicator, 'denied')
        );
    }
}

function updatePermissionIndicator(indicator, status) {
    if (status === 'granted') {
        indicator.classList.add('granted');
    } else {
        indicator.classList.remove('granted');
    }
}

// Weather Animation Handling
function updateWeatherAnimation(weatherCode) {
    weatherAnimation.className = 'weather-animation';
    weatherAnimation.innerHTML = '';

    if (weatherCode >= 200 && weatherCode < 300) { // Thunderstorm
        weatherAnimation.classList.add('rainy');
        createRaindrops();
    } else if (weatherCode >= 300 && weatherCode < 600) { // Rain
        weatherAnimation.classList.add('rainy');
        createRaindrops();
    } else if (weatherCode >= 600 && weatherCode < 700) { // Snow
        weatherAnimation.classList.add('cloudy');
        createClouds();
    } else if (weatherCode >= 700 && weatherCode < 800) { // Atmosphere
        weatherAnimation.classList.add('cloudy');
        createClouds();
    } else if (weatherCode === 800) { // Clear
        weatherAnimation.classList.add('sunny');
        const sun = document.createElement('div');
        sun.className = 'sun';
        weatherAnimation.appendChild(sun);
    } else if (weatherCode > 800) { // Clouds
        weatherAnimation.classList.add('cloudy');
        createClouds();
    }
}

function createRaindrops() {
    for (let i = 0; i < 50; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
        drop.style.animationDelay = (Math.random() * 2) + 's';
        weatherAnimation.appendChild(drop);
    }
}

function createClouds() {
    for (let i = 0; i < 3; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.style.left = (Math.random() * 80) + '%';
        cloud.style.top = (Math.random() * 40) + '%';
        cloud.style.animationDelay = (Math.random() * 2) + 's';
        weatherAnimation.appendChild(cloud);
    }
}

// Toast Notification
function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

// Tab Navigation
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Update active states
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show/hide content
        tabContents.forEach(content => {
            if (content.id === targetTab + '-tab') {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });

        // Stop camera when switching away from camera tab
        if (targetTab !== 'camera' && window.stream) {
            window.stream.getTracks().forEach(track => track.stop());
            document.getElementById('camera-preview').srcObject = null;
            document.getElementById('startCamera').classList.remove('hidden');
            document.getElementById('stopCamera').classList.add('hidden');
            document.getElementById('capturePhoto').classList.add('hidden');
        }
    });
});

// Offline Detection
window.addEventListener('online', () => {
    document.getElementById('offline-message').classList.add('hidden');
    showToast('Back online!');
});

window.addEventListener('offline', () => {
    document.getElementById('offline-message').classList.remove('hidden');
    showToast('You are offline. Using cached data.');
});

// PWA Installation
let deferredPrompt;
const installButton = document.getElementById('installButton');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.classList.remove('hidden');
});

installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        showToast('Thank you for installing our app!');
    }
    deferredPrompt = null;
    installButton.classList.add('hidden');
});

// Initialize app when page loads
window.addEventListener('load', () => {
    checkPermissions();
    updateOnlineStatus();
    checkPermissionsNew();
});

// Export functions for use in other modules
window.updateWeatherAnimation = updateWeatherAnimation;
window.showToast = showToast;

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const weatherAnimation = document.querySelector('.weather-animation');

// Tab Navigation
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        
        // Update active states
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        // Handle specific tab actions
        if (tabName === 'camera') {
            initializeCamera();
        }
    });
});

// Weather Animation Update
window.updateWeatherAnimation = (weatherCode) => {
    weatherAnimation.className = 'weather-animation';
    
    if (weatherCode >= 200 && weatherCode < 300) {
        weatherAnimation.classList.add('weather-thunder');
    } else if (weatherCode >= 300 && weatherCode < 600) {
        weatherAnimation.classList.add('weather-rain');
    } else if (weatherCode >= 600 && weatherCode < 700) {
        weatherAnimation.classList.add('weather-snow');
    } else if (weatherCode >= 700 && weatherCode < 800) {
        weatherAnimation.classList.add('weather-mist');
    } else if (weatherCode === 800) {
        weatherAnimation.classList.add('weather-clear');
    } else if (weatherCode > 800) {
        weatherAnimation.classList.add('weather-clouds');
    }
};

// Camera Functionality
let stream = null;

async function initializeCamera() {
    const preview = document.getElementById('camera-preview');
    const startButton = document.getElementById('startCamera');
    const takePhotoButton = document.getElementById('takePhoto');
    const photoCanvas = document.getElementById('photo-canvas');
    const photoGallery = document.getElementById('photoGallery');
    
    startButton.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            preview.srcObject = stream;
            startButton.disabled = true;
            takePhotoButton.disabled = false;
            showToast('Camera started successfully');
        } catch (error) {
            console.error('Camera error:', error);
            showToast('Could not access camera');
        }
    });
    
    takePhotoButton.addEventListener('click', () => {
        if (stream) {
            const context = photoCanvas.getContext('2d');
            photoCanvas.width = preview.videoWidth;
            photoCanvas.height = preview.videoHeight;
            context.drawImage(preview, 0, 0);
            
            const photoUrl = photoCanvas.toDataURL('image/jpeg');
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            
            const img = document.createElement('img');
            img.src = photoUrl;
            
            const timestamp = new Date().toLocaleString();
            const caption = document.createElement('div');
            caption.className = 'photo-caption';
            caption.textContent = `Captured: ${timestamp}`;
            
            photoItem.appendChild(img);
            photoItem.appendChild(caption);
            photoGallery.insertBefore(photoItem, photoGallery.firstChild);
            
            showToast('Photo captured');
            
            // Save to localStorage
            const photos = JSON.parse(localStorage.getItem('weatherPhotos') || '[]');
            photos.unshift({ url: photoUrl, timestamp });
            if (photos.length > 10) photos.pop();
            localStorage.setItem('weatherPhotos', JSON.stringify(photos));
        }
    });
}

// Load saved photos
function loadSavedPhotos() {
    const photoGallery = document.getElementById('photoGallery');
    const photos = JSON.parse(localStorage.getItem('weatherPhotos') || '[]');
    
    photos.forEach(photo => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        
        const img = document.createElement('img');
        img.src = photo.url;
        
        const caption = document.createElement('div');
        caption.className = 'photo-caption';
        caption.textContent = `Captured: ${photo.timestamp}`;
        
        photoItem.appendChild(img);
        photoItem.appendChild(caption);
        photoGallery.appendChild(photoItem);
    });
}

// Toast Notification
window.showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
};

// Offline Detection
window.addEventListener('online', () => {
    document.getElementById('offline-message').classList.add('hidden');
    showToast('You are back online');
});

window.addEventListener('offline', () => {
    document.getElementById('offline-message').classList.remove('hidden');
    showToast('You are offline');
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSavedPhotos();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.error('ServiceWorker registration failed:', error);
            });
    }
});
