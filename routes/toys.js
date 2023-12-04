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

router.get("/search", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  try {
    let queryS = req.query.s;
    let searchReg = new RegExp(queryS, "i")
    let data = await ToysModel.find({ $or: [{ name: searchReg }, { info: searchReg }] })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 })
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})

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

router.get("/category/:catname", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  try {
    let category = req.params.catname;
    let searchReg = new RegExp(category, "i")
    let data = await ToysModel.find({ category: searchReg })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 })
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }

})

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
  let valdiateBody = validateToy(req.body);
  if (valdiateBody.error) {
    return res.status(400).json(valdiateBody.error.details);
  }
  try {
    let toy = new ToyModel(req.body);
      toy.user_id = req.tokenData._id;
    await toy.save();
    res.status(201).json(toy);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});
router.put("/:idEdit",auth, async(req,res) => {
  let valdiateBody = validateToy(req.body);
  if (valdiateBody.error) {
    return res.status(400).json(valdiateBody.error.details);
  }
  try {
    let idEdit = req.params.idEdit;
    let data = await ToyModel.updateOne({ _id: idEdit }, req.body);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});
router.delete("/:idDel",auth, async(req,res) => {
  try {
    let idDel = req.params.idDel;
    let data = await ToyModel.deleteOne({ _id: idDel });
    if (data.deletedCount == 0) {
      return res.status(403).json({ msg: "Unauthorized to delete this toy" });
    }
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});

module.exports = router;
