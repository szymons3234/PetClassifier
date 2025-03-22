// Pet Breed Recognizer - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const removeImageBtn = document.getElementById('remove-image');
    const predictBtn = document.getElementById('predict-button');
    const uploadSection = document.getElementById('upload-section');
    const loadingSection = document.getElementById('loading-section');
    const resultSection = document.getElementById('result-section');
    const breedResult = document.getElementById('breed-result');
    const confidenceBar = document.getElementById('confidence-bar');
    const confidenceValue = document.getElementById('confidence-value');
    const tryAgainBtn = document.getElementById('try-again-button');
    const errorSection = document.getElementById('error-section');
    const errorMessage = document.getElementById('error-message');
    const errorTryAgainBtn = document.getElementById('error-try-again-button');
    const resultImage = document.getElementById('result-image');

    // API endpoint
    const API_URL = 'http://localhost:8000/predict'; // Upewnij się że port zgadza się z portem serwera w PyCharm

    // Current file to upload
    let currentFile = null;

    // Add decorative paw elements
    addDecorativePaws();

    // Event Listeners
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);
    dropArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    removeImageBtn.addEventListener('click', resetUpload);
    predictBtn.addEventListener('click', predictBreed);
    tryAgainBtn.addEventListener('click', resetToUpload);
    errorTryAgainBtn.addEventListener('click', resetToUpload);

    // Drag and Drop Handlers
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.add('highlight');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('highlight');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('highlight');
        
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            handleFiles(files);
        }
    }

    // File Selection Handler
    function handleFileSelect(e) {
        const files = e.target.files;
        if (files.length) {
            handleFiles(files);
        }
    }

    // Process the selected files
    function handleFiles(files) {
        const file = files[0];
        
        // Check if file is an image
        if (!file.type.match('image.*')) {
            showError('Please select an image file (JPEG, PNG, etc.)');
            return;
        }
        
        currentFile = file;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            dropArea.classList.add('hidden');
            previewContainer.classList.remove('hidden');
            previewContainer.classList.add('fade-in');
        };
        reader.readAsDataURL(file);
    }

    // Reset the upload area
    function resetUpload(e) {
        if (e) {
            e.stopPropagation();
        }
        currentFile = null;
        fileInput.value = '';
        previewContainer.classList.add('hidden');
        dropArea.classList.remove('hidden');
    }

    // Reset to upload view
    function resetToUpload() {
        resultSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        resetUpload();
    }

    // Make prediction request
    async function predictBreed() {
        if (!currentFile) {
            return;
        }

        // Show loading
        uploadSection.classList.add('hidden');
        loadingSection.classList.remove('hidden');
        
        // Create form data
        const formData = new FormData();
        formData.append('file', currentFile);
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    
                },
                mode: 'cors',
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            const result = await response.json();
            displayResult(result);
        } catch (error) {
            console.error('Error:', error);
            showError(`Failed to analyze image: ${error.message}`);
        }
    }

    // Display prediction result
    function displayResult(result) {
        loadingSection.classList.add('hidden');
        
        // Format breed name (remove trailing space if present)
        const breedName = result.class.trim();
        
        // Update result elements
        breedResult.textContent = breedName;
        
        // Ensure image is visible and animated
        console.log('Displaying result image from:', previewImage.src);
        resultImage.src = previewImage.src;
        resultImage.classList.remove('hidden', 'opacity-0');
        resultImage.classList.add('block', 'opacity-100');
        
        // Force reflow to trigger animation
        void resultImage.offsetWidth;
        
        const confidencePercent = Math.round(result.confidence * 100);
        confidenceValue.textContent = `${confidencePercent}%`;
        
        // Set confidence bar width
        confidenceBar.style.setProperty('--confidence-width', `${confidencePercent}%`);
        confidenceBar.style.width = `${confidencePercent}%`;
        
        // Show result section with animation
        resultSection.classList.remove('hidden');
        resultSection.classList.add('slide-up');
    }

    // Show error message
    function showError(message) {
        loadingSection.classList.add('hidden');
        uploadSection.classList.add('hidden');
        
        errorMessage.textContent = message;
        errorSection.classList.remove('hidden');
        errorSection.classList.add('fade-in');
    }

    // Add decorative paw elements
    function addDecorativePaws() {
        const container = document.querySelector('.container');
        const pawCount = 5;
        
        for (let i = 0; i < pawCount; i++) {
            const paw = document.createElement('div');
            paw.classList.add('pet-paw');
            
            // Random positioning
            paw.style.top = `${Math.random() * 100}%`;
            paw.style.left = `${Math.random() * 100}%`;
            paw.style.opacity = `${Math.random() * 0.5 + 0.1}`;
            
            container.appendChild(paw);
        }
    }
});
