# Support and Resistance Levels Finder

This project is a tool for annotating support and resistance levels on a stock chart. It uses the [Lightweight Charts](https://github.com/tradingview/lightweight-charts) library to display the chart and allows the user to add support and resistance levels by clicking on the chart.

## Usage

To use this tool, first set the following environment variables in a file named `local.env`:

```
FLASK_APP=index.py
FLASK_ENV=development
```

Then, run the following command:

```
flask -e local.env run
```

This will start the Flask development server. You can then open the `index.html` file in your browser. You can then load a CSV file containing the stock data by clicking on the "Load CSV" button. Once the data is loaded, you can annotate the chart by clicking on it to add support and resistance levels.

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request. 

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

