import CodepageEncoder from 'codepage-encoder';

const codepages = {
    'cp437': 0x00,
    'shiftjis': 0x01,
    'cp850': 0x02,
    'cp860': 0x03,
    'cp863': 0x04,
    'cp865': 0x05,
    'cp858': 0x13,
    'windows1257': 0x1a,     
};

const codepageCandidates = [
    'cp437', 'cp858', 'cp860', 'cp863', 'cp865', 
    'cp850', 'windows1257'
];

class LanguageDigipos {

    initialize() {
        return new Uint8Array([
            0x1b, 0x40,         // Initialize   
            0x1b, 0x3d, 0x01,   // Display printer, enable display
            0x1f, 0x03,         // Horizontal scroll mode
            0x1f, 0x43, 0x00,   // Turn cursor off
        ]);
    }

    clear() {
        return new Uint8Array([
            0x0c,               // Clear display
        ]);
    }

    encode(value) {
        const fragments = CodepageEncoder.autoEncode(value, codepageCandidates);

        let length = 0;
        for (let f = 0; f < fragments.length; f++) {
            length += 3 + fragments[f].bytes.byteLength;
        }
    
        const buffer = new Uint8Array(length);
        let i = 0;
        
        for (let f = 0; f < fragments.length; f++) {
            buffer.set([0x1b, 0x74, codepages[fragments[f].codepage]], i);
            buffer.set(fragments[f].bytes, i + 3);
            i += 3 + fragments[f].bytes.byteLength;
        }
    
        return buffer;
    }
}

export default LanguageDigipos;