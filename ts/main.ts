const toolTypes = {
    "Point": "Point",
    "Arc": "Arc",
    "arcBetween": "arcBetween"
};

declare const Picker;
const defaultRenderSettings: RenderSettings = {
    fill: "#ffffff00",
    stroke: "#000000",
    background: "#00000000",
    line: {
        width: 15,
        cap: "square",
        join: "round"
    },
    shadow: {
        blur: 15,
        color: "#00000000",
        x: 0,
        y: 0
    },
    noClose: true
}
const addLayer = function () {
    const id = nextLayerId++;
    let newLayer: HTMLDivElement = html.div({className: "layer", eventListeners: {click: () => setActiveLayer(id)}},
        html.div({className: "layer-nav"},
            html.button({className: "layer-nav-up", attributes: id === 0 ? {disabled: true} : {}, eventListeners: {click: () => {setActiveLayer(id); moveLayer(id, -1)}}}, "/\\"),
            html.button({className: "layer-nav-down", attributes: {disabled: true}, eventListeners: {click: () => {setActiveLayer(id); moveLayer(id, 1)}}}, "\\/")
        ),
        html.p({className: "layer-label"},
            `Layer ${id}`
        ),
        html.button({className: "layer-render-button", eventListeners: {click: (e:MouseEvent) => {renderSettings = layers[getLayerIndex(id)].renderSettings; overlay.visible = true; e.cancelBubble = true;}}},
            "R"
        ),
        html.button({className: "layer-render-button", eventListeners: {click: (e:MouseEvent) => {
            e.cancelBubble = true;
            if (layers.length == 1) return;
            let nextLayer = getLayerIndex(id) - 1; if (nextLayer == -1) nextLayer = 1;
            setActiveLayer(layers[nextLayer].id);
            deleteLayer(id);
            }}},
            "D"
        )
    )
    document.getElementById("layer-list").appendChild(newLayer);

    if (layers.length > 0) layers[layers.length - 1].html.getElementsByClassName("layer-nav")[0].getElementsByClassName("layer-nav-down")[0].toggleAttribute("disabled", false);
    
    layers.push({
        html: newLayer,
        paths: [{list: []}],
        renderSettings: free(defaultRenderSettings),
        id
    })
};
const getLayerIndex = function (layerId: number): number {
    let index = layers.findIndex(v => v.id === layerId);
    if (index === -1) throw new Error(`No layer with id ${layerId}`)

    return index;
}
const setActiveLayer = function (layerId: number) {
    layers[activeLayer].html.id = "";

    activeLayer = getLayerIndex(layerId);
    layers[activeLayer].html.id = "active-layer";

    grid = layers[activeLayer].paths;
    renderSettings = layers[activeLayer].renderSettings;
    grid[grid.length - 1].mirrorX = mirroredX;
    grid[grid.length - 1].mirrorY = mirroredY;
}
const moveLayer = function (layerId: number, change: number) {
    let index = getLayerIndex(layerId);

    let layer = layers.splice(index, 1)[0];
    layers.splice(index + change, 0, layer);

    const layerlist = document.getElementById("layer-list");
    layers.forEach(l => layerlist.removeChild(l.html));
    layers.forEach(l => layerlist.appendChild(l.html));

    for (let i = 0; i < layers.length; i++) {
        let eleUp = layers[i].html.getElementsByClassName("layer-nav")[0].getElementsByClassName("layer-nav-up")[0];
        let eleDown = layers[i].html.getElementsByClassName("layer-nav")[0].getElementsByClassName("layer-nav-down")[0];
        
        if (i === 0) eleUp.toggleAttribute("disabled", true)
        else eleUp.toggleAttribute("disabled", false);

        if (i === layers.length - 1) eleDown.toggleAttribute("disabled", true);
        else eleDown.toggleAttribute("disabled", false);
    }

}
const deleteLayer = function (layerId: number) {
    const index = getLayerIndex(layerId);
    document.getElementById("layer-list").removeChild(layers[index].html);
    layers.splice(index, 1);
};

let nextLayerId = 0;
let layers: {paths: path[], renderSettings: RenderSettings, html: HTMLDivElement, id: number, hidden?: boolean}[] = []
addLayer();
layers[0].html.id = "active-layer"
let activeLayer = 0;

let renderSettings: RenderSettings = layers[activeLayer].renderSettings;
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
    set visible(value: boolean) {
        this._visible = value;
        this.html.className = !value ? "gone" : "";
        preview = value;
    
        this.mainboxes.fill.colorPicker.setColor(renderSettings.fill);
        this.mainboxes.stroke.colorPicker.setColor(renderSettings.stroke);
        this.mainboxes.shadow.colorPicker.setColor(renderSettings.shadow.color);
        this.mainboxes.background.colorPicker.setColor(renderSettings.background);

    },
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
            },
            background: {
                get active() {return overlay.topbar._activeTab == "background"},
                set active(value) {if(!value){return} overlay.topbar.activeTab = "background"},
                html: document.getElementById("tab-background")
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
                color: defaultRenderSettings.fill,
                onChange: color => {renderSettings.fill = color.hex}
            })
        },
        stroke: {
            html: document.getElementById("main-stroke"),
            colorPicker: new Picker({
                parent: document.getElementById("stroke-color"),
                popup: false,
                color: defaultRenderSettings.stroke,
                onChange: color => renderSettings.stroke = color.hex
            })
        },
        shadow: {
            html: document.getElementById("main-shadow"),
            colorPicker: new Picker({
                parent: document.getElementById("shadow-color"),
                popup: false,
                color: defaultRenderSettings.shadow.color,
                onChange: color => renderSettings.shadow.color = color.hex
            })
        },
        background: {
            html: document.getElementById("main-background"),
            colorPicker: new Picker({
                parent: document.getElementById("main-background"),
                popup: false,
                color: defaultRenderSettings.background,
                onChange: color => {renderSettings.background = color.hex}
            })
        }
    }
};

let grid: path[] = layers[activeLayer].paths;

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
const drawShapeMap = function (shape: path, options: {render?: boolean, forceClose?: boolean, mirror?: boolean, noShadow?: boolean, renderSettings?: RenderSettings} = {}) {

    let settings: PartialRendererSettings = options.render ? free(options.renderSettings) : {
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

    if (options.noShadow) {
        CR.DrawShape(
            shape.list.map(v => {
                if (v.type === "Point" || v.type === undefined) return { ...v, x: v.x * spacing + 25, y: v.y * spacing + 25 };
                if (v.type === "Arc") return { ...v, x: v.x * spacing + 25, y: v.y * spacing + 25, radius: v.radius * spacing }
            }),
            {...settings, shadow: {blur: 0}});
    } else {
        CR.DrawShape(
            shape.list.map(v => {
                if (v.type === "Point" || v.type === undefined) return { ...v, x: v.x * spacing + 25, y: v.y * spacing + 25 };
                if (v.type === "Arc") return { ...v, x: v.x * spacing + 25, y: v.y * spacing + 25, radius: v.radius * spacing }
            }),
            settings);
    }

    if (options.mirror) {
        drawShapeMap(mirroredPath(shape, gridSize), {...options, mirror: false});
    }
};
const drawShapes = function (grid: path[], options: {render?: boolean, noShadow?: boolean, renderSettings?: RenderSettings}) {

    for (let s = 0; s < grid.length; s++) {

        let shape = grid[s];
        let shapeMirror = mirroredPath(shape, gridSize);

        if (shape.list.length !== 0) {

            let forceClose = (shape.list[0].startPoint.x == shape.list[shape.list.length-1].endPoint.x)
                    && (shape.list[0].startPoint.y == shape.list[shape.list.length-1].endPoint.y)

            if (!shape.mirrorX && !shape.mirrorY) {

                drawShapeMap(shape, {...options, forceClose});

            } else if ((shape.mirrorX || shape.mirrorY)) {
                let end = shape.list[shape.list.length - 1];
                let endMirror = shapeMirror.list[shapeMirror.list.length - 1];

                if (end.x === endMirror.x && end.y === endMirror.y) {

                    let tempShape: path = free(shape);
                    let tempShapeMirror: path = free(shapeMirror); tempShapeMirror.list.pop();
                    for (let i = tempShapeMirror.list.length - 1; i >= 0; i--) {
                        if (tempShapeMirror.list[i].type === "Arc") tempShape.list.push(reverseArc(<listNode & {type: "Arc"}>tempShapeMirror.list[i]))
                        else tempShape.list.push(tempShapeMirror.list[i]);
                    };

                    let forceClose = (tempShape.list[0].startPoint.x == tempShape.list[tempShape.list.length-1].endPoint.x)
                    && (tempShape.list[0].startPoint.y == tempShape.list[tempShape.list.length-1].endPoint.y)

                    drawShapeMap(tempShape, {...options, forceClose});

                } else if (shape.list[0].x === shapeMirror.list[0].x && shape.list[0].y === shapeMirror.list[0].y) {
                    let tempShape: path = free(shape);
                    let tempShapeMirror: path = free(shapeMirror);
                    for (let i = 0; i < tempShape.list.length; i++) {
                        if (tempShape.list[i].type === "Arc") tempShapeMirror.list.splice(0, 0, reverseArc(<listNode & {type: "Arc"}>tempShape.list[i]));
                        else tempShapeMirror.list.splice(0, 0, tempShape.list[i])
                    };

                    let forceClose = (tempShape.list[0].startPoint.x == tempShape.list[tempShape.list.length-1].endPoint.x)
                    && (tempShape.list[0].startPoint.y == tempShape.list[tempShape.list.length-1].endPoint.y)

                    drawShapeMap(tempShapeMirror, {...options, forceClose});
                } else {
                    drawShapeMap(shape, {...options, forceClose, mirror: true});
                }
            } else {
                drawShapeMap(shape, {...options, forceClose, mirror: true});
            };
        }

        if (options.render || s !== grid.length - 1) continue;

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

    if (options.render && !options.noShadow) drawShapes(grid, {...options, noShadow: true});

};
const drawLayers = function (render = false) {

    if(render) {
        CR.DrawShape([{x: 0, y: 0}, {x: CR.settings.size.width, y: 0}, {x: CR.settings.size.width, y: CR.settings.size.height}, {x: 0, y: CR.settings.size.height}], {fill: renderSettings.background, stroke: "#00000000"})
    }

    for (let i = 0; i < layers.length; i++) {
        let layer = layers[i];
        if (layer.hidden) continue;

        drawShapes(layer.paths, {render, renderSettings: layer.renderSettings});
    }

    
};
const drawGrid = function (gridSize: number) {
    CR.Reset();
    if (preview) return drawLayers(true);

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

    drawLayers();

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
            drawLayers(true);
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
document.getElementById("export-menu").onclick = () => {
    CR.Reset();
    drawLayers(true);
    navigator.clipboard.writeText(CR.GetDataURL());
}
document.getElementById("tab-fill").onclick = () => overlay.topbar.activeTab = "fill";
document.getElementById("tab-stroke").onclick = () => overlay.topbar.activeTab = "stroke";
document.getElementById("tab-shadow").onclick = () => overlay.topbar.activeTab = "shadow";
document.getElementById("tab-background").onclick = () => overlay.topbar.activeTab = "background";
document.getElementById("resume").onclick = () => overlay.visible = false;
document.getElementById("new-layer").onclick = () => addLayer();
document.getElementById("export").onclick = () => {
    overlay.visible = false;
    CR.Reset();
    drawLayers(true);
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