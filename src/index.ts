export class Semaphore {
	#tasks: Array<() => void> = [];

	constructor(public count: number) {}

	async acquire() {
		const release = await new Promise<() => void>(resolve => {
			this.#tasks.push(() => {
				let released = false;
				resolve(() => {
					if (!released) {
						released = true;
						this.count++;
						this.#sched();
					}
				});
			});

			queueMicrotask(() => {
				this.#sched();
			});
		});

		return release;
	}

	async use<T>(f: () => Promise<T>) {
		const release = await this.acquire();

		try {
			return await f();
		} finally {
			release();
		}
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
