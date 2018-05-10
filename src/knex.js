export default require( 'knex' )( {

    client: 'mysql',
    connection: {

        host: 'localhost',

        user: 'api',
        password: 'api',

        database: 'hapi-api',
        charset: 'utf8',

    }

} );
