# 📊 Chart Dashboard Application

A modern React application that automatically detects and renders different types of charts using D3.js. The app intelligently determines whether your data represents single-series or multi-series charts and renders them with appropriate styling and colors.

## 🔗 Live Demo

Visit the deployed app here: https://chart-panto-task.vercel.app/

## ✨ Features

- 🎯 **Smart Chart Detection** - Automatically identifies chart type from data format
- 📈 **Single-Series Charts** - Clean line charts with null value handling
- 🌈 **Multi-Series Charts** - Three-color line charts (Blue, Green, Red) with legend
- 🔄 **Dynamic Rendering** - Processes all charts from data automatically
- 📱 **Responsive Design** - Modern, clean interface
- ⚡ **Performance Optimized** - Efficient data processing and rendering
- 🛡️ **Error Handling** - Graceful error handling and loading states

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd chart2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

The application will automatically load your chart data and display all charts!

## 📁 Data Format

The application expects a JSON file (`data.json`) with the following structure:

### Single-Series Chart

```json
{
  "title": "Temperature Over Time",
  "data": [
    [0, 23.5],
    [10, 24.1],
    [20, null],
    [30, 25.3]
  ]
}
```

### Multi-Series Chart

```json
{
  "title": "Cable Performance Metrics",
  "data": [
    [0, [34, 45, 75]],
    [10, [53, 84, 34]],
    [20, [null, 67, 89]],
    [30, [78, 92, 56]]
  ]
}
```

**Notes:**

- `timestamp` values can be any numeric value
- `null` values are automatically skipped during rendering
- Multi-series charts expect exactly 3 values per data point
- Chart titles are displayed above each chart

## 🏗️ Project Structure

```
chart2/
├── public/
│   ├── data.json          # Your chart data
│   └── index.html         # HTML template
├── src/
│   ├── components/
│   │   └── Chart.js       # D3.js chart rendering logic
│   ├── App.js             # Main application component
│   ├── App.css            # Application styles
│   ├── index.js           # React entry point
│   └── index.css          # Global styles
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 🎨 Chart Types & Colors

### Single-Series Charts

- **Color**: Blue (#2196F3)
- **Style**: Clean, continuous line
- **Features**: Automatic null value filtering, smooth curves

### Multi-Series Charts

- **Series 1**: Blue (#2196F3) - First data series
- **Series 2**: Green (#4CAF50) - Second data series
- **Series 3**: Red (#F44336) - Third data series
- **Features**: Individual legend, independent null handling per series

## 🛠️ Available Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm start`     | Starts development server    |
| `npm run build` | Creates production build     |
| `npm test`      | Runs test suite              |
| `npm run eject` | Ejects from Create React App |

## 🚀 Production Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your web server

3. **Ensure `data.json` is accessible** at the root of your deployment

### Modifying Chart Styles

Edit `src/components/Chart.js` to customize:

- Chart dimensions and margins
- Line colors and thickness
- Grid styling
- Axis formatting

### Updating Data

Simply replace `public/data.json` with your new chart data. The application will automatically detect and render the new charts.
