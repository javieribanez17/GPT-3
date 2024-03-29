//Load require modules
const express = require("express");
const app = express();
const { OpenAI } = require("openai");
require("dotenv").config();
// const { Configuration, OpenAIApi } = require("openai");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;
//openAI Service configuration
// const configuration = new Configuration({
//   apiKey: process.env.OPEN_AI_KEY,
// });
// const openai = new OpenAIApi(configuration);
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});
//Test for manage asks
let startModel = false;
let respondModel = "";
let namePatient = "";
let descriptionPatient = "";
let diagnosticPatient = [];
let userPhoto = "";
let estadoSemaforo = "default";
let pertinencia = "";
let consultPrev = "Ninguna";
//Certificado de TSL Desactivado
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//Necessary declarations for use app
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
//Respond to GET in the root's server
app.get("/", function (req, res) {
  res.render("home");
  (startModel = false), (pertinencia = "");
  estadoSemaforo = "default";
  consultPrev = "Ninguna";
});
//Respond to GET in the about root
app.get("/pacientes", function (req, res) {
  res.render("paciente", {
    startModel: startModel,
    userPhoto: userPhoto,
    namePatient: namePatient,
    descriptionPatient: descriptionPatient,
    diagnosticPatient: diagnosticPatient,
    respondModel: respondModel,
    estadoSemaforo: estadoSemaforo,
    pertinencia: pertinencia,
    consultPrev: consultPrev,
  });
});
//Respond to POST in the compose root
app.post("/gpt", async function (req, res) {
  let prompt =
    "Voy a hacer el procedimiento médico de (" +
    req.body.questionModel +
    ") en el paciente (" +
    namePatient +
    ") quien (" +
    descriptionPatient +
    ") y tiene sintomas de (" +
    diagnosticPatient +
    "). Necesito saber si el nivel de pertinencia médico del procedimiento en el paciente es bajo, medio o alto. Teniendo en cuenta si ayudará a mejorar la salud del paciente." +
    " Además, necesito que me des la justificación del nivel en un texto de máximo 60 palabras." +
    " La Respuesta que me entregues debe ser en formato:(Nivel de pertinencia:\nJustificación:)";
  try {
    // const response = await openai.createCompletion({
    //   model: "gpt-3.5-turbo",
    //   prompt: prompt,
    //   max_tokens: 400,
    //   temperature: 0.2,
    //   top_p: 1,
    //   frequency_penalty: 0,
    //   presence_penalty: 0.0,
    //   best_of: 1,
    //   //stop: ["/n"]
    // });
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Tú eres un médico experto que determina el nivel de pertinencia de procedimientos de salud en pacientes",
        },
        { role: "user", content: prompt },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 400,
      temperature: 0.5,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.0,
    });
    // respondModel = response.data.choices[0].text;
    respondModel = response.choices[0].message.content;
    pertinencia = respondModel.slice(2, -1).split("\n", 2)[0].split(": ", 2)[1];
    consultPrev = req.body.questionModel;
    startModel = true;
    if (pertinencia.includes("Alto")) {
      estadoSemaforo = "green";
      pertinencia = "Alta";
    } else if (pertinencia.includes("Medio")) {
      estadoSemaforo = "yellow";
      pertinencia = "Media";
    } else if (pertinencia.includes("Bajo")) {
      estadoSemaforo = "red";
      pertinencia = "Baja";
    } else {
      estadoSemaforo = "default";
    }
    console.log();
    return res.render("paciente", {
      startModel: startModel,
      userPhoto: userPhoto,
      namePatient: namePatient,
      descriptionPatient: descriptionPatient,
      diagnosticPatient: diagnosticPatient,
      respondModel: respondModel,
      estadoSemaforo: estadoSemaforo,
      pertinencia: pertinencia,
      consultPrev: consultPrev,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err,
    });
  }
});
//Respond to POST patients
app.post("/pacientes", function (req, res) {
  let paciente = req.body.user;
  respondModel = "";
  if (paciente == 1) {
    userPhoto = "Daniel";
    namePatient = "Daniel Rodríguez";
    descriptionPatient =
      "Paciente de 20 años con diabetes tipo 1 con glucemias muy altas y falta de riñón derecho. Tiene encefalomielitis miálgica y reporta bajos niveles de actividad física";
    diagnosticPatient = [
      "Visión borrosa",
      "Cansancio y debilidad",
      "Pérdida de peso involuntaria",
      "Gripas frecuentes",
    ];
    res.render("paciente", {
      startModel: startModel,
      userPhoto: userPhoto,
      namePatient: namePatient,
      descriptionPatient: descriptionPatient,
      diagnosticPatient: diagnosticPatient,
      respondModel: respondModel,
      estadoSemaforo: estadoSemaforo,
      pertinencia: pertinencia,
      consultPrev: consultPrev,
    });
  } else if (paciente == 2) {
    userPhoto = "Valentina";
    namePatient = "Valentina Cortés";
    descriptionPatient =
      "Mujer de 30 años que sufre principalmente de asma desde su juventud, usa regularmente un inhalador. Sus síntomas empeoran durante la menstruación y tiene dificultad para dormir por la tos nocturna";
    diagnosticPatient = [
      "Dolor en el pecho",
      "Dificultad para respirar",
      "Tos constante",
      "Fatiga",
    ];
    res.render("paciente", {
      startModel: startModel,
      userPhoto: userPhoto,
      namePatient: namePatient,
      descriptionPatient: descriptionPatient,
      diagnosticPatient: diagnosticPatient,
      respondModel: respondModel,
      estadoSemaforo: estadoSemaforo,
      pertinencia: pertinencia,
      consultPrev: consultPrev,
    });
  } else {
    userPhoto = "Pablo";
    namePatient = "Pablo García";
    descriptionPatient =
      "Es un adulto mayor de 80 años con una fractura en un brazo, producto de un accidente automovilístico. El paciente tiene antecedentes de 2 eventos de paro cardiaco y también antecedentes colesterol alto";
    diagnosticPatient = [
      "Dolor intenso en el brazo",
      "Falta de apetito",
      "Ansiedad",
      "Alergía a antiflamatorios",
    ];
    res.render("paciente", {
      startModel: startModel,
      userPhoto: userPhoto,
      namePatient: namePatient,
      descriptionPatient: descriptionPatient,
      diagnosticPatient: diagnosticPatient,
      respondModel: respondModel,
      estadoSemaforo: estadoSemaforo,
      pertinencia: pertinencia,
      consultPrev: consultPrev,
    });
  }
});
//Initialize the port
app.listen(port, function () {
  console.log("Server started on port 3000");
});
