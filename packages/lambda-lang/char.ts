/**
 * only support \n, don't support \r\n now
 */
export function isNewLine(char: string) {
    return char === "\n";
}
