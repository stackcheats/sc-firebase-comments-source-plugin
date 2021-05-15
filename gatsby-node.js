const firebase = require('firebase/app')
require('firebase/firestore')

exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest },
  pluginOptions
) => {
  const { createTypes, createNode } = actions
  const {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  } = pluginOptions

  const commentTypeDefinition = `
      type StackCheatsComments implements Node {
        _id: String
			  _parentId: String
        author: String
        slug: String
        content: String
        createdAt: Date
      }
    `

  createTypes(commentTypeDefinition)

  let config = {
    apiKey: apiKey,
    authDomain: authDomain,
    projectId: projectId,
    storageBucket: storageBucket,
    messagingSenderId: messagingSenderId,
    appId: appId,
    measurementId: measurementId,
  }

  firebase.default.initializeApp(config)

  const commentCollection = await firebase.default
    .firestore()
    .collection(`comments`)
    .get()

  function commentToNode(comment, { createContentDigest, createNode }) {
    const nodeMeta = {
      id: createNodeId(`comments-${comment._id}`),
      parent: null,
      children: [],
      internal: {
        type: `StackCheatsComments`,
        mediaType: `text/plain`,
        content: JSON.stringify(comment),
        contentDigest: createContentDigest(comment),
      },
    }

    const node = Object.assign({}, comment, nodeMeta)
    createNode(node)
  }

  commentCollection.forEach((comment) => {
    var c = comment.data()
    c._id = comment.id
    c.createdAt = comment.data()['createdAt'].toDate()
    commentToNode(c, { createNode, createContentDigest })
  })
}

exports.createResolvers = ({ createResolvers }) => {
  const resolver = {
    Mdx: {
      comments: {
        type: ['StackCheatsComments'],
        resolve(source, args, context, info) {
          return context.nodeModel.runQuery({
            query: {
              filter: {
                slug: { eq: source.fields.slug },
              },
            },
            type: 'StackCheatsComments',
            firstOnly: false,
          })
        },
      },
    },
  }

  createResolvers(resolver)
}
