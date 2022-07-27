const DataModelManager = require("../util/DataModelManager");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var CansSchema = new Schema({

    name: {
        type: String,
        unique: true,
        required: true
    },

    attributes: [
        {
            trait_type: String,
            value: String
        }
    ],
    pallete: [
        String
    ]
    ,
    image: {
        type: String,
        required: true
    },



});

CansSchema.statics.addCan = function( data,  callback)  {


    data.save(function(err) {
        if (err)  console.log(err);
        // return callback(data, null);
    });
}
module.exports = DataModelManager.registerModel("Cans", CansSchema);
