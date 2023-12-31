const mongoose = require("mongoose");


const movieSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    lowercase: true,
    uniqe: true
  },
  
  rating: [  {

    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(), 
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    rate: {
      type: String
    }

  } ],

  reviews: [{
   
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(), 
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    review: {
      type: String
    }
  },
  ],

  genres: {
    type: String,
    required: true,
  },

  actors: {
    type: String,
    required: true,
  },

  directors: {
    type: String,
    required: true,
  },
});



module.exports = new mongoose.model("Movie", movieSchema);

