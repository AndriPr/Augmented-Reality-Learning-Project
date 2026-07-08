const fs = require('fs'); const str = fs.readFileSync('public/assets/models/Buggy.glb').toString('utf8'); const match = str.match(/"name":"([^"]+)"/g); console.log([...new Set(match)]);
