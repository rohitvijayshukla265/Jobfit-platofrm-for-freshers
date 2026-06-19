const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Change provider
schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "mongodb"');

// Change primary keys
schema = schema.replace(/@id\s+@default\(cuid\(\)\)/g, '@id @default(auto()) @map("_id") @db.ObjectId');

// Change relation foreign keys (any field ending in Id that is String, should have @db.ObjectId)
schema = schema.replace(/^(\s+\w+Id\s+String\??)(?!\s*@id)(.*)$/gm, '$1 @db.ObjectId$2');
schema = schema.replace(/^(\s+parentId\s+String\??)(?!\s*@id)(.*)$/gm, '$1 @db.ObjectId$2');

// Fix unique indexes with @@unique syntax that might need relation scalars for MongoDB
// Wait, MongoDB supports @@unique([userId, courseId]) normally in Prisma as long as both are mapped.

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema updated for MongoDB');
