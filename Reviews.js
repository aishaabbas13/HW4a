var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// user schema

/*
var reviewerSchema = Schema({
    ReviewerName: {type:String,required: true},
    smallQuote: {type: String, required: true},
    rating:Number
});
*/
var reviewSchema = Schema({
    MovieTitle:{type: String, required: true},
    ReviewerName: {type:String,required: true},
    smallQuote: {type: String, required: true},
    rating:{type:Number, max:5, min:1, required: true}
});


reviewSchema.pre('save',function (next) {
    if(this.length == 0){
        return next(new Error('There must be one reviewer'));
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
module.exports = mongoose.model('Review', reviewSchema);