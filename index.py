from flask import Flask, Response, request, jsonify
import yfinance as yf
from datetime import datetime, timedelta
import traceback

app = Flask(__name__, static_url_path='/static')


@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/static/<filename>')
def static_files(filename):
    print(filename)
    return app.send_static_file(filename)

@app.route('/getdata/<ticker>', methods=['GET'])
def getdata(ticker):
    try:
        intervals = ['1m', '2m', '5m', '15m', '30m', '60m',
                     '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo']
        interval = request.args.get('interval', '15m')
        start = request.args.get('start')
        end = request.args.get('end')
        filename = f'{ticker}_{interval}.csv'
        if interval not in intervals:
            return Response("interval not supported, supported intervals : ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo']", status=400)
        if start is None:
            if interval in ['1m', '2m']:
                start = (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d')
            elif interval in ['5m', '15m', '30m', '90m']:
                start = (datetime.now() - timedelta(days=58)).strftime('%Y-%m-%d')
            elif interval in ['60m', '1h']:
                start = (datetime.now() - timedelta(days=728)).strftime('%Y-%m-%d')

        print(ticker, interval, start, end)
        data = yf.download(ticker, interval=interval, start=start, end=end)
        csv_data = data.to_csv()
        if len(data) == 0:
            return jsonify(error="Data not found"), 500
        return Response(csv_data, mimetype='text/csv', headers={'Content-Disposition': f'attachment;filename={filename}'})
    except Exception as e:
        exception_details = traceback.format_exc()  # Get full exception traceback
        return jsonify(error="An error occurred", details=str(e), traceback=exception_details), 500


if __name__ == "__main__":
    app.run(debug=True)
