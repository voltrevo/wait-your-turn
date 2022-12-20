# wait-your-turn

Awaitable semaphore/mutex

A semaphore implementation using ES6 promises and supporting 3 styles:

* async/await style (needs typescript)
* thunk style (automatic acquire/release)
* promise style

Also includes `Mutex` as a convenience for `new Semaphore(1)`.

## Fork of await-semaphore

This is a fork of [`await-semaphore`](https://www.npmjs.com/package/await-semaphore).

Changes:
- Use `queueMicrotask` instead of `process.nextTick` for more portability and less polyfilling
- Modernizations

## API

### new Semaphore(count: number)

Create a new semaphore with the given count.

```javascript
import { Semaphore } from 'wait-your-turn';

var semaphore = new Semaphore(10);
```

### semaphore.acquire(): Promise<() => void>

Acquire the semaphore and returns a promise for the release function. Be sure to handle release for exception case.

```javascript
semaphore.acquire()
.then(release => {
    //critical section...
    doSomething()
    .then(res => {
        //...
        release();
    })
    .catch(err => {
        //...
        release();
    });
});
```

### semaphore.use<T>(thunk: () => Promise<T>): Promise<T>

Alternate method for using the semaphore by providing a thunk. This automatically handles acquire/release.

```javascript
semaphore.use(() => {
    //critical section...
});
```

### new Mutex()

An alias for `new Semaphore(1)`. Mutex has the same methods as Semaphore.

```javascript
import {Mutex} from 'wait-your-turn';

var mutex = new Mutex();
```

## Examples

Create a version of `fetch()` with concurrency limited to 10.

### async/await style (typescript)

```typescript
var semaphore = new Semaphore(10);

async function niceFetch(url) {
    var release = await semaphore.acquire();
    var result = await fetch(url);
    release();
    return result;
}
```

### thunk style (javascript)

```javascript
var semaphore = new Semaphore(10);

function niceFetch(url) {
    return semaphore.use(() => fetch(url));
}
```

### promise style (javascript)

```javascript
var semaphore = new Semaphore(10);

function niceFetch(url) {
    return semaphore.acquire()
    .then(release => {
        return fetch(url)
        .then(result => {
            release();
            return result;
        });
    });
}
```