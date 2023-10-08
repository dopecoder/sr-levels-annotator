// Constants
const BASE_URL = 'http://localhost:5000/getdata/';
const TOLERANCE = 0.2;

// Utility functions
function getQueryParam(paramName) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(paramName);
}

function toUnixTimestamp(dateString) {
    const date = new Date(dateString);
    return Math.floor(date.getTime() / 1000);
}

function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}

// Stock fetch and parse functions
function formatAndSetData(parsedData) {
    const formattedData = parsedData
        .filter(entry => entry.Datetime && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(entry.Datetime.replace(' ', 'T')))
        .map(entry => ({
            time: toUnixTimestamp(entry.Datetime.replace(" ", "T")),
            open: entry.Open,
            high: entry.High,
            low: entry.Low,
            close: entry.Close
        }));
    candlestickSeries.setData(formattedData);
}

function parseCSV(data) {
    Papa.parse(data, {
        header: true,
        dynamicTyping: true,
        complete: results => formatAndSetData(results.data)
    });
}

function fetchData(ticker, interval, start, end) {
    const params = new URLSearchParams();

    if (interval) params.append("interval", interval);
    if (start) params.append("start", start);
    if (end) params.append("end", end);

    const url = new URL(BASE_URL + ticker);
    url.search = params.toString();

    fetch(url, {
        mode: 'no-cors',
        headers: {
            'content-type': 'text/csv',
            'charset': 'utf-8',
        }
    })
        .then(response => response.text())
        .then(parseCSV)
        .catch(error => console.error('Error fetching CSV data:', error));
}

// Save and download functions
function generateCSV(prices) {
    let csv = 'Type,Level\n';
    for (let i = 0; i < prices.length; i++) {
        const { type, price } = prices[i];
        csv += type + ',' + price + '\n';
    }
    return csv;
}

function downloadCSV(content, fileName) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
}

// Support and Resistance mode activation for UI after clicking button
function activateMode(mode) {
    activeMode = mode;

    chart.applyOptions({
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        }
    });
}

// Event handlers
function handleSupportButtonClick() {
    activateMode('Support');
}

function handleResistanceButtonClick() {
    activateMode('Resistance');
}

function handleShortcuts(event) {
    if (event.ctrlKey && event.key === 's') {
        activateMode('Support');
    } else if (event.ctrlKey && event.key === 'r') {
        activateMode('Resistance');
    }
}

function handleChartClick(param) {
    function removeLevels(clickPrice) {
        // Check if the click is near any of the price lines
        for (let i = 0; i < priceLines.length; i++) {
            const { priceLine, price } = priceLines[i];
            const someTolerance = 0.2
            console.log(`Comparing ${clickPrice} with ${price}`);
            if (clickPrice && Math.abs(clickPrice - price) < someTolerance) {  // someTolerance can be a small value like 0.05 depending on your data range
                // Remove the price line from the chart
                candlestickSeries.removePriceLine(priceLine);
                // Remove the price line from our list
                priceLines.splice(i, 1);
                console.log(`Removing line at ${price}`);
                break;
            }
        }
    }

    const yCoordinate = param.point.y;
    const price = candlestickSeries.coordinateToPrice(yCoordinate);

    if (!activeMode) {
        removeLevels(price);
        return;
    }

    console.log(`Click at ${param.point.x}, ${price}`);

    if (price) {
        const lineColor = activeMode === 'Support' ? 'green' : 'red';
        const priceLine = candlestickSeries.createPriceLine({
            price: price,
            color: lineColor,
            lineWidth: 2,
            lineStyle: LightweightCharts.LineStyle.Dotted,
            axisLabelVisible: true,
            title: activeMode,
        });
        // Store the price line and its price for reference
        priceLines.push({ type: activeMode, price, priceLine });
        chart.applyOptions({
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Magnet,
            }
        });
        activeMode = null;
    }
}

function handleSaveButtonClick() {
    const csvContent = generateCSV(sortByKey(priceLines, 'price'));
    filename = interval ? `${ticker}_${interval}_levels.csv` : `${ticker}_levels.csv`;
    downloadCSV(csvContent, filename);
}


// Vars initialization
let activeMode = null;
let horizontalLineSeries = null;
let priceLines = [];

// Initialization
document.getElementById('support-button').addEventListener('click', handleSupportButtonClick);
document.getElementById('resistance-button').addEventListener('click', handleResistanceButtonClick);
document.addEventListener('keydown', handleShortcuts);
document.getElementById('save-button').addEventListener('click', handleSaveButtonClick);

// Fetch data and initialize the chart
const ticker = getQueryParam('ticker');
const interval = getQueryParam('interval');
const start = getQueryParam('start');
const end = getQueryParam('end');

document.getElementById("ticker_name").innerHTML = `${ticker}  ${interval}`;

fetchData(ticker, interval, start, end);

const chart = LightweightCharts.createChart(
    document.getElementById('chart'),
    {
        layout: {
            background: { color: '#222222' },
            textColor: '#DDDDDD',
        },
        grid: {
            vertLines: { color: '#444444' },
            horzLines: { color: '#444' },
        },
    });

// Setting the border color for the vertical axis
chart.priceScale().applyOptions({
    borderColor: '#71649C',
});

// Setting the border color for the horizontal axis
chart.timeScale().applyOptions({
    borderColor: '#71649C',
});

const candlestickSeries = chart.addCandlestickSeries();

chart.subscribeClick(handleChartClick);