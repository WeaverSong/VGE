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
    mirror?: path,
    isVisual?: boolean,
    visual?: path,
    mirrors?: path[]
};
let grid: path[] = [{ list: [] }, { list: [] }];

//TEMP
grid[0].mirror = grid[1]; grid[1].mirror = grid[0];

let gridSize = 41;
let spacing = (CR.size.height - 25) / gridSize;

let mirroredY = true;
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

const divisibleBy = (n: number, n2: number) => Math.round(n / n2) === n / n2;
const drawShapes = function (render = false) {
    for (let s = 0; s < grid.length; s++) {

        let shape = grid[s];
        let shapeMirror = grid[s].mirror;

        if (shape.list.length === 0) continue;

        if (!shape.visual) {
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
        }

        let mx = hoveredX, my = hoveredY;
        if (mirroredY) mx = (((gridSize - 1) / 2 - hoveredX) * 2 + hoveredX);
        if (mirroredX) my = (((gridSize - 1) / 2 - hoveredY) * 2 + hoveredY);
        const {x, y} = shape.list[shape.list.length - 1];

        //If the shape is the final one, it's the one the user is drawing, if its mirror is the final one it's the mirror of that.
        if (s === grid.length - 1) {
            CR.DrawShape(
                [{x: x * spacing + 25, y: y * spacing + 25}, {x: hoveredX * spacing + 25, y: hoveredY * spacing + 25}],

                {
                    fill: render ? "#ffffff" : "#00000000",
                    stroke: render ? "#00000000" : "#00ff00",
                    line: {
                        width: 5,
                        cap: "square",
                        join: "round"
                    },
                    noClose: true
                });
        } else if (shapeMirror === grid[grid.length - 1]) {
            CR.DrawShape(
                [{x: x * spacing + 25, y: y * spacing + 25}, {x: mx * spacing + 25, y: my * spacing + 25}],

                {
                    fill: render ? "#ffffff" : "#00000000",
                    stroke: render ? "#00000000" : "#0000dd",
                    line: {
                        width: 5,
                        cap: "square",
                        join: "round"
                    },
                    noClose: true
                });
        }


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

    let t: path[] = [{ list: [] }];
    if (mirroredY || mirroredX) {
        t.push({ list: [], mirror: t[0] });
        t[0].mirror = t[1];
    }
    grid.push(...t);

};
const undo = function () {

    while (grid[grid.length - 1].list.length == 0) grid.pop();

    let gridEnd = grid[grid.length - 1];

    if (gridEnd.isVisual) {

        gridEnd.mirrors.forEach(v => {
            v.list.pop();
            delete v.visual;
        })
        grid.pop();

    } else if (gridEnd.mirror) {

        gridEnd.mirror.list.pop();
        gridEnd.list.pop();

    } else {

        gridEnd.list.pop();

    }

};
const addLine = function (x: number, y: number) {

    let gridEnd = grid[grid.length - 1];
    let gridEndMirror = gridEnd.mirror;

    gridEnd.list.push({ x: x, y: y });
    let mx = x;
    let my = y;

    if (mirroredY || mirroredX) {

        if (mirroredY) mx = ((gridSize - 1) / 2 - x) * 2 + x;
        if (mirroredX) my = ((gridSize - 1) / 2 - y) * 2 + y;

        gridEndMirror.list.push({ x: mx, y: my });

    };

    if (gridEnd.list.length > 1 && x === gridEnd.list[0].x && y === gridEnd.list[0].y) {
        addBlanks();
    } else if ((mirroredY || mirroredX) && x === mx && y === my && gridEnd.list.length > 1) {

        let g: path = { list: JSON.parse(JSON.stringify(gridEndMirror.list)) };
        g.list.pop();
        let h: path = { list: JSON.parse(JSON.stringify(gridEnd.list)), isVisual: true };

        for (let i = g.list.length - 1; i >= 0; i--) {
            h.list.push(g.list[i]);
        }

        gridEnd.visual = h;
        gridEndMirror.visual = h;
        h.mirrors = [gridEnd, gridEndMirror];
        grid.push(h);

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
        addBlanks();
    } else if (kv.key === "y") {
        mirroredY = !mirroredY;
        addBlanks();
    } else if (kv.key === "c") {
        cc = !cc;
    }
});
