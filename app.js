const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require ("lodash");
const MongoClient = require('mongodb').MongoClient;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-sharry:sandeep@cluster0.a0dvb1w.mongodb.net/todolist', { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.connect('mongodb://0.0.0.0/todolist', { useNewUrlParser: true, useUnifiedTopology: true });
const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
  name: 'eat',
});
const item2 = new Item({
  name: 'drink',
});
const item3 = new Item({
  name: 'sleep',
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items:[itemSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({})
  .then(function(foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName= req.body.list;

  const item = new Item({
    name: itemName
  });
  if(listName==="Today"){
  item.save();
  res.redirect("/");

  }else{
    List.findOne({name:listName})
    .then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(function(){
      res.redirect("/");
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
    .then(function(){
      res.redirect("/"+listName);
    });
  }
});

app.get("/:customlistname",function(req,res){
  const customlistname = _.capitalize(req.params.customlistname);

  List.findOne({name: customlistname})
  .then(function(foundList){
    if(!foundList){
      //create a new list
      const list =new List({
        name:customlistname,
        items: defaultItems
      });
      
  list.save();
  res.redirect("/"+customlistname);
    }else{
      //show a current list
      res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
    }
  });

  
});

// app.get("/work", function(req, res){
//   res.render("list", {listTitle: "Work List", newListItems: defaultItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});