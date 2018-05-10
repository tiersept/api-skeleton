import Knex from './knex';
import jwt from 'jsonwebtoken';
import GUID from 'node-uuid';
import * as R from 'ramda';

const routes = [


    {
        path: '/users/',
        method: 'GET',
        handler: async (request, reply ) => {

          try {
            console.log('/USERS handler ')

            const query = Knex('users')
              .select('name', 'email');

            const results = await query;

            if (!R.isNil(results)) {
              //transform?
              reply(results)

            } else {
                return reply([]);
            }
          } catch(error) {
            console.error("/users-error: ", error)
          }

        }
    },

    {
        path: '/users/',
        method: 'POST',
        handler: async (request, reply ) => {
          try {
            const formFields = request.payload;

            //schema welke valideerd of velden aanwezig en valide zijn
             let schema = {
               name: false,
               username: false,
               password: false,
               email: false
             }

             //pluk alle 'keys' uit de schema object, type: array
             const requiredFields = Object.keys(schema); //name, username, password, etc

             for (let field of requiredFields) {
               //zit het vereiste veld in de payload en is t niet null/leeg?
               if (formFields.hasOwnProperty(field) && !R.isNil(formFields[field])) {
                 schema[field] = true;

                 console.log('field: ', field, schema[field])
               }
             }

             console.log('requiredFields: ', requiredFields)

             //true of false als alle velden true terugggeven als field.key is true
             //array.prototype functie = mdn Array.prototype
            let isValidUser = requiredFields.every((field) => {return schema[field] === true})

            console.error('isValid:', isValidUser)


            if (isValidUser === true) {
              //als de vereiste velden aanwezig en valide zijn
              let insertFields = R.clone(formFields);
              insertFields.guid = GUID.v4();

              //insert en return mij het nieuw euser record
              const insertObject = Knex('users')
                .insert(R.pick(['name', 'username', 'password', 'email', 'guid'], insertFields))
                .returning('*');

              //reply nieuwe object min het passwordt;
              return reply(R.omit(['password'], insertObject))

            } else {
              return reply()
              //error, niet alle velden zijn meegegeven =>  Build error response
            }
          } catch(error) {
            console.error('NERD= > :', error)
          }
        }
    },


    {

        path: '/birds/',
        method: 'GET',
        handler: ( request, reply ) => {
            const getOperation = Knex( 'birds' ).where( {

                isPublic: true

            } ).select( 'name', 'species', 'picture_url' )
            .then( ( results ) => {

                if( !results || results.length === 0 ) {

                    reply( {

                        error: true,
                        errMessage: 'no public bird found',

                    } );

                }

                reply( {

                    dataCount: results.length,
                    data: results,

                } );

            } ).catch( ( err ) => {

                reply( 'server-side error' );

            } );
        }

    },

    {

        path: '/auth',
        method: 'POST',
        handler: ( request, reply ) => {

            const { username, password } = request.payload;

            const query = Knex( 'users' ).where( {

                username,

            } ).select( 'password', 'guid' ).then( ( [ user ] ) => {

                if( !user ) {

                    reply( {

                        error: true,
                        errMessage: 'the specified user was not found',

                    } );

                    return;

                }

                if( user.password === password ) {

                    const token = jwt.sign( {

                        username,
                        scope: user.guid,

                    }, 'vZiYpmTzqXMp8PpYXKwqc9ShQ1UhyAfy', {

                        algorithm: 'HS256',
                        expiresIn: '1h',

                    } );

                    reply( {

                        token,
                        scope: user.guid,

                    } );

                } else {

                    reply( 'incorrect password' );

                }

            } ).catch( ( err ) => {
              console.error('error-auth: ', err)
                reply( 'server-side error' );

            } );

        }

    },

    {

        path: '/birds',
        method: 'POST',
        config: {

            auth: {

                strategy: 'token',

            }

        },
        handler: ( request, reply ) => {

            const { bird } = request.payload;

            const guid = GUID.v4();

            const insertOperation = Knex( 'birds' ).insert( {

                owner: request.auth.credentials.scope,
                name: bird.name,
                species: bird.species,
                picture_url: bird.picture_url,
                guid,

            } ).then( ( res ) => {

                reply( {

                    data: guid,
                    message: 'successfully created bird'

                } );

            } ).catch( ( err ) => {

                reply( 'server-side error' );

            } );

        }

    },

    {

        path: '/birds/{birdGuid}',
        method: 'PUT',
        config: {

            auth: {

                strategy: 'token',

            },

            pre: [

                {

                    method: ( request, reply ) => {

                        const { birdGuid } = request.params
                            , { scope }    = request.auth.credentials;

                        const getOperation = Knex( 'birds' ).where( {

                            guid: birdGuid,

                        } ).select( 'owner' ).then( ( [ result ] ) => {

                            if( !result ) {

                                reply( {

                                    error: true,
                                    errMessage: `the bird with id ${ birdGuid } was not found`

                                } ).takeover();

                            }

                            if( result.owner !== scope ) {

                                reply( {

                                    error: true,
                                    errMessage: `the bird with id ${ birdGuid } is not in the current scope`

                                } ).takeover();

                            }

                            return reply.continue();

                        } );

                    }

                }

            ],

        },
        handler: ( request, reply ) => {

            const { birdGuid } = request.params
                , { bird }     = request.payload;

            const insertOperation = Knex( 'birds' ).where( {

                guid: birdGuid,

            } ).update( {

                name: bird.name,
                species: bird.species,
                picture_url: bird.picture_url,
                isPublic: bird.isPublic,

            } ).then( ( res ) => {

                reply( {

                    message: 'successfully updated bird'

                } );

            } ).catch( ( err ) => {

                reply( 'server-side error' );

            } );

        }

    }

];

export default routes;
