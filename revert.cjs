const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

schema = schema.replace(/provider = "mongodb"/, 'provider = "postgresql"');
schema = schema.replace(/@id @default\(auto\(\)\) @map\("_id"\) @db\.ObjectId/g, '@id @default(cuid())');
schema = schema.replace(/ @db\.ObjectId/g, '');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Reverted to PostgreSQL');
