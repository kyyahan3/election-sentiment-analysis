// Authorship: Yahan

import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns'; // Ensure this is imported
import axios from 'axios';
import { rgba } from './utils/colors';
import { getChartOptions } from './utils/tsplotConfig';
import { Card, Select } from 'antd';
import { BASE_PARTY_COLORS, BACKEND_URL } from './utils/constants';

const { Option } = Select;

// Register Chart.js components
Chart.register(...registerables);


const TSPlotSentiment = () => {
    const [aggregation, setAggregation] = useState('6h');  // Default 
    const [data, setData] = useState({
        democrat: [],
        republican: []
    });
    const chartContainer = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
      const fetchData = async () => {
        const url = `${BACKEND_URL}/api/sentiment_trend/${aggregation}`;
        try {
          const response = await axios.get(url);
          // console.log("Data received:", response.data);  // Debugging log

          // sort data by time and set it to state
          response.data.democrat.sort((a, b) => new Date(a.time) - new Date(b.time));
          response.data.republican.sort((a, b) => new Date(a.time) - new Date(b.time));
          setData(response.data);

        } catch (error) {
          console.error('Error fetching sentiment data:', error);
        }
      };
      fetchData();
    }, [aggregation]);

    
    useEffect(() => {
      if (chartContainer.current && data.democrat && data.republican) {
          const options = getChartOptions(aggregation);
          const chartData = {
            labels: data.democrat.map(item => item.time),  // Assuming both parties have the same timestamps
            datasets: [
              {   // Democrat trends
                label: 'Democrat Overall Sentiment',
                borderColor: BASE_PARTY_COLORS.democrat,
                backgroundColor: rgba(BASE_PARTY_COLORS.democrat, 0.6),
                data: data.democrat.map(item => item.value),
                tension: 0.4,
                spanGaps: true,
              },
              {   // Republican trends
                label: 'Republican Overall Sentiment',
                borderColor: BASE_PARTY_COLORS.republican,
                backgroundColor: rgba(BASE_PARTY_COLORS.republican, 0.6),
                data: data.republican.map(item => item.value),
                tension: 0.4,
                spanGaps: true,
              }
            ]
          };

          if (chartInstance.current) {
              chartInstance.current.destroy();
          }

          chartInstance.current = new Chart(chartContainer.current, {
            type: 'line',
            data: chartData,
            options: options
          });
      }
      return () => {
          if (chartInstance.current) {
              chartInstance.current.destroy();
              chartInstance.current = null; 
          }
      };
    }, [data]); // Re-create the chart when 'data' changes

    return (
        <Card title="Sentiment Analysis for Democrats vs Republican Over Time" bordered={false}>
          <Select defaultValue="6h" style={{ width: 200 }} onChange={setAggregation}>
            <Option value="30m">Every 30 Minutes</Option>
            <Option value="1h">Hourly</Option>
            <Option value="6h">Every 6 Hours</Option>
            <Option value="12h">Half Day</Option>
            <Option value="1d">Daily</Option>
          </Select>
          <canvas ref={chartContainer}></canvas>
        </Card>
      );
      
};

export default TSPlotSentiment;
