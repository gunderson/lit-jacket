const DATA_TYPES = {
	WIDTH: 0x0, // WIDTH, <byte width0>, <byte width1>
	HEIGHT: 0x1, // HEIGHT, <byte height0>, <byte height1>
	NUM_PALETTES: 0x2, // NUM_PALETTES, <byte>
	PALETTE_A: 0x3, // PALETTE_A, <byte palette_index>, <byte length <= 250>, <byte a0>, <byte a1>... <byte aN>
	PALETTE_R: 0x4, // PALETTE_R, <byte palette_index>, <byte length <= 250>, <byte r0>, <byte r1>... <byte rN>
	PALETTE_G: 0x5, // PALETTE_G, <byte palette_index>, <byte length <= 250>, <byte g0>, <byte g1>... <byte gN>
	PALETTE_B: 0x6, // PALETTE_B, <byte palette_index>, <byte length <= 250>, <byte b0>, <byte b1>... <byte bN>
	PALETTE_DEPTH: 0x7, // PALETTE_DEPTH, depth(<byte>, <byte>)
	PIXEL_INDEX: 0x8 // PIXEL_INDEX, <byte offset0>, <byte offset1>, <byte offset2>, <byte bitsPerIndex>, <byte length <= 247>, <byte index1> ... <byte index247>
}
