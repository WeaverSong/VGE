declare const saveAs;
const handleSlider = (name: string, func: (v: number) => any) => {
    (document.getElementById(name + "-slider") as HTMLInputElement).addEventListener("mousemove", function () {
        func(parseInt(this.value));
        (document.getElementById(name + "-text") as HTMLInputElement).value = this.value;
    });
    (document.getElementById(name + "-text") as HTMLInputElement).addEventListener("change", function () {
        func(parseInt(this.value));
        (document.getElementById(name + "-slider") as HTMLInputElement).value = this.value;
    });
};
const handleClick = (name: string, func: (ev: MouseEvent) => any) => document.getElementById(name).onclick = ev => func(ev);

EM.subscribe(grid, "preTick", () => drawGrid(gridSize))
EM.subscribe(grid, "click", () => {

    if (tool === toolTypes.Point) {
        addLine(hoveredX, hoveredY);
    } else if (tool === toolTypes.Arc) {
        addArc(hoveredX, hoveredY);
    } else if (tool === toolTypes.Edit && getPoints(hoveredX, hoveredY).length > 0) {
        addEdit(hoveredX, hoveredY);
    }

});
EM.subscribe(grid, "keyUp", (kv: KeyboardEvent) => {
    if (!overlay.visible) {
        if (kv.key === "Backspace") {

            undo();

        } else if (kv.key === " ") {
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
    if (!overlay.visible) {
        if (kv.key === " ") {
            preview = true;
        }
    }
});

handleClick("tool-line", () => {
    tool = toolTypes.Point;
    tempVars = {};
});
handleClick("tool-arc", () => {
    tool = toolTypes.Arc;
    tempVars = {};
});
handleClick("tool-edit", () => {
    tool = toolTypes.Edit;
    tempVars = {};
});

handleClick("export-menu", exportRender);

handleClick("tab-fill", () => overlay.topbar.activeTab = "fill");
handleClick("tab-stroke", () => overlay.topbar.activeTab = "stroke");
handleClick("tab-shadow", () => overlay.topbar.activeTab = "shadow");
handleClick("tab-background", () => overlay.topbar.activeTab = "background");

handleClick("new-layer", () => addLayer());

handleClick("resume", () => overlay.visible = false);
handleClick("export", () => {overlay.visible = false; exportRender();});

handleSlider("stroke-size", v => renderSettings.line.width = v);
handleSlider("shadow-blur", v => renderSettings.shadow.blur = v);
handleSlider("shadow-x", v => renderSettings.shadow.x = v);
handleSlider("shadow-y", v => renderSettings.shadow.y = v);

handleClick("save", () => {
    var blob = new Blob([JSON.stringify({
        layers: layers.map(v => ({paths: v.paths, hidden: v.hidden, renderSettings: v.renderSettings})),
        gridSize,
        gridReducer
    })],
                { type: "application/json;charset=utf-8" });
    saveAs(blob, projectName);
    
});
document.getElementById("load").addEventListener("change", async () => {
    let load = <HTMLInputElement>document.getElementById("load");

    if (!load.files[0].name.endsWith(".vge")) { alert("Not a vge file"); return; }

    let loadValue = JSON.parse(await load.files[0].text());

    layers.forEach(v => deleteLayer(v.id));
    nextLayerId = 0;

    gridSize = loadValue.gridSize;
    gridReducer = loadValue.gridReducer;
    loadValue.layers.forEach(v => {
        addLayer(v);
    });

    activeLayer = 0;
    setActiveLayer(0);
    projectName = load.files[0].name;

})