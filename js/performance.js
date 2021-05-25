import { IndexedDB } from './indexeddb.js';

window.addEventListener('load', async () => {

  // IndexedDB connection
  const perfDB = await new IndexedDB('performance', 1, (db, oldVersion, newVersion) => {

    console.log(`upgrading database from ${ oldVersion } to ${ newVersion }`);

    switch (oldVersion) {

      case 0: {

        const
          navigation = db.createObjectStore('navigation', { keyPath: 'date' }),
          resource = db.createObjectStore('resource', { keyPath: 'id', autoIncrement: true });

        resource.createIndex('dateIdx', 'date', { unique: false });
        resource.createIndex('nameIdx', 'name', { unique: false });

      }


    }

  });


  if (!('performance' in window) || !perfDB) return;


  // record page navigation information
  const
    date = new Date(),

    nav = Object.assign(
      { date },
      performance.getEntriesByType('navigation')[0].toJSON()
    );

  await perfDB.update('navigation', nav);


  // record resource
  const res = performance.getEntriesByType('resource').map(
    r => Object.assign({ date }, r.toJSON())
  );

  await perfDB.update('resource', res);


  // counr all records
  console.log('page navigation records: ', await perfDB.count('navigation'));
  console.log('resource records: ', await perfDB.count('resource'));
  console.log('page load times during 2021:');


  // fetch page navigation objects in 2021
  perfDB.fetch(
    'navigation',
    null, // not an index
    new Date(2021,0,1,10,40,0,0), // lower
    new Date(2021,11,1,10,40,0,0), // upper
    cursor => { // callback function

      if (cursor) {
        console.log(`${ cursor.value.date }: ${ cursor.value.domContentLoadedEventEnd }`);
        cursor.continue();
      }

    }
  );


  // calculate average download time using index
  let
    filename = 'http://localhost:8888/css/main.css',
    count = 0,
    total = 0;

  perfDB.fetch(
    'resource', // object store
    'nameIdx',  // index
    filename,   // matching file
    filename,
    cursor => { // callback

      if (cursor) {

        count++;
        total += cursor.value.duration;
        cursor.continue();

      }
      else {

        // all records processed
        if (count) {

          const avgDuration = total / count;

          console.log(`average duration for ${ filename }: ${ avgDuration } ms`);

        }

      }

    });


});
