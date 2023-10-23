"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from "./shared.types.d";
import Tag, { ITag } from "@/database/tag.model";
import Question from "@/database/question.model";
import { FilterQuery } from "mongoose";

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    connectToDatabase();
    const { userId } = params;
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    // Findinteraction for the user and group by tags

    // Interaction........
    return [
      { _id: "1", name: "tag1" },
      { _id: "2", name: "tag2" },
    ];
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAllTags(params: GetAllTagsParams) {
  try {
    connectToDatabase();
    const { searchQuery,filter,page = 1, pageSize = 5} =params;
     const skipAmount=(page-1)*pageSize;


    const query : FilterQuery<typeof Tag> ={};

    if(searchQuery ){
      query.$or = [{name:{$regex:new RegExp(searchQuery,'i')}}
      ]
    }

    
    let sortTags = {};

    switch (filter) {
      case "popular":
        sortTags = { questions: -1 };
        break;
      case "recent":
        sortTags = { createdAt: -1 };
        break;
        case "name":
        sortTags= { name: 1 };
        break;
        case "old":
          sortTags = {createdAt: 1 };
      
        break;
      default:
        break;
    }

    const totalTags=await Tag.countDocuments(query)

    const tags = await Tag.find(query).sort(sortTags).skip(skipAmount).limit(pageSize);
    const isNext =totalTags >skipAmount +tags.length
    return { tags,isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    connectToDatabase();

    const { tagId, searchQuery,page = 1, pageSize = 5 } = params;
    const skipAmount=(page-1)*pageSize;


    const tagFilter: FilterQuery<ITag> = { _id: tagId };

    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: "i" } }
        : {},
      options: {
        sort: { createdAt: -1 },
        skip:skipAmount,
        limit:pageSize+1   // +1 to check if there is a next page
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picure" },
      ],
    });

    if (!tag) {
      throw new Error("Tag not found");
    }

    const isNext=tag.questions.length>pageSize;
  
    const questions = tag.questions;
    console.log("Tag Questions", questions);

    return { tagTitle: tag.name, questions ,isNext};
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getPopularTags() {
  try {
    connectToDatabase();
    const popularTags = await Tag.aggregate([
      // Reshape how we see tags and count the number of questions
      {
        $project: {
          name: 1,
          numberOfQuestions: { $size: { $ifNull: ["$questions", []] } }
        }
      },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 }
    ]);

    
    return popularTags
   
  } catch (error) {
    console.log(error);
    throw error;
  }
}
