const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Change provider
schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');

// Change String[] to String
schema = schema.replace(/String\[\]/g, 'String');

// Find all enum names
const enumRegex = /enum\s+(\w+)\s+\{[\s\S]*?\}/g;
let match;
const enums = [];
while ((match = enumRegex.exec(schema)) !== null) {
  enums.push(match[1]);
}

// Remove enum blocks
schema = schema.replace(enumRegex, '');

// Replace enum field types with String
enums.forEach(e => {
  const regex = new RegExp(`\\b${e}\\b`, 'g');
  schema = schema.replace(regex, 'String');
});

// Since enums are now strings, defaults like @default(STUDENT) need to be @default("STUDENT")
// We can use a regex to wrap the default values of enums
schema = schema.replace(/@default\((STUDENT|PREMIUM_STUDENT|ADMIN|IN_PROGRESS|COMPLETED|SUBMITTED|TIMED_OUT|NEW|LEARNING|MASTERED|PENDING|SUCCESS|FAILED|WISHLIST|APPLIED|ONLINE_TEST|INTERVIEW|OFFER|REJECTED|WITHDRAWN|MONTHLY|SIX_MONTHS)\)/g, '@default("$1")');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Reverted to SQLite');
