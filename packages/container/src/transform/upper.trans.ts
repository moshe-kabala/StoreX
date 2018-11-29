
export function upperTransform(data: any) {
    return data instanceof Array ? data.map(d => d.toUpperCase()): data.toUpperCase();
}
