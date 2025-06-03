FROM node:20-alpine

# 1. Environment variable for the database
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# 2. Set working directory
WORKDIR /app

# 3. Install git if needed — remove if not using it
RUN apk add --no-cache git

# 4. Copy dependency files
COPY package*.json ./

# 5. Install dependencies
RUN npm install

# 6. Copy the rest of the app source code
COPY . .

# 7. Generate Prisma client
RUN npx prisma generate

# 8. Build the app
RUN npm run build

# 9. Expose port
EXPOSE 3000

# 10. Start the app
CMD ["npm", "start"]