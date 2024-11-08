const express = require("express");
const router = express.Router();

////// Temp data
const parts = [
    { id: 0, name: "Resistor"},
    { id: 1, name: "Inductor"},
    { id: 2, name: "Capacitor"},
]

router.get("/", (req, res) => res.send(parts));

router.get("/:id", (req, res) => {
    const part = parts.find(p => p.id == parseInt(req.params.id));
    if(!part) {
        res.status(404).send("Part with given ID not found.");
    }else{
        res.send(part);
    }
});

router.post("/", (req, res) => {
    const {error} = validatePart(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    const part = {
        id: parts.length,
        name: req.body.name
    }

    parts.push(part);
    res.send(part);
});

router.put("/:id", (req, res) => {
    const part = parts.find(p => p.id == parseInt(req.params.id));

    if(!part) {
        res.status(404).send("Part with given ID not found.");
        return;
    }

    const {error} = validatePart(req.body);
    if(error) {
        res.status(400).send("Bad Request!\n" + error.details[0].message);
        return;
    }

    part.name = req.body.name;
    res.send(part);

});

router.delete("/:id", (req, res) => {
    const part = parts.find(p => p.id == parseInt(req.params.id));

    if(!part) {
        res.status(404).send("Part with given ID not found.");
        return;
    }

    const index = parts.indexOf(part);
    parts.splice(index, 1);

    res.send(part);
});

function validatePart(part) {
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });

    return schema.validate(part);
}

module.exports = router;