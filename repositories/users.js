const fs = require('fs');
const crypto = require('crypto');
const util = require('util');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository {
    constructor(filename) {
        if (!filename) {
            throw new Error('Creating a repository requires a filename');
        }
        
        this.filename = filename;
        try {
            fs.accessSync(this.filename);
        } catch {
            fs.writeFileSync(this.filename, '[]');
        }
    }

    async getAll() {
        const content = JSON.parse(await fs.promises.readFile(this.filename, { encoding: 'utf8' }));
        return content;
    }

    async create(attrs) {
        attrs.id = this.randomId();
        
        const salt = crypto.randomBytes(8).toString('hex');
        const hashed = await scrypt(attrs.password, salt, 64);

        const records = await this.getAll();
        const record = {
            ...attrs,
            password: `${hashed.toString('hex')}.${salt}`
        }
        records.push(record);

        await this.writeAll(records);
        return record;

    }

    async comparePasswords(saved, supplied) {
        // Saved is in db (hash.salt), supplied from the form
        const [hashed, salt] = saved.split('.');
        const hashedSupplied = await scrypt(supplied, salt, 64);

        return hashed === hashedSupplied.toString('hex');
    }

    async writeAll(records) {
        await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 4));
    }

    async getOne(id) {
        const records = await this.getAll();
        return records.find(record => record.id === id);
    }

    async delete(id) {
        const records = await this.getAll();
        const filteredRecords = records.filter(record => record.id !== id);
        await this.writeAll(filteredRecords);
    }

    async update(id, attrs) {
        const records = await this.getAll();
        const record = records.find(record => record.id === id);
        if (!record) {
            throw new Error('Record not found');
        }
        Object.assign(record, attrs);
        // EQUALS
        // for (let attr in attrs) {
        //     record[attr] = attrs[attr];
        // }
        await this.writeAll(records);
    }

    async getOneBy(filters) {
        const records = await this.getAll();

        for (let record of records) {
            let found = true;

            for (let key in filters) {
                if (record[key] !== filters[key]) {
                    found = false;
                }
            }

            if (found) {
                return record;
            }
        }
    }

    randomId() {
        return crypto.randomBytes(4).toString('hex');
    }
}

module.exports = new UsersRepository('users.json');