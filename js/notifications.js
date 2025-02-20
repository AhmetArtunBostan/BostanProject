document.addEventListener('DOMContentLoaded', () => {
    const locationBtn = document.getElementById('locationBtn');
    const notificationBtn = document.getElementById('notificationBtn');
    const cameraPermBtn = document.getElementById('cameraPermBtn');

    // Location permission
    locationBtn.addEventListener('click', async () => {
        try {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            if (result.state === 'granted') {
                const position = await getCurrentPosition();
                console.log('Location:', position);
            } else {
                const permission = await navigator.geolocation.getCurrentPosition(() => {
                    locationBtn.style.color = 'rgba(255, 255, 255, 0.9)';
                    console.log('Location permission granted');
                }, () => {
                    console.log('Location permission denied');
                });
            }
        } catch (error) {
            console.error('Error requesting location permission:', error);
        }
    });

    // Notification permission
    notificationBtn.addEventListener('click', async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                notificationBtn.style.color = 'rgba(255, 255, 255, 0.9)';
                console.log('Notification permission granted');
            } else {
                console.log('Notification permission denied');
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    });

    // Camera permission
    cameraPermBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            cameraPermBtn.style.color = 'rgba(255, 255, 255, 0.9)';
            console.log('Camera permission granted');
        } catch (error) {
            console.error('Error requesting camera permission:', error);
        }
    });

    // Helper function to get current position
    function getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }
});
