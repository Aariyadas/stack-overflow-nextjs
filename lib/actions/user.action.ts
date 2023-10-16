"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
  GetAllUsersParams,
  ToggleSaveQuestionParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";

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
    console.log(userQuestionsIds,"userQuestionId");

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
    

    const users = await User.find({}).sort({ createdAt: -1 });
    
   

    return {users};
  } catch (error) {
    
    console.error("An error occurred while fetching users:", error);
    throw error;
  }
}



export async function savedQuestion(params:ToggleSaveQuestionParams){
  try{
    connectToDatabase();
    const {userId,questionId,path}=params
    const user =await User.findById(userId);
    if(!user){
      throw new Error('User not found')
    }
    
    const isQuestionSaved =user.saved.includes(questionId)
    if(isQuestionSaved){
      // remove question from saved 
      await User.findByIdAndUpdate(userId,
        {$pull:{saved:questionId}},
        {new:true}
      )
    } else {
      // add question to saved
      await User.findByIdAndUpdate(userId,
        {$addToSet:{saved:questionId}},
        {new:true}
      )
    }
     revalidatePath(path)


  }catch(error){
    console.log(error)
    throw error

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
