import { Schema, models, model, Document } from "mongoose";

export interface IQuestion extends Document {
  author: Schema.Types.ObjectId;
  question: Schema.Types.ObjectId;
  content: string;
  // upbotes going to be an array of ID's ie the reference[id1,id2]
  upvotes: Schema.Types.ObjectId[];
  downvotes: Schema.Types.ObjectId[];
  createdAt:Date;
}

const AnswerSchema = new Schema({
    author:{type:Schema.Types.ObjectId,ref:'User',required:true},
    question:{type:Schema.Types.ObjectId,ref:'User',required:true},
    content:{type:String,required:true},
    upVotes:[{type:Schema.Types.ObjectId,ref:'User'}],
    downVotes:[{type:Schema.Types.ObjectId,ref:'User'}],
    createdAt:{type:Date,default:Date.now}
});

const Answer = models.Answer || model("Answer", AnswerSchema);

export default Answer;
