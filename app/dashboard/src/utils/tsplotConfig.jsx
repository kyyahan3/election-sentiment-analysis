import {PLOT_TITLE_FONT, PLOT_TITLE_PADDING } from './constants';

export const getXAxisOptions = (aggregation) => {
    switch (aggregation) {
        case '30m':
            return {
                type: 'time',
                time: {
                unit: 'hour',
                tooltipFormat: 'yyyy-MM-dd HH:mm',
                stepSize: 1,  
                displayFormats: {
                    minute: 'HH:mm'
                }
                }
            };
        case '1h':
        case '6h':
        case '12h': // Grouping '1h' and '12h' for similar formatting
            return {
                type: 'time',
                time: {
                    unit: 'hour',
                    tooltipFormat: 'yyyy-MM-dd HH:mm',
                    stepSize: aggregation === '1h' ? 1 : 12,
                    displayFormats: {
                        hour: 'dd-HH:mm'  
                    }
                }
            };
        case '1d':
            return {
                type: 'time',
                time: {
                    unit: 'day',
                    tooltipFormat: 'yyyy-MM-dd',
                    stepSize: 1,
                    displayFormats: {
                        day: 'MMM dd'  // Month-Day format
                    }
                }
            };
        default:
            return {
                type: 'time',
                time: {
                    unit: 'hour',
                    tooltipFormat: 'yyyy-MM-dd HH:mm',
                    displayFormats: {
                        minute: 'HH:mm'
                    }
                }
            };
    }
};


// Function to get the chart options based on the aggregation level
export const getChartOptions = (aggregation) => {
    // First, get the specific x-axis options for the given aggregation level
    const xAxisOptions = getXAxisOptions(aggregation);

    return {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Positive Sentiment Score Change Over Time',
                font: {
                    size: PLOT_TITLE_FONT
                },
                padding: PLOT_TITLE_PADDING
            },
        },
        scales: {
            x: xAxisOptions,  // Apply the dynamic x-axis options here
            y: {
                title: {
                    display: true,
                    text: 'Positive Sentiment Score'
                }
            }
        }
    };
};
