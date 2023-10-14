"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
  GetAllUsersParams,
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
    console.log(userQuestionsIds);

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
    console.log("Connecting to the database...");
    connectToDatabase();
    console.log("Connected to the database.");

    const users = await User.find({}).sort({ createdAt: -1 });
    
    console.log("Fetched users:", users);

    return {users};
  } catch (error) {
    console.log("Aiya")
    console.error("An error occurred while fetching users:", error);
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

// export async function GetAllUsers(params:GetAllUsersParams){
//   try{
//     connectToDatabase();
//   }catch(error){
//     console.log(error)
//     throw error

//   }
// }
