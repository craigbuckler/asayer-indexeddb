// IndexedDB wrapper class
export class IndexedDB {

  // connect to IndexedDB database
  constructor(dbName, dbVersion, dbUpgrade) {

    return new Promise((resolve, reject) => {

      // connection object
      this.db = null;

      // no support
      if (!('indexedDB' in window)) reject('not supported');

      // open database
      const dbOpen = indexedDB.open(dbName, dbVersion);

      if (dbUpgrade) {

        // database upgrade event
        dbOpen.onupgradeneeded = e => {
          dbUpgrade(dbOpen.result, e.oldVersion, e.newVersion);
        };
      }

      dbOpen.onsuccess = () => {
        this.db = dbOpen.result;
        resolve( this );
      };

      dbOpen.onerror = e => {
        reject(`IndexedDB error: ${ e.target.errorCode }`);
      };

    });

  }


  // return database connection
  get connection() {
    return this.db;
  }


  // store item
  update(storeName, value, overwrite = false) {

    return new Promise((resolve, reject) => {

      // new transaction
      const
        transaction = this.db.transaction(storeName, 'readwrite'),
        store = transaction.objectStore(storeName);

      // ensure values are in array
      value = Array.isArray(value) ? value : [ value ];

      // write all values
      value.forEach(v => {
        if (overwrite) store.put(v);
        else store.add(v);
      });

      transaction.oncomplete = () => {
        resolve(true); // success
      };

      transaction.onerror = () => {
        reject(transaction.error); // failure
      };

    });

  }


  // count items
  count(storeName, indexName, lowerBound = null, upperBound = null) {

    return new Promise((resolve, reject) => {

      const request = this.index(storeName, indexName)
        .count( this.bound(lowerBound, upperBound) );

      request.onsuccess = () => {
        resolve(request.result); // return count
      };

      request.onerror = () => {
        reject(request.error);
      };

    });

  }


  // get items using cursor
  fetch(storeName, indexName, lowerBound = null, upperBound = null, callback) {

    const
      request = this.index(storeName, indexName)
        .openCursor( this.bound(lowerBound, upperBound) );

    // run callback with current value
    request.onsuccess = () => {
      if (callback) callback(request.result);
    };

    request.onerror = () => {
      return(request.error); // failure
    };

  }


  // start a new read transaction on object store or index
  index(storeName, indexName) {

    const
      transaction = this.db.transaction(storeName),
      store = transaction.objectStore(storeName);

    return indexName ? store.index(indexName) : store;

  }


  // get bounding object
  bound(lowerBound, upperBound) {

    let bound;
    if (lowerBound && upperBound) bound = IDBKeyRange.bound(lowerBound, upperBound);
    else if (lowerBound) bound = IDBKeyRange.lowerBound(lowerBound);
    else if (upperBound) bound = IDBKeyRange.upperBound(upperBound);

    return bound;

  }


}
