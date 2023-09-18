import app from './app';
import cors from "cors";

const allowedOrigins = '*';

const options: cors.CorsOptions = {
  origin: allowedOrigins
};

app.use(cors(options));

app.listen(3333);