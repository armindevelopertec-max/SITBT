#!/usr/bin/env node
/**
 * Sube a MinIO todos los archivos de una carpeta local, recreando su ruta
 * como clave del bucket. Sirve para restaurar la exportación legible.
 *
 * Uso: node restaurar_minio.js <carpeta_origen>
 */
const fs = require('fs');
const path = require('path');

const Minio = require(path.join(__dirname, '..', 'backend', 'node_modules', 'minio'));

const origen = process.argv[2];
if (!origen) {
  console.error('Uso: node restaurar_minio.js <carpeta_origen>');
  process.exit(1);
}

const cliente = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: Number(process.env.MINIO_PORT || 9010),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
});

const bucket = process.env.MINIO_BUCKET || 'sitbt-files';

function listarArchivos(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? listarArchivos(p) : [p];
  });
}

(async () => {
  const archivos = listarArchivos(origen);
  for (const archivo of archivos) {
    const clave = path.relative(origen, archivo).split(path.sep).join('/');
    await cliente.fPutObject(bucket, clave, archivo);
    console.log(`  ✓ ${clave}`);
  }
  console.log(`Restaurados ${archivos.length} archivos en el bucket "${bucket}".`);
})().catch((e) => {
  console.error('Error restaurando MinIO:', e.message);
  process.exit(1);
});
