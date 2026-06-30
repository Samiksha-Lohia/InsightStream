import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        content:{
            type : String,
            required : true
        },
        status:{
            type : String,
            enum : ["Pending","Processing","Completed","Failed"],
            default : "Pending"
        },
        insights:{
            type : mongoose.Schema.Types.Mixed,
        }
    },
    {
        timestamps : true,
    }
);

const Document = mongoose.model("Document", documentSchema);
export default Document;