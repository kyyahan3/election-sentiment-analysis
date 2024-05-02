// Authorship: Yahan

import React, { useEffect, useRef, useState } from "react";
import { VennDiagramChart, extractSets } from "chartjs-chart-venn";
import { Chart, Tooltip, registerables } from "chart.js";
import { Card } from 'antd';

// Register Chart.js components and Venn diagram
Chart.register(...registerables, VennDiagramChart);

const ChartVenn = () => {
  const [data, setData] = useState([]);
  const canvasRef = useRef(null);
  const chartRef = useRef(null); 

  useEffect(() => {
    // Function to fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/user-count');
        const jsonData = await response.json();
        const formattedData = [
            { sets: ["Democrat"], value: isNaN(jsonData.democrat_count) ? 0 : jsonData.democrat_count },
            { sets: ["Republican"], value: isNaN(jsonData.republican_count) ? 0 : jsonData.republican_count },
            { sets: ["Democrat", "Republican"], value: isNaN(jsonData.both_parties_count) ? 0 : jsonData.both_parties_count }
        ];
        // console.log('Data:', formattedData); // for debugging
        setData(formattedData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (canvasRef.current && data.length) {
        if (chartRef.current) {
          chartRef.current.destroy();
        }
        const config = {
            type: 'venn',
            data: {
              labels: ['Democrat', 'Republican', 'Both Parties'],
              datasets: [{
                data: data, 
                backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(185, 143, 221, 0.6)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(185, 143, 221, 1)'],
                borderWidth: 2
              }]
            },
            
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                title: {
                    display: false,
                },
                tooltip:{
                    bodyFont:{  
                      size: 16
                    }
                },
                labels: {
                    font: {
                      size: 20 // Increase the font size of the labels
                    }
                },
              },
              layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 3,
                    bottom: 20,
                }
              },
              elements: {
                arc: {
                    borderWidth: 2, // Adjust the border width of the circles
                    hoverBorderWidth: 2 // Adjust the border width on hover
                }
            }
        },
    };
      
        if (chartRef.current) {
        chartRef.current.destroy();
        }
          
          chartRef.current = new VennDiagramChart(canvasRef.current, config);
        }
      }, [data]); // Re-render when data changes

    return (
    <Card 
        title="User Count" 
        style={{ height: '230px', marginTop: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <div style={{ flexGrow: 1, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%' }}></canvas>
      </div>
    </Card>
    );
};

export default ChartVenn;
