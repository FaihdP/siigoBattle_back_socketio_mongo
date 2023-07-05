import { Schema, model } from "mongoose";

const cardSchema = new Schema(
  {
    code: String,
    name: String,
    displacement: Number,
    cylinders: Number,
    revolutions: Number,
    weight: Number,
  }
);

export default model("Card", cardSchema);
