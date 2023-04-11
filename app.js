const express = require('express')
const bodyparser = require("body-parser")
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js")
const _ = require("lodash")
const app = express()

app.set('view engine', 'ejs');
mongoose.set('strictQuery', true);
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"))


mongoose.connect("mongodb://127.0.0.1/toDoDB", { useNewUrlParser: true });
const tasksSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true,
        minlength: 1,
    },
});
const listsSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    items: [tasksSchema],
});

const Task = mongoose.model("tasks", tasksSchema);
const List = mongoose.model("lists", listsSchema);
const defaultIteams = []
app.get("/", function (req, res) {
    let day = date.getDate();
    Task.find().then(function (task) {
        res.render("list", { kindOfDay: day, newListItems: task })
    }).catch(function (err) {
        console.log(err);
    })
})

app.get("/:customLinkName", function (req, res) {
    const customLinkName = req.params.customLinkName;
    List.findOne({ name: customLinkName }).then(function (result) {

        if (!result) {
            const list = new List({
                name: customLinkName,
                items: defaultIteams
            })
            list.save();
            res.redirect("/" + customLinkName);
        } else {
            res.render("list", { kindOfDay: result.name, newListItems: result.items })
        }
    })

})

app.post("/", function (req, res) {
    const taskName = req.body.newItem;
    const listName = req.body.newItemBtn;
    let day = date.getDate();
    const task = new Task({
        task: taskName,
    })
    if (listName === day) {
        task.save();
        res.redirect("/");
    } else {
        List.findOne({ name:listName}).then(function (result) {
            result.items.push(task);
            result.save();
            res.redirect("/" + listName);
        })
    }
})

app.post("/delete", function (req, res) {
    const listName = req.body.newItemBtn;
    let day = date.getDate();
    if (listName === day) {
        Task.deleteOne({ _id: req.body.checkbox }).then(function () {
            console.log("Sucssefully deleted");
        }).catch(function (err) {
            console.log(err);
        })
        res.redirect("/");
    }else{
        List.findOneAndUpdate({ name: listName },{$pull:{items:{_id:req.body.checkbox}}}).then(function (result) {
            res.redirect("/" + listName);
        })
    }
})
app.post("/addList",function(req,res){
    const listName = req.body.newList;
    let day = date.getDate();
    if(listName===day){
        res.redirect("/");
    }else{
        res.redirect("/"+listName);
    }
    
})

app.listen(3000, function () {
    console.log("Server is running in 3000")
})