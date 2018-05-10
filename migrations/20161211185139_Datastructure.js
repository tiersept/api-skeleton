exports.up = function(knex, Promise) {

    return knex
            .schema
            .createTable( 'users', function( table ) {

                // Primary Key
                table.increments();

                // Data
                table
                    .string( 'name', 50 )
                    .notNullable();

                table
                    .string( 'username', 50 )
                    .notNullable()
                    .unique();

                table
                    .string( 'email', 250 )
                    .notNullable().unique();

                table
                    .string( 'password', 128 )
                    .notNullable();

                table.string( 'guid', 50 )
                    .notNullable()
                    .unique();

                table.timestamp( 'created_at' )
                    .notNullable();

            } )

};

exports.down = function(knex, Promise) {

    return knex
        .schema
            .dropTableIfExists( 'users' );

};
