# Getting Started with IndexedDB for Big Data Storage

This example code uses a client-side IndexedDB database to store page and resource performance metrics which can be analysed and uploaded later.


## Usage

Copy the files to a web server (http://localhost:8888 is presumed) and open the `index.html` file in a browser. Open DevTools to view the calculated statistics.

The `filename` variable on line 77 of `js/performance.js` will need to be changed if you use a different domain, port, or path.

The following files are provided:

1. `js/indexeddb.js` a wrapper API for IndexedDB database functionality, and
1. `js/performance.js` a file which uses the wrapper API to store performance data.
