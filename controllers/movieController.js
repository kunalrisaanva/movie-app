const session = require("express-session");
const { Movie } = require("../models/allModel");
const mongoose = require("mongoose");
// Retrieve a list of movies.

const moviesList = async (req, res) => {
  try {
   
    const movies = await Movie.find(
      {},
      {
        rating: 0,
        reviews: 0,
        genres: 0,
      //   actors: 0,
      //   directors: 0,
      }
    );

    res.status(200).send({ status: "sucess", movies_name: movies });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

// Get details of a specific movie.

const speceficMovie = async (req, res) => {
  try {
    const id = req.params?.id || req.body;

    const movies = await Movie.findById({ _id: id })
      .populate({
        path: "rating",
        populate: {
          path: "userId",
          model: "User",
          select: "-password -token",
        },
      })
      .populate({
        path: "reviews",
        populate: {
          path: "userId",
          model: "User",
          select: "-password -token",
        },
      });

    res.status(200).send({ status: "sucess", movies: movies });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

// Get rated movies for a user

const rateMovie = async (req, res) => {
  try {
    const id = req.params?.id || req.body.rate;
    const rate = req.body.rate || req.params.rate;
    console.log(id, rate);
    const date = await Movie.updateOne(
      { _id: id }, // Match the document with _id = 1
      {
        $push: {
          rating: {
            userId: req.session.user_session?._id,
            rate: rate,
          },
        },
      }
    );

    res.status(200).send({ status: "sucess", movies: date });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

// Get movie reviews submitted by a user

const getReviews = async (req, res) => {
  try {
    const _id = req.body.id || req.params?.id;

    const movie = await Movie.findById({ _id }, { rating: 0 }).populate({
      path: "reviews",
      populate: {
        path: "userId",
        model: "User",
        select: "-password -token -createdAt -updatedAt -__v",
      },
    });

    res.status(200).send({ status: "sucess", reviews: movie });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

// Create a new review.

const createReview = async (req, res) => {
  try {
    const _id = req.params?.id;
    const { review } = req.body;
    const updatedDate = await Movie.updateOne(
      { _id: _id },
      {
        $push: {
          reviews: {
            userId: req.session?.user_session._id,
            review: review,
          },
        },
      }
    );

    res
      .status(200)
      .send({ msg: "you have created this review ", data: updatedDate });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

//  Get details of a specific review..

const specificReview = async (req, res) => {
  try {
    const _id = req.body.id || req.params.id;

    const aggregateData = await Movie.aggregate([
      {
        $unwind: "$reviews",
      },
      {
        $match: { "reviews._id": new mongoose.Types.ObjectId(_id) },
      },
      {
        $project: { rating: 0, genres: 0, actors: 0, directors: 0 },
      },
    ]);

    res
      .status(200)
      .send({ msg: "Here is the data you want  ", data: aggregateData });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

// Edit an existing review.

const editeExistReview = async (req, res) => {
  try {
    const review = req.body.review || req.body.params;
    const _id = req.params.id || req.body.id;

    const data = await Movie.updateOne(
      { reviews: { $elemMatch: { _id: _id } } },
      { $set: { "reviews.$[e].review": review } },
      { arrayFilters: [{ "e._id": { _id: _id } }] }
    );

    res.status(200).send({
      msg: "you have edie this review ",
      data: {
        msg: "your " + review + " review is updated",
      },
    });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

// Delete a review.

const deleteReview = async (req, res) => {
  try {
    const _id = req.body.id || req.params?.id;

    const deleteReview = await Movie.updateOne(
      { "reviews._id": _id }, // Replace with the document's _id you want to update
      {
        $pull: {
          reviews: { _id: _id },
        },
      }
    );

    res.status(200).send({ msg: ` review  deleted  ` });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

// search point

const searchMovie = async (req, res) => {
  try {
    const { title, genres } = req.query;

    const movie = await Movie.find(
      {
        $or: [{ title: title }, { genres: genres }],
      },
      {
        _id: 0,
        genres: 0,
        rating: 0,
        reviews: 0,
      }
    );

    res.status(200).send({ msg: "here is the movie", movieData: movie });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

// Get movie recommendations for a user based on their preferences.

const recomondationMovie = async (req, res) => {
  try {
    const { prefrence } = req.query;
    console.log(prefrence);

    const movieData = await Movie.find(
      { genres: prefrence },
      { _id: 0, rating: 0, reviews: 0 }
    );

    res.send({ msg: "here is the movies", data: movieData });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

// Miscellaneous Endpoints:

// funtion that remove same value in object ;

function removeDuplicateValues(obj) {
  const uniqueValues = {}; // Initialize an empty object to store unique values
  const newObj = {}; // Initialize a new object to store the result

  for (const key in obj) {
    const value = obj[key];

    // Check if the value is not already in the uniqueValues object
    if (!uniqueValues.hasOwnProperty(value)) {
      newObj[key] = value; // Add the unique value to the new object
      uniqueValues[value] = true; // Mark the value as seen in the uniqueValues object
    }
  }

  return newObj;
}

// Retrieve a list of available genres

const genres = async (req, res) => {
  try {
    const genresData = await Movie.find();
    const data = genresData.map((data, i) => {
      return data.genres;
    });

    const uniqueObject = removeDuplicateValues(data);

    res
      .send({ msg: "here is the availble genres ", data: uniqueObject })
      .status(200);
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

// Retrieve a list of actors.

const actors = async (req, res) => {
  try {
    const genresData = await Movie.find();
    const data = genresData.map((data, i) => {
      return data.actors;
    });
    const uniqueObject = removeDuplicateValues(data);
    res.send({ msg: "here is the availble actors ", data: uniqueObject });

    res.status(200);
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

//  Retrieve a list of directors.

const directors = async (req, res) => {
  try {
    const genresData = await Movie.find();
    const data = genresData.map((data, i) => {
      return data.directors;
    });

    const uniqueObject = removeDuplicateValues(data);

    res
      .send({ msg: "here is the availble directors ", data: uniqueObject })
      .status(200);
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

// to create movie

const createMovie = async (req, res) => {
  try {
    const data = req.body;

    const movieData = await Movie.create(data);

    res.send(movieData);
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

module.exports = {
  moviesList,
  speceficMovie,
  rateMovie,
  getReviews,
  createReview,
  specificReview,
  editeExistReview,
  deleteReview,
  searchMovie,
  recomondationMovie,
  genres,
  actors,
  directors,
  createMovie,
};
