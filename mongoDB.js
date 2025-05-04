const mongoose = require("mongoose");

const connect = async () => {
  await mongoose.connect(process.env.DB_LINK);
  console.log("connect to DB");
};
const userSchema = mongoose.Schema({
  id: String,
  name: String,
  password: String,
  email: String,
  phone: String,
  birthday: Date,
});
const listSchema = mongoose.Schema({
    _id:mongoose.Types.ObjectId,
  name: String,
  userId: String,
});
const taskSchema = mongoose.Schema({
  task: String,
  listId: mongoose.Types.ObjectId,
  done:Boolean
});

const userModel = mongoose.model("user", userSchema);
const listModel = mongoose.model("list", listSchema);
const taskModel = mongoose.model("task", taskSchema);

const deleteList=async(listId)=>{
    const result =await listModel.deleteOne({
            _id:mongoose.Types.ObjectId(listId)
        })
        const deleteTasks =await taskModel.delete({
            listId:mongoose.Types.ObjectId(listId)
        })
        return result,deleteTasks
}

module.exports = {
  connect,
  userModel,
  listModel,
  taskModel,
  deleteList
};
