import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import router from "./routes";
import cors from "cors";
import { swaggerUi, specs } from './swagger';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', router);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API Documentation available at http://localhost:${port}/api-docs`);
});
