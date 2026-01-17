const fs = require('fs');
const path = "c:/Users/Shreya Prasad/Desktop/Yogyata/frontend/src/context/Web3Context.js";
try {
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.split(/\r?\n/);
    console.log("Total lines:", lines.length);
    console.log("Line 5:", lines[4]);
    console.log("Line 372:", lines[371]);

    if (lines[4].trim().startsWith("const CONTRACT_ABI") && lines[371].trim().startsWith("const CONTRACT_ABI")) {
        console.log("Confirmed pattern. Slicing...");
        const part1 = lines.slice(0, 4); // Keep lines 1-4 (Index 0-3)
        const part2 = lines.slice(371);  // Keep lines 372+ (Index 371+)
        // Note: Index 371 is the line with the *second* declaration, so we keep it.

        const newContent = part1.concat(part2).join('\n');
        fs.writeFileSync(path, newContent, 'utf8');
        console.log("File fixed. New line count:", newContent.split('\n').length);
    } else {
        console.error("Pattern mismatch! Aborting to avoid damage.");
    }
} catch (e) {
    console.error("Error:", e);
}
