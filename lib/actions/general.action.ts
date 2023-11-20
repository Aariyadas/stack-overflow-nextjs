"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import { SearchParams } from "./shared.types";
import User from "@/database/user.model";
import Tag from "@/database/tag.model";
import Answer from "@/database/answer.model";

const searchableTypes = ["question", "answer", "user", "tag"];
export async function globalSearch(params: SearchParams) {
  try {
    await connectToDatabase();
    const { query, type } = params;
    const regex = { $regex: query, $options: "i" };
    let results = [];
    const modelsAndTypes = [
      { model: Question, searchField: "title", type: "question" },
      { model: Answer, searchField: "content", type: "answer" },
      { model: User, searchField: "name", type: "user" },
      { model: Tag, searchField: "name", type: "tag" },
    ];

    const typeLowerCase = type?.toLowerCase();
    if (!typeLowerCase || !searchableTypes.includes(typeLowerCase)) {
      //    Search Across Everything

      for(const {model,searchField,type} of modelsAndTypes){
        const queryResults=await model.find({[searchField]:regex}).limit(2);
        results.push(
            ...queryResults.map((item)=>({
                title:
          type === "answer"
            ? `Answer containing ${query}`
            : item[searchField],
        type,
        id:
          type === "user"
            ? item.clerkId
            : type === "answer"
            ? item.question
            : item._id,
      }))
        )}   
      
    } else {
      // Search in the specified model type
      const modelInfo = modelsAndTypes.find((item) => item.type === type);
      console.log(modelInfo)
      if (!modelInfo) {
        throw new Error("Invalid search types");
      }

      const queryResult = await modelInfo.model
        .find({ [modelInfo.searchField]: regex })
        .limit(8);
      results = queryResult.map((item) => ({
        title:
          type === "answer"
            ? `Answer containing ${query}`
            : item[modelInfo.searchField],
        type,
        id:
          type === "user"
            ? item.clerkId
            : type === "answer"
            ? item.question
            : item._id,
      }));
    }
    return JSON.stringify(results);
    console.log(results)
  } catch (error) {
    console.log(`Error fetching logical reason ${error}`);
    throw error;
  }
}
