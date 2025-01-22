export default class CircularArray {
    buffer: any[];
    head: number;
    tail: number;
    size: number;

    constructor(size: number) {
        this.buffer = new Array(size);
        this.head = 0;
        this.tail = 0;
        this.size = size;
    }

    set(index, value) {
        const bufferIndex = index % this.size;
        this.buffer[bufferIndex] = value;
    }

    get(index) {
        const bufferIndex = index % this.size;
        return this.buffer[bufferIndex];
    }

    *[Symbol.iterator]() {
        for (let i = 0; i < this.size; i++) {
            yield this.buffer[i];
        }
    }
}
