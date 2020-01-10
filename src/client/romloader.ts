const zip = require('zip');
const Graphics = require('./graphics');
const Sound = require('./sound');
const Emulator = require('./emulator');

zip.workerScriptsPath = "/lib/";
zip.useWebWorkers = false;

export function loadRoms(rompack: Blob): void {
  zip.createReader(new zip.BlobReader(rompack), function(reader) {
    reader.getEntries((entries) => {

      entries.forEach((entry) => {
        // TODO DEBUG
        console.log(entry.filename, '0x' + entry.crc32.toString(16), entry.uncompressedSize);
      });

      const palettesLoadedPromise = new Promise((resolve, reject) => {
        entries.forEach((entry) => {
          if (entry.filename.endsWith('82s126.4a') && entry.uncompressedSize == 256) {
            entry.getData(new zip.BlobWriter(), function(blob) {
              blob.arrayBuffer().then( (buffer) => {
                Graphics.loadPalettes(new Uint8Array(buffer));
                resolve();
              });
            });
          }
        });
      });

      palettesLoadedPromise.then(() => {
        entries.forEach((entry) => {

          if (entry.filename.endsWith('1m') && entry.uncompressedSize == 256) {
            entry.getData(new zip.BlobWriter(), function(blob) {
              blob.arrayBuffer().then( (buffer) => {
                Sound.loadSamples(new Uint8Array(buffer), 0);
              });
            });
          }

          if (entry.filename.endsWith('3m') && entry.uncompressedSize == 256) {
            entry.getData(new zip.BlobWriter(), function(blob) {
              blob.arrayBuffer().then( (buffer) => {
                Sound.loadSamples(new Uint8Array(buffer), 8);
              });
            });
          }

          if (entry.filename.endsWith('5e') && entry.uncompressedSize == 4096) {
            entry.getData(new zip.BlobWriter(), function(blob) {
              blob.arrayBuffer().then( (buffer) => {
                Graphics.loadTiles(new Uint8Array(buffer));
              });
            });
          }

          if (entry.filename.endsWith('5f') && entry.uncompressedSize == 4096) {
            entry.getData(new zip.BlobWriter(), function(blob) {
              blob.arrayBuffer().then( (buffer) => {
                Graphics.loadSprites(new Uint8Array(buffer));
              });
            });
          }

          if (entry.filename.endsWith('6e') && entry.uncompressedSize == 4096) {
            entry.getData(new zip.BlobWriter(), function(blob) {
              blob.arrayBuffer().then( (buffer) => {
                Emulator.copyRom(0x0000, new Uint8Array(buffer));
              });
            });
          }

          if (entry.filename.endsWith('6f') && entry.uncompressedSize == 4096) {
            entry.getData(new zip.BlobWriter(), function(blob) {
              blob.arrayBuffer().then( (buffer) => {
                Emulator.copyRom(0x1000, new Uint8Array(buffer));
              });
            });
          }

          if (entry.filename.endsWith('6h') && entry.uncompressedSize == 4096) {
            entry.getData(new zip.BlobWriter(), function(blob) {
              blob.arrayBuffer().then( (buffer) => {
                Emulator.copyRom(0x2000, new Uint8Array(buffer));
              });
            });
          }

          if (entry.filename.endsWith('.6j') && entry.uncompressedSize == 4096) {
            entry.getData(new zip.BlobWriter(), function(blob) {
              blob.arrayBuffer().then( (buffer) => {
                Emulator.copyRom(0x3000, new Uint8Array(buffer));
              });
            });
          }

        });
      });
    });
  });
}

