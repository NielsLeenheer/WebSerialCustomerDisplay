import CodepageEncoder from 'codepage-encoder';

const codepages = {
    'cp437': 0x00,
    'shiftjis': 0x01,
    'cp850': 0x02,
    'cp860': 0x03,
    'cp863': 0x04,
    'cp865': 0x05,
    'windows1250': 0x0e,
    'windows1251': 0x0f,
    'windows1252': 0x10,
    'cp866': 0x11,
    'cp852': 0x12,
    'cp858': 0x13,
    'cp862': 0x15,
    'windows1254': 0x19,
    'windows1257': 0x1a,
    'cp864': 0x1b,
    'cp775': 0x1c,
    'cp737': 0x1d,
    'windows1253': 0x1e,
    'cp857': 0x1f,
    'windows1255': 0x21,
    'cp855': 0x24,
    'windows1256': 0x28,
    'windows1258': 0x29,        
};

const codepageCandidates = [
    'cp437', 'cp858', 'cp860', 'cp863', 'cp865',
    'cp852', 'cp857', 'cp855', 'cp866',
];

class LanguageBixolon {

    initialize() {
        return new Uint8Array([
            0x1b, 0x40,         // Initialize   
            0x1b, 0x3d, 0x02,   // Display printer, enable display
            0x1b, 0x13,         // Horizontal scroll mode
            0x1b, 0x5f, 0x00,   // Turn cursor off
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

export default LanguageBixolon;