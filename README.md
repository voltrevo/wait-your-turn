# wait-your-turn

Awaitable semaphore/mutex.

A semaphore implementation using ES6 promises and supporting 3 styles:

* async/await style
* thunk style (automatic acquire/release)
* promise style

Also includes `Mutex` as a convenience for `new Semaphore(1)`.

## Fork of await-semaphore

This is a fork of [`await-semaphore`](https://www.npmjs.com/package/await-semaphore) by Emma Kuo.

Changes:
- Use `queueMicrotask` instead of `process.nextTick` for more portability and less polyfilling
- Modernizations

## API

### new Semaphore(count: number)

Create a new semaphore with the given count.

```ts
import {Semaphore} from 'wait-your-turn';

const semaphore = new Semaphore(10);
```

### semaphore.acquire(): Promise<() => void>

Acquire the semaphore and returns a promise for the release function. Be sure to handle release for exception case.

```ts
const release = await semaphore.acquire();

try {
  // critical section...
  await doSomething();
} finally {
  release();
}
```

### semaphore.use<T>(thunk: () => Promise<T>): Promise<T>

Alternate method for using the semaphore by providing a thunk. This automatically handles acquire/release.

```ts
await semaphore.use(async () => {
  // critical section...
});
```

### new Mutex()

An alias for `new Semaphore(1)`. Mutex has the same methods as Semaphore.

```ts
import {Mutex} from 'wait-your-turn';

const mutex = new Mutex();
```

## Examples

Create a version of `fetch()` with concurrency limited to 10.

### async/await style (typescript)

```ts
const semaphore = new Semaphore(10);

async function niceFetch(url: string) {
  const release = await semaphore.acquire();

  try {
    const result = await fetch(url);
    return result;
  } finally {
    release();
  }
}
```

### thunk style (javascript)

```js
const semaphore = new Semaphore(10);

function niceFetch(url) {
  return semaphore.use(() => fetch(url));
}
```

### promise style (javascript)

```js
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
