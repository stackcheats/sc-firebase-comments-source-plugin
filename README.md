# Firebase Comments

A Gatsby source plugin to retrieve comments from Firebase
for StackCheats. Please find the plugin configurations and docs below.

[:construction: Plugin Under Development]

## Configure

Add the following plugin configuration in `gatsby-config.js` to activate the plugin

```js
{
    resolve: `stackcheats-source-firebase-comments`,
    options: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
}
```

To communicate with Firebase, the following configurations are required

```sh
apiKey              API Key to communicate with the Firebase
authDomain          Firebase authentication domain
projectId           Firebase project ID
storageBucket       Firebase storage bucket that has been configured
messagingSenderId   Firebase messaging sender ID
appId               Firebase application ID
measurementId       Firebase measurement ID
```

## Firebase Collection

The collection (should be) is created and named as `comments` with the following document structure

```json
{
    "_parentId": null,
    "author": string,
    "slug": string,
    "content": string,
    "createdAt": timestamp
}
```

## Usage

Following GraphQL can be used to retrieve the comments

```graphql
allStackCheatsComments(filter: { slug: { eq: $slug } }) {
    edges {
        node {
            _id
            _parentId
            author
            content
            createdAt
        }
    }
}
```

## License

[MIT](LICENSE)
