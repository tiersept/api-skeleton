module.exports = {

    development: {

        migrations: { tableName: 'knex_migrations' },
        seeds: { tableName: './seeds' },

        client: 'mysql',
        connection: {

            host: 'localhost',

            user: 'api',
            password: 'api',

            database: 'hapi_cms',
            charset: 'utf8',

        }

    }

};
