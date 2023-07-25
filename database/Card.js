import { Schema, model } from "mongoose";

const cardSchema = new Schema(
  {
    code: String,
    name: String,
    cylinder: Number,
    cylinders: Number,
    horsepower: Number,
    revolutions: Number,
    weight: Number,
    img: String,
  }
);

export default model("Card", cardSchema);
