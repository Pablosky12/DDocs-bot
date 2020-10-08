FROM node:latest

WORKDIR /usr/src/app
COPY ./ ./
ENV PORT 5000
ENV BOT_TOKEN test
ENV API_URL https://lit-cliffs-44994.herokuapp.com/


RUN npm cache clear --force && npm install
CMD ["npm", "start"]
