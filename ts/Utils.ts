const dist = (x: number, y: number, x2: number, y2: number) => Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));

const divisibleBy = (n: number, n2: number) => Math.round(n / n2) === n / n2;

const mirrored = (number: number, gridSize: number) => (((gridSize - 1) / 2 - number) * 2 + number);

const mirroredPath = (path: {list: {x: number, y: number}[], mirrorX?: boolean, mirrorY?: boolean}, gridSize: number) => {

    return { ...path, 
        list: path.list.map(v => ({
            x: path.mirrorY ? mirrored(v.x, gridSize) : v.x,
            y: path.mirrorX ? mirrored(v.y, gridSize) : v.y
            }))
    };

};

const free = (obj: object) => JSON.parse(JSON.stringify(obj));