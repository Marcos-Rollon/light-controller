export class Utils {
    static map(current: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
        const mapped = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
        return Utils.clamp(mapped, out_min, out_max);
    }
    static clamp(input: number, min: number, max: number): number {
        return input < min ? min : input > max ? max : input;
    }
    static uInt8ArrayToFloatArray(uInt8Array: Uint8Array) {
        let uint16: Uint16Array = new Uint16Array(uInt8Array.buffer);
        let floats: number[] = [];
        uint16.forEach(e => {
            floats.push(Utils.float16ToNumber(e));
        })
        return floats;
    }

    // Takes as input a uInt16 encoded 16 bit float
    // and returns a js Number (float 32)
    static float16ToNumber(input: number): number {
        // Create a 32 bit DataView to store the input
        const arr = new ArrayBuffer(4);
        const dv = new DataView(arr);

        // Set the Float16 into the last 16 bits of the dataview
        // So our dataView is [00xx]
        dv.setUint16(2, input, false);

        // Get all 32 bits as a 32 bit integer
        // (JS bitwise operations are performed on 32 bit signed integers)
        const asInt32 = dv.getInt32(0, false);

        // All bits aside from the sign
        let rest = asInt32 & 0x7fff;
        // Sign bit
        let sign = asInt32 & 0x8000;
        // Exponent bits
        const exponent = asInt32 & 0x7c00;

        // Shift the non-sign bits into place for a 32 bit Float
        rest <<= 13;
        // Shift the sign bit into place for a 32 bit Float
        sign <<= 16;

        // Adjust bias
        // https://en.wikipedia.org/wiki/Half-precision_floating-point_format#Exponent_encoding
        rest += 0x38000000;
        // Denormals-as-zero
        rest = (exponent === 0 ? 0 : rest);
        // Re-insert sign bit
        rest |= sign;

        // Set the adjusted float32 (stored as int32) back into the dataview
        dv.setInt32(0, rest, false);

        // Get it back out as a float32 (which js will convert to a Number)
        const asFloat32 = dv.getFloat32(0, false);

        return asFloat32;
    }
}
