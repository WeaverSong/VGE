//For debugging the various modules

let EM = new EventManager([{ name: "click" }, { name: "keyUp" }]);
let canvas = document.getElementById("canvas") as HTMLCanvasElement;
let CR = new CanvasRenderer({
    size: {
        width: window.innerHeight,
        height: window.innerHeight
    }
}, canvas);

interface path {
    list: { x: number, y: number }[],
    mirrorX?: boolean,
    mirrorY?: boolean
};
let grid: path[] = [{ list: [] }];

let gridSize = 41;
let spacing = (CR.size.height - 25) / gridSize;

let mirroredY = false;
let mirroredX = false;
let gridReducer = 2;

let mouseX = 0;
let mouseY = 0;
let hoveredX = 0;
let hoveredY = 0;

let cc = false;

canvas.onmousemove = ev => {
    mouseX = ev.offsetX;
    mouseY = ev.offsetY;

    hoveredX = Math.round((mouseX - 25) / spacing);
    hoveredY = Math.round((mouseY - 25) / spacing);

};
canvas.onmouseup = ev => {
    EM.fire("click", { x: ev.offsetX, y: ev.offsetY, hoveredX, hoveredY });
};
window.onkeyup = (kv: KeyboardEvent) => EM.fire("keyUp", kv);

const drawShapes = function (render = false) {
    for (let s = 0; s < grid.length; s++) {

        let shape = grid[s];
        let shapeMirror = mirroredPath(shape, gridSize);
        if (shape.list.length === 0) continue;

        if (!shape.mirrorX && !shape.mirrorY) {
            CR.DrawShape(

                shape.list.map(v => ({ ...v, x: v.x * spacing + 25, y: v.y * spacing + 25 })),

                {
                    fill: render ? "#ffffff" : "#00000000",
                    stroke: render ? "#00000000" : "#000000",
                    line: {
                        width: 5,
                        cap: "square",
                        join: "round"
                    },
                    noClose: true
                });
        } else if (s !== grid.length - 1 && (shape.mirrorX || shape.mirrorY)) {
            let end = shape.list[shape.list.length - 1];
            let endMirror = shapeMirror.list[shapeMirror.list.length - 1];



            if (end.x === endMirror.x && end.y === endMirror.y) {

                let tempShape = free(shape);
                let tempShapeMirror = free(shapeMirror); tempShapeMirror.list.pop();
                for (let i = tempShapeMirror.list.length - 1; i >= 0; i--) {
                    tempShape.list.push(tempShapeMirror.list[i]);
                };

                CR.DrawShape(
                    tempShape.list.map(v => ({ ...v, x: v.x * spacing + 25, y: v.y * spacing + 25 })),
                    {
                        fill: render ? "#ffffff" : "#00000000",
                        stroke: render ? "#00000000" : "#000000",
                        line: {
                            width: 5,
                            cap: "square",
                            join: "round"
                        },
                        noClose: true
                    });

            } else {
                CR.DrawShape(
                    shape.list.map(v => ({ ...v, x: v.x * spacing + 25, y: v.y * spacing + 25 })),
                    {
                        fill: render ? "#ffffff" : "#00000000",
                        stroke: render ? "#00000000" : "#000000",
                        line: {
                            width: 5,
                            cap: "square",
                            join: "round"
                        },
                        noClose: true
                    });
                CR.DrawShape(
                    mirroredPath(shape, gridSize).list.map(v => ({ ...v, x: v.x * spacing + 25, y: v.y * spacing + 25 })),
                    {
                        fill: render ? "#ffffff" : "#00000000",
                        stroke: render ? "#00000000" : "#000000",
                        line: {
                            width: 5,
                            cap: "square",
                            join: "round"
                        },
                        noClose: true
                    });
            }


        } else {
            CR.DrawShape(
                shape.list.map(v => ({ ...v, x: v.x * spacing + 25, y: v.y * spacing + 25 })),
                {
                    fill: render ? "#ffffff" : "#00000000",
                    stroke: render ? "#00000000" : "#000000",
                    line: {
                        width: 5,
                        cap: "square",
                        join: "round"
                    },
                    noClose: true
                });
            CR.DrawShape(
                shapeMirror.list.map(v => ({ ...v, x: v.x * spacing + 25, y: v.y * spacing + 25 })),
                {
                    fill: render ? "#ffffff" : "#00000000",
                    stroke: render ? "#00000000" : "#000000",
                    line: {
                        width: 5,
                        cap: "square",
                        join: "round"
                    },
                    noClose: true
                });
        };

        if (render || s !== grid.length - 1) continue;

        //TODO: Re-add the preview lines
        let firstPoint = shape.list[shape.list.length - 1];
        let firstMirroredPoint = shapeMirror.list[shapeMirror.list.length - 1];
        let mirroredEnd = {x: mirroredY ? mirrored(hoveredX, gridSize) : hoveredX, y: mirroredX ? mirrored(hoveredY, gridSize) : hoveredY};

        CR.DrawShape(
            [firstPoint, {x: hoveredX, y: hoveredY}].map(v => ({ ...v, x: v.x * spacing + 25, y: v.y * spacing + 25 })),
            {
                fill: "#00000000",
                stroke: "#00ff00",
                line: {
                    width: 5,
                    cap: "square",
                    join: "round"
                },
                noClose: true
            });
        if (mirroredX || mirroredY) CR.DrawShape(
            [firstMirroredPoint, mirroredEnd].map(v => ({ ...v, x: v.x * spacing + 25, y: v.y * spacing + 25 })),
            {
                fill: "#00000000",
                stroke: "#0000ff",
                line: {
                    width: 5,
                    cap: "square",
                    join: "round"
                },
                noClose: true
            });

    }
};
const drawGrid = function (gridSize: number) {

    CR.Reset();

    let mx = hoveredX, my = hoveredY;
    if (mirroredY) mx = (((gridSize - 1) / 2 - hoveredX) * 2 + hoveredX);
    if (mirroredX) my = (((gridSize - 1) / 2 - hoveredY) * 2 + hoveredY);

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {

            let hovered = 0;
            if (x === hoveredX && y === hoveredY) hovered = 1;
            else if (x === mx && y === my) hovered = 2;

            if ((divisibleBy(x, gridReducer) && divisibleBy(y, gridReducer)) || hovered) {
                CR.DrawShape(
                    [{
                        type: "Arc",
                        x: x * spacing + 25,
                        y: y * spacing + 25,
                        radius: hovered !== 0 ? 400 / gridSize : 300 / gridSize,
                        startAngle: 0,
                        endAngle: Math.PI * 2
                    }], {
                    fill: hovered === 1 ? "#00ff00" : hovered === 2 ? "#0000ff" : "#000000"
                });
            }

        }
    };

    drawShapes();

};
const addBlanks = function () {

    grid.push({ list: [], mirrorX: mirroredX, mirrorY: mirroredY });

};
const undo = function () {

    while (grid[grid.length - 1].list.length == 0) grid.pop();

    grid[grid.length - 1].list.pop();

};
const addLine = function (x: number, y: number) {

    let gridEnd = grid[grid.length - 1];
    gridEnd.list.push({ x: x, y: y }); let gridEndEnd = gridEnd.list[gridEnd.list.length - 1];
    let gridEndMirror = mirroredPath(gridEnd, gridSize); let gridEndMirrorEnd = gridEndMirror.list[gridEndMirror.list.length - 1];

    if (gridEnd.list.length > 1 &&
        ((x === gridEnd.list[0].x && y === gridEnd.list[0].y) ||
        ((gridEnd.mirrorX || gridEnd.mirrorY) && gridEndEnd.x === gridEndMirrorEnd.x && gridEndEnd.y === gridEndMirrorEnd.y))
        ) {
        addBlanks();
    }

};

EM.subscribe(grid, "preTick", () => drawGrid(gridSize))
EM.subscribe(grid, "click", () => {

    addLine(hoveredX, hoveredY);

});

EM.subscribe(grid, "keyUp", (kv: KeyboardEvent) => {
    if (kv.key === "Backspace") {

        undo();

    } else if (kv.key === " ") {
        CR.Reset();
        drawShapes(true);
        navigator.clipboard.writeText(CR.GetDataURL());
    } else if (kv.key === "x") {
        mirroredX = !mirroredX;
        grid[grid.length - 1].mirrorX = mirroredX;
    } else if (kv.key === "y") {
        mirroredY = !mirroredY;
        grid[grid.length - 1].mirrorY = mirroredY;
    } else if (kv.key === "c") {
        cc = !cc;
    }
});
