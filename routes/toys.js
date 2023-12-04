const express = require("express");
const {auth} = require("../middlewares/auth");
const { ToyModel, validateToy } = require("../models/toyModel");
const router = express.Router();

router.get("/", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  try {
    let data = await ToyModel.find({})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err });
  }
});

//sara lea
// http://localhost:3000/toys/search/?s=
// ?s= -> query string
router.get("/search/", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  try {
    let searchQ = req.query.s.toLowerCase();
    let data = await ToyModel.find({
      $or: [{ name: searchQ }, {info:searchQ}],
    })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});

//http://localhost:3000/toys/category/:games
router.get("/prices", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  try {
    let minPrice = req.query.min;
    let maxPrice = req.query.max;
    if(minPrice&maxPrice){
      let data = await ToyModel.find({$and:[{price:{$gte:minPrice}},{price:{$lte:maxPrice}}]})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 });
       res.json(data);
    }
    else if(minPrice){
      let data = await ToyModel.find({price:{$gte:minPrice}})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 });
       res.json(data);
    }
    else if(maxPrice){
      let data = await ToyModel.find({price:{$lte:maxPrice}})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 });
       res.json(data);
    }
    else{
      let data = await ToyModel.find({})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 });
       res.json(data);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});

router.get("/category/:xyx", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  try {
    let catN = req.params.xyx;
    let data = await ToyModel.find({category:catN})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});


router.get("/single/:id", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  try {
    let idT = req.params.id;
    let data = await ToyModel.find({ _id: idT })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});

router.post("/", auth, async(req,res) => {
//router.post("/", async (req, res) => {
  let valdiateBody = validateToy(req.body);
  if (valdiateBody.error) {
    return res.status(400).json(valdiateBody.error.details);
  }
  try {
    let toy = new ToyModel(req.body);
    // הוספת מאפיין האיי די של המשתמש
    // בהמשך יעזור לנו לזהות שירצה למחוק או לערוך רשומה
    //  tokenData._id; -> מגיע מפונקציית האוט מהטוקן ומכיל את
    // האיי די של המשתמש
      toy.user_id = req.tokenData._id;
    await toy.save();
    res.status(201).json(toy);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});
router.put("/:idEdit",auth, async(req,res) => {
//router.put("/:idEdit", async (req, res) => {
  let valdiateBody = validateToy(req.body);
  if (valdiateBody.error) {
    return res.status(400).json(valdiateBody.error.details);
  }
  try {
    let idEdit = req.params.idEdit;
    let data = await ToyModel.updateOne({ _id: idEdit }, req.body);
    // modfiedCount:1 - אם יש הצלחה
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});
router.delete("/:idDel",auth, async(req,res) => {
//router.delete("/:idDel", async (req, res) => {
  try {
    let idDel = req.params.idDel;
    // כדי שמשתמש יוכל למחוק רשומה הוא חייב
    // שלרשומה יהיה את האיי די ביוזר איי די שלו
    //    let data = await ToyModel.deleteOne({_id:idDel,user_id:req.tokenData._id})
    let data = await ToyModel.deleteOne({ _id: idDel });
    // "deletedCount": 1 -  אם יש הצלחה של מחיקה
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});

module.exports = router;
