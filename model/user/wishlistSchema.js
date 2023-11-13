const mongoose = require('mongoose')
const {Schema} = mongoose

const WishlistSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    products:[ {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  })

  const WishlistModel = new mongoose.model('wishlist',WishlistSchema)

  module.exports = WishlistModel