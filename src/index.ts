export class Semaphore {
	#tasks: Array<() => void> = [];

	constructor(public count: number) {}

	async acquire() {
		return new Promise<() => void>(res => {
			const task = () => {
				let released = false;
				res(() => {
					if (!released) {
						released = true;
						this.count++;
						this.#sched();
					}
				});
			};

			this.#tasks.push(task);
			queueMicrotask(() => {
				this.#sched();
			});
		});
	}

	async use<T>(f: () => Promise<T>) {
		return this.acquire()
			.then(async release =>
				f()
					.then(res => {
						release();
						return res;
					})
					.catch(err => {
						release();

						// eslint-disable-next-line @typescript-eslint/no-throw-literal
						throw err;
					}),
			);
	}

	#sched() {
		if (this.count > 0 && this.#tasks.length > 0) {
			this.count--;
			const next = this.#tasks.shift();
			if (next === undefined) {
				throw new Error('Unexpected undefined value in tasks list');
			}

			next();
		}
	}
}

export class Mutex extends Semaphore {
	constructor() {
		super(1);
	}
}
