FROM nginx:alpine
RUN mkdir -p /var/www/ussd-simulator/{libs,assets}
COPY ./assets/ /var/www/ussd-simulator/assets
COPY ./libs/ /var/www/ussd-simulator/libs
COPY ./index.html /var/www/ussd-simulator
COPY ./nginx.conf /etc/nginx/conf.d/default.conf