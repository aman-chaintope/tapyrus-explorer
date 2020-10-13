FROM node:14.13.1-stretch

WORKDIR /app
COPY . .

RUN npm install && \
    npm install -g @angular/cli@8.3.29

EXPOSE 4200