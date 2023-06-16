//Load require modules
const express = require("express");
const app = express();
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;
//openAI Service configuration
const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_KEY,
});
const openai = new OpenAIApi(configuration);
//Test for manage asks
let respondModel = "";
let namePatient = "";
let descriptionPatient = "";
let diagnosticPatient = [];
let userPhoto = "";
//Necessary declarations for use app
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
//Respond to GET in the root's server
app.get("/", function (req, res) {
    res.render("home");
})
//Respond to GET in the about root
app.get("/pacientes", function (req, res) {
    res.render("paciente", {
        userPhoto: userPhoto,
        namePatient: namePatient,
        descriptionPatient: descriptionPatient,
        diagnosticPatient: diagnosticPatient,
        respondModel: respondModel
    });
})
//Respond to POST in the compose root
app.post("/gpt", async function (req, res) {
    let prompt = "Voy a hacer el procedimiento médico de ("+req.body.questionModel+") en el paciente ("+namePatient+") quien ("+descriptionPatient+
                    ") y tiene sintomas de ("+diagnosticPatient+"). Necesito saber si el procedimiento ayudará a tratar su condición o mejorar"+
                    " sus sintomas y para esto quiero que me digas si el nivel de pertinencia de este procedimiento es bajo, medio o alto."+
                    " Además, necesito que me des la justificación del nivel en un texto de máximo 60 palabras."+
                    " La Respuesta que me entregues debe ser en formato:\n(Nivel de pertinencia:\nJustificación:)";                    
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 400,
            temperature: 0.2,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0.0,
            best_of: 1
            //stop: ["/n"]
        });
        respondModel = response.data.choices[0].text;
        return res.render("paciente", {
            userPhoto: userPhoto,
            namePatient: namePatient,
            descriptionPatient: descriptionPatient,
            diagnosticPatient: diagnosticPatient,
            respondModel: respondModel
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.response
                ? error.response.data
                : "Hay un error en el servidor",
        });
    }
})
//Respond to POST patients
app.post("/pacientes", function (req, res) {
    let paciente = req.body.user;
    respondModel = "";
    if (paciente == 1) {
        userPhoto = "Daniel";
        namePatient = "Daniel Rodríguiez";
        descriptionPatient = "Es un hombre de 20 años que padece de diabetes tipo 1, el paciente ha seguido el tratamiento pero se siente mal";
        diagnosticPatient = ["Visión borrosa", "Cansancio y debilidad", "Pérdida de peso involuntaria"];
        res.render("paciente", {
            userPhoto: userPhoto,
            namePatient: namePatient,
            descriptionPatient: descriptionPatient,
            diagnosticPatient: diagnosticPatient,
            respondModel: respondModel
        });
    } else if (paciente == 2) {
        userPhoto = "Valentina";
        namePatient = "Valentina Cortés";
        descriptionPatient = "Es una mujer de 30 años que sufre de asma desde su juventud y usa regularmente un inhalador";
        diagnosticPatient = ["Dolor en el pecho", "Dificultad para respirar", "Tos constante"];
        res.render("paciente", {
            userPhoto: userPhoto,
            namePatient: namePatient,
            descriptionPatient: descriptionPatient,
            diagnosticPatient: diagnosticPatient,
            respondModel: respondModel
        });
    } else {
        userPhoto = "Pablo";
        namePatient = "Pablo García";
        descriptionPatient = "Es un adulto mayor de 80 años con una fractura en un brazo, producto de un accidente automovilístico";
        diagnosticPatient = ["Dolor intenso en el brazo", "Falta de apetito", "Ansiedad"];
        res.render("paciente", {
            userPhoto: userPhoto,
            namePatient: namePatient,
            descriptionPatient: descriptionPatient,
            diagnosticPatient: diagnosticPatient,
            respondModel: respondModel
        });
    }
})
//Initialize the port
app.listen(port, function () {
    console.log("Server started on port 3000");
});