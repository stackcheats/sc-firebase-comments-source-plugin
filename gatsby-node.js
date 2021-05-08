const fs = require('fs');
const path = require('path');

// exports.onPreInit = () => console.log('Loaded gatsby-plugin-firebase-comment');

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest, pluginOptions }) => {
	const { createTypes, createNode } = actions;
	// const { name } = pluginOptions;

	const commentTypeDefinition = `
        type StackCheatsComments implements Node {
            _id: String
            author: String
            slug: String
            content: String
            createdAt: Date
            updatedAt: Date
        }
    `;

	createTypes(commentTypeDefinition);

	// TODO: load the comments from the Firebase
	const results = [
		{
			_id: '01',
			author: 'Athiththan',
			content: 'Comments are working as expected',
			slug: '/wso2-api-manager-oauth2-protected-endpoint/content/',
			createdAt: '02-04-2020',
			updatedAt: '02-04-2020',
		},
		{
			_id: '02',
			author: 'Athiththan',
			content: 'Another set of Comments are working as expected',
			slug: '/subscribe-apis-using-store-rest-apis/content/',
			createdAt: '02-04-2020',
			updatedAt: '02-04-2020',
		},
	];

	function commentToNode(comment, { createContentDigest, createNode }) {
		const nodeMeta = {
			id: createNodeId(`comments-${comment._id}`),
			parent: null,
			children: [],
			internal: {
				type: `StackCheatsComments`,
				mediaType: `text/html`,
				content: JSON.stringify(comment),
				contentDigest: createContentDigest(comment),
			},
		};

		const node = Object.assign({}, comment, nodeMeta);
		createNode(node);
	}

	results.forEach((comment) => {
		commentToNode(comment, { createNode, createContentDigest });
	});
};

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
					});
				},
			},
		},
	};

	createResolvers(resolver);
};

exports.createPagesStatefully = async ({ graphql }) => {
	const comments = await graphql(
		`
			{
				allStackCheatsComments(limit: 1000) {
					edges {
						node {
							_id
							author
							slug
							content
							createdAt
						}
					}
				}
			}
		`
	);

	if (comments.errors) {
		throw comments.errors;
	}

	const markdownPosts = await graphql(
		`
			{
				allMdx(sort: { fields: [frontmatter___date], order: DESC }, limit: 1000) {
					edges {
						node {
							fields {
								slug
							}
						}
					}
				}
			}
		`
	);

	const posts = markdownPosts.data.allMdx.edges;
	const _comments = comments.data.allStackCheatsComments.edges;

	const commentsPublicPath = path.resolve(process.cwd(), 'public/comments');

	var exists = fs.existsSync(commentsPublicPath);
	if (!exists) {
		fs.mkdirSync(commentsPublicPath);
	}

	posts.forEach((post) => {
		const contentPath = post.node.fields.slug;
		const commentsForPost = _comments
			.filter((comment) => {
				return comment.node.slug === contentPath;
			})
			.map((comment) => comment.node);

		const strippedPath = contentPath
			.split('/')
			.filter((s) => s)
			.join('_');

		const _commentPath = path.resolve(process.cwd(), 'public/comments/', `${strippedPath}.json`);
		fs.writeFileSync(_commentPath, JSON.stringify(commentsForPost));
	});
};
