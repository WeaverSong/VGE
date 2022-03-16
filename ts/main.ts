//For debugging the various modules

let EM = new EventManager([{ name: "click" }, { name: "keyUp" }]);
let canvas = document.getElementById("canvas") as HTMLCanvasElement;
let CR = new CanvasRenderer({
    size: {
        width: window.innerHeight,
        height: window.innerHeight
    }
}, canvas);

let grid = [[]];
let gridSize = 41;
let spacing = (CR.size.height - 25) / gridSize;

let mirroredX = false;
let mirroredY = false;
let gridReducer = 2;

let mouseX = 0;
let mouseY = 0;
let hoveredX = 0;
let hoveredY = 0;

canvas.onmousemove = ev => {
    mouseX = ev.offsetX;
    mouseY = ev.offsetY;
};
canvas.onmouseup = ev => {
    EM.fire("click", { x: ev.offsetX, y: ev.offsetY, hoveredX, hoveredY });
};
window.onkeyup = (kv: KeyboardEvent) => EM.fire("keyUp", kv);

const divisibleBy = (n: number, n2: number) => Math.round(n / n2) === n / n2;
const drawShapes = function (render = false) {
    for (let s = 0; s < grid.length; s++) {
        if (grid[s].length > 0) CR.DrawShape(grid[s], {
            fill: render ? "#ffffff" : "#00000000",
            stroke: render ? "#00000000" : "#000000",
            line: {
                width: 5,
                cap: "square",
                join: "round"
            },
            noClose: true
        })
    }
};
const drawGrid = function (gridSize: number) {

    CR.Reset();

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {

            let hovered = false;

            if (Vec2.Magnitude(mouseX - (x * spacing + 25), mouseY - (y * spacing + 25)) < 300 / gridSize) {
                hovered = true;
                hoveredX = x;
                hoveredY = y;
            };

            if ((divisibleBy(x, gridReducer) && divisibleBy(y, gridReducer)) || hovered) {
                CR.DrawShape(
                    [{
                        type: "Arc",
                        x: x * spacing + 25,
                        y: y * spacing + 25,
                        radius: hovered ? 400 / gridSize : 300 / gridSize,
                        startAngle: 0,
                        endAngle: Math.PI * 2
                    }],

                    {
                        fill: hovered ? "#00ff00" : "#000000"
                    });
            }

        }
    };

    drawShapes();

};

EM.subscribe(grid, "preTick", () => drawGrid(gridSize))
EM.subscribe(grid, "click", () => {

    grid[grid.length - 1].push({ x: hoveredX * spacing + 25, y: hoveredY * spacing + 25 });
    let mx = hoveredX;
    let my = hoveredY;

    if (mirroredX || mirroredY) {

        if (mirroredX) mx = ((gridSize - 1) / 2 - hoveredX) * 2 + hoveredX;
        if (mirroredY) my = ((gridSize - 1) / 2 - hoveredY) * 2 + hoveredY;

        grid[grid.length - 2].push({ x: mx * spacing + 25, y: my * spacing + 25 });

    };

    if (grid[grid.length - 1].length > 1 && hoveredX * spacing + 25 === grid[grid.length - 1][0].x && hoveredY * spacing + 25 === grid[grid.length - 1][0].y) {
        grid.push([]);
        if (mirroredX || mirroredY) grid.push([]);
    } else if ((mirroredX || mirroredY) && hoveredX === mx && hoveredY === my && grid[grid.length - 1].length > 1) {

        grid[grid.length - 1].pop();
        for (let i = grid[grid.length - 1].length - 1; i >= 0; i--) {
            grid[grid.length - 2].push(grid[grid.length - 1][i]);
        }
        grid[grid.length - 1] = JSON.parse(JSON.stringify(grid[grid.length - 2]));

        grid.push([], []);
    }

});

EM.subscribe(grid, "keyUp", (kv: KeyboardEvent) => {
    if (kv.key === "Backspace") {
        grid[grid.length - 1].pop();
        if (mirroredX || mirroredY) grid[grid.length - 2].pop();

        if (grid[grid.length - 1].length === 1) {
            grid.pop();
            if (mirroredX || mirroredY) grid.pop();
            grid.push([]);
            if (mirroredX || mirroredY) grid.push([]);
        } else if (grid[grid.length - 1].length === 0) {
            grid.pop();
            if (mirroredX || mirroredY) grid.pop();

            if (grid.length > 0) {
                grid[grid.length - 1].pop();
                if (mirroredX || mirroredY) grid[grid.length - 2].pop();
            } else {
                grid.push([]);
                if (mirroredX || mirroredY) grid.push([]);
            }

        }
    } else if (kv.key === " ") {
        CR.Reset();
        drawShapes(true);
        navigator.clipboard.writeText(CR.GetDataURL());
    }
});