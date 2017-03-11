FROM node:boron

# Set up environment
RUN mkdir -p /home/node/app
WORKDIR /home/node/app

# Clone Project
COPY ./ ./

# Compile Application
RUN yarn install
RUN yarn build

EXPOSE 3000
CMD yarn start