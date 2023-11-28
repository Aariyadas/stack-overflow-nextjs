"use server";

import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
} from "./shared.types";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import Answer from "@/database/answer.model";
import Interaction from "@/database/interaction.model";
import { FilterQuery } from "mongoose";


export async function getQuestion(params: GetQuestionsParams) {
  try {
    connectToDatabase();
    const { searchQuery, filter, page = 1, pageSize = 2 } = params;

    // Calculate the no of question card to skip based on page

    const skipQuestions = (page - 1) * pageSize;

    const query: FilterQuery<typeof Question> = {};

    if (searchQuery) {
      query.$or = [
        // searching either by content or by title
        { title: { $regex: new RegExp(searchQuery, "i") } },
        { content: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    let sortQuestions = {};

    switch (filter) {
      case "newest":
        sortQuestions = { createdAt: -1 };
        break;
      case "frequent":
        sortQuestions = { views: -1 };
        break;
      case "unanswered":
        query.answers = { $size: 0 };
        break;
      default:
        break;
    }

    const questions = await Question.find(query)
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .skip(skipQuestions)
      .limit(pageSize)
      .sort(sortQuestions);



      // calculate total questions
      const totalQuestions=await Question.countDocuments(query)
      const isNext=totalQuestions >skipQuestions +questions.length


    return { questions,isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createQuestion(params: CreateQuestionParams) {
  // eslint-disable-next-line no-empty
  try {
    connectToDatabase();
    const { title, content, tags, author, path } = params;
    //  Crete a  Question
    const question = await Question.create({
      title,
      content,
      author,
    });
    const tagDocument = [];
    // Create tags or get them already exist
    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        //  1 argument searching for document
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        // If it found it updates and push id  of question  into Question array field
        { $setOnInsert: { name: tag }, $push: { questions: question._id } },
        // if no document found matching it insert new document with name set value to tag
        { upsert: true, new: true }
      );
      tagDocument.push(existingTag._id);
    }

    // Once we have tag update the question with tag information

    await Question.findByIdAndUpdate(question._id, {
      // for each tag document we push the Id of that tag and that's going to be added to  the question
      $push: { tags: { $each: tagDocument } },
    });

    //  Create an interaction record for user's ask_question action
    await Interaction.create({
      user:author,
      action:'ask_question',
      question:question._id,
      tags:tagDocument,

    })

    await User.findByIdAndUpdate(author,{$inc:{reputation:5}})
    revalidatePath(path)
   
    // Increment author's reputation by +5 points

 
  } catch (error) {
    console.log(error)
  }
}

export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    connectToDatabase();
    const { questionId } = params;

    const question = await Question.findById(questionId)
      .populate({ path: "tags", model: Tag, select: "_id name" })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      });
    console.log(question);
    return question;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function upvoteQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();
    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;
    let updateQuery = {};

    if (hasupVoted) {
      updateQuery = { $pull: { upvotes: userId } };
    } else if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { upvotes: userId } };
    }
    // Database Update
    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) {
      throw new Error("Question not found");
    }
    // Increment author reputation +1/-1 for upvoting
    await User.findByIdAndUpdate(userId,{
      $inc:{reputation:hasupVoted ? -1: 1}
    })

// Increase author reputation bt +10/-10 for receiving and upvote or downvote question
    await User.findByIdAndUpdate(question.author,{
      $inc:{reputation:hasupVoted ? -10 : 10}
    })




    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function downvoteQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();
    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;
    let updateQuery = {};

    if (hasdownVoted) {
      updateQuery = { $pull: { downvote: userId } };
    } else if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { downvotes: userId } };
    }
    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });
    if (!question) {
      throw new Error("Question not found");
    }
    // Increment author badge by 10 points

    await User.findByIdAndUpdate(userId,{
      $inc:{reputation:hasdownVoted ? -1: 1}
    })


    await User.findByIdAndUpdate(answer.author,{
      $inc:{reputation:hasdownVoted ?-10 : 10}
    })

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    connectToDatabase();

    const { questionId, path } = params;
    await Question.deleteOne({ _id: questionId });
    // Need to delete answer assosiated answers and interactions
    await Answer.deleteMany({ question: questionId });
    await Interaction.deleteMany({ question: questionId });
    await Tag.updateMany(
      { question: questionId },
      { $pull: { questions: questionId } }
    );
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function editQuestion(params: EditQuestionParams) {
  try {
    connectToDatabase();
    const { questionId, title, content, path } = params;
    const question = await Question.findById(questionId).populate("tags");

    if (!question) {
      throw new Error("Question Not found");
    }

    question.title = title;
    question.content = content;

    await question.save();

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getTopQuestions() {
  try {
    connectToDatabase();
    const topQuestions = await Question.find({})
      .sort({ view: -1, upvotes: -1 })
      .limit(5); // sort decsending order
    return topQuestions;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
