FROM nginx:alpine
COPY index.html /usr/share/nginx/html
COPY main.js /usr/share/nginx/html
COPY USA_Counties_Generalized.json /usr/share/nginx/html

WORKDIR /usr/share/nginx/html
