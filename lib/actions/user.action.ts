"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { FilterQuery } from "mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
  GetAllUsersParams,
  ToggleSaveQuestionParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import Answer from "@/database/answer.model";


export async function getUserById(params: any) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();
    const newUser = await User.create(userData);
    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();

    const { clerkId, updateData, path } = params;
    await User.findOneAndUpdate({ clerkId }, updateData, {
      // create new instance true
      new: true,
    });
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();
    const { clerkId } = params;
    const user = await User.findOneAndDelete({ clerkId });
    if (!user) {
      throw new Error("User not found");
    }
    // Delete user from data and delete everything(questions,answers,comments) user have done

    // get user question id

    const userQuestionsIds = await Question.find({ author: user._id }).distinct(
      "_id"
    );
    console.log(userQuestionsIds, "userId");

    await Question.deleteMany({ author: user._id });

    // Todo: delete users answers ,comments

    const deletedUser = await User.findByIdAndDelete(user._id);
    return deletedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectToDatabase();
    const { searchQuery, filter, page = 1, pageSize = 8 } = params;

    // Calculate the no of question card to skip based on page

    const skipQuestions = (page - 1) * pageSize;

    const query :FilterQuery<typeof User> ={}

   

    if(searchQuery) {
      query.$or =[
        {name:{$regex:new RegExp(searchQuery,'i')}},
        {username:{$regex:new RegExp(searchQuery,'i')}}
      ]
    }


    let sortUser ={} 

    switch(filter){
      case "new_users": sortUser={joinedAt:-1}
        break;
      case "old_users":sortUser={joinedAt:1}
        break;
      case "top_contributors":sortUser={reputation:-1}
       break;
    }
    

    const users = await User.find(query) .skip(skipQuestions)
      .limit(pageSize).sort(sortUser);

      const totalUsers=await User.countDocuments(query)
      const isNext=totalUsers >skipQuestions +users.length


    return { users,isNext };
  } catch (error) {
    console.error("An error occurred while fetching users:", error);
    throw error;
  }
}

export async function saveQuestion(params: ToggleSaveQuestionParams) {
  try {
    connectToDatabase();
    const { userId, questionId, path } = params;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const isQuestionSaved = user.saved.includes(questionId);
    if (isQuestionSaved) {
      // remove question from saved
      await User.findByIdAndUpdate(
        userId,
        { $pull: { saved: questionId } },
        { new: true }
      );
    } else {
      // add question to saved
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { saved: questionId } },
        { new: true }
      );
    }
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    connectToDatabase();
    const { clerkId, searchQuery ,filter, page = 1, pageSize = 29} = params;

    const skipSavedQuestions = (page - 1) * pageSize;

 

    const query :FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, "i") } }
      : {};

      let savedQuestion = {};

      switch (filter) {
        case "most_recent":
          savedQuestion = { createdAt: -1 };
          break;
        case "oldest":
          savedQuestion = { createdAt: 1 };
          break;
          case "most_viewed":
          savedQuestion = { views: -1 };
          break;
          case "most_answered":
          savedQuestion = { answers: -1 };
          break;
         case "most_voted":
          savedQuestion = { upvotes:-1}
          break;
        default:
          break;
      }
  
    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        skip:skipSavedQuestions,
        limit:pageSize+1,
         sort: savedQuestion
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picure" },
      ],
    });
    const isNext=user.saved > pageSize 
    if (!user) {
      throw new Error("User not found");
    }
    const savedQuestions = user.saved;
   

    
      
    return { questions: savedQuestions ,isNext};
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    connectToDatabase();
    const { userId } = params;
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new Error("User not Found!!!");
    }
    //  We need to find no questions and answers this userId done

    const totalQuestions = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });

    return {
      user,
      totalQuestions,
      totalAnswers,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    connectToDatabase();
    const { userId,page = 1, pageSize = 10} = params;
    const skipAmount=(page-1)*pageSize;
    const totalQuestion = await Question.countDocuments({ author: userId });
    const userQuestion = await Question.find({ author: userId })
      .sort({ views: -1, upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate("tags", "_id name")
      .populate("author", "_id clerkId name picture");
   const isNextQuestion =totalQuestion>skipAmount+userQuestion.length
    return { totalQuestion, questions: userQuestion,isNextQuestion };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserAnswer(params: GetUserStatsParams) {
  try {
    connectToDatabase();
    const { userId,page = 1, pageSize = 10 } = params;
    const skipAmount=(page-1)*pageSize;
    const totalAnswers = await Answer.countDocuments({ author: userId });
    const userAnswers = await Answer.find({ author: userId })
      .sort({ views: -1, upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate("question", "_id title")
      .populate("author", "_id clerkId name picture");
      const isNextAnswer =totalAnswers>skipAmount+userAnswers.length
    return { totalAnswers, answers: userAnswers ,isNextAnswer};
  } catch (error) {
    console.log(error);
    throw error;
  }
}




// export async function GetAllUsers(params:GetAllUsersParams){
//   try{
//     connectToDatabase();
//   }catch(error){
//     console.log(error)
//     throw error

//   }
// }
