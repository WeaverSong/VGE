type Vec2TypeX = Vec2 | number | {x: number, y: number} | Array<number>;
type Vec2TypeY = number | undefined;

//Takes an object with x and y, an array of 2 items, 2 parameters, or 1 parameter.
class Vec2 {

    public x: number;
    public y: number;

    constructor (x: Vec2TypeX, y?: Vec2TypeY)
    {
        if (Array.isArray(x)) {
            this.x = x[0];
            this.y = x[1];
        } else if (typeof(x) === "object") {
            this.x = x.x;
            this.y = x.y;
        } else if (x !== undefined && y !== undefined) {
            this.x = x;
            this.y = y;
        } else {
            this.x = x;
            this.y = x;
        }
    };

    //Adds a vector or a number, and returns this
    Add (x: Vec2TypeX, y?: Vec2TypeY) {
        let vec = new Vec2(x, y)

        this.x += vec.x;
        this.y += vec.y;
        return this;
    };
    //Subtracts a vector or number, and returns this
    Subtract (x: Vec2TypeX, y?: Vec2TypeY) {
        let vec = new Vec2(x, y)

        this.x -= vec.x;
        this.y -= vec.y;
        return this;
    };
    //Multiplies a vector or number, and returns this
    Multiply (x: Vec2TypeX, y?: Vec2TypeY) {
        let vec = new Vec2(x, y)

        this.x *= vec.x;
        this.y *= vec.y;
        return this;
    };
    //Divides a vector or number, and returns this
    Divide (x: Vec2TypeX, y?: Vec2TypeY) {
        let vec = new Vec2(x, y)

        this.x /= vec.x;
        this.y /= vec.y;
        return this;
    };
    //Normalizes the vector, and returns this
    Normalize () {
        let vec = Vec2.Normalized(this, undefined);
        this.x = vec.x;
        this.y = vec.y;
        return this;
    };
    //Returns the magnitude of the vector
    Magnitude () {
        return Vec2.Magnitude(this);
    };
    //Returns the normalized equivalent of the vector
    Normalized () {
        return Vec2.Normalized(this);
    };


    //Static methods

    //Add 2 vectors, or a vector and a number
    static Add (vec1: Vec2, vec2: Vec2 | number) {
        vec1 = new Vec2(vec1);
        vec2 = new Vec2(vec2);
        return new Vec2(vec1.x + vec2.x, vec1.y + vec2.y);
    };
    //Subtract 2 vectors, or a vector and a number
    static Subtract (vec1: Vec2, vec2: Vec2 | number) {
        vec1 = new Vec2(vec1);
        vec2 = new Vec2(vec2);
        return new Vec2(vec1.x - vec2.x, vec1.y - vec2.y);
    };
    //Multiply 2 vectors, or a vector and a number
    static Multiply (vec1: Vec2, vec2: Vec2 | number) {
        vec1 = new Vec2(vec1);
        vec2 = new Vec2(vec2);
        return new Vec2(vec1.x * vec2.x, vec1.y * vec2.y);
    };
    //Divide 2 vectors, or a vector and a number
    static Divide (vec1: Vec2, vec2: Vec2 | number) {
        vec1 = new Vec2(vec1);
        vec2 = new Vec2(vec2);
        return new Vec2(vec1.x / vec2.x, vec1.y / vec2.y);
    };
    //Get the magnitue of a vector, by single or double input
    static Magnitude (x: Vec2TypeX, y?: Vec2TypeY) {
        let vec = new Vec2(x, y);
        return (Math.sqrt(vec.x * vec.x + vec.y * vec.y));
    };
    //Returns the normalized form of the vector, by single or double input
    static Normalized (x: Vec2TypeX, y?: Vec2TypeY) {
        let vec = new Vec2(x, y);
        return vec.Divide(vec.Magnitude());
    };
};

type Vec3TypeX = Vec3 | number | {x: number, y: number, z: number} | Array<number>;
type Vec3TypeY = number | undefined;
type Vec3TypeZ = number | undefined;

//Takes an object with x, y and z, an array of 3 items, 3 numbers, or 1 number.
class Vec3 {

    public x: number;
    public y: number;
    public z: number;

    constructor (x: Vec3TypeX, y?: Vec3TypeY, z?: Vec3TypeZ)
    {
        if (Array.isArray(x)) {
            this.x = x[0];
            this.y = x[1];
            this.z = x[2];
        } else  if (typeof(x) === "object" && x.z !== undefined) {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        } else if (typeof(x) == "number" && typeof(y) == "number" && typeof(z) == "number") {
            this.x = x;
            this.y = y;
            this.z = z;
        } else if (typeof(x) == "number") {
            this.x = x;
            this.y = x;
            this.z = x;
        } else {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
    };

    //Adds a vector or a number, and returns this
    Add (x: Vec3TypeX, y?: Vec3TypeY, z?: Vec3TypeZ) {
        let vec = new Vec3 (x, y, z);

        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
        return this;
    };
    //Subtracts a vector or number, and returns this
    Subtract (x: Vec3TypeX, y?: Vec3TypeY, z?: Vec3TypeZ) {
        let vec = new Vec3 (x, y, z);

        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
        return this;
    };
    //Multiplies a vector or number, and returns this
    Multiply (x: Vec3TypeX, y?: Vec3TypeY, z?: Vec3TypeZ) {
        let vec = new Vec3 (x, y, z);

        this.x *= vec.x;
        this.y *= vec.y;
        this.z *= vec.z;
        return this;
    };
    //Divides a vector or number, and returns this
    Divide (x: Vec3TypeX, y?: Vec3TypeY, z?: Vec3TypeZ) {
        let vec = new Vec3 (x, y, z);

        this.x /= vec.x;
        this.y /= vec.y;
        this.z /= vec.z;
        return this;
    };
    //Normalizes the vector, and returns this
    Normalize () {
        let vec = Vec3.Normalized(this);
        this.x = vec.x;
        this.y = vec.y;
        this.z = vec.z;
        return this;
    };
    //Returns the magnitude of the vector
    Magnitude () {
        return Vec3.Magnitude(this);
    };
    //Returns the normalized equivalent of the vector
    Normalized () {
        return Vec3.Normalized(this);
    };


    //Static methods

    //Add 2 vector-types
    static Add (vec1: Vec3TypeX, vec2: Vec3TypeX) {
        let Vec1 = new Vec3(vec1);
        let Vec2 = new Vec3(vec2);
        return Vec1.Add(Vec2);
    };
    //Subtract 2 vector-types
    static Subtract (vec1: Vec3TypeX, vec2: Vec3TypeX) {
        let Vec1 = new Vec3(vec1);
        let Vec2 = new Vec3(vec2);
        return Vec1.Subtract(Vec2);
    };
    //Multiply 2 vector-types
    static Multiply (vec1: Vec3TypeX, vec2: Vec3TypeX) {
        let Vec1 = new Vec3(vec1);
        let Vec2 = new Vec3(vec2);
        return Vec1.Multiply(Vec2);
    };
    //Divide 2 vector-types
    static Divide (vec1: Vec3TypeX, vec2: Vec3TypeX) {
        let Vec1 = new Vec3(vec1);
        let Vec2 = new Vec3(vec2);
        return Vec1.Divide(Vec2);
    };
    //Get the magnitue of a vector-type, by single or triple input
    static Magnitude (x: Vec3TypeX, y?: Vec3TypeY, z?: Vec3TypeZ) {
        let vec = new Vec3(x, y, z);
        return (Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z));
    };
    //Returns the normalized form of a vector-type, by single or triple input
    static Normalized (x: Vec3TypeX, y?: Vec3TypeY, z?: Vec3TypeZ) {
        let vec = new Vec3(x, y, z);
        return vec.Divide(vec.Magnitude());
    };
};

type VecXType = Vec2TypeX | Vec3TypeX | VecX

//Creates a vector with an arbitrary number of values. Can take in a VecX, Vec2, Vec3, Array, or number;
class VecX {

    public values: number[];
    get size () {
        return this.values.length;
    }

    constructor (values: VecXType) {
        if (typeof(values) === "number") this.values = [values];
        else if (Array.isArray(values)) this.values = values;
        else if (values instanceof VecX) this.values = values.values;
        else if (typeof(values) === "object") {
            if (!values.hasOwnProperty('z')) this.values = [values.x, values.y];
            if ('z' in values) this.values = [values.x, values.y, values.z];
            else this.values = [];
        }
        else this.values = [];
    };

    //Adds a second Vector-type. Returns this.
    Add (values: VecXType) {
        let vec = new VecX (values);
        while (vec.size < this.size) {
            vec.values.push(vec.values[0]);
        };

        this.values = this.values.map((val, index) => val + vec.values[index]);

        return this;
    };
    //Subtracts a second Vector-type. Returns this.
    Subtract (values: VecXType) {
        let vec = new VecX (values);
        while (vec.size < this.size) {
            vec.values.push(vec.values[0]);
        };

        this.values = this.values.map((val, index) => val - vec.values[index]);

        return this;
    };
    //Multiplies by a second Vector-type. Returns this.
    Multiply (values: VecXType) {
        let vec = new VecX (values);
        while (vec.size < this.size) {
            vec.values.push(vec.values[0]);
        };

        this.values = this.values.map((val, index) => val * vec.values[index]);

        return this;
    };
    //Divides by a second Vector-type. Returns this.
    Divide (values: VecXType) {
        let vec = new VecX (values);
        while (vec.size < this.size) {
            vec.values.push(vec.values[0]);
        };

        this.values = this.values.map((val, index) => val / vec.values[index]);

        return this;
    };
    //Normalizes this VecX. Returns this.
    Normalize () {
        this.values = VecX.Normalized(this).values;
        return this;
    };
    //Returns the magnitude of this VecX
    Magnitude () {
        return VecX.Magnitude(this);
    };
    //Returns the normalized equivalent of this VecX
    Normalized () {
        return VecX.Normalized(this);
    }


    //Static methods

    //Adds 2 Vector-types
    static Add (vec1: VecXType, vec2: VecXType) {
        vec1 = new VecX (vec1);
        vec2 = new VecX (vec2);
        return vec1.Add(vec2);
    };
    //Subtracts 2 Vector-types
    static Subtract (vec1: VecXType, vec2: VecXType) {
        vec1 = new VecX (vec1);
        vec2 = new VecX (vec2);
        return vec1.Subtract(vec2);
    };
    //Multiplies 2 Vector-types
    static Multiply (vec1: VecXType, vec2: VecXType) {
        vec1 = new VecX (vec1);
        vec2 = new VecX (vec2);
        return vec1.Multiply(vec2);
    };
    //Adds 2 Vector-types
    static Divide (vec1: VecXType, vec2: VecXType) {
        vec1 = new VecX (vec1);
        vec2 = new VecX (vec2);
        return vec1.Divide(vec2);
    };
    //Returns the magnitude of a Vector-type
    static Magnitude (vec: VecXType) {
        vec = new VecX (vec);
        return Math.sqrt(vec.values.reduce((adder, value) => adder + value * value, 0));
    };
    //Returns the normalized form of a Vector-type
    static Normalized (vec: VecXType) {
        vec = new VecX (vec);
        return vec.Divide(vec.Magnitude());
    };
}