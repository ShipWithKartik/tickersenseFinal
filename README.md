# TickerSense 📊

TickerSense is an AI-powered stock insights and visualization tool that allows users to analyze stock data through interactive charts. Upload your own CSV files or fetch real-time stock data using the Twelve Data API.

## Features

- 📈 Interactive charts with multiple visualization types (Line, Bar, Pie)
- 📂 CSV file upload with automatic parsing using Papa Parse
- 🔍 Real-time stock data lookup using Twelve Data API
- 🎨 Clean, dark mode UI with responsive design
- 🔄 Dynamic chart updates with smooth animations
- 📱 Mobile-friendly interface

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for API calls and CDN resources)
- Twelve Data API key (for real-time stock data)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tickersense.git
   cd tickersense
   ```

2. Open `index.html` in your web browser

### Using Your Own API Key

1. Sign up for a free API key at [Twelve Data](https://twelvedata.com/)
2. Open `app.js`
3. Replace `YOUR_API_KEY_HERE` with your actual API key

## Usage

### Uploading CSV Files
1. Click "Choose CSV File" and select your CSV file
2. The application will automatically parse and display the data
3. Use the dropdown to switch between different chart types

### Fetching Stock Data
1. Enter a stock symbol (e.g., AAPL, MSFT, GOOGL) in the search box
2. Click "Ask AI" to fetch the latest stock data
3. View the interactive chart with the stock's performance

## File Structure

```
tickersense/
├── index.html          # Main HTML file
├── style.css          # CSS styles
├── app.js             # Main JavaScript application
└── README.md          # This file
```

## Dependencies

- [Chart.js](https://www.chartjs.org/) - Interactive charts
- [Papa Parse](https://www.papaparse.com/) - CSV parsing
- [Twelve Data API](https://twelvedata.com/) - Real-time stock data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Built with ❤️ for financial data visualization
- Special thanks to Twelve Data for their excellent API

---

**First Project: One must imagine engineers happy!**
