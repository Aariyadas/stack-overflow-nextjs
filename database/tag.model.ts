import {Schema,model,models,Document} from 'mongoose'

export interface ITag extends Document {

    name:string;
    description:string;
    questions:Schema.Types.ObjectId[];
    followers:Schema.Types.ObjectId[];
    createdOn:Date;


}

const TagSchema = new Schema ({
    name: { type: String, required: true,unique:true },
    description: { type: String, required: true },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }], // Assuming you want to reference "Question" models.
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Assuming you want to reference "User" models.
    createdOn: { type: Date, default: Date.now },
});

const Tag = models.Tag || model('Tag', TagSchema);

export default Tag;