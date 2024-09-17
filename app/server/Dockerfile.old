FROM node:20.9.0

WORKDIR /app

COPY package*.json .

COPY . .

RUN npm install

EXPOSE 8000

CMD [ "npm" , "run" ,"dev" ]