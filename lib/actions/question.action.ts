"use server";

import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import { connectToDatabase } from "../mongoose";
import { CreateQuestionParams, GetQuestionByIdParams, GetQuestionsParams } from "./shared.types";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";

export async function getQuestion(params: GetQuestionsParams) {
  try {
    connectToDatabase();
    const questions = await Question.find({})
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .sort({ createdAt: -1 });
    return { questions };
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
        { $setOnInsert: { name: tag }, push: { question: question._id } },
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
    // Increment author's reputation by +5 points
    revalidatePath(path);
  } catch (error) {}
}

export async function getQuestionById(params:GetQuestionByIdParams){
try{
  connectToDatabase()
  const{questionId}=params;

  const question =await Question.findById(questionId)
  .populate({path:'tags' ,model:Tag,select:"_id name"})
  .populate({path:'author' ,model:User,select:"_id clerkId name picture"})
  console.log(question)
  return question
  

}catch(error){
  console.log(error)
  throw error
}
}
