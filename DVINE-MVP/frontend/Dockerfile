# Use Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

# Copy the source code
COPY . .

# Remove any existing node_modules from the copied files
RUN rm -rf node_modules && npm install --legacy-peer-deps

EXPOSE 5173

# Start the application
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]