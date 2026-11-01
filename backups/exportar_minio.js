#!/usr/bin/env node
/**
 * Exporta todos los objetos del bucket de MinIO a una carpeta local,
 * conservando la ruta original de cada archivo (logos/..., documentos/...).
 *
 * Uso: node exportar_minio.js <carpeta_destino>
 * Variables opcionales: MINIO_ENDPOINT, MINIO_PORT, MINIO_ACCESS_KEY,
 *                       MINIO_SECRET_KEY, MINIO_BUCKET
 */
const fs = require('fs');
const path = require('path');

const Minio = require(path.join(__dirname, '..', 'backend', 'node_modules', 'minio'));

const destino = process.argv[2];
if (!destino) {
  console.error('Uso: node exportar_minio.js <carpeta_destino>');
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

(async () => {
  const objetos = [];
  const stream = cliente.listObjectsV2(bucket, '', true);
  for await (const obj of stream) {
    if (obj.name.endsWith('/')) continue;
    objetos.push(obj);
  }

  let total = 0;
  for (const obj of objetos) {
    const archivo = path.join(destino, obj.name);
    fs.mkdirSync(path.dirname(archivo), { recursive: true });
    await new Promise((resolve, reject) => {
      cliente.getObject(bucket, obj.name, (err, dataStream) => {
        if (err) return reject(err);
        const salida = fs.createWriteStream(archivo);
        dataStream.pipe(salida);
        salida.on('finish', resolve);
        salida.on('error', reject);
        dataStream.on('error', reject);
      });
    });
    total += obj.size;
    console.log(`  ✓ ${obj.name} (${(obj.size / 1024).toFixed(1)} KB)`);
  }

  console.log(`Exportados ${objetos.length} objetos (${(total / 1048576).toFixed(2)} MB) a ${destino}`);
})().catch((e) => {
  console.error('Error exportando MinIO:', e.message);
  process.exit(1);
});
