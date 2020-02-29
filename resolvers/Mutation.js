
const { authorizeWithGithub } = require('../lib')
const fetch = require('node-fetch')
const { ObjectID } = require('mongodb')

module.exports = {
      async postPhoto(parent,args,{db,currentUser,pubsub}) {
            if(!currentUser){
                throw new Error("only an authorized user can post a photo");
            }

            
            const newPhoto = {
                ... args.input,
                userID: currentUser.githubLogin,
                created: new Date()
            }
            const {insertedIds} = await db.collection('photos').insert(newPhoto);
            newPhoto.id = insertedIds[0];
            pubsub.publish('photo-added',{newPhoto});
            return newPhoto;
        },

        async githubAuth(parent,{code},{db}) {
            let {
                message,
                access_token,
                avatar_url,
                login,
                name
            } = await authorizeWithGithub({
                client_id: 'eff92653014bd9fbdfd7',
                client_secret: '2e6c904c1c1e23aa66cea10c63df56960006cc1a',
                code
            });
            console.log(message);
            if(message){
                throw new Error(message);
            }

            let latestUserInfo = {
                name,
                githubLogin: login,
                githubToken: access_token,
                avatar: avatar_url
            }

            const {ops:[user]} = await db
                .collection('users')
                .replaceOne({githubLogin: login},latestUserInfo,{upsert: true});
            return {user,token: access_token};
        },

        async addFakeUsers(root,{count},{db,pubsub}){
            var randomUserApi = `https://randomuser.me/api/?results=${count}`;
            var { results } = await fetch(randomUserApi)
                .then(res => res.json());
            var users = results.map(r =>({
                githubLogin: r.login.username,
                name: `${r.name.first} ${r.name.last}`,
                avatar: r.picture.thumbnail,
                githubToke: r.login.sha1
            }));
            await db.collection('users').insertMany(users);
            var newUsers = await db.collection('users').find().sort({_id:-1}).limit(count).toArray();
            console.log(newUsers);
            newUsers.forEach(newUser=>{
               pubsub.publish('user-added',{newUser});
            });
         //   newUsers.forEach(newUser => pubsub.publish('user-added', {newUser}));
            return users;
          
        },

        async fakeUserAuth(parent,{githubLogin},{db}){
            var user  =  await db.collection('users').findOne({githubLogin});
            if(!user){
                throw new Error(`Cannot find user with githubLogin "${githubLogin}"`);
            }
            return {
                token: user.githubToken,
                user
            }
        }
}