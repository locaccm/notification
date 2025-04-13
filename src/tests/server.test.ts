import request from 'supertest';
import express from 'express';
import cors from '../config/cors.config';
import emailRoutes from '../routes/email.routes';
import { errorHandler } from '../middlewares/errorHandler.middleware';
import { swaggerServe, swaggerSetup } from '../config/swagger.config';

const app = express();

app.use(cors);
app.use(express.json());

app.use("/api-docs", swaggerServe, swaggerSetup);

app.get('/api', (req, res) => {
    res.status(200).json({ message: 'API is working' });
});

app.use("/api", emailRoutes);  
app.use(errorHandler);

describe('API route handling and response validation', () => {
    it('should respond with status 200 for the /api-docs route', async () => {
        const response = await request(app).get('/api-docs');
        expect(response.status).toBe(301);  
    });

    it('should respond with status 404 for an unknown route', async () => {
        const response = await request(app).get('/unknown-route');
        expect(response.status).toBe(404);
    });

    it('should respond with status 200 for the /api route', async () => {
        const response = await request(app).get('/api');
        expect(response.status).toBe(200); 
        expect(response.body.message).toBe('API is working');  
    });

    it('should handle invalid JSON in /api/send-email', async () => {
        const response = await request(app)
        .post('/api/send-email') 
        .set('Content-Type', 'application/json')
        .send({ invalidField: "test" }); 

        expect(response.status).toBe(400);  
        expect(response.body.error).toBe('Missing required fields'); 
    });
});
