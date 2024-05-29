// Authorship: Yahan (50), Aleks (50)

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card } from 'antd';
import axios from 'axios';
import { BASE_PARTY_COLORS, BACKEND_URL } from './utils/constants';
import {rgba} from './utils/colors';


const RadarChartEmotion = () => {
  const chartRef = useRef(null);
  const chart = useRef(null);  // Use useRef to directly manage the chart instance

  // Fetch the initial data and set up the chart
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios(`${BACKEND_URL}/api/overall-emotion`);
        const initialData = response.data;
        // console.log('Initial data:', initialData);
        updateChartData(initialData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    const updateChartData = (data) => {
      // check if the chart is already created
      if (chart.current) {
        chart.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      
      const categories = ['joy', 'optimism', 'anger', 'sadness'];

      const democratData = data.rows.find(row => row.key === "democrat").value;
      const republicanData = data.rows.find(row => row.key === "republican").value;
      const democratAverages = {
        anger: democratData.anger / democratData.count,
        joy: democratData.joy / democratData.count,
        optimism: democratData.optimism / democratData.count,
        sadness: democratData.sadness / democratData.count
      };
      const republicanAverages = {
        anger: republicanData.anger / republicanData.count,
        joy: republicanData.joy / republicanData.count,
        optimism: republicanData.optimism / republicanData.count,
        sadness: republicanData.sadness / republicanData.count
      };


      const datasets = [
        {
          label: 'Democrat',
          data: categories.map((emotion) => (democratAverages && democratAverages[emotion] ? democratAverages[emotion] * 100 : 0)),
          backgroundColor: rgba(BASE_PARTY_COLORS.democrat, 0.6),
          borderColor: BASE_PARTY_COLORS.democrat,
          borderWidth: 1,
        },
        {
          label: 'Republican',
          data: categories.map((emotion) => (republicanAverages && republicanAverages[emotion] ? republicanAverages[emotion] * 100 : 0)),
          backgroundColor: rgba(BASE_PARTY_COLORS.republican, 0.6),
          borderColor: BASE_PARTY_COLORS.republican,
          borderWidth: 1,
        },
      ];

      chart.current = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: categories,
          datasets: datasets,
        },
        options: {
            scales: {
              r: {
                angleLines: {
                  display: true,
                },
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: {
                  stepSize: 20,
                  display: true, //false //hide the labels
                },
                pointLabels: {
                  display: true, // false, // to hide the point labels if desired
                },
              },
            },
            plugins: {
                legend: {
                    display: false
                },
            },
          }
          
      });
    };

    fetchInitialData();

    // Cleanup
    return () => {
      if (chart.current) {
        chart.current.destroy();
      }
    };
  }, []);

  // Listen for changes and update the chart
  useEffect(() => {
    let eventSource = new EventSource(`${BACKEND_URL}/api/changes`);
    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
    //   console.log('New data:', newData);

      // Ensure only updates for democrat and republican parties 
      if (!['democrat', 'republican'].includes(newData.party)) {
        return;
      }
      const label = newData.party;
      const probabilities = newData.probability;

      // Find the index of the updated label in the categories
      const datasetIndex = label === 'democrat' ? 0 : 1;

      // Update the corresponding dataset
      if (chart.current) {
        // Clone the datasets to ensure immutability
        const newDatasets = chart.current.data.datasets.map(dataset => ({
          ...dataset,
          data: [...dataset.data]
        }));
        
        // Update the cloned data
        const categories = ['joy', 'optimism', 'anger', 'sadness'];
        categories.forEach((category, index) => {
          newDatasets[datasetIndex].data[index] += probabilities[category];
        });
  
        // Set the cloned data to the chart and update
        chart.current.data.datasets = newDatasets;
        chart.current.update();
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };

    // Cleanup
    return () => {
      // if chart exists, destroy it
      if (chart.current) { chart.current.destroy(); } 
      eventSource.close();
    };
  }, []); // Only re-run if chart object changes

  return (
    <Card title="Real-time Overall Emotion Scores">
      <canvas ref={chartRef}></canvas>
    </Card>
  );
};

export default RadarChartEmotion;
