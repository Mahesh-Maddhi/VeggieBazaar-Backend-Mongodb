import mongoose from "mongoose";

const { Schema } = mongoose;

const messagesSchema = new Schema({
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const contactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  messages: [messagesSchema],
});

const Contact = mongoose.model("Contact", contactSchema, "contact");

export default Contact;
