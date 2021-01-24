//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var _ = require("lodash");
mongoose.connect("mongodb+srv://admin-ritwik:test123@cluster0.pwfnu.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = new mongoose.model("Item", itemsSchema);



const item1 = new Item({
  name: "Welcome to your ToDo List"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<---- Check this to strike an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = new mongoose.model("List", listSchema);
// const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];

app.get("/", function(req, res) {

// const day = date.getDate();
  Item.find(function(err, items){
    if(items.length === 0){
      Item.insertMany(defaultItems,function(err){
        if (err){
          console.log(err);
        } else {
          console.log("Default items added successfully");
        }
        res.redirect("/");
      });
      
    } else {
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const nextItem = new Item({
    name: itemName
  });

  if(listName === "Today"){
    nextItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      if(!err){
        foundList.items.push(nextItem);
        foundList.save(function(){
          res.redirect("/" + listName);
        });
        
      } else {
        console.log(err);
      }
    })
  }

});

app.post("/delete", function(req,res){
  // console.log(req.body.checkbox);
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndDelete({_id:checkedItemId}, function(err){
      if (err){
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

  
});


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:listName",function(req, res){

  const requestedListName = _.capitalize(req.params.listName);
  List.findOne({name: requestedListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: requestedListName,
          items: defaultItems
        });

        list.save(function(){
          res.redirect("/"+ requestedListName);
        });
        //console.log("count1");
        
      } else {
        //console.log(foundList);
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    } else {
      console.log(err);
    }
    
  });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});


