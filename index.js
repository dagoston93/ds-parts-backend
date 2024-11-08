const express = require("express");
const Joi = require("joi");
const config = require("config");

const logger = require("./logger");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
app.use(express.json());
app.use(helmet());

if(app.get("env") == "development") {
    app.use(morgan('tiny'));
    app.use(logger);

    console.log("Logging enabled...");
}

////// Temp data
const parts = [
    { id: 0, name: "Resistor"},
    { id: 1, name: "Inductor"},
    { id: 2, name: "Capacitor"},
]

app.get("/", (req, res) => res.send("Hello World."));

app.get("/api/parts", (req, res) => res.send(parts));

app.get("/api/parts/:id", (req, res) => {
    const part = parts.find(p => p.id == parseInt(req.params.id));
    if(!part) {
        res.status(404).send("Part with given ID not found.");
    }else{
        res.send(part);
    }
});

app.post("/api/parts", (req, res) => {
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

app.put("/api/parts/:id", (req, res) => {
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

app.delete("/api/parts/:id", (req, res) => {
    const part = parts.find(p => p.id == parseInt(req.params.id));

    if(!part) {
        res.status(404).send("Part with given ID not found.");
        return;
    }

    const index = parts.indexOf(part);
    parts.splice(index, 1);

    res.send(part);
});

const port = config.get("port");
app.listen(port, () => console.log(`Listening on port ${port}...`));

function validatePart(part) {
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });

    return schema.validate(part);
}