FROM node:18
# Create app directory
WORKDIR /usr/src/app
# copy package.json and yarn.lock files
COPY package.json yarn.lock ./
# run yarn install to install all the dependensies
RUN yarn install
# Bundle app source
COPY . .
# setting up host
EXPOSE 3000
# cmd running command
CMD [ "yarn", "start" ]
