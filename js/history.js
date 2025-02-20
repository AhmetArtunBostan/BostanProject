// Weather History functionality
let historyChart = null;

// DOM Elements
const historyView = document.getElementById('historyView');
const historyBtn = document.getElementById('historyBtn');
const backFromHistory = document.getElementById('backFromHistory');
const historyTabs = document.querySelectorAll('.tab-button');
const chartCanvas = document.getElementById('historyChart');
const weatherView = document.getElementById('weatherView');
const historyNavBtn = document.getElementById('historyNavBtn');
const historyList = document.getElementById('historyList');

// Sample data structure
const weatherHistory = {
    '24h': {
        labels: Array.from({length: 24}, (_, i) => `${i}:00`),
        temperatures: Array.from({length: 24}, () => Math.round(Math.random() * 10 + 15)),
        conditions: Array.from({length: 24}, () => ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)])
    },
    '1w': {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        temperatures: Array.from({length: 7}, () => Math.round(Math.random() * 10 + 15)),
        conditions: Array.from({length: 7}, () => ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)])
    },
    '1m': {
        labels: Array.from({length: 30}, (_, i) => `Day ${i + 1}`),
        temperatures: Array.from({length: 30}, () => Math.round(Math.random() * 10 + 15)),
        conditions: Array.from({length: 30}, () => ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)])
    }
};

// Event Listeners
historyBtn.addEventListener('click', () => {
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    historyView.classList.add('active');
    showHistoryData('24h'); // Default to 24-hour view
});

backFromHistory.addEventListener('click', () => {
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.getElementById('weatherView').classList.add('active');
});

historyTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        historyTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        showHistoryData(tab.dataset.period);
    });
});

historyNavBtn.addEventListener('click', () => {
    weatherView.classList.remove('active');
    historyView.classList.add('active');
    loadHistoryData();
});

backFromHistory.addEventListener('click', () => {
    historyView.classList.remove('active');
    weatherView.classList.add('active');
});

// Chart Functions
function showHistoryData(period) {
    const data = weatherHistory[period];
    
    if (historyChart) {
        historyChart.destroy();
    }

    historyChart = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: data.temperatures,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Weather History - ${period === '24h' ? 'Last 24 Hours' : period === '1w' ? 'Last Week' : 'Last Month'}`
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });

    // Add weather condition indicators
    const conditionsContainer = document.createElement('div');
    conditionsContainer.className = 'weather-conditions';
    data.conditions.forEach((condition, index) => {
        const indicator = document.createElement('span');
        indicator.className = `condition-indicator ${condition.toLowerCase()}`;
        indicator.title = `${data.labels[index]}: ${condition}`;
        conditionsContainer.appendChild(indicator);
    });

    const existingContainer = document.querySelector('.weather-conditions');
    if (existingContainer) {
        existingContainer.remove();
    }
    chartCanvas.parentNode.appendChild(conditionsContainer);
}

// Load history data
function loadHistoryData() {
    // Clear existing items
    historyList.innerHTML = '';

    // Get weather history from localStorage
    const history = JSON.parse(localStorage.getItem('weatherHistory') || '[]');

    // Create history items
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-item-time">${new Date(item.timestamp).toLocaleString()}</div>
            <div class="history-item-temp">${item.temperature}°</div>
            <div class="history-item-desc">${item.description}</div>
        `;
        historyList.appendChild(historyItem);
    });

    if (history.length === 0) {
        historyList.innerHTML = '<div class="no-history">No weather history available</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadHistoryData();
});
