import mongoose, { isValidObjectId } from "mongoose";
import ApiResponse from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Comment } from "../models/comment.model";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(401, "Video doesn't exist");
  }
  const { page = 1, limit = 10 } = req.query;
  const parsedLimit = parseInt(limit);
  const pageSkip = (page - 1) * parsedLimit;
  const allComments = await Comment.aggregate([
    {
      $match: {
        video: videoId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              userName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $skip: pageSkip,
    },
    {
      $limit: parsedLimit,
    },
  ]);
  if (!allComments) {
    throw new ApiError(501, "Error Fetching Comments");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, allComments, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { comment } = req.body;
  if (!videoId) {
    throw new ApiError(401, "No video exist with this videoId");
  }
  if (!comment) {
    throw new ApiError(401, "Please add comments");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId!");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found!");
  }
  const createComment = await Comment.create({
    comment,
    owner: req.user._id,
    video: videoId,
  });
  if (!createComment) {
    throw new ApiError(401, "Not able to create comment");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createComment, "Comment created successfully"));
});
const updateComment = asyncHandler(async (req, res) => {
  // const {videoId} = req.params
  const { comment } = req.body;
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commendId!");
  }
  if (!comment) {
    throw new ApiError(400, "please enter comment");
  }
  const findComment = await Comment.findById(commentId);
  if (findComment) {
    throw new ApiError(401, "Comment doesn't exist");
  }
  if(findComment.owner.toString()!==req.user._id)
  {
    throw new ApiError(401, "Unauthroized request")
  }
  const updatedComment = Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        comment
      },
    },
    {
      new: true,
    }
  ).select("-video -owner");
  if(!updatedComment)
  {
    throw new ApiError(501, "Something went wrong while updating comment")
  }
  return res
  .status(201)
  .json(
    new ApiResponse(201, updatedComment, "Your comment updated successfully")
  )
});
const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;
    if(!commentId || !isValidObjectId(commentId))
    {
        throw new ApiError(401, "Invalid CommentId")
    }
    const findComment = await Comment.findById(commentId)
    if(!findComment)
    {
        throw new ApiError(404, "Comment not found")
    }
    if(findComment.owner.toString()!==req.user._id)
    {
        throw new ApiError(403, "Unauthrized access")
    }
    const commentDelete = await Comment.findByIdAndDelete(commentId)
    if(!commentDelete)
    {
        throw new ApiError(500, "Something went wrong while deleting comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "comment deleted successfully")
    )


})
export { getVideoComments, addComment , updateComment, deleteComment};
