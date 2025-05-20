# Step 1: Use the official Node.js image (LTS version recommended)
FROM node:18

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy only the dependency files
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application files
COPY . .

# Step 6: Expose the port the app runs on
EXPOSE 3000

# Step 7: Start the application
CMD ["npm", "start"]
