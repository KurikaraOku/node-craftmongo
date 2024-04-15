const express = require("express");
const app = express();
const path = require("path");
const Joi = require("joi");
const multer = require("multer");

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());

const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/crafts/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });

mongoose
    .connect("mongodb+srv://kurikaraalex:Kurikara1@alexkuri.iqfaviw.mongodb.net/?retryWrites=true&w=majority&appName=AlexKuri")
    .then(() => {
        console.log("We are connected to MongoDB.");
    })
    .catch((error) => console.log("Error: could not connect to MongoDB.", error));

    const craftSchema = new mongoose.Schema({
        name: { type: String, required: true },
        image: { type: String, required: true },
        description: { type: String, required: true },
        supplies: [String],
      });
      
      const Craft = mongoose.model("Craft", craftSchema);
      module.exports = Craft;

app.use(express.static(path.join(__dirname, "public")));

app.get('/',(req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get('/api/crafts',(req, res) => {
    getCrafts(res);
});

const getCrafts = async (res) => {
    const crafts = await Craft.find();
    res.send(crafts);
}

app.get("/api/crafts/:id", (req, res) => {
    getCraft(res, req.params.id);
});

const getCraft = async(res) => {
    const craft = await Craft.findOne({ _id: id })
    res.send(craft);
};


app.post("/api/crafts", upload.single("img"), (req, res) => {
    console.log(req.body);
    const result = validateCraft(req.body);
  
    if (result.error) {
      res.status(400).send(result.error.details[0].message);
      return;
    }
  
    const craft = new Craft ({
        name: req.body.name,
        description: req.body.description,
        supplies:req.body.supplies.split(",")
    })
  
    if (req.file) {
      craft.image = req.file.filename;
    }
  
    createCraft(res, craft);
  });

  const createCraft = async (res, craft) => {
    const result = await craft.save();
    res.send(craft);
  };

  app.put("/api/crafts/:id", upload.single("img"), (req, res) => {
    const result = validateCraft(req.body);
    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }
    updateCraft(req, res);
  });

  const updateCraft = async (req, res) => {
    let fieldsToUpdate = {
        name:req.body.name,
        description:req.body.description,
        supplies:req.body.supplies.split(",")
    }

    if(req.file){
        fieldsToUpdate.image = "crafts/" + req.file.filename;
    }

    const result = await Craft.updateOne({ _id:req.params.id }, fieldsToUpdate);
    res.send(result);
  };

  app.delete("/api/crafts/:id", (req, res)=>{
   removeCrafts(res, req.params.id);
  });

  const removeCrafts = async (res, id) => {
    try {
        const craft = await Craft.findByIdAndDelete(id);
        if (!craft) {
            return res.status(404).send("Craft not found.");
        }
        res.send(craft);
    } catch (error) {
        res.status(500).send("Error deleting craft.");
    }
};

const validateCraft = (craft) => {
  const schema = Joi.object({
    _id: Joi.allow(""),
    name: Joi.string().min(3).required(),
    description: Joi.string().min(3).required(),
    supplies: Joi.allow(),
  });

  return schema.validate(craft);
};

app.listen(3002, () => {
    console.log("Server successfully ran. :) ");
});