const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  designation: {
    type: String,
  },
  email:{
    type: String,
  },
  password:{
    type:String,
  }

},  {
  timestamps: true,
}
);

module.exports = mongoose.model('Employee', employeeSchema);