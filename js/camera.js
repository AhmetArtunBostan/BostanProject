// Camera functionality
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const cameraView = document.getElementById('cameraView');
    const weatherView = document.getElementById('weatherView');
    const historyView = document.getElementById('historyView');
    const cameraNavBtn = document.getElementById('cameraNavBtn');
    const backFromCamera = document.getElementById('backFromCamera');
    const cameraPreview = document.getElementById('cameraPreview');
    const photoPreview = document.getElementById('photoPreview');
    const capturedPhoto = document.getElementById('capturedPhoto');
    const takePhotoBtn = document.getElementById('takePhoto');
    const deletePhotoBtn = document.getElementById('deletePhoto');
    const savePhotoBtn = document.getElementById('savePhoto');
    const cameraPermBtn = document.getElementById('cameraPermBtn');
    const video = document.getElementById('camera');
    const weatherNavBtn = document.getElementById('weatherNavBtn');
    const historyNavBtn = document.getElementById('historyNavBtn');

    let stream = null;

    // Camera navigation
    cameraPermBtn.addEventListener('click', () => {
        weatherView.classList.remove('active');
        historyView.classList.remove('active');
        cameraView.classList.add('active');
        document.getElementById('weatherNavBtn').classList.remove('active');
        document.getElementById('historyNavBtn').classList.remove('active');
        cameraNavBtn.classList.add('active');
        startCamera();
    });

    if (cameraNavBtn) {
        cameraNavBtn.addEventListener('click', () => {
            weatherView.classList.remove('active');
            historyView.classList.remove('active');
            cameraView.classList.add('active');
            document.getElementById('weatherNavBtn').classList.remove('active');
            document.getElementById('historyNavBtn').classList.remove('active');
            cameraNavBtn.classList.add('active');
            startCamera();
        });
    }

    if (backFromCamera) {
        backFromCamera.addEventListener('click', () => {
            cameraView.classList.remove('active');
            weatherView.classList.add('active');
            cameraNavBtn.classList.remove('active');
            document.getElementById('weatherNavBtn').classList.add('active');
            stopCamera();
        });
    }

    // Camera functions
    async function startCamera() {
        try {
            if (!stream) {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    } 
                });
                cameraPreview.srcObject = stream;
            }
            
            cameraPermBtn.style.display = 'none';
            cameraPreview.style.display = 'block';
            photoPreview.style.display = 'none';
            takePhotoBtn.style.display = 'block';
            
            await cameraPreview.play();
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Could not access the camera. Please check permissions.');
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            cameraPreview.srcObject = null;
        }
    }

    // Photo capture and management
    takePhotoBtn.addEventListener('click', () => {
        if (!stream) return;

        const canvas = document.createElement('canvas');
        const videoWidth = cameraPreview.videoWidth;
        const videoHeight = cameraPreview.videoHeight;
        
        // Maintain aspect ratio
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        
        canvas.getContext('2d').drawImage(cameraPreview, 0, 0, videoWidth, videoHeight);
        capturedPhoto.src = canvas.toDataURL('image/jpeg');
        
        cameraPreview.style.display = 'none';
        photoPreview.style.display = 'block';
        takePhotoBtn.style.display = 'none';
    });

    deletePhotoBtn.addEventListener('click', () => {
        capturedPhoto.src = '';
        photoPreview.style.display = 'none';
        cameraPreview.style.display = 'block';
        takePhotoBtn.style.display = 'block';
    });

    savePhotoBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `weather-photo-${new Date().toISOString()}.jpg`;
        link.href = capturedPhoto.src;
        link.click();
        
        // Reset view after saving
        deletePhotoBtn.click();
    });
});
