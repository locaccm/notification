FROM node:20-alpine

# 1. Set environment variables from build arguments
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ARG AUTH_SERVICE_URL
ENV AUTH_SERVICE_URL=${AUTH_SERVICE_URL}

ARG MAIL_HOST
ENV MAIL_HOST=${MAIL_HOST}

ARG MAIL_PORT
ENV MAIL_PORT=${MAIL_PORT}

ARG MAIL_USER
ENV MAIL_USER=${MAIL_USER}

ARG MAIL_PASS
ENV MAIL_PASS=${MAIL_PASS}

ARG CORS_ORIGIN
ENV CORS_ORIGIN=${CORS_ORIGIN}

# 2. Set working directory inside the container
WORKDIR /app

# 3. Install git (only needed if your project requires it)
RUN apk add --no-cache git

# 4. Copy dependency files
COPY package*.json ./

# 5. Install npm dependencies
RUN npm install

# 6. Copy the rest of the application source code
COPY . .

# 7. Pull the database schema with Prisma
RUN npx prisma db pull

# 8. Generate Prisma client
RUN npm run prisma:generate

# 9. Build the app
RUN npm run build

# 10. Expose port 3000 for the app
EXPOSE 3000

# 11. Start the application
CMD ["npm", "start"]
