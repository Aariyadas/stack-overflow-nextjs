"use server";

import Answer from "@/database/answer.model";
import { CreateAnswerParams } from "./shared.types";
import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import { revalidatePath } from "next/cache";

export async function createAnswer(params: CreateAnswerParams) {
  try {
    connectToDatabase();
    const { content, author, question, path } = params;
    const newAnswer = new Answer({ content, author, question, path });
    // Add the answers to the questions answer array
    // Refer to the question the question being the id
    await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    });
    // todo : Add the interaction
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
