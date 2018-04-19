var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var movies = require('./movies');
var reviews = require('./reviews');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(passport.initialize());

var router = express.Router();

//////////////////////////////////////////////////////////////////////////////////////////////////////////
router.route('/reviews/:title')
    .get(authJwtController.isAuthenticated, function (req, res) {
        if(req.query.reviews === 'true') {
            var title = req.params.title;
            movies.aggregate([
                {
                    $match: {title: title}
                },
                {
                    $lookup:{
                        from: "reviews",
                        localField: "title",
                        foreignField: "movTitle",
                        as: 'Review'
                    }
                }
            ], function (err, result) {
                if(err) {res.send(err);}
                else res.send({movies: result});
            });
        }else {
            movies.findOne({title:req.params.title}, function(err, movies) {
                if (movies !== null) {
                    console.log(movies);
                    res.json(movies);
                }
                else
                {
                    res.json({message: "Error: Invalid Title"});
                }
            });
        }
    });

router.route('/POSTreviews')
    .post(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.movTitle || !req.body.reviewer || !req.body.quote || !req.body.rating) {
            res.json({success: false, msg: 'Pass the Review Information'});
        }

            else {
            var title= req.header.title;
            movies.findOne({title: req.body.movTitle}).select('title').exec(function (err, movies) {
                if (err) {return res.send(err);}

                if (movies) {
                    var newRev = new reviews(req.body);

                    newRev.save(function (err) {
                        if (err) {
                            return res.send(err);
                        }
                        res.json({message: 'Review is saved.'});

                    });
                }
                else {
                    res.json({success: false, message: 'Error: Movie Title Does Not Exists'});
                }
            })
        }

    });
//////////////////////////////////////////////////////////////////////////////////////////////////////
router.route('/movies')
    .get(authJwtController.isAuthenticated, function (req, res) {

            if (req.query.reviews === 'true') {

                movies.aggregate([
                    {
                        $lookup: {
                            from: "reviews",
                            localField: "title",
                            foreignField: "movTitle",
                            as: 'Review'
                        }
                    }
                ], function (err, result) {
                    if (err) {
                        res.send(err);
                    }
                    else res.send({movies: result});
                })
            }
            else {
                movies.find(function (err, movies) {
                    if (err)
                        res.send(err);

                    res.json({movies:movies});
                });
            }
        });
router.route('/SAVEmovies')
    .post(authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.title || !req.body.yearReleased || !req.body.genre || !req.body.actors && req.body.actors.length) {
            res.json({success: false, msg: 'Pass the Movie Information'});
        }
        else {
            if (req.body.actors.length < 3) {
                res.json({success: false, msg: "Please have at least 3 actors"});
            }

            else {
                var newMov = new movies(req, res);
                newMov.title = req.body.title;
                newMov.yearReleased = req.body.yearReleased;
                newMov.genre = req.body.genre;
                newMov.actors = req.body.actors;

                newMov.save(function (err, movies) {
                    if (err)
                        res.send(err);

                    res.json(movies);
                });
            }

        }
    });

router.route('/DELETEmovies/:title')
    .delete(authJwtController.isAuthenticated, function (req, res) {
        movies.findOne({title: req.params.title}, function (err, results) {
            if (results !== null) {
                movies.remove({title: req.params.title}).exec(function (err) {
                    res.json({message: "Movie Deleted"});
                });
            }
            else {
                res.json({message: "ERROR: Movie not found"});
            };
        })
    });


router.route('/UPDATEmovies/:title')
    .put(authJwtController.isAuthenticated, function (req, res) {
        movies.findOne({title: req.params.title}, function (err, results) {
            if (results !== null) {
                movies.update({title: req.params.title}, req.body).exec(function (err) {
                    res.json({message: "Movie Updated"});
                });
            }
            else {
                res.json({message: "ERROR: Movie not found"});
            }
        })
    });


router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function (err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);
            // return that user
            res.json(user);
        });
    });

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

router.post('/signup', function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function (err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }

            res.json({message: 'User created!'});
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({username: userNew.username}).select('name username password').exec(function (err, user) {
        if (err) res.send(err);
        var returnedUser = new User(user);
        returnedUser.comparePassword(userNew.password, function (isMatch) {
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
            }
        });


    });
});



app.use('/', router);
app.listen(process.env.PORT || 8080);
