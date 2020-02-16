
const { authorizeWithGithub } = require('../lib')
const fetch = require('node-fetch')
const { ObjectID } = require('mongodb')

module.exports = {
      async postPhoto(parent,args) {
            console.log(args);
            var newPhoto = {
                id: _id++,
                ... args.input,
                created: new Date()
            }
            photos.push(newPhoto);
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
        }
}