#!/usr/bin/env node

/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2018, 2019
 */

// load command line params
const stdio = require('stdio');
const { httpTypeToString } = require('./utils');
const process=require('process');

const params = stdio.getopt({
  'service': {key: 's',  args:1, description: 'service-for path', default:'', type: 'string'},
  'path': {key: 'b', args:1,    description: 'base path uri', default:''},
  'dir': {key: 'd',  args:1, description: 'base dir', default: '../app'},
  'port': {key: 'p',  args:1, description: 'listening port'},
  'key': {key: 'k',  args:1,description: 'server key', default:'' },
  'cert': {key: 'c', args:1, description: 'server cert', default:''},
  'pfx': {key: 'x', args:1, description: 'server pfx', default:''},
  'pass': {key: 'w', args:1, description: 'server pfx passphrase', default:''},
  'csp': {key: 'f', args:1, description: 'csp whitelist ancestors frames', default:''},
  'keyring': {key: 'n', args:1, description: 'keyring name', default:''},
  'keyring-owner': {key: 'o', args:1, description: 'keyring owner id', default:''},
  'keyring-label': {key: 'l', args:1, description: 'keyring certificate label', default:''},
  'verbose': {key: 'v', default:false}
});
const serviceFor = params.service;

// load config
let config;
try {
  config = require('./config')(params);
  process.stdout.write(`[${serviceFor}] rootDir ${config.rootDir}\n`);
  process.stdout.write(`[${serviceFor}] version ${config.version}\n`);
  process.stdout.write(`[${serviceFor}] script name ${config.scriptName}\n`);
  process.stdout.write(`[${serviceFor}] paths ${JSON.stringify(config.paths)}\n`);
  process.stdout.write(`[${serviceFor}] port ${JSON.stringify(config.port)}\n`);
  process.stdout.write(`[${serviceFor}] https using ${httpTypeToString(config.https.type)}\n`);
} catch (err)  {
  process.stderr.write(`[${serviceFor}] failed to process config\n`);
  process.stderr.write(`[${serviceFor}] ${err}\n\n`);
  process.exit(1);
}


// start server
try {
  const staticFileHandler = require('./staticFileHandler')(config);
  // configure https server and start listening
  const httpsServer =require('./server')(config,staticFileHandler);
  httpsServer.listen(config.port, '0.0.0.0', () => { process.stdout.write(`[${config.serviceFor}] is started and listening on ${config.port}...\n\n`);});
  // trap SIGTERM
  process.stdout.write(`[${serviceFor}] trap SIGTERM signal\n`);
  process.on('SIGTERM', function () {
    process.stdout.write(`[${serviceFor}] SIGTERM received, shutting down server ...\n`);
    httpsServer.close();
    process.exit(0);
  });
  
} catch (err) {
  process.stderr.write(`[${config.serviceFor}] is failed to start, error:\n`);
  process.stderr.write(`[${config.serviceFor}] ${err}\n\n`);
  process.exit(1);
}
