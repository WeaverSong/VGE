const dist = (x: number, y: number, x2: number, y2: number) => Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));

const divisibleBy = (n: number, n2: number) => Math.round(n / n2) === n / n2;

const mirrored = (number: number, gridSize: number) => (((gridSize - 1) / 2 - number) * 2 + number);

const mirroredPath = (path: path, gridSize: number): path => {
    return {
        ...path,
        list: path.list.map(v => {
            if (v.type === "Point" || v.type === undefined) {
                let x = path.mirrorY ? mirrored(v.x, gridSize) : v.x;
                let y = path.mirrorX ? mirrored(v.y, gridSize) : v.y
                return {
                 x,
                 y,
                 type: "Point",
                 startPoint: {x, y},
                 endPoint: {x, y}
                };
            }
            else if (v.type === "Arc") {
                let startPoint = { x: path.mirrorY ? mirrored(v.startPoint.x, gridSize) : v.startPoint.x, y: path.mirrorX ? mirrored(v.startPoint.y, gridSize) : v.startPoint.y };
                let endPoint = { x: path.mirrorY ? mirrored(v.endPoint.x, gridSize) : v.endPoint.x, y: path.mirrorX ? mirrored(v.endPoint.y, gridSize) : v.endPoint.y };
                let x = path.mirrorY ? mirrored(v.x, gridSize) : v.x;
                let y = path.mirrorX ? mirrored(v.y, gridSize) : v.y;
                let startAngle = Vec2.Angle(startPoint.x - x, startPoint.y - y)
                let endAngle = Vec2.Angle(endPoint.x - x, endPoint.y - y);
                return {
                    type: "Arc",
                    x,
                    y,
                    startPoint,
                    endPoint,
                    radius: v.radius,
                    antiClockWise: (path.mirrorX && path.mirrorY) ? v.antiClockWise : !v.antiClockWise,
                    startAngle: startAngle,
                    endAngle: startAngle == endAngle ? endAngle - Math.PI * 2 : endAngle
                }
            }
        })
    };

};

const reverseArc = (arc: listNode & {type: "Arc"}): listNode => ({
    type: "Arc",
    x: arc.x, y: arc.y,
    startPoint: arc.endPoint,
    endPoint: arc.startPoint,
    radius: arc.radius,
    startAngle: arc.endAngle,
    endAngle: arc.startAngle,
    antiClockWise: !arc.antiClockWise
})

const free = (obj: object) => JSON.parse(JSON.stringify(obj));