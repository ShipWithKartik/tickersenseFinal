// Configuration
const API_KEY = "b6e8ce54e3fe097a93505cf5d412c990";
const API_BASE_URL = "https://api.marketstack.com/v2/eod";

// DOM Elements
const csvFileInput = document.getElementById('csvFile');
const fileNameSpan = document.getElementById('fileName');
const chartTypeSelect = document.getElementById('chartType');
const updateChartBtn = document.getElementById('updateChart');
const chartCanvas = document.getElementById('dataChart');
const noDataMessage = document.getElementById('noDataMessage');
const stockQueryInput = document.getElementById('stockQuery');
const askAIBtn = document.getElementById('askAI');
const aiResponse = document.getElementById('aiResponse');

// Global variables
let currentChart = null;
let chartData = null;
let chartLabels = [];
let chartDatasets = [];

// Initialize the application
function init() {
    setupEventListeners();
    showNoDataMessage();
}

// Set up event listeners
function setupEventListeners() {
    // File upload handling
    csvFileInput.addEventListener('change', handleFileUpload);
    
    // Chart controls
    updateChartBtn.addEventListener('click', updateChart);
    
    // AI query handling
    askAIBtn.addEventListener('click', handleAIQuery);
    stockQueryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAIQuery();
    });
}

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    fileNameSpan.textContent = file.name;
    parseCSV(file);
}

// Parse CSV file using PapaParse
function parseCSV(file) {
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
            if (results.errors.length > 0) {
                showError("Error parsing CSV file: " + results.errors[0].message);
                return;
            }
            
            processCSVData(results.data, results.meta.fields);
        }
    });
}

// Process parsed CSV data
function processCSVData(data, headers) {
    if (data.length === 0) {
        showError("The uploaded CSV file is empty");
        return;
    }
    
    // Extract labels and datasets from CSV
    chartLabels = data.map(row => row[headers[0]] || '');
    chartDatasets = [];
    
    // Create datasets for each column (except the first one which is used as labels)
    for (let i = 1; i < headers.length; i++) {
        const header = headers[i];
        const dataset = {
            label: header,
            data: data.map(row => row[header]),
            borderColor: getRandomColor(),
            backgroundColor: getRandomColor(0.2),
            borderWidth: 2,
            fill: true
        };
        chartDatasets.push(dataset);
    }
    
    chartData = {
        labels: chartLabels,
        datasets: chartDatasets
    };
    
    renderChart(chartTypeSelect.value);
}

// Render chart with the specified type
function renderChart(type) {
    if (!chartData) {
        showNoDataMessage();
        return;
    }
    
    hideNoDataMessage();
    
    const ctx = chartCanvas.getContext('2d');
    
    // Destroy previous chart if it exists
    if (currentChart) {
        currentChart.destroy();
    }
    
    // Common chart options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#ffffff'
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                titleFont: { size: 14 },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 4,
                displayColors: true
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#b3b3b3'
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#b3b3b3'
                }
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        }
    };
    
    // Create chart based on type
    switch (type) {
        case 'line':
            currentChart = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: commonOptions
            });
            break;
            
        case 'bar':
            currentChart = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: {
                    ...commonOptions,
                    scales: {
                        ...commonOptions.scales,
                        x: {
                            ...commonOptions.scales.x,
                            stacked: true
                        },
                        y: {
                            ...commonOptions.scales.y,
                            stacked: true
                        }
                    }
                }
            });
            break;
            
        case 'pie':
            // For pie charts, we'll use the first dataset and take the first 10 data points
            const pieData = {
                labels: chartData.labels.slice(0, 10),
                datasets: [{
                    data: chartData.datasets[0].data.slice(0, 10),
                    backgroundColor: Array(10).fill().map(() => getRandomColor(0.7)),
                    borderColor: '#1e1e1e',
                    borderWidth: 1
                }]
            };
            
            currentChart = new Chart(ctx, {
                type: 'pie',
                data: pieData,
                options: {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        legend: {
                            ...commonOptions.plugins.legend,
                            position: 'right'
                        }
                    }
                }
            });
            break;
    }
    
    // Add animation class
    chartCanvas.classList.add('fade-in');
}

// Update chart when type changes
function updateChart() {
    renderChart(chartTypeSelect.value);
}

// Handle AI query for stock data
async function handleAIQuery() {
    const query = stockQueryInput.value.trim();
    if (!query) {
        showError(aiResponse, "Please enter a stock symbol");
        return;
    }
    
    try {
        showLoading(aiResponse, `Fetching data for ${query.toUpperCase()}...`);
        
        // Add a small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await fetchStockData(query);
        
        if (response && response.data && response.data.length > 0) {
            // Process and display the stock data
            processStockData(response, query);
            showSuccess(aiResponse, `Successfully loaded data for ${query.toUpperCase()}`);
        } else {
            showError(aiResponse, `No data found for symbol: ${query.toUpperCase()}`);
        }
    } catch (error) {
        console.error("Error in handleAIQuery:", error);
        
        // More user-friendly error messages
        let errorMessage = error.message || 'Failed to fetch stock data';
        
        // Handle specific error cases
        if (error.message.includes('422')) {
            errorMessage = `Invalid stock symbol: ${query.toUpperCase()}. Please check the symbol and try again.`;
        } else if (error.message.includes('limit') || error.message.includes('quota')) {
            errorMessage = 'API rate limit exceeded. Please try again later.';
        } else if (error.message.includes('401')) {
            errorMessage = 'Invalid API key. Please check your API configuration.';
        } else if (error.message.includes('404')) {
            errorMessage = `No data available for symbol: ${query.toUpperCase()}`;
        }
        
        showError(aiResponse, `Error: ${errorMessage}`);
    }
}

// Fetch stock data from Marketstack API
async function fetchStockData(symbol) {
    try {
        // Build the API URL with required parameters
        const params = new URLSearchParams({
            access_key: API_KEY,
            symbols: symbol.toUpperCase(),
            limit: 30, // Get last 30 days of data
            sort: 'DESC' // Get most recent data first
        });
        
        console.log('Fetching data for symbol:', symbol);
        const apiUrl = `${API_BASE_URL}?${params}`;
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Handle error responses
        if (!response.ok) {
            const errorMessage = data?.error?.message || 
                              `API request failed with status ${response.status}`;
            throw new Error(errorMessage);
        }
        
        console.log('API Response:', data);
        
        // Check for API-level errors
        if (data.error) {
            throw new Error(data.error.message || 'Error fetching stock data');
        }
        
        // Check if we have valid data
        if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
            throw new Error('No data available for the specified symbol');
        }
        
        return data;
    } catch (error) {
        console.error('Error in fetchStockData:', error);
        throw error; // Re-throw to be caught by the caller
    }
}

// Process and display stock data
function processStockData(stockData, symbol) {
    // Ensure we have valid data
    if (!stockData || !Array.isArray(stockData.data) || stockData.data.length === 0) {
        console.error('Invalid or empty stock data:', stockData);
        throw new Error('No data available for the specified symbol');
    }
    
    const values = stockData.data;
    console.log('Processing stock data for symbol:', symbol, 'Data points:', values.length);
    
    try {
        // Get the most recent data point for the info panel
        const latestData = values[0];
        
        // Extract dates and closing prices (reverse to show oldest to newest)
        const dates = [];
        const closingPrices = [];
        
        // Process each data point
        for (let i = values.length - 1; i >= 0; i--) {
            const item = values[i];
            if (item.date && item.close !== undefined) {
                dates.push(item.date.split('T')[0]);
                closingPrices.push(parseFloat(item.close));
            }
        }
        
        if (dates.length === 0) {
            throw new Error('No valid date/price data found in the response');
        }
    
        // Update chart data
        chartData = {
            labels: dates,
            datasets: [{
                label: `${symbol.toUpperCase()} Closing Price`,
                data: closingPrices,
                borderColor: '#4a6cf7',
                backgroundColor: 'rgba(74, 108, 247, 0.1)',
                borderWidth: 2,
            fill: true,
            tension: 0.3
        }]
    };
    
        // Render the chart
        renderChart('line');
        
        // Switch to line chart for stock data
        chartTypeSelect.value = 'line';
        
        // Display the stock information
        displayStockInfo(latestData);
    } catch (error) {
        console.error('Error in processStockData:', error);
        throw error; // Re-throw to be caught by the caller
    }
    
}

// Display stock information in a formatted way
function displayStockInfo(stock) {
    const infoContainer = document.createElement('div');
    infoContainer.className = 'stock-info';
    
    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: stock.price_currency || 'USD'
        }).format(value);
    };
    
    // Format volume
    const formatVolume = (volume) => {
        if (!volume) return 'N/A';
        return new Intl.NumberFormat('en-US').format(volume);
    };
    
    // Format date
    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: 'UTC'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };
    
    infoContainer.innerHTML = `
        <div class="stock-header">
            <h3>${stock.name || 'N/A'} (${stock.symbol || 'N/A'})</h3>
            <span class="exchange">${stock.exchange_code || 'N/A'}: ${stock.exchange || 'N/A'}</span>
        </div>
        <div class="stock-price">
            <span class="current-price">${formatCurrency(stock.close)}</span>
            <span class="price-change ${stock.close >= stock.open ? 'positive' : 'negative'}">
                ${stock.close >= stock.open ? '▲' : '▼'} 
                ${formatCurrency(Math.abs(stock.close - stock.open))} 
                (${((stock.close - stock.open) / stock.open * 100).toFixed(2)}%)
            </span>
        </div>
        <div class="stock-details">
            <div class="detail">
                <span class="label">Open:</span>
                <span class="value">${formatCurrency(stock.open)}</span>
            </div>
            <div class="detail">
                <span class="label">High:</span>
                <span class="value">${formatCurrency(stock.high)}</span>
            </div>
            <div class="detail">
                <span class="label">Low:</span>
                <span class="value">${formatCurrency(stock.low)}</span>
            </div>
            <div class="detail">
                <span class="label">Volume:</span>
                <span class="value">${formatVolume(stock.volume)}</span>
            </div>
            <div class="detail">
                <span class="label">Date:</span>
                <span class="value">${formatDate(stock.date)}</span>
            </div>
        </div>
    `;
    
    // Clear previous content and append new info
    aiResponse.innerHTML = '';
    aiResponse.appendChild(infoContainer);
    aiResponse.style.display = 'block';
    
    // Add CSS for the stock info
    const style = document.createElement('style');
    style.textContent = `
        .stock-info {
            background-color: var(--surface-color);
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .stock-header {
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
        }
        .stock-header h3 {
            margin: 0 0 0.5rem 0;
            color: var(--text-primary);
        }
        .exchange {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        .stock-price {
            margin-bottom: 1.5rem;
        }
        .current-price {
            font-size: 2rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-right: 1rem;
        }
        .price-change {
            font-size: 1rem;
            font-weight: 500;
            padding: 0.3rem 0.6rem;
            border-radius: 4px;
        }
        .price-change.positive {
            background-color: rgba(76, 175, 80, 0.1);
            color: #4caf50;
        }
        .price-change.negative {
            background-color: rgba(244, 67, 54, 0.1);
            color: #f44336;
        }
        .stock-details {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
        }
        .detail {
            display: flex;
            flex-direction: column;
        }
        .label {
            color: var(--text-secondary);
            font-size: 0.85rem;
            margin-bottom: 0.25rem;
        }
        .value {
            color: var(--text-primary);
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);
}

// Helper function to generate random colors
function getRandomColor(alpha = 1) {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// UI Helper Functions
function showNoDataMessage() {
    noDataMessage.style.display = 'block';
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
}

function hideNoDataMessage() {
    noDataMessage.style.display = 'none';
}

function showError(element, message) {
    element.innerHTML = `<div class="error-message">${message}</div>`;
    element.style.display = 'block';
}

function showSuccess(element, message) {
    element.innerHTML = `<div class="success-message">${message}</div>`;
    element.style.display = 'block';
}

function showLoading(element, message = 'Loading...') {
    element.innerHTML = `<div class="loading-message">${message}</div>`;
    element.style.display = 'block';
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
