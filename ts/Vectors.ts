type Vec2Type = number | {x: number, y: number} | number[] | Vec2;

//Takes an object with x and y, an array of 2 items, 2 parameters, or 1 parameter.
class Vec2 {

    x: number;
    y: number;

    constructor (x: Vec2Type, y?: number)
    {
        if (Array.isArray(x)) {
            this.x = x[0];
            this.y = x[1];
        } else if (typeof(x) === "object") {
            this.x = x.x;
            this.y = x.y;
        } else if (y !== undefined) {
            this.x = x;
            this.y = y;
        } else {
            this.x = x;
            this.y = x;
        }
    };

    //Adds a vector or a number, and returns this
    Add (x: Vec2Type, y?: number) {
        let vec = new Vec2(x, y)

        this.x += vec.x;
        this.y += vec.y;
        return this;
    };
    //Subtracts a vector or number, and returns this
    Subtract (x: Vec2Type, y?: number) {
        let vec = new Vec2(x, y)

        this.x -= vec.x;
        this.y -= vec.y;
        return this;
    };
    //Multiplies a vector or number, and returns this
    Multiply (x: Vec2Type, y?: number) {
        let vec = new Vec2(x, y)

        this.x *= vec.x;
        this.y *= vec.y;
        return this;
    };
    //Divides a vector or number, and returns this
    Divide (x: Vec2Type, y?: number) {
        let vec = new Vec2(x, y)

        this.x /= vec.x;
        this.y /= vec.y;
        return this;
    };
    //Normalizes the vector, and returns this
    Normalize () {
        let vec = Vec2.Normalized(this);
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
    //Absolutes the vector and returns this
    Absolute () {
        this.x = Math.abs(this.x);
        this.y = Math.abs(this.y);
        return this;
    };
    //Rotates the vector towards the specified vector/point with multiplicate % and returns this;
    RotateTowardsMult (percent: number, x: Vec2Type, y?: number) {
        let Mag = this.Magnitude();
        let B = new Vec2(x, y).Normalize();
        this.Normalize();
        let VecLine = Vec2.Subtract(B, this).Multiply(percent);
        this.Add(VecLine);
        this.Normalize().Multiply(Mag);
        return this;
    };
    //Rotates the vector towards the specified vector/point with multiplicate % and returns this;
    RotateTowardsAdd (amount: number, x: Vec2Type, y?: number) {
        let Mag = this.Magnitude();
        let B = new Vec2(x, y);
        let VecLine = Vec2.Subtract(B, this).Normalize().Multiply(amount);
        this.Add(VecLine);
        this.Normalize().Multiply(Mag);
        return this;
    };
    //Returns the angle of the vector
    Angle () {
        let a = (Math.atan(this.y / this.x));
        if (this.x < 0) a += Math.PI;
        return a;
    }


    //Static methods

    //Add 2 vectors, or a vector and a number
    static Add (vec1: Vec2Type, vec2: Vec2Type) {
        vec1 = new Vec2(vec1);
        vec2 = new Vec2(vec2);
        return new Vec2(vec1.x + vec2.x, vec1.y + vec2.y);
    };
    //Subtract 2 vectors, or a vector and a number
    static Subtract (vec1: Vec2Type, vec2: Vec2Type) {
        vec1 = new Vec2(vec1);
        vec2 = new Vec2(vec2);
        return new Vec2(vec1.x - vec2.x, vec1.y - vec2.y);
    };
    //Multiply 2 vectors, or a vector and a number
    static Multiply (vec1: Vec2Type, vec2: Vec2Type) {
        vec1 = new Vec2(vec1);
        vec2 = new Vec2(vec2);
        return new Vec2(vec1.x * vec2.x, vec1.y * vec2.y);
    };
    //Divide 2 vectors, or a vector and a number
    static Divide (vec1: Vec2Type, vec2: Vec2Type) {
        vec1 = new Vec2(vec1);
        vec2 = new Vec2(vec2);
        return new Vec2(vec1.x / vec2.x, vec1.y / vec2.y);
    };
    //Get the magnitue of a vector, by single or double input
    static Magnitude (x: Vec2Type, y?: number) {
        let vec = new Vec2(x, y);
        return (Math.sqrt(vec.x * vec.x + vec.y * vec.y));
    };
    //Returns the normalized form of the vector, by single or double input
    static Normalized (x: Vec2Type, y?: number) {
        let vec = new Vec2(x, y);
        if (vec.Magnitude() === 0) return new Vec2(0);
        return vec.Divide(vec.Magnitude());
    };
    //Returns the absoluted form of the vector, by single or double input
    static Absolute (x: Vec2Type, y?: number) {
        let vec = new Vec2(x, y);
        return vec.Absolute();
    }
    //Returns the value of the first vector, rotated towards the second by multiplicative percent
    static RotateTowardsMult (vec1: Vec2Type, vec2: Vec2Type, percent: number) {
        let A = new Vec2(vec1);
        let B = new Vec2(vec2);
        return A.RotateTowardsMult(percent, B);
    }
    //Returns the value of the first vector, rotated towards the second by additive amount
    static RotateTowardsAdd (vec1: Vec2Type, vec2: Vec2Type, percent: number) {
        let A = new Vec2(vec1);
        let B = new Vec2(vec2);
        return A.RotateTowardsAdd(percent, B);
    }
    //Returns the angle of the vector
    static Angle (x: Vec2Type, y?: number) {
        let vec = new Vec2(x, y);
        return vec.Angle();
    }
};


type Vec3Type = number | {x: number, y: number, z: number} | number[] | Vec3;

//Takes an object with x, y and z, an array of 3 items, 3 numbers, or 1 number.
class Vec3 {

    x: number;
    y: number;
    z: number;

    constructor (x: Vec3Type, y?: number, z?: number)
    {
        if (Array.isArray(x)) {
            this.x = x[0];
            this.y = x[1];
            this.z = x[2];
        } else if (typeof(x) === "object") {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        } else if (y !== undefined && z !== undefined) {
            this.x = x;
            this.y = y;
            this.z = z;
        } else {
            this.x = x;
            this.y = x;
            this.z = x;
        }

    };

    //Adds a vector or a number, and returns this
    Add (x: Vec3Type, y?: number, z?: number) {
        let vec = new Vec3 (x, y, z);

        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
        return this;
    };
    //Subtracts a vector or number, and returns this
    Subtract (x: Vec3Type, y?: number, z?: number) {
        let vec = new Vec3 (x, y, z);

        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
        return this;
    };
    //Multiplies a vector or number, and returns this
    Multiply (x: Vec3Type, y?: number, z?: number) {
        let vec = new Vec3 (x, y, z);

        this.x *= vec.x;
        this.y *= vec.y;
        this.z *= vec.z;
        return this;
    };
    //Divides a vector or number, and returns this
    Divide (x: Vec3Type, y?: number, z?: number) {
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
    //Absolutes the vector
    Absolute () {
        this.x = Math.abs(this.x);
        this.y = Math.abs(this.y);
        this.z = Math.abs(this.z);
        return this;
    }


    //Static methods

    //Add 2 vector-types
    static Add (vec1: Vec3Type, vec2: Vec3Type) {
        let Vec1 = new Vec3(vec1);
        let Vec2 = new Vec3(vec2);
        return Vec1.Add(Vec2);
    };
    //Subtract 2 vector-types
    static Subtract (vec1: Vec3Type, vec2: Vec3Type) {
        let Vec1 = new Vec3(vec1);
        let Vec2 = new Vec3(vec2);
        return Vec1.Subtract(Vec2);
    };
    //Multiply 2 vector-types
    static Multiply (vec1: Vec3Type, vec2: Vec3Type) {
        let Vec1 = new Vec3(vec1);
        let Vec2 = new Vec3(vec2);
        return Vec1.Multiply(Vec2);
    };
    //Divide 2 vector-types
    static Divide (vec1: Vec3Type, vec2: Vec3Type) {
        let Vec1 = new Vec3(vec1);
        let Vec2 = new Vec3(vec2);
        return Vec1.Divide(Vec2);
    };
    //Get the magnitue of a vector-type, by single or triple input
    static Magnitude (x: Vec3Type, y?: number, z?: number) {
        let vec = new Vec3(x, y, z);
        return (Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z));
    };
    //Returns the normalized form of a vector-type, by single or triple input
    static Normalized (x: Vec3Type, y?: number, z?: number) {
        let vec = new Vec3(x, y, z);
        if (vec.Magnitude() === 0) return new Vec3(0);
        return vec.Divide(vec.Magnitude());
    };
    //Returns the absoluted form of the vector, by single or triple input
    static Absolute (x: Vec3Type, y?: number, z?: number) {
        let vec = new Vec3(x, y, z);
        return vec.Absolute();
    }
};


type VecXType = Vec2Type | Vec3Type | VecX;

//Creates a vector with an arbitrary number of values. Can take in a VecX, Vec2, Vec3, Array, or number;
class VecX {

    values: number[];
    get size () {
        return this.values.length;
    }

    constructor (values: VecXType) {
        if (typeof(values) === "number") this.values = [values];
        else if (Array.isArray(values)) this.values = values;
        else if (values instanceof VecX) this.values = values.values;
        else if (typeof(values) === "object" && 'z' in values) this.values = [values.x, values.y, values.z];
        else this.values = [values.x, values.y];
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
    //Absolutes the vector
    Absolute () {
        this.values = this.values.map(i => Math.abs(i));
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
        if (vec.Magnitude() === 0) return vec.Multiply(0);
        return vec.Divide(vec.Magnitude());
    };
    //Returns the absoluted form of a Vector-type
    static Absolute (vec: VecXType) {
        let Vec = new VecX(vec);
        return Vec.Absolute();
    }
}