const Post = require('../models/post');

exports.createPost = (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename,
        creator: req.userData.userId
    });
    post.save()
        .then(createdPost => {
            res.status(201).json({
                message: 'Post added succesfully.',
                post: {
                    ...createdPost,
                    id: createdPost._id
                }
            });
        })
        .catch(error => {
            res.status(500).json({
                message: "Post failed to be created."
            });
        });    
};

exports.updatePostById = (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
        const url = req.protocol + '://' + req.get('host');
        imagePath = url + '/images/' + req.file.filename;
    };
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId
    });
    Post.updateOne({_id: req.params.id, creator: req.userData.userId}, post)
        .then(result => {
            console.log(result);
            if (result.matchedCount > 0) {
                res.status(200).json({
                    message: "Update was successful."
                });
            }
            else {
                res.status(401).json({
                    message: "User is not authorized."
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                message: "Post failed to be updated."
            });
        });
};

exports.getPostById = (req, res, next) => {
    Post.findById(req.params.id)
        .then( post => {
            if (post) {
                res.status(200).json(post);
            }
            else {
                res.status(404).json({message: "Post not found."});
            }
        })
        .catch(error => {
            res.status(500).json({
                message: "Post failed to be fetched."
            });
        });
};

exports.getPosts = (req, res, next) => {
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let fetchedPosts;
    if (pageSize && currentPage) {
        postQuery
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);
    }
    postQuery
        .then(documents => {
            fetchedPosts = documents;
            return Post.countDocuments();
        })
        .then(count => {
            console.log(fetchedPosts);
            res.status(200).json({
                message: 'Posts fetched successfully.',
                posts: fetchedPosts,
                totalCount: count
            });
        })
        .catch(error => {
            res.status(500).json({
                message: "Posts failed to be fetched."
            });
        });
};

exports.deletePostById = (req, res, next) => {
    Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
        .then(result => {
            console.log(result);
            if (result.deletedCount > 0) {
                res.status(200).json({
                    message: "Delete was successful."
                });
            }
            else {
                res.status(401).json({
                    message: "User is not authorized."
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                message: "Post failed to be deleted."
            });
        });
};