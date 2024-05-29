// Authorship: Yahan

import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import axios from 'axios'; // Import axios for making HTTP requests
import { Doughnut } from 'react-chartjs-2';
import { BACKEND_URL } from './utils/constants';

function DoughnutPosts() {
    const [docCount, setDocCount] = useState(null);
    const [democratCount, setDemocratCount] = useState(0);
    const [republicanCount, setRepublicanCount] = useState(0);

    useEffect(() => {
        // Function to fetch document count from the API
        const fetchDocCount = async () => {
            try {
                const response = await axios.get('${BACKEND_URL}/count/sentiment_data'); 
                // Store the response in state
                setDemocratCount(response.data['democrat']);
                setRepublicanCount(response.data['republican']);
                setDocCount(response.data['democrat'] + response.data['republican']);
            } catch (error) {
                console.error('Failed to fetch document count', error);
                setDocCount('Error fetching data'); // Handle error state
            }
        };
        fetchDocCount(); // Call the function when the component mounts
    }, []); 

    // Doughnut chart data
    const data = {
        labels: ['Democrats', 'Republicans'],
        datasets: [
            {
                data: [democratCount, republicanCount],
                // add transparent colors to the chart
                backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)'],
                hoverBackgroundColor: ['#0074D9', '#FF851B'],
            },
        ],
    };

    // Prepare the options for the Doughnut chart
    const options = {
        maintainAspectRatio: false, // set this to false if you want the chart to be responsive
        plugins: {
            legend: { display: false, },
        cutoutPercentage: 90,
        },
    };

    return (
        <Card 
            title={<span style={{ fontSize: '15px'}}>
                Total Posts:   {docCount !== null ? docCount : 'Loading...'}</span>}
            align="middle"
            style={{ height: '230px' }}
        >
            <div style={{ height: '80px', marginBottom: '20px', marginTop: '15px'}}> 
                <Doughnut data={data} options={options} />
            </div>
        </Card>
    );
}

export default DoughnutPosts;
