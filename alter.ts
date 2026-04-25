import Database from 'better-sqlite3';
const db = new Database('database.sqlite');
try { db.exec('ALTER TABLE prospects ADD COLUMN email TEXT'); } catch(e){}
try { db.exec('ALTER TABLE prospects ADD COLUMN companyName TEXT'); } catch(e){}
try { db.exec('ALTER TABLE prospects ADD COLUMN businessType TEXT'); } catch(e){}
try { db.exec('ALTER TABLE prospects ADD COLUMN businessDetails TEXT'); } catch(e){}
try { db.exec('ALTER TABLE prospects ADD COLUMN targetAudience TEXT'); } catch(e){}
try { db.exec('ALTER TABLE prospects ADD COLUMN nextFollowUp TEXT'); } catch(e){}
console.log('done');
