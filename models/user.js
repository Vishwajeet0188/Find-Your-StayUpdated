const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({ 
  fullName: {
    type: String,
    required: true,
    trim: true
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
    type: String,
    required: true,
    match: [/^[6-9]\d{9}$/, "Invalid phone number"] // Indian format
    },
    role: {
      type: String,
      enum: ["user", "lister", "admin"],
      default: "user"
    },

  wishlist: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Listing" }
  ]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",UserSchema);