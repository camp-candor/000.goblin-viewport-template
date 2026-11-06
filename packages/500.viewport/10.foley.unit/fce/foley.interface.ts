import FoleyBit from './foley.bit.js'

export default interface Foley {
    // idx:string;
    // foleyBitList: FoleyBit[];
    // foleyBits:any;
}

export interface FoleyPlacementSpec {
    category: string;
    fromFrame: number;
    durationInFrames: number;
    wavPath: string;
}
