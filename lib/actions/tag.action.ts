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
    const { searchQuery,filter} =params;
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


    const tags = await Tag.find(query).sort(sortTags);
    return { tags };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    connectToDatabase();

    const { tagId, searchQuery } = params;

    const tagFilter = (FilterQuery<ITag> = { _id: tagId });

    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: "i" } }
        : {},
      options: {
        sort: { createdAt: -1 },
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picure" },
      ],
    });

    if (!tag) {
      throw new Error("Tag not found");
    }
    console.log(tag, "Tag");
    const questions = tag.questions;
    console.log("Tag Questions", questions);

    return { tagTitle: tag.name, questions };
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
