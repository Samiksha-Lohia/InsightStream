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
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        retention: {
            type: String,
            enum: ["24 Hours", "7 Days", "30 Days", "Indefinite"],
            default: "Indefinite"
        },
        expiresAt: {
            type: Date
        }
    },
    {
        timestamps : true,
    }
);

documentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Document = mongoose.model("Document", documentSchema);
export default Document;