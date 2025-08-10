import React, { useState, useEffect } from 'react';
import Chart from './components/Chart';
import './App.css';

function App() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error('Failed to load data');
        }
        const data = await response.json();
        setChartData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading charts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <h1 className="app-title">Chart Dashboard</h1>
        {chartData.map((chart, index) => (
          <div key={index} className="chart-container">
            <h2 className="chart-title">{chart.title}</h2>
            <Chart data={chart.data} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
