/* global db, ObjectId */
// Demo accounts, inserted by the MongoDB image on the first start of user-db
// (empty volume only). Every password is "password123".

const PASSWORD_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$wATX3DnfX/VluZ3fqzvsWg==$EOhXeED3y4NQ1ltDU+H2mV5wgmmK+khCc0lhEMCnJy8=';
const now = new Date();

// Same ids as the ownerId of the recipe-db fixtures
db.getSiblingDB('users').users.insertMany([
  {
    _id: ObjectId('665f00000000000000000001'),
    createdAt: now,
    email: 'alice@example.com',
    name: 'Alice',
    passwordHash: PASSWORD_HASH,
    updatedAt: now,
  },
  {
    _id: ObjectId('665f00000000000000000002'),
    createdAt: now,
    email: 'bob@example.com',
    name: 'Bob',
    passwordHash: PASSWORD_HASH,
    updatedAt: now,
  },
  {
    _id: ObjectId('665f00000000000000000003'),
    createdAt: now,
    email: 'chloe@example.com',
    name: 'Chloé',
    passwordHash: PASSWORD_HASH,
    updatedAt: now,
  },
]);
