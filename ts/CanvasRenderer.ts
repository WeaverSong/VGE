interface Point {
    x: number;
    y: number;
}
interface Size
{
    width: number;
    height: number;
}
type Area = Point & Size;


type Color = string;

interface GradientStop
{
    offset: number;
    color: Color;
}
interface LinearGradient
{
    type: "LinearGradient";
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stops: GradientStop[];
}
interface RadialGradient
{
    type: "RadialGradient";
    x1: number;
    y1: number;
    /** Inner radius */
    r1: number,
    x2: number,
    y2: number,
    /** Outer radius */
    r2: number,
    stops: GradientStop[]
}

type Gradient = LinearGradient | RadialGradient;

interface Pattern
{
    type: "Pattern";
    image: CanvasImageSource;
    // TODO: Unknown what this is for.
    repetition: string;
}

type Fill = Color | Pattern | Gradient;
type Stroke = Fill;

type PartialFill = Color | Partial<Pattern> | DeepPartial<Gradient>;
type PartialStroke = PartialFill;

type Font = string;
type TextAlignment = "start" | "center" | "end";
type TextBaselineAlignment = "alphabetic" | "top" | "hanging" | "middle" | "ideographic" | "bottom";

type CompositionOperation = `${"source" | "destination"}-${"over" | "atop" | "in" | "out"}` | "lighter" | "copy" | "xor";

type LineCap = "butt" | "round" | "square";
type LineJoin = "miter" | "bevel" | "round";

type ShadowSettings = Point & {
    color: Color,
    blur: number
};

interface LineSettings
{
    cap: LineCap,
    join: LineJoin,
    width: number,
    miterLimit: number
}

interface RendererSettings {
    type: "2d",
    size: Size,
    fill: Fill,
    stroke: Stroke,
    shadow: ShadowSettings,
    line: LineSettings,
    scale: Point,
    rotation: number,
    translation: Point,
    skew: Point,
    font: Font,
    textAlign: TextAlignment,
    textBaseLine: TextBaselineAlignment,
    textFill: boolean,
    maxTextWidth?: number,
    imageSize: Partial<Size>,
    imageClipping: Partial<Area>,
    /** A number between zero and one representing the opacity. */
    alpha: number,
    compositeOperation: CompositionOperation,
    noClose: boolean
}

type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]>; } : T;

type PartialRendererSettings = DeepPartial<Omit<RendererSettings, "fill" | "stroke">> & { fill?: PartialFill; stroke?: PartialStroke; };

type PathNode =
    { type?: "Point", x: number, y: number }
    | { type: "QuadraticCurveTo", cx: number, cy: number, x: number, y: number}
    | { type: "BezierCurveTo", cx1: number, cy1: number, cx2: number, cy2: number, x: number, y: number }
    | { type: "Arc", x: number, y: number, radius: number, startAngle: Radians, endAngle: Radians, antiClockWise?: boolean }
    | { type: "ArcTo", cx: number, cy: number, x: number, y: number, radius: number };

type Path = PathNode[];

type Radians = number;

type Invocable<T, U> = T & { (value: U): void };

/**
 * Mirrors a value such that reads return as normal, and sets use the provided setter.
 * Any sets assume that the setter supports values that are deep partialed.
 */
const mirror = function <T extends object, U>(thing: T, setter: (value: unknown) => void): Invocable<T, U>
{
    return new Proxy(() => {}, {
        get: (target, key) =>
        {
            return typeof thing[key] === "object" ?
                mirror(thing[key], subvalue => setter( { [key]: subvalue })) :
                thing[key];
        },
        set: (_, key, value) =>
        {
            setter({ [key]: value });
            return true;
        },
        apply: (target, thisArg, argArray) =>
        {
            setter(argArray[0]);
        },
        has: (target, key) => key in thing,
        ownKeys: (target) => Reflect.ownKeys(thing),
        isExtensible: () => false
    }) as Invocable<T, U>;
};

/*

    More elegant and flexible replacement to Processing JS.

    NOTES:

    'i' is an internal boolean paremter used to avoid conflicts with setting temp values. Completely useless if used from the outside - setting it would only prevent the command from working.

    All settings only apply to things drawn after they were changed. All drawing methods take a final, optional, 'Settings' object for what settings to override for this drawing specifically. These settings are temporary and will not affect any other drawings.

*/
class CanvasRenderer {

    constructor(Defaults: PartialRendererSettings, Canvas = document.createElement('canvas')) {

        this.#defaults = {
            type: "2d",
            size: {
                width: 1000,
                height: 1000
            },
            fill: "#f00000",
            stroke: "#000000",
            shadow: {
                color: "#000000",
                blur: 0,
                x: 0,
                y: 0
            },
            line: {
                cap: "butt",
                join: "miter",
                width: 1,
                miterLimit: 10
            },
            scale: {
                x: 1,
                y: 1
            },
            rotation: 0,
            translation: {
                x: 0,
                y: 0
            },
            skew: {
                x: 0,
                y: 0
            },
            font: "10px sans-serif",
            textAlign: "start",
            textBaseLine: "alphabetic",
            textFill: true,
            maxTextWidth: undefined,
            imageSize: {
                width: undefined,
                height: undefined
            },
            imageClipping: {
                x: undefined,
                y: undefined,
                width: undefined,
                height: undefined
            },
            alpha: 1,
            compositeOperation: "source-over",
            noClose: false
        };

        this.canvas = Canvas;
        if (Defaults && Defaults.size) {
            this.canvas.width = Defaults.size.width;
            this.canvas.height = Defaults.size.height;
        }
        this.ctx = this.canvas.getContext("2d");

        
        this.#settings = JSON.parse(JSON.stringify(this.#defaults));
        this.#ts = JSON.parse(JSON.stringify(this.#defaults));
        this.Defaults(Defaults);
    }

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    #defaults: RendererSettings;
    #settings: RendererSettings;
    #ts: RendererSettings;

    get settings(): Invocable<RendererSettings, PartialRendererSettings>
    {
        return mirror(this.#settings, value => this.#Settings(value));
    }
    set settings(value: PartialRendererSettings)
    {
        this.#Settings(value);
    }

    get size(): Invocable<Size, Partial<Size>>
    {
        return mirror(this.#settings.size, value => this.#Size(value));
    }
    set size(value: Partial<Size>)
    {
        this.#Size(value);
    }

    get shadow(): Invocable<ShadowSettings, Partial<ShadowSettings>>
    {
        return mirror(this.#settings.shadow, value => this.#Shadow(value));
    }
    set shadow(newValue: Partial<ShadowSettings>)
    {
        this.#Shadow(newValue);
    }

    static #IsForInternal<T>(value: T, isInternal: boolean): value is Required<T>
    {
        return !isInternal;
    }

    //Basic settings and value adjusting stuff

    //Takes an object of what settings to modify. If no inputs are given, returns the current settings object.
    /**
     * @param { { width?: number; height?: number; [key: string]: unknown; } } Settings 
     */
    #Settings(Settings?: PartialRendererSettings) {
        if (Settings === undefined) return this.#settings;

        if (Settings?.size?.width && this.#settings.size.width !== Settings.size.width) this.canvas.width = Settings.size.width;
        if (Settings?.size?.height && this.#settings.size.height !== Settings.size.height) this.canvas.height = Settings.size.height;

        for (let key in Settings) {
            this.#settings[key] = Settings[key];
        }

        this.#SetValues(this.#settings);

    };
    //Used to set temp values - so single commands can do something different than the current settings.
    #SetValues(Settings: PartialRendererSettings) {
        this.#ts = JSON.parse(JSON.stringify(this.#settings));

        for (let key in Settings) {
            this.#ts[key] = Settings[key];
        }

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        this.Fill(this.#ts.fill, true);
        this.Stroke(this.#ts.stroke, true);
        this.#Shadow(this.#ts.shadow, true);
        this.Line(this.#ts.line, true);
        this.Scale(this.#ts.scale, true);
        this.Rotation(this.#ts.rotation, true);
        this.Skew(this.#ts.skew, true);
        this.Font(this.#ts.font, true);
        this.TextAlign(this.#ts.textAlign, true);
        this.TextBaseLine(this.#ts.textBaseLine, true);
        this.Alpha(this.#ts.alpha, true);
        this.CompositeOperation(this.#ts.compositeOperation, true);
        this.#Size(this.#ts.size, true);

    };
    //Adjusts the defaults with the specified object and resets to them. If not specified returns the current defaults object.
    Defaults(Settings?: PartialRendererSettings) {

        if (Settings === undefined) {
            return this.#defaults;
        }

        for (let key in Settings) {
            this.#defaults[key] = Settings[key];
        }

        this.#Settings(this.#defaults);
    };

    //Adjusting single settings. Used internally to actually set things on the context - the others are just for consistency. If not inputs are provided, returns the specified setting

    //The size of the canvas. WARNING: Will blank out all data when changed.
    /*
        Settings: Size-Vector
    */
    #Size(Settings?: Partial<Size>, i = false) {

        if (Settings === undefined) return this.#settings.size;

        if (Settings.width !== this.canvas.width) this.canvas.width = Settings.width;
        if (Settings.height !== this.canvas.height) this.canvas.height = Settings.height;

        if (CanvasRenderer.#IsForInternal(Settings, i)) this.#settings.size = Settings;

    };
    //Setting the fillStyle
    /*
        Settings: string CSS color OR
        gradient/pattern object.
        {
            type: "LinearGradient",
            x1: number,
            y1: number,
            x2: number,
            y2: number,
            stops: []{offset: number, color: string CSS color}
        }
        {
            type: "RadialGradient",
            x1: number,
            y1: number,
            r1: number (inner radius),
            x2: number,
            y2: number,
            r2: number (outer radius),
            stops: []{offset: number, color: string CSS color}
        }
        {
            type: "Pattern",
            image: CanvasImageSource,
            repetition: String - values unkown
        }
    */
    Fill(Settings: Fill, i = false) {

        if (Settings === undefined) {
            return this.#settings.fill;
        } else if (typeof (Settings) === "string") {
            this.ctx.fillStyle = Settings;
        } else if (Settings.type === "LinearGradient") {
            let grad = this.ctx.createLinearGradient(Settings.x1, Settings.y1, Settings.x2, Settings.y2);

            Settings.stops.forEach(stop => {
                grad.addColorStop(stop.offset, stop.color);
            });

            this.ctx.fillStyle = grad;
        } else if (Settings.type === "RadialGradient") {
            let grad = this.ctx.createRadialGradient(Settings.x1, Settings.y1, Settings.r1, Settings.x2, Settings.y2, Settings.r2);

            Settings.stops.forEach(stop => {
                grad.addColorStop(stop.offset, stop.color);
            });

            this.ctx.fillStyle = grad;
        } else if (Settings.type === "Pattern") {
            let grad = this.ctx.createPattern(Settings.image, Settings.repetition);

            this.ctx.fillStyle = grad;
        }

        if (!i) this.#settings.fill = Settings;

    };
    //Setting the strokeStyle.
    /*
        Settings: See Fill (Above)
    */
    Stroke(Settings: Fill, i = false) {

        if (Settings === undefined) {
            return this.#settings.stroke;
        } else if (typeof (Settings) === "string") {
            this.ctx.strokeStyle = Settings;
        } else if (Settings.type === "LinearGradient") {
            let grad = this.ctx.createLinearGradient(Settings.x1, Settings.y1, Settings.x2, Settings.y2);

            Settings.stops.forEach(stop => {
                grad.addColorStop(stop.offset, stop.color);
            });

            this.ctx.strokeStyle = grad;
        } else if (Settings.type === "RadialGradient") {
            let grad = this.ctx.createRadialGradient(Settings.x1, Settings.y1, Settings.r1, Settings.x2, Settings.y2, Settings.r2);

            Settings.stops.forEach(stop => {
                grad.addColorStop(stop.offset, stop.color);
            });

            this.ctx.strokeStyle = grad;
        } else if (Settings.type === "Pattern") {
            let grad = this.ctx.createPattern(Settings.image, Settings.repetition);

            this.ctx.strokeStyle = grad;
        }

        if (!i) this.#settings.stroke = Settings;

    };
    //Setting the Shadow. 'blur: 0' will disable shadows
    /*
        Settings: Object
        {
            ?color: string CSS color,
            ?blur: number,
            ?x: number,
            ?y: number
        }
    */
    #Shadow(Settings: Partial<Point & { color: string; blur: number; }>, i = false) {

        if (Settings === undefined) return this.#settings.shadow;

        for (let key in this.#settings.shadow) {
            if (Settings[key] === undefined) Settings[key] = this.#settings.shadow[key];
        }

        this.ctx.shadowColor = Settings.color;
        this.ctx.shadowBlur = Settings.blur;
        this.ctx.shadowOffsetX = Settings.x;
        this.ctx.shadowOffsetY = Settings.y;

        if (CanvasRenderer.#IsForInternal(Settings, i)) this.#settings.shadow = Settings;

    };
    //Setting the line settings
    /*
        Settings: Object
        {
            ?cap: string. 'butt || round || square',
            ?join: string. 'miter || bevel || round',
            ?width: number,
            ?miterLimit: number
        }
    */
    Line(Settings: Partial<LineSettings>, i = false) {

        if (Settings === undefined) return this.#settings.line;

        for (let key in this.#settings.line) {
            if (Settings[key] === undefined) Settings[key] = this.#settings.line[key];
        }

        this.ctx.lineCap = Settings.cap;
        this.ctx.lineJoin = Settings.join;
        this.ctx.lineWidth = Settings.width;
        this.ctx.miterLimit = Settings.miterLimit;

        if (CanvasRenderer.#IsForInternal(Settings, i)) this.#settings.line = Settings;

    };
    //Setting the scaling.
    /*
        Settings: Point-Vector
    */
    /**
     * 
     * @param {*} Settings 
     * @param {boolean | undefined} i
     */
    Scale(Settings: Point, i = false) {

        if (Settings === undefined) return this.#settings.scale;

        if (Settings.x === undefined) Settings.x = 1;
        if (Settings.y === undefined) Settings.y = 1;

        this.ctx.scale(Settings.x, Settings.y);

        if (!i) {
            this.#settings.scale.x = Settings.x;
            this.#settings.scale.y = Settings.y;
        }

    };
    //Setting the rotation.
    /*
        Settings: RADIANS
    */
    Rotation(Settings: Radians, i = false) {

        if (Settings === undefined) return this.#settings.rotation;

        this.ctx.rotate(Settings);

        if (!i) this.#settings.rotation = Settings;

    };
    //Setting the translation.
    /*
        Settings: Point-Vector
    */
    /**
     * 
     * @param {{ x?: number; y?: number; }} Settings 
     * @param {boolean | undefined} i 
     * @returns 
     */
    Translation(Settings: Point, i: any) {
        if (Settings === undefined) return this.#settings.translation;

        if (Settings.x === undefined) Settings.x = 0;
        if (Settings.y === undefined) Settings.y = 0;

        this.ctx.translate(Settings.x, Settings.y);

        if (!i) {
            this.#settings.translation.x = Settings.x;
            this.#settings.translation.y = Settings.y;
        }

    };
    //Setting the skew.
    /*
        Settings: Point-Vector
    */
    Skew(Settings: Point, i = false) {

        if (Settings === undefined) return this.#settings.skew;

        if (Settings.x === undefined) Settings.x = 0;
        if (Settings.y === undefined) Settings.y = 0;

        this.ctx.transform(1, Settings.x, Settings.y, 1, 0, 0);

        if (!i) {
            this.#settings.skew.x = Settings.x;
            this.#settings.skew.y = Settings.y;
        }

    };
    //Setting the font.
    /*
        Settings: string CSS font properties
    */
    Font(Settings: Font, i = false) {

        if (Settings === undefined) return this.#settings.font;

        this.ctx.font = Settings;

        if (!i) this.#settings.font = Settings;

    };
    //Setting the text align.
    /*
        Settings: string 'start || center || end'
    */
    TextAlign(Settings: TextAlignment, i = false) {

        if (Settings === undefined) return this.#settings.textAlign;

        this.ctx.textAlign = Settings;

        if (!i) this.#settings.textAlign = Settings;

    };
    //Setting the text baseline.
    /*
        Settings: string 'alphabetic || top || hanging || middle || ideographic || bottom'

        RefLink - https://www.w3schools.com/tags/img_textbaseline.gif
    */
    TextBaseLine(Settings: TextBaselineAlignment, i = false) {

        if (Settings === undefined) return this.#settings.textBaseLine;

        this.ctx.textBaseline = Settings;

        if (!i) this.#settings.textBaseLine = Settings;

    };
    //Setting the global transparency
    /**
     * @param Settings Between 0 and 1 inclusive
     */
    Alpha(Settings: number, i = false) {

        if (Settings === undefined) return this.#settings.alpha;

        this.ctx.globalAlpha = Settings;

        if (!i) this.#settings.alpha = Settings;
    };
    //Setting how the total is composited from the parts.
    /*
        Settings: string, 'source-over || source-atop || source-in || source-out || destination-over || destination-atop || destination-in || destination-out || lighter || copy || xor'
    */
    /**
     * @param {boolean | undefined} i
     */
    CompositeOperation(Settings: CompositionOperation, i = false) {

        if (Settings === undefined) return this.#settings.compositeOperation;

        this.ctx.globalCompositeOperation = Settings;

        if (!i) this.#settings.compositeOperation = Settings;
    };
    //Setting Whether text should be filled. Pseudo-method. Only exists for consistency.
    /*
        Settings: boolean
    */
    TextFill(Settings: boolean) {

        if (Settings === undefined) return this.#settings.textFill;
        this.#settings.textFill = Settings;

    };
    //Setting the max width for drawing text. Pseudo-method. Only exists for consistency.
    /*
        Settings: number
    */
    MaxTextWidth(Settings: number) {

        if (Settings === undefined) return this.#settings.maxTextWidth;
        this.#settings.maxTextWidth = Settings;

    };
    //Setting the size for images draw. Optional if image is not being clipped. Pseudo-method. Only exists for consistency.
    /*
        Settings: Size-Vector
    */
    ImageSize(Settings: Partial<Size>) {

        if (Settings === undefined) return this.#settings.imageSize;

        this.#settings.imageSize = Settings;

    };
    //Setting the rectangular piece of the image to draw. Optional. Pseudo-method. Only exists for consistency.
    /*
        Settings: Object
        {
            ?x: number,
            ?y: number,
            ?width: number,
            ?height: number
        }
    */
    ImageClipping(Settings: Area) {

        if (Settings === undefined) return this.#settings.imageClipping;

        if (Settings.x !== undefined) this.#settings.imageClipping.x = Settings.x;
        if (Settings.y !== undefined) this.#settings.imageClipping.y = Settings.y;
        if (Settings.width !== undefined) this.#settings.imageClipping.width = Settings.width;
        if (Settings.height !== undefined) this.#settings.imageClipping.height = Settings.height;

    };
    //Setting Whether the shape should skip the closing line. Pseudo-method. Only exists for consistency.
    /*
        Settings: boolean
    */
    NoClose(Settings: boolean) {

        if (Settings === undefined) return this.#settings.noClose;

        this.#settings.noClose = Settings;

    };

    //Drawing methods. Draw things to the canvas. All 'Settings' inputs are for temp-settings, used only for this drawing operation

    //Drawing a generic shape.
    /*
        Positions: Array.
        
        Each item is one of the following:
        {
            x: number,
            y: number,
            ?type: "Point"
        }
        {
            type: "QuadraticCurveTo",
            cx: number,
            cy: number,
            x: number,
            y: number
        }
        {
            type: "BezierCurveTo",
            cx1: number,
            cy1: number,
            cx2: number,
            cy2: number,
            x: number,
            y: number
        }
        {
            type: "Arc",
            x: number,
            y: number,
            radius: number,
            startAngle: RADIANS,
            endAngle: RADIANS,
            ?antiClockWise: boolean
        }
        {
            type: "ArcTo",
            cx: number,
            cy: number,
            x: number,
            y: number
        }
    */
    DrawShape(Positions: Path, Settings?: PartialRendererSettings) {
        this.#SetValues(Settings);
        //Lets you pass an array in without it getting mangled
        Positions = JSON.parse(JSON.stringify(Positions));

        this.ctx.beginPath();

        const start = Positions[0];

        if (start.type === undefined || start.type === "Point") {
            this.ctx.moveTo(start.x, start.y);
            Positions.splice(0, 1);
        }
        Positions.forEach(i => {
            if (i.type === undefined || i.type === "Point") {
                this.ctx.lineTo(i.x, i.y)
            } else if (i.type === "QuadraticCurveTo") {
                this.ctx.quadraticCurveTo(i.cx, i.cy, i.x, i.y);
            } else if (i.type === "BezierCurveTo") {
                this.ctx.bezierCurveTo(i.cx1, i.cy1, i.cx2, i.cy2, i.x, i.y);
            } else if (i.type === "Arc") {
                this.ctx.arc(i.x, i.y, i.radius, i.startAngle, i.endAngle, i.antiClockWise);
            } else if (i.type === "ArcTo") {
                this.ctx.arcTo(i.cx, i.cy, i.x, i.y, i.radius);
            }

        });
        if (this.#ts.noClose && Positions.length > 1) this.ctx.moveTo(Positions[Positions.length - 2].x, Positions[Positions.length - 2].y);
        this.ctx.closePath();

        this.ctx.stroke();
        this.ctx.fill();
    };
    //Drawing text
    /*
        Text: string,
        Position: Point-Vector
    */
    DrawText(Text: string, Position = { x: 0, y: 0 }, Settings: Partial<RendererSettings>) {

        this.#SetValues(Settings);

        if (this.#ts.textFill) {
            this.ctx.fillText(Text, Position.x, Position.y, this.#ts.maxTextWidth)
        } else {
            this.ctx.strokeText(Text, Position.x, Position.y, this.#ts.maxTextWidth)
        }
    };
    //Drawing an image to the canvas
    /*
        Img: CanvasImageSource,
        Position: Point-Vector
    */
    DrawImage(Img: CanvasImageSource, Position = { x: 0, y: 0 }, Settings: Partial<RendererSettings>) {

        this.#SetValues(Settings);

        let c = this.#ts.imageClipping
        if (c.x === undefined || c.y === undefined || c.width === undefined || c.height === undefined) {
            this.ctx.drawImage(Img, Position.x, Position.y, this.#ts.imageSize.width, this.#ts.imageSize.height);
        } else {
            this.ctx.drawImage(Img, c.x, c.y, c.width, c.height, Position.x, Position.y, this.#ts.imageSize.width, this.#ts.imageSize.height);
        }
    }
    //Draws ImageData to the canvas.
    /*
        Data: ImageData (array),
        Position: Point-Vector
    */
    DrawImageData(Data: ImageData, Position: Point = { x: 0, y: 0 }, Settings: Partial<RendererSettings>) {

        this.#SetValues(Settings);

        this.ctx.putImageData(Data, Position.x, Position.y);

    }
    //Resets the canvas.
    Reset() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.#settings.size.width, this.#settings.size.height);
        this.Defaults();
    }
    //Resets a rectangular area
    ResetRect(Point: Point, Size: Size, Settings: Partial<RendererSettings>) {

        this.#SetValues(Settings);

        this.ctx.clearRect(Point.x, Point.y, Size.width, Size.height)
    }

    //Additional related-and-helpful functions

    //Gets a rectangular section of the canvas as ImageData
    /*
        Position: Point-Vector,
        Size: Size-Vector
    */
    GetImageData(Position: Point = { x: 0, y: 0 }, Size: Size = this.#settings.size): ImageData {
        return this.ctx.getImageData(Position.x, Position.y, Size.width, Size.height);
    }
    //Returns whether the point is within the path.
    /*
        Path: Array. See DrawShape,
        Point: Point-Vector,
        ?fillRule: string 'nonzero || evenodd'

        wiki for fillRule - https://en.wikipedia.org/wiki/Nonzero-rule
    */
    Collides(Path: Path, Point: Point, fillRule: CanvasFillRule = "nonzero") {

        let path = new Path2D();

        //path.beginPath();


        if (Path[0].type === undefined || Path[0].type === "Point") {
            path.moveTo(Path[0].x, Path[0].y);
            Path.splice(0, 1);
        } else {
            path.moveTo(0, 0);
        }
        Path.forEach(i => {
            if (i.type === undefined || i.type === "Point") {
                path.lineTo(i.x, i.y)
            } else if (i.type === "QuadraticCurveTo") {
                path.quadraticCurveTo(i.cx, i.cy, i.x, i.y);
            } else if (i.type === "BezierCurveTo") {
                path.bezierCurveTo(i.cx1, i.cy1, i.cx2, i.cy2, i.x, i.y);
            } else if (i.type === "Arc") {
                path.arc(i.x, i.y, i.radius, i.startAngle, i.endAngle, i.antiClockWise);
            } else if (i.type === "ArcTo") {
                path.arcTo(i.cx, i.cy, i.x, i.y, i.radius);
            }
        });
        path.closePath();

        //Alternate fillRule: "evenodd"
        return this.ctx.isPointInPath(path, Point.x, Point.y, fillRule)

    }
    //Measures the width of text, given the current or temporary settings
    /*
        Text: string,
        Settings: Temporary override settings object
    */
    MeasureText(Text: string, Settings: Partial<RendererSettings>) {

        this.#SetValues(Settings);

        return this.ctx.measureText(Text);

    }
    //Creates a blank piece of ImageData
    /*
        Size: Size-Vector
    */
    CreateImageData(Size = this.#settings.size) {
        return this.ctx.createImageData(Size.width, Size.height);
    }
    //Returns the current state of the canvas as a DataURL
    GetDataURL() {
        return this.canvas.toDataURL();
    }
    //Returns a random CSS HSLA color.
    /*
        Input: overrides Object
        {
            ?hue: number 0-255,
            ?sat: number 0-100,
            ?light: number 0-100,
            ?alpha: number 0-1
        }
    */
    RandomHSLAColor(Input: Partial<{
        /** Between 0 and 255 inclusive */
        hue: number;
        /** Between 0 and 100 inclusive */
        sat: number;
        /** Between 0 and 100 inclusive */
        light: number;
        /** Between 0 and 1 inclusive */
        alpha: number;
    }> = {}) {
        let c = {
            hue: Math.round(Math.random() * 255),
            sat: Math.round(Math.random() * 80) + 20,
            light: Math.round(Math.random() * 80) + 20,
            alpha: (Math.random() * 0.7) + 0.3
        }

        for (let key in Input) {
            c[key] = Input[key];
        }

        while (c.alpha > 1) {
            c.alpha = Math.random() + 0.3;
        }


        return `hsla(${c.hue}deg, ${c.sat}%, ${c.light}%, ${c.alpha})`;
    };

};