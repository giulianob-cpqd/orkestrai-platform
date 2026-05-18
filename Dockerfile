FROM node:22-alpine

RUN apk add --no-cache tini

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 8080

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
