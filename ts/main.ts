const toolTypes = {
    "Point": "Point",
    "Arc": "Arc",
    "arcBetween": "arcBetween"
};

declare const Picker;

let renderSettings: PartialRendererSettings = {
    fill: "#ffffff00",
    stroke: "#000000",
    line: {
        width: 15,
        cap: "square",
        join: "round"
    },
    shadow: {
        blur: 15,
        color: "#01f056",
        x: 0,
        y: 0
    },
    noClose: true
};
let EM = new EventManager([{ name: "click" }, { name: "keyUp" }, { name: "keydown" }]);
let canvas = document.getElementById("canvas") as HTMLCanvasElement;
let CR = new CanvasRenderer({
    size: {
        width: window.innerHeight,
        height: window.innerHeight
    }
}, canvas);
let overlay = {
    html: document.getElementById("overlay"),
    _visible: false,
    get visible() {return this._visible},
    set visible(value: boolean) {this._visible = value; this.html.className = !value ? "gone" : ""; preview = value},
    topbar: {
        html: document.getElementById("topbar"),
        _activeTab: "fill",
        get activeTab() {return this._activeTab},
        set activeTab(value) {
            this.tabs[this._activeTab].html.className = "tab tab-inactive";
            overlay.mainboxes[this._activeTab].html.className = "box gone";
            this.tabs[value].html.className = "tab tab-active";
            overlay.mainboxes[value].html.className = "box";
            this._activeTab = value;
        },
        tabs: {
            fill: {
                get active() {return overlay.topbar._activeTab == "fill"},
                set active(value) {if(!value){return} overlay.topbar.activeTab = "fill"},
                html: document.getElementById("tab-fill")
            },
            stroke: {
                get active() {return overlay.topbar._activeTab == "stroke"},
                set active(value) {if(!value){return} overlay.topbar.activeTab = "stroke"},
                html: document.getElementById("tab-stroke")
            },
            shadow: {
                get active() {return overlay.topbar._activeTab == "shadow"},
                set active(value) {if(!value){return} overlay.topbar.activeTab = "shadow"},
                html: document.getElementById("tab-shadow")
            }
        }
    },
    get mainbox() {return this.mainboxes[this.topbar._activeTab]},
    mainboxes: {
        fill: {
            html: document.getElementById("main-fill"),
            colorPicker: new Picker({
                parent: document.getElementById("main-fill"),
                popup: false,
                color: "#ffffff00",
                onChange: color => {renderSettings.fill = color.hex}
            })
        },
        stroke: {
            html: document.getElementById("main-stroke"),
            colorPicker: new Picker({
                parent: document.getElementById("stroke-color"),
                popup: false,
                color: "#000000",
                onChange: color => renderSettings.stroke = color.hex
            })
        },
        shadow: {
            html: document.getElementById("main-shadow"),
            colorPicker: new Picker({
                parent: document.getElementById("shadow-color"),
                popup: false,
                color: "#000000",
                onChange: color => renderSettings.shadow.color = color.hex
            })
        }
    }
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

let cc = true;
let drawAxis = true;
let tool = toolTypes.Point;
let tempVars: {
    x1?: number,
    y1?: number,
    x2?: number,
    y2?: number
} = {};

let preview = false;

canvas.onmousemove = ev => {
    const rect = canvas.getBoundingClientRect();

    mouseX = ev.clientX - rect.left;
    mouseY = ev.clientY - rect.top;


    hoveredX = Math.round((mouseX - 25) / spacing);
    hoveredY = Math.round((mouseY - 25) / spacing);

};
canvas.onmouseup = ev => {
    EM.fire("click", { x: ev.offsetX, y: ev.offsetY, hoveredX, hoveredY });
};
window.onkeyup = (kv: KeyboardEvent) => EM.fire("keyUp", kv);
window.onkeydown = (kv: KeyboardEvent) => EM.fire("keydown", kv);

const getStartPoint = function (listNode: listNode) {
    if (listNode.startPoint) return listNode.startPoint;
    else return listNode;
};
const getEndPoint = function (listNode: listNode) {
    if (listNode.endPoint) return listNode.endPoint;
    else return listNode;
}
const drawShapeMap = function (shape: path, options: {render?: boolean, forceClose?: boolean, mirror?: boolean} = {}) {

    let settings: PartialRendererSettings = options.render ? free(renderSettings) : {
        fill: "#00000000",
        stroke: "#000000",
        line: {
            width: 5,
            cap: "square",
            join: "round"
        },
        noClose: true
    };
    if (options.forceClose) settings.noClose = false;

    CR.DrawShape(

        shape.list.map(v => {
            if (v.type === "Point" || v.type === undefined) return { ...v, x: v.x * spacing + 25, y: v.y * spacing + 25 };
            if (v.type === "Arc") return { ...v, x: v.x * spacing + 25, y: v.y * spacing + 25, radius: v.radius * spacing }
        }),
        settings);

    if (options.mirror) {
        drawShapeMap(mirroredPath(shape, gridSize), {...options, mirror: false});
    }
};
const drawShapes = function (render = false) {
    for (let s = 0; s < grid.length; s++) {

        let shape = grid[s];
        let shapeMirror = mirroredPath(shape, gridSize);

        if (shape.list.length !== 0) {

            let forceClose = (shape.list[0].startPoint.x == shape.list[shape.list.length-1].endPoint.x)
                    && (shape.list[0].startPoint.y == shape.list[shape.list.length-1].endPoint.y)

            if (!shape.mirrorX && !shape.mirrorY) {

                drawShapeMap(shape, {render, forceClose});

            } else if (s !== grid.length - 1 && (shape.mirrorX || shape.mirrorY)) {
                let end = shape.list[shape.list.length - 1];
                let endMirror = shapeMirror.list[shapeMirror.list.length - 1];

                if (end.x === endMirror.x && end.y === endMirror.y) {

                    let tempShape: path = free(shape);
                    let tempShapeMirror: path = free(shapeMirror); tempShapeMirror.list.pop();
                    for (let i = tempShapeMirror.list.length - 1; i >= 0; i--) {
                        tempShape.list.push(tempShapeMirror.list[i]);
                    };

                    let forceClose = (tempShape.list[0].startPoint.x == tempShape.list[tempShape.list.length-1].endPoint.x)
                    && (tempShape.list[0].startPoint.y == tempShape.list[tempShape.list.length-1].endPoint.y)

                    drawShapeMap(tempShape, {render, forceClose});

                } else {
                    drawShapeMap(shape, {render, forceClose, mirror: true});
                }
            } else {
                drawShapeMap(shape, {render, forceClose, mirror: true});
            };
        }

        if (render || s !== grid.length - 1) continue;

        if (tool === toolTypes.Point && shape.list[shape.list.length - 1] !== undefined) {

            drawShapeMap({list: [...shape.list, { x: hoveredX, y: hoveredY }], mirrorX: mirroredX, mirrorY: mirroredY }, {mirror: mirroredX || mirroredY});

        } else if (tool === toolTypes.Arc) {
            if (tempVars.x1 === undefined && shape.list[shape.list.length - 1] !== undefined) {
                drawShapeMap({list: [...shape.list, { x: hoveredX, y: hoveredY }], mirrorX: mirroredX, mirrorY: mirroredY }, {mirror: mirroredX || mirroredY});
            }
            else if (tempVars.x2 === undefined) {
                let angle = Vec2.Angle(hoveredX - tempVars.x1, hoveredY - tempVars.y1);
                let tempArc: path = {
                    list: [...shape.list, {
                        type: "Arc",
                        x: tempVars.x1,
                        y: tempVars.y1,
                        radius: Vec2.Magnitude({ x: hoveredX - tempVars.x1, y: hoveredY - tempVars.y1 }),
                        startAngle: angle,
                        endAngle: angle + Math.PI * 2,
                        startPoint: {x: hoveredX, y: hoveredY},
                        endPoint: {x: hoveredX, y: hoveredY}
                    }], mirrorX: mirroredX, mirrorY: mirroredY
                }
                drawShapeMap(tempArc, {mirror: mirroredX || mirroredY});

            } else {
                let startAngle = Vec2.Angle(tempVars.x2 - tempVars.x1, tempVars.y2 - tempVars.y1);
                let endAngle = Vec2.Angle(hoveredX - tempVars.x1, hoveredY - tempVars.y1);
                if (endAngle === startAngle) endAngle += Math.PI * 2;
                let tempArc: path = {
                    list: [...shape.list, {
                        type: "Arc",
                        x: tempVars.x1,
                        y: tempVars.y1,
                        radius: dist(tempVars.x1, tempVars.y1, tempVars.x2, tempVars.y2),
                        startAngle,
                        endAngle,
                        antiClockWise: !cc,
                        startPoint: {x: tempVars.x2, y: tempVars.y2},
                        endPoint: {x: hoveredX, y: hoveredY}
                    }], mirrorX: mirroredX, mirrorY: mirroredY
                };
                drawShapeMap(tempArc, {mirror: mirroredX || mirroredY});
            }
        };

    }
};
const drawGrid = function (gridSize: number) {
    CR.Reset();
    if (preview) return drawShapes(true);

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

    if (drawAxis) {
        CR.DrawShape(
            [{ x: 0, y: CR.size.height / 2 + 1 }, { x: CR.size.width, y: CR.size.height / 2 + 1 }], {
            line: { width: 3 }, stroke: "#000000"
        });
        CR.DrawShape(
            [{ x: CR.size.height / 2 + 1, y: 0 }, { x: CR.size.width / 2 + 1, y: CR.size.height }], {
            line: { width: 3 }, stroke: "#000000"
        });
    }

    drawShapes();

};
const addBlanks = function () {

    grid.push({ list: [], mirrorX: mirroredX, mirrorY: mirroredY });

};
const undo = function () {

    while (grid.length > 1 && grid[grid.length - 1].list.length == 0) grid.pop();

    if (tempVars.x1 === undefined) grid[grid.length - 1].list.pop();
    else {
        if (tempVars.x2 !== undefined) {
            tempVars.x2 = undefined;
            tempVars.y2 = undefined;
        } else {
            tempVars.x1 = undefined;
            tempVars.y1 = undefined;
        }
    }

};
const addLine = function (x: number, y: number) {

    let gridEnd = grid[grid.length - 1];
    gridEnd.list.push({ x, y, type: "Point", startPoint: {x, y}, endPoint: {x, y} }); let gridEndEnd = gridEnd.list[gridEnd.list.length - 1];
    let gridEndMirror = mirroredPath(gridEnd, gridSize); let gridEndMirrorEnd = getEndPoint(gridEndMirror.list[gridEndMirror.list.length - 1]);

    let startPoint = getStartPoint(gridEnd.list[0]);
    if (gridEnd.list.length > 1 &&
        ((x === startPoint.x && y === startPoint.y) ||
            ((gridEnd.mirrorX || gridEnd.mirrorY) && gridEndEnd.x === gridEndMirrorEnd.x && gridEndEnd.y === gridEndMirrorEnd.y))
    ) {
        addBlanks();
    }

};
const addArc = function (x: number, y: number) {
    if (tempVars.x1 === undefined) {
        tempVars.x1 = x;
        tempVars.y1 = y;
    } else if (tempVars.x1 === undefined) {
        tempVars.x1 = x;
        tempVars.y1 = y;
    } else if (tempVars.x2 === undefined) {
        tempVars.x2 = x;
        tempVars.y2 = y;
    } else {
        let gridEnd = grid[grid.length - 1];
        let startAngle = Vec2.Angle(tempVars.x2 - tempVars.x1, tempVars.y2 - tempVars.y1);
        let endAngle = Vec2.Angle(hoveredX - tempVars.x1, hoveredY - tempVars.y1);
        if (endAngle === startAngle) endAngle += Math.PI * 2;
        gridEnd.list.push({
            type: "Arc",
            x: tempVars.x1,
            y: tempVars.y1,
            radius: dist(tempVars.x1, tempVars.y1, tempVars.x2, tempVars.y2),
            startAngle,
            endAngle,
            startPoint: {x: tempVars.x2, y: tempVars.y2},
            endPoint: {x: hoveredX, y: hoveredY},
            antiClockWise: !cc
        });
        let endPoint = getEndPoint(gridEnd.list[gridEnd.list.length - 1]);
        let startPoint = getStartPoint(gridEnd.list[0]);
        let mirror = mirroredPath(gridEnd, gridSize);
        let mirroredEndPoint = getEndPoint(mirror.list[mirror.list.length - 1]);
        if ((endPoint.x === startPoint.x && endPoint.y === startPoint.y) || ((mirroredX || mirroredY) && endPoint.x === mirroredEndPoint.x && endPoint.y === mirroredEndPoint.y)) {
            addBlanks();
        }


        tempVars = {};

    };
};

EM.subscribe(grid, "preTick", () => drawGrid(gridSize))
EM.subscribe(grid, "click", () => {

    if (tool === toolTypes.Point) {
        addLine(hoveredX, hoveredY);
    } else if (tool === toolTypes.Arc) {
        addArc(hoveredX, hoveredY);
    }

});
EM.subscribe(grid, "keyUp", (kv: KeyboardEvent) => {
    if (!overlay.visible)
    {
        if (kv.key === "Backspace") {

            undo();
    
        } else if (kv.key === " ") {
            CR.Reset();
            drawShapes(true);
            navigator.clipboard.writeText(CR.GetDataURL());
            preview = false;
        } else if (kv.key === "x") {
            mirroredX = !mirroredX;
            grid[grid.length - 1].mirrorX = mirroredX;
        } else if (kv.key === "y") {
            mirroredY = !mirroredY;
            grid[grid.length - 1].mirrorY = mirroredY;
        } else if (kv.key === "c") {
            cc = !cc;
        } else if (kv.key === "a") {
            drawAxis = !drawAxis;
        } else if (kv.key === "Enter") {
            addBlanks();
        }
    }
});
EM.subscribe(grid, "keydown", (kv: KeyboardEvent) => {
    if (!overlay.visible)
    {
        if (kv.key === " ") {
            preview = true;
        }
    }
})

document.getElementById("tool-line").onclick = () => {
    tool = toolTypes.Point;
    tempVars = {};
}
document.getElementById("tool-arc").onclick = () => {
    tool = toolTypes.Arc;
    tempVars = {};
}
document.getElementById("tool-arc-between").onclick = () => {
    tool = toolTypes.arcBetween;
    tempVars = {};
}
document.getElementById("export-menu").onclick = () => overlay.visible = true;
document.getElementById("tab-fill").onclick = () => overlay.topbar.activeTab = "fill";
document.getElementById("tab-stroke").onclick = () => overlay.topbar.activeTab = "stroke";
document.getElementById("tab-shadow").onclick = () => overlay.topbar.activeTab = "shadow";
document.getElementById("resume").onclick = () => overlay.visible = false;
document.getElementById("export").onclick = () => {
    overlay.visible = false;
    CR.Reset();
    drawShapes(true);
    navigator.clipboard.writeText(CR.GetDataURL());
};
(document.getElementById("stroke-size-slider") as HTMLInputElement).addEventListener("mousemove", function ()
{
    renderSettings.line.width = parseInt(this.value);
    (document.getElementById("stroke-size-text") as HTMLInputElement).value = this.value;
});
(document.getElementById("stroke-size-text") as HTMLInputElement).addEventListener("change", function ()
{
    renderSettings.line.width = parseInt(this.value);
    (document.getElementById("stroke-size-slider") as HTMLInputElement).value = this.value;
});
(document.getElementById("shadow-blur-slider") as HTMLInputElement).addEventListener("mousemove", function ()
{
    renderSettings.shadow.blur = parseInt(this.value);
    (document.getElementById("shadow-blur-text") as HTMLInputElement).value = this.value;
});
(document.getElementById("shadow-blur-text") as HTMLInputElement).addEventListener("change", function ()
{
    renderSettings.shadow.blur = parseInt(this.value);
    (document.getElementById("shadow-blur-slider") as HTMLInputElement).value = this.value;
});
(document.getElementById("shadow-x-slider") as HTMLInputElement).addEventListener("mousemove", function ()
{
    renderSettings.shadow.x = parseInt(this.value);
    (document.getElementById("shadow-x-text") as HTMLInputElement).value = this.value;
});
(document.getElementById("shadow-x-text") as HTMLInputElement).addEventListener("change", function ()
{
    renderSettings.shadow.x = parseInt(this.value);
    (document.getElementById("shadow-x-slider") as HTMLInputElement).value = this.value;
});
(document.getElementById("shadow-y-slider") as HTMLInputElement).addEventListener("mousemove", function ()
{
    renderSettings.shadow.y = parseInt(this.value);
    (document.getElementById("shadow-y-text") as HTMLInputElement).value = this.value;
});
(document.getElementById("shadow-y-text") as HTMLInputElement).addEventListener("change", function ()
{
    renderSettings.shadow.y = parseInt(this.value);
    (document.getElementById("shadow-y-slider") as HTMLInputElement).value = this.value;
});