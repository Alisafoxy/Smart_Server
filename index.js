require('dotenv').config()
const express=require('express')
const cors = require('cors')
const{connect,userModel,listModel,taskModel,deleteList}=require('./mongoDB')
const { default: mongoose, deleteModel } = require('mongoose')

const app =express()
app.use(cors())
app.use(express.json())
connect()

app.post('/register',async(req,res)=>{
    // const result=await userModel.insertOne(req.body)
    // res.status(200).send(result)

    const { id } = req.body
    const exists = await userModel.findOne({ id: id })

    if (exists) {
        return res.status(209).send('משתמש כבר קיים עם תעודת זהות זו')
    }
    else{
        const result = await userModel.insertOne(req.body)
        res.status(200).send(result)
    }
})
app.post('/addList',async(req,res)=>{
    const {userId}=req.query//איזה משתמש רוצה את הרשימה החדשה
    const result=await listModel.insertOne({
        ...req.body,
        userId:userId,
    })
    res.status(200).send(result)
}) 

app.post('/addTask',async(req,res)=>{
    const {listId}=req.query
    const result=await taskModel.insertOne({
        ...req.body,
        listId:listId
    })
    res.status(200).send(result)
})
app.get('/login',async(req,res)=>{
    const {id,password}=req.query
    const person=await userModel.findOne({
        id:id,
    })
    if(person==null)
        res.status(404).send("משתמש לא קיים")
    else{
        if(person.password === password)
        {
            res.status(200).send(true)
        }
        else{
            res.status(404).send(false)
        }
    }
})
app.get('/profile',async(req,res)=>{
    const{id}=req.query
    const user =await userModel.findOne({
        id:id
    })
    res.status(200).send({
        id:user.id,
        name:user.name,
        email:user.email,
        phone:user.phone,
        birthday:user.birthday
    })
})

app.get('/tasks',async(req,res)=>{
    const {listId}=req.query
    const tasks =await taskModel.find({
        listId:mongoose.Types.ObjectId(listId)
    })
    res.status(200).send(tasks)
})
app.get('/lists',async(req,res)=>{
    const{userId}=req.query
    const lists =await listModel.find({
        userId:userId
    })
    res.status(200).send(lists)
})

app.put('/updateTasks',async(req,res)=>{
    const{taskId}=req.query
    const result=await taskModel.findOneAndUpdate({
        _id:mongoose.Types.ObjectId(taskId)
    },{
        ...req.body
    })
    res.status(200).send(result)
})
app.put('/profile',async(req,res)=>{

    const { id } = req.query

    if (req.body.id) {
        return res.status(400).send("נא לא לשלוח ת.ז. בגוף הבקשה")
    }
    else{
        const result = await userModel.findOneAndUpdate(
            { id: id },
            { ...req.body }
        )
        res.status(200).send(result)
    } 
})
app.put('/list',async(req,res)=>{
    const{listId}=req.query
    const result =await listModel.findOneAndUpdate({
        _id:mongoose.Types.ObjectId(listId)
    },{
        ...req.body
    })
    res.status(200).send(result)
})

app.put('/id', async (req, res) => {
    const oldId = req.query.id
    const newId = req.body.id

    if (!newId) {
        return res.status(400).send("יש לשלוח ת.ז. חדשה בגוף הבקשה")
    }

    if (oldId === newId) {
        return res.status(400).send("הת.ז. החדשה חייבת להיות שונה מהת.ז. הנוכחית")
    }
    const userExists = await userModel.findOne({ id: oldId })
    if (!userExists) {
        return res.status(404).send("לא נמצא משתמש עם ת.ז. זו")
    }
    const duplicate = await userModel.findOne({ id: newId })
    if (duplicate) {
        return res.status(409).send("כבר קיים משתמש עם ת.ז. החדשה")
    }
    await userModel.updateOne({ id: oldId }, { id: newId })
    await listModel.updateMany({ userId: oldId }, { userId: newId })

    res.status(200).send("התעודת זהות עודכנה בהצלחה")
})

app.delete('/task',async(req,res)=>{
    const{taskId}=req.query
    const result= await taskModel.deleteOne({
        _id:mongoose.Types.ObjectId(taskId)
    })
    res.status(200).send(result)
})
app.delete('/list',async(req,res)=>{
    const{listId}=req.query
    const result =await listModel.deleteOne({
        _id:mongoose.Types.ObjectId(listId)
    })
    const deleteTasks =await taskModel.delete({
        listId:mongoose.Types.ObjectId(listId)
    })
    res.status(200).send(result,deleteTasks)
})
app.delete('/profile',async(req,res)=>{
    const {id}=req.query
    const lists=await listModel.find({
        userId:id
    })
    const deletePerson =await userModel.deleteOne({
        id:id
    })
    lists.map((list)=>{
        deleteList(list._id)
    })
    res.status(200).send(deletePerson)
})

app.listen(process.env.PORT,console.log(`server is on localhost${process.env.PORT}`))