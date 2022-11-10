FROM node:erbium
RUN apt-get update && apt-get install -y \
COPY . /cab432
WORKDIR /cab432
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]