import app from './app';
import cors from "cors";

const allowedOrigins = ['http://www.dinocard.net', '*'];

const options: cors.CorsOptions = {
  origin: allowedOrigins
};

app.use(cors(options));

app.listen(3333);