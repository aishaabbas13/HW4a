var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// user schema

var actorSchema = Schema({
    actorName: {type:String,required: true},
    characterName: {type:String,required:true}
});

var movieSchema = Schema({
    Title:{type: String, required: true, index: { unique: true }},
    releaseYear: {type: Number, required: true},
    Genre:{
        type: String,
        enum: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
            'Horror', 'Mystery', 'Thriller', 'Western']
    },
    Actors: {type:[actorSchema]}
});

movieSchema.pre('save',function (next) {
    if(this.Actors.length < 3){
        return next(new Error('Fewer than 3 Actors'));
    }
    next()
});
/*
movieSchema.methods.remove = function(password, callback) {
    Movie.findOne({Title: title}).exec(function(err, result){ //Make sure movie exists before deleting
            if (result !== null) {
                Movie.remove({Title: title}).exec(function (err, numFound) {
                    if (numFound.result.n === 0) callback({msg: "Could not find movie with title '" + title + "'"});
                    else callback({msg: "Movie deleted."});
                })
            }
});
}
*/
/*
findAllMovies: function (callback) {
    Movie.find().exec(function (err, Movies) {
        if (Movies === null) callback({msg: "Could not find movies"});
        else callback(Movies);
    });
},
findOneMovie: function (title, callback) {
    Movie.findOne({Title:title}).exec(function (err, Movies) {
        if (Movies === null) {
            callback({msg: "Could not find movie with title '"+title+"'"})
        } else {
            callback(Movies);
        }
    });
}
*/
// return the model
module.exports = mongoose.model('Movie', movieSchema);