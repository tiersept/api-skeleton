export default require( 'knex' )( {

    client: 'mysql',
    connection: {

        host: 'localhost',

        user: 'api',
        password: 'api',

        database: 'hapi_cms',
        charset: 'utf8',

    }

} );
