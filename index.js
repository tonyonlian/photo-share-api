// 1. Require 'apollo-server'
const {ApolloServer} = require('apollo-server-express');
const express = require('express');
const expressPlayground = require('graphql-playground-middleware-express').default
const { readFileSync} = require('fs');
const typeDefs = readFileSync('./typeDefs.graphql','UTF-8');
const resolvers = require('./resolvers');
const { MongoClient } = require('mongodb');

async function start(){
    const app = express();
    const MOGO_DB = "mongodb://tunyl:1q2w3e@cluster0-shard-00-00-4n2ii.mongodb.net:27017,cluster0-shard-00-01-4n2ii.mongodb.net:27017,cluster0-shard-00-02-4n2ii.mongodb.net:27017/test?ssl=true&replicaSet=GettingStarted-shared-0&authSource=admin&retryWrites=truemongodb+srv://tunyl:1q2w3e@cluster0-4n2ii.mongodb.net/test?retryWrites=true&w=majority";//process.env.DB_HOST;
    const client = await MongoClient.connect(
        MOGO_DB,
        { useUnifiedTopology: true}
     );
     const db = client.db();
     const context = {db};

    // A data type to store our photos in memory
    let _id = 0;
    let users = [
        {"githubLogin": "mHattrup", "name": "Mike Hattrup"},
        {"githubLogin": "gPlake", "name": "Gen Plake"},
        {"githubLogin": "sSchmidt","name": "Scot Schmidt"}
    ]
    let photos = [
        {
            "id": "1",
            "name": "Dropping the Heart Chute",
            "description": "The heart chute is one of my favorite chutes",
            "category": "ACTION",
            "githubUser":"gPlake",
            "created": "3-28-1977"
        },{
            "id": "2",
            "name": "Enjoying the sunshine",
            "category": "SELFIE",
            "githubUser": "sSchmidt",
            "created": "1-2-1985"
        },
        {
            "id": "3",
            "name": "Gunbarrel 25",
            "description": "25 laps on gunbarrel today",
            "category": "LANDSCAPE",
            "githubUser": "sSchmidt",
            "created": "2018-04-15T19:09:57.308Z"
        }
    ];

    let tags = [
        {
            "photoID": "1", "userID": "gPlake"
        },{
            "photoID": "2", "userID": "sSchmidt"
        },{
            "photoID": "2", "userID": "mHattrup"
        },{
            "photoID": "2", "userID": "gPlake"
        }
    ];

    /*const resolvers = {
        Query: {
            totalPhotos: () => photos.length,
            allPhotos: () => photos
        },
        Mutation: {
            postPhoto(parent,args) {
                console.log(args);
                var newPhoto = {
                    id: _id++,
                    ... args.input,
                    created: new Date()
                }
                photos.push(newPhoto);
                return newPhoto;
            }
        },
        Photo: {
            url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
            postedBy: parent => {
                return users.find(u => u.githubLogin === parent.githubUser )
            },
            taggedUsers: parent => tags.filter(tag => tag.photoID === parent.id)
                                        .map(tag => tag.userID)
                                        .map(userID => users.find(u => u.githubLogin === userID))
        },
        User: {
            postedPhotos: parent => {
                return photos.filter( p => p.githubUser === parent.githubLogin)
            },
            inPhotos: parent => tags.filter(tag => tag.userID === parent.id)
                                    .map(tag => tag.photoID)
                                    .map(photoID => photos.find(p => p.id === photoID))
        },
        DateTime: new GraphQLScalarType({
            name: 'DateTime',
            description: 'A valid date time value.',
            parseValue: value => new Date(value),
            serialize: value => new Date(value).toISOString(),
            parseLiteral: ast => ast.value
        })

    };
    */
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context
    });

    server.applyMiddleware({app});
    app.get("/",(req,res) => res.send('Welcome to  the PhotoShare API'));
    app.get("/playground",expressPlayground({endpoint: '/graphql'}));

    app.listen({port: 4000},() =>{
        console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`)
    });

}

start();

//mongodb+srv://tunyl:<password>@cluster0-4n2ii.mongodb.net/test?retryWrites=true&w=majority