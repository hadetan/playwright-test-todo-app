FROM mcr.microsoft.com/playwright:v1.49.1

RUN apt-get update && \
    apt-get install -y openjdk-11-jdk && \
    apt-get clean;

ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

WORKDIR /app

COPY package*.json ./

RUN npm install --quiet

RUN npx playwright install

RUN npm install -g allure-commandline --save-dev

COPY . .

COPY docker.sh .

RUN chmod +x docker.sh

EXPOSE 9323

CMD [ "./docker.sh" ]