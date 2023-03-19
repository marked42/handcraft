import { isNewLine } from "./char";

export class InputStream {
    private pos = 0;
    private line = 1;
    private col = 0;
    constructor(private readonly input: string) {}

    next() {
        // only support BMP characters
        const char = this.input.charAt(this.pos++);
        if (isNewLine(char)) {
            this.line++;
            this.col = 0;
        } else {
            this.col++;
        }
        return char;
    }

    peek() {
        return this.input.charAt(this.pos);
    }

    eof() {
        return this.peek() === "";
    }

    croak(msg: string): never {
        throw new Error(`${msg} (${this.line}, ${this.col})`);
    }
}
