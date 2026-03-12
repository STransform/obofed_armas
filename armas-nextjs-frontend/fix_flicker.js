const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('./src/app');

files.forEach(file => {
    const original = fs.readFileSync(file, 'utf8');
    const updated = original.replace(/if \(!isAuthenticated\) return <div[^>]*>Please log in[^<]*<\/div>;/g, 'if (!isAuthenticated) return null;');
    if (original !== updated) {
        fs.writeFileSync(file, updated, 'utf8');
        console.log('Fixed', file);
    }
});
