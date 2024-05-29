// Authorship: Yahan (50), Aleks (50)

import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { Card } from 'antd';
import axios from 'axios';
import { BASE_PARTY_COLORS, BACKEND_URL } from './utils/constants';
import {rgba} from './utils/colors';


const RealTimeBarEmotion = () => {
  const chartRef = useRef(null);
  const chart = useRef(null);  // Use useRef to directly manage the chart instance
  const [counts, setCounts] = useState({democrat: 0, republican: 0, green: 0, libertarian: 0});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios(`${BACKEND_URL}/api/overall-emotion`);
        const initialData = response.data;
        updateChartData(initialData); // Pass true to indicate initial setup
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
  
    const updateChartData = (data) => {
      if (!chartRef.current) return;
      // Destroy existing chart if one exists
      if (chart.current) {
        chart.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');

      const categories = ['joy', 'optimism', 'anger', 'sadness'];
      let newCounts = { ...counts };

      const getDataForParty = (partyKey) => {
        const partyData = data.rows.find(row => row.key === partyKey)?.value;
  
        if (!partyData) {
          return { anger: 0, joy: 0, optimism: 0, sadness: 0, count: 1 }; // Default if no data
        }
  
        return {
          anger: partyData.anger,
          joy: partyData.joy,
          optimism: partyData.optimism,
          sadness: partyData.sadness,
          count: partyData.count
        };
      };
  
      const parties = ['democrat', 'republican', 'green', 'libertarian'];
  
      const datasets = parties.map(party => {
        const partyData = getDataForParty(party);
        // Update counts for each party
        newCounts[party] = (newCounts[party] || 0) + partyData.count;
        return {
            label: party.charAt(0).toUpperCase() + party.slice(1),
            data: categories.map(category => partyData[category] / partyData.count),
            backgroundColor: rgba(BASE_PARTY_COLORS[party], 0.8),
            borderColor: BASE_PARTY_COLORS[party],
            borderWidth: 1
        };
    });
    setTimeout(() => {
      chart.current = new Chart(ctx, {
          type: 'bar',
          data: { labels: categories, datasets },
          options: {
            scales: {
              x: { stacked: false },
              y: { stacked: false, beginAtZero: true, suggestedMax: 1, ticks: { stepSize: 0.2 } }
            },
            plugins: { legend: { display: true }, title: { display: false } }
          }
        });
      }, 0);
      setCounts(newCounts);
    };

    fetchInitialData();

    // Cleanup
    return () => {
      if (chart.current) {
        chart.current.destroy();
        chart.current = null;
      }
    };
  }, []); 

  // Listen for changes and update the chart
  useEffect(() => {
    const eventSource = new EventSource(`${BACKEND_URL}/api/changes`);
    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      const { party, probability } = newData;

      if (chart.current) {
        // Clone the datasets to ensure immutability
        const newDatasets = chart.current.data.datasets.map(dataset => ({
          ...dataset,
          data: [...dataset.data]
        }));
        // console.log('Old data:', chart.current.data.datasets);

        const updatedCounts = { ...counts };  // Initialize updatedCounts 
        const datasetIndex = chart.current.data.datasets.findIndex(dataset => dataset.label.toLowerCase() === party);
        
        if (datasetIndex !== -1) {  
          const categories = ['joy', 'optimism', 'anger', 'sadness'];
          // Update each category within the dataset using the new probability
          categories.forEach((category, index) => {
            const currentCount = counts[party];
            const currentTotal = newDatasets[datasetIndex].data[index] * currentCount;
            const newTotal = currentTotal + probability[category];
            const newCount = currentCount + 1;

            // Calculate the new average
            newDatasets[datasetIndex].data[index] = newTotal / newCount;
            // Store the new count in updatedCounts object
            updatedCounts[party] = newCount;
          });

          // Set the cloned data to the chart and update
          chart.current.data.datasets = newDatasets;
          chart.current.update();
          // console.log('Updated data:', chart.current.data.datasets);

          // Update the counts
          setCounts(updatedCounts);
        }
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };

    // Cleanup
    return () => {
      if (chart.current) {
        chart.current.destroy();
      }
      eventSource.close();
    };
}, []);  


  return (
    <Card title="Real-time Overall Emotion Scores">
      <canvas ref={chartRef}></canvas>
    </Card>
  );
};

export default RealTimeBarEmotion;
