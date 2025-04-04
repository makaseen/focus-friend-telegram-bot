
const { spawn } = require('child_process');
const path = require('path');

console.log('Restarting server...');

// First build the project
require('./build');

// Then start the server
require('./start');
