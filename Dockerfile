# Step 1: Use an official Node.js runtime as the base image
FROM node:20

# Step 2: Set the working directory in the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Step 4: Install Node.js dependencies
RUN yarn install

# Step 5: Copy the rest of your application code to the container
COPY . .

# Step 6: Expose the port your server is running on (e.g., 5000)
EXPOSE 3000

# Step 7: Specify the command to run your application
CMD [ "yarn", "start" ]
