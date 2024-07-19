import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new ApiError(404, "Please enter tweet");
  }
  const tweetCreate = await Tweet.create({
    content,
    owner: req.user._id,
  });
  if (!tweetCreate) {
    throw new ApiError(401, "Something went wrong while creating tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweetCreate, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(404, "userId not found");
  }
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new ApiError(404, "User not find!");
  }
  const userTweets = await Tweet.findById({ owner: userId }).select("-owner");

  if (!userTweets) {
    throw new ApiError(401, "something went wrong while fetching tweets");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(401, "Invalid tweetId");
  }
  if (!content) {
    throw new ApiError(401, "Please enter tweet to update");
  }
  const tweetFind = await findById(tweetId);
  if (!tweetFind) {
    throw new ApiError(404, "Tweet doesn't exist");
  }
  if (!tweetFind.owner.toString() != req.user._id) {
    throw new ApiError(403, "Unauthorized Access");
  }
  const tweetUpdate = Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  ).select("-owner");
  if(!tweetUpdate)
  {
    throw new ApiError(501, "Something went wrong while updating tweet")
  }
  return res
  .status(200)
  .json(
    new ApiResponse(200, tweetUpdate, "Tweet updates successfully")
  )
});


const deleteTweet = asyncHandler(async (req, res) => {
  const {tweetId}= req.params
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(401, "Invalid tweetId");
  }
  const tweetFind = await findById(tweetId);
  if (!tweetFind) {
    throw new ApiError(404, "Tweet doesn't exist");
  }
  if (!tweetFind.owner.toString() != req.user._id) {
    throw new ApiError(403, "Unauthorized Access");
  }
  const tweetDelete= await Tweet.findByIdAndDelete({owner: tweetId})
  if(!tweetDelete)
  {
    throw new ApiError(401, "Something went wrong while delting tweet")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200, tweetDelete, "Tweet deleted succesfully")
  )

});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
