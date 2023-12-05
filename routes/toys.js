const express = require("express");
const { auth } = require("../middlewares/auth");
const { ToyModel, validateToy } = require("../models/toyModel")
const router = express.Router();

router.get("/", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    try {
        let data = await ToyModel.find({})
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ _id: -1 })
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "There error, try again later", err })
    }
})

router.get("/search", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    try {
        let queryS = req.query.s;
        let searchReg = new RegExp(queryS, "i")
        let data = await ToyModel.find({ $or: [{ name: searchReg }, { info: searchReg }] })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ _id: -1 })
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "There error to search, try again later", err })
    }
})

router.get("/category/:catname", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    try {
        let category = req.params.catname;
        let searchReg = new RegExp(category, "i")
        let data = await ToyModel.find({ category: searchReg })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ _id: -1 })
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "There error, try again later", err })
    }
})

router.post("/", auth, async (req, res) => {
    let validBody = validateToy(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let toy = new ToyModel(req.body);
        toy.user_id = req.tokenData._id;
        await toy.save();
        res.status(201).json(toy);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "There error to add, try again later", err })
    }
})

router.put("/:editId", auth, async (req, res) => {
    let validBody = validateToy(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let editId = req.params.editId;
        let data;
        if (req.tokenData.role == "admin") {
            data = await ToyModel.updateOne({ _id: editId }, req.body)
        }
        else {
            data = await ToyModel.updateOne({ _id: editId, user_id: req.tokenData._id }, req.body)
        }
        if (data.modifiedCount == 0) {
            res.json({ msg: "not valid id or you are not allowed to edit. nothing was edited" })
        }
        else res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "There error to edit, try again later", err })
    }
})

router.delete("/:delId", auth, async (req, res) => {
    try {
        let delId = req.params.delId;
        let data;
        if (req.tokenData.role == "admin") {
            data = await ToyModel.deleteOne({ _id: delId })
        }
        else {
            data = await ToyModel.deleteOne({ _id: delId, user_id: req.tokenData._id })
        }
        if (data.deletedCount == 0) {
            res.json({ msg: "not valid id or you are not allowed to erase. nothing was erased" })
        }
        else res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "There error to delete, try again later", err })
    }
})

router.get("/prices", async (req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    try {
        let min = req.query.min || 0;
        let max = req.query.max || Infinity;
        let data = await ToyModel.find({ $and: [{ price: { $gte: min } }, { price: { $lte: max } }] })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({ _id: -1 })
        res.json(data)
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "There error, try again later", err })
    }
})

router.get("/single/:id", async (req, res) => {
    try {
        let id = req.params.id;
        let data = await ToyModel.findById(id)
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: "There error, try again later", err })
    }
})


module.exports = router;
