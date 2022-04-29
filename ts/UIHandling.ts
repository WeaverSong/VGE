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
    }

});
EM.subscribe(grid, "keyUp", (kv: KeyboardEvent) => {
    if (!overlay.visible) {
        if (kv.key === "Backspace") {

            undo();

        } else if (kv.key === " ") {
            exportRender();
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
handleClick("tool-arc-between", () => {
    tool = toolTypes.arcBetween;
    tempVars = {};
});

handleClick("export-menu", exportRender);

handleClick("tab-fill", () => overlay.topbar.activeTab = "fill");
handleClick("tab-stroke", () => overlay.topbar.activeTab = "stroke");
handleClick("tab-shadow", () => overlay.topbar.activeTab = "shadow");
handleClick("tab-background", () => overlay.topbar.activeTab = "background");

handleClick("new-layer", addLayer);

handleClick("resume", () => overlay.visible = false);
handleClick("export", () => {overlay.visible = false; exportRender();});

handleSlider("stroke-size", v => renderSettings.line.width = v);
handleSlider("shadow-blur", v => renderSettings.shadow.blur = v);
handleSlider("shadow-x", v => renderSettings.shadow.x = v);
handleSlider("shadow-y", v => renderSettings.shadow.y = v);